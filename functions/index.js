/**
 * ============================================================
 * E-Learn Language Academy (ELA) — Cloud Functions
 * ============================================================
 * RÈGLES DE SÉCURITÉ (héritées de la crise Francophone Academy) :
 * - AUCUNE clé secrète dans ce fichier ni dans le frontend
 * - Toutes les clés vivent dans functions/.env (jamais commité)
 * - 2nd-gen functions chargent automatiquement le .env
 * - Répondre TOUJOURS "N" aux invites Firebase qui proposent
 *   de supprimer des index ou des fonctions
 * ============================================================
 *
 * JALON 1 : squelette + santé du système (healthCheck).
 * JALON 2 : paiements Paystack.
 *   - initializePayment    (callable)  : initie un paiement côté serveur
 *   - verifyPaystackPayment(callable)  : vérifie un paiement côté serveur
 *   - paystackWebhook      (onRequest) : reçoit charge.success (idempotent)
 *   Les montants sont TOUJOURS recalculés côté serveur (table canonique),
 *   jamais depuis le client. Le secret vit dans functions/.env uniquement.
 * JALON 3 : assistantChat (Learning Assistant multi-langue, clé OpenRouter serveur).
 * JALON 4 : processReferral (filleul -15000 NGN 1er mois, parrain +10000 NGN).
 * JALON 5 : checkSubscriptionExpiry + notifications.
 * ============================================================
 */

const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const crypto = require('crypto');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const REGION = 'africa-south1';
const PAYSTACK_BASE = 'https://api.paystack.co';
const DEFAULT_CALLBACK_URL = 'https://ela-academy-7f868.web.app/#/payment/result';

/**
 * Grille tarifaire canonique (NGN) — source de vérité côté serveur.
 * Le montant facturé/validé est TOUJOURS lu ici, jamais depuis le client.
 */
const PRICE_TABLE = {
  general:  { 1: 75000,  3: 200000, 6: 405000 },
  premium:  { 1: 120000, 3: 320000, 6: 648000 },
  business: { 1: 150000, 3: 420000, 6: 840000 }
};

function getAmountNaira(plan, duration) {
  const p = PRICE_TABLE[plan];
  if (!p) return null;
  const amount = p[duration];
  return amount ? amount : null;
}

function paystackSecret() {
  const secret = process.env.PAYSTACK_SECRET;
  if (!secret) throw new HttpsError('internal', 'Paystack is not configured.');
  return secret;
}

/** Health check — vérifier que les fonctions répondent après déploiement */
exports.healthCheck = onRequest((req, res) => {
  res.json({
    status: 'ok',
    project: 'E-Learn Language Academy',
    milestone: 1,
    time: new Date().toISOString()
  });
});

/**
 * Initie un paiement Paystack (callable — utilisateur authentifié requis).
 * Le montant est recalculé côté serveur. Enregistre une transaction "pending".
 */
exports.initializePayment = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const data = request.data || {};
  const plan = data.plan;
  const duration = Number(data.duration);

  const amount = getAmountNaira(plan, duration);
  if (!amount) {
    throw new HttpsError('invalid-argument', 'Invalid plan or duration.');
  }

  let email = request.auth.token && request.auth.token.email;
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists && userDoc.data().email) {
    email = userDoc.data().email;
  }
  if (!email) {
    throw new HttpsError('failed-precondition', 'No email address found for this account.');
  }

  const secret = paystackSecret();
  const reference = `ela-${uid.slice(0, 8)}-${Date.now()}`;
  const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || DEFAULT_CALLBACK_URL;

  const initResp = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      amount: amount * 100,
      currency: 'NGN',
      reference,
      callback_url: callbackUrl,
      metadata: { uid, plan, duration, amount }
    })
  });

  const initData = await initResp.json();
  if (!initResp.ok || !initData.status || !initData.data) {
    throw new HttpsError('internal', 'Paystack could not initialize the payment.');
  }

  await db.collection('transactions').doc(reference).set({
    uid,
    email,
    amount,
    plan,
    duration,
    status: 'pending',
    createdAt: new Date()
  });

  return {
    authorizationUrl: initData.data.authorization_url,
    reference
  };
});

/**
 * Vérifie un paiement Paystack et active l'abonnement (callable — auth requis).
 * Revalide le montant et l'appartenance de la référence côté serveur.
 */
exports.verifyPaystackPayment = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const reference = request.data && request.data.reference;
  if (!reference) {
    throw new HttpsError('invalid-argument', 'Missing payment reference.');
  }

  const secret = paystackSecret();
  const verifyResp = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` }
  });
  const verifyData = await verifyResp.json();
  if (!verifyResp.ok || !verifyData.status || !verifyData.data) {
    throw new HttpsError('internal', 'Paystack could not verify this payment.');
  }

  const tx = verifyData.data;
  const meta = tx.metadata || {};
  const plan = meta.plan;
  const duration = Number(meta.duration);
  const paidAmount = Math.round((tx.amount || 0) / 100);
  const expectedAmount = getAmountNaira(plan, duration);

  if (tx.status !== 'success') {
    return { status: 'failed', reference };
  }
  if (!expectedAmount || paidAmount !== expectedAmount) {
    throw new HttpsError('invalid-argument', 'Payment amount does not match the selected plan.');
  }
  if (meta.uid && meta.uid !== uid) {
    throw new HttpsError('permission-denied', 'This payment does not belong to you.');
  }

  await grantSubscription({ uid, plan, duration, amount: paidAmount, reference });
  return { status: 'success', reference };
});

/**
 * Active l'abonnement (idempotent). Étend un abonnement actif non expiré.
 * Écrit via l'Admin SDK (contourne les règles client — le client ne peut pas
 * forger un abonnement actif).
 */
async function grantSubscription({ uid, plan, duration, amount, reference }) {
  const txRef = db.collection('transactions').doc(reference);
  const subRef = db.collection('subscriptions').doc(uid);

  await db.runTransaction(async (t) => {
    const txDoc = await t.get(txRef);
    if (txDoc.exists && txDoc.data().status === 'success') {
      return; // déjà accordé — idempotent
    }

    const now = new Date();
    let start = now;
    const subDoc = await t.get(subRef);
    if (subDoc.exists) {
      const existing = subDoc.data();
      if (existing.status === 'active' && existing.endDate && existing.endDate.toDate() > now) {
        start = existing.endDate.toDate();
      }
    }
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);

    t.set(subRef, {
      plan,
      duration,
      status: 'active',
      startDate: start,
      endDate: end,
      amount,
      reference,
      updatedAt: new Date()
    }, { merge: true });

    t.set(txRef, {
      uid,
      plan,
      duration,
      amount,
      status: 'success',
      paidAt: new Date()
    }, { merge: true });
  });
}

/**
 * Webhook Paystack (onRequest, appelé par Paystack en serveur-à-serveur).
 * Vérifie la signature HMAC SHA-512 puis active l'abonnement (idempotent).
 */
exports.paystackWebhook = onRequest({ region: REGION }, async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET;
  if (!secret) {
    res.status(500).send('not configured');
    return;
  }

  const signature = req.headers['x-paystack-signature'];
  if (!signature) {
    res.status(400).send('missing signature');
    return;
  }

  const rawBody = req.rawBody ? req.rawBody : Buffer.from(req.body ? JSON.stringify(req.body) : '');
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  if (hash !== signature) {
    res.status(401).send('invalid signature');
    return;
  }

  const event = req.body;
  if (event && event.event === 'charge.success') {
    const data = event.data || {};
    const meta = data.metadata || {};
    const uid = meta.uid;
    const plan = meta.plan;
    const duration = Number(meta.duration);
    const amount = Math.round((data.amount || 0) / 100);
    const expected = getAmountNaira(plan, duration);

    if (uid && expected && amount === expected && data.reference) {
      try {
        await grantSubscription({ uid, plan, duration, amount, reference: data.reference });
      } catch (err) {
        console.error('webhook grant failed', err);
        res.status(500).send('grant failed');
        return;
      }
    }
  }

  res.status(200).send('received');
});

/* ============================================================
   JALON 3 — Learning Assistant (OpenRouter, côté serveur)
   ============================================================ */
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const ASSISTANT_DAILY_LIMIT = parseInt(process.env.ASSISTANT_DAILY_LIMIT || '50', 10);
const ASSISTANT_TIMEOUT_MS = 30000;
const ASSISTANT_MAX_HISTORY = 20;
const ASSISTANT_MAX_LEN = 2000;

/** Prompts système par académie (le tuteur s'adapte au niveau de l'élève).
    Aucun terme "AI" n'apparaît : c'est un tuteur de langue bienveillant. */
const ACADEMY_PROMPTS = {
  german: 'You are a warm, patient and encouraging German tutor for the Germanophone academy of E-Learn Language Academy. Help learners progress from A1 to B2 and prepare the Goethe-Zertifikat and daily life in Germany. Adapt vocabulary, grammar and pace to the level the learner signals. Correct mistakes kindly, give short clear examples, and end by inviting the learner to continue in German. Never claim to be a human teacher: you are the academy Learning Assistant.',
  mandarin: 'You are a warm, patient and encouraging Mandarin tutor for the Sinophone academy of E-Learn Language Academy. Help learners progress from HSK 1 to HSK 6, with a focus on business Chinese, import-export vocabulary and supplier negotiation. Adapt to the level the learner signals. Correct tones and mistakes kindly, give short examples, and invite the learner to continue in Chinese. Never claim to be a human teacher: you are the academy Learning Assistant.',
  english: 'You are a warm, patient and encouraging English tutor for the Anglophone Pro academy of E-Learn Language Academy. Help learners improve professional English and prepare IELTS for the UK, Canada and international careers. Adapt to the level the learner signals. Correct mistakes kindly, give short examples, and invite the learner to continue in English. Never claim to be a human teacher: you are the academy Learning Assistant.',
  arabic: 'You are a warm, patient and encouraging Arabic tutor for the Arabophone academy of E-Learn Language Academy. Help learners with Quranic Arabic and Gulf business Arabic — understanding, speaking and working with confidence. Adapt to the level the learner signals. Correct mistakes kindly, give short examples, and invite the learner to continue in Arabic. Never claim to be a human teacher: you are the academy Learning Assistant.',
  russian: 'You are a warm, patient and encouraging Russian tutor for the Russophone academy of E-Learn Language Academy. Help learners prepare TORFL and study medicine or engineering in Russia on government scholarships. Adapt to the level the learner signals. Correct mistakes kindly, give short examples, and invite the learner to continue in Russian. Never claim to be a human teacher: you are the academy Learning Assistant.'
};

const LANG_NAMES = { en: 'English', fr: 'French', ar: 'Arabic' };

function sanitizeHistory(history) {
  const out = [];
  if (Array.isArray(history)) {
    for (const m of history) {
      if (out.length >= ASSISTANT_MAX_HISTORY) break;
      if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
      const content = String(m.content || '').slice(0, ASSISTANT_MAX_LEN);
      if (!content) continue;
      out.push({ role: m.role, content });
    }
  }
  return out;
}

async function hasActiveSubscription(uid) {
  const snap = await db.collection('subscriptions').doc(uid).get();
  if (!snap.exists) return false;
  const s = snap.data();
  if (s.status !== 'active' || !s.endDate) return false;
  const end = s.endDate && s.endDate.toDate ? s.endDate.toDate() : new Date(s.endDate);
  return end > new Date();
}

exports.learningAssistant = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;

  const active = await hasActiveSubscription(uid);
  if (!active) {
    throw new HttpsError('failed-precondition', 'active-subscription-required');
  }

  const message = String((request.data && request.data.message) || '').trim().slice(0, ASSISTANT_MAX_LEN);
  if (!message) {
    throw new HttpsError('invalid-argument', 'empty-message');
  }

  // Garde-fou : 50 messages/jour/utilisateur (compteur Firestore transactionnel)
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const usageRef = db.collection('assistantUsage').doc(`${uid}_${day}`);
  const usage = await db.runTransaction(async (t) => {
    const d = await t.get(usageRef);
    const count = d.exists ? (d.data().count || 0) : 0;
    if (count >= ASSISTANT_DAILY_LIMIT) return null;
    t.set(usageRef, { uid, day, count: count + 1, updatedAt: new Date() }, { merge: true });
    return count + 1;
  });
  if (usage === null) {
    throw new HttpsError('resource-exhausted', 'daily-limit-reached');
  }

  const history = sanitizeHistory(request.data && request.data.history);

  let academy = 'german';
  let interfaceLang = 'en';
  const userSnap = await db.collection('users').doc(uid).get();
  if (userSnap.exists) {
    const u = userSnap.data();
    if (Array.isArray(u.academies) && u.academies.length && ACADEMY_PROMPTS[u.academies[0]]) academy = u.academies[0];
    if (u.interfaceLang && LANG_NAMES[u.interfaceLang]) interfaceLang = u.interfaceLang;
  }

  const systemPrompt = ACADEMY_PROMPTS[academy]
    + ' Respond in ' + LANG_NAMES[interfaceLang]
    + ', at the learner\'s level, and keep answers concise and encouraging.';

  const key = process.env.OPENROUTER_KEY;
  if (!key) {
    // Mode dégradé propre : pas de crash, message clair côté client.
    return { reply: '', degraded: true };
  }

  const messages = [{ role: 'system', content: systemPrompt }]
    .concat(history)
    .concat([{ role: 'user', content: message }]);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ASSISTANT_TIMEOUT_MS);
  try {
    const resp = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: OPENROUTER_MODEL, messages }),
      signal: controller.signal
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error('openrouter ' + resp.status);
    }
    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    return { reply, degraded: false };
  } catch (err) {
    console.error('learningAssistant error', err && err.message);
    throw new HttpsError('internal', 'assistant-error');
  } finally {
    clearTimeout(timer);
  }
});
