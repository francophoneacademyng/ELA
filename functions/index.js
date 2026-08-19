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
const { onSchedule } = require('firebase-functions/v2/scheduler');
const crypto = require('crypto');
const admin = require('firebase-admin');

admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'ela-academy-7f868' });
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

/* ============================================================
   JALON 4 — Parrainage
   - filleul : -15000 NGN sur son PREMIER paiement (jamais sous 0)
   - parrain : +10000 NGN de crédit académique (referralCredit)
   - crédit utilisé en priorité sur les paiements suivants
   ============================================================ */
const REFERRAL_DISCOUNT = 15000;
const REFERRAL_CREDIT = 10000;

async function findUserByReferralCode(code) {
  const snap = await db.collection('users').where('referralCode', '==', code).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, data: doc.data() };
}

async function computePricing(uid, plan, duration, referralCode) {
  const base = getAmountNaira(plan, duration);
  if (!base) return null;

  const userSnap = await db.collection('users').doc(uid).get();
  const user = userSnap.exists ? userSnap.data() : {};

  const firstPayment = !user.firstPaymentDone;
  const credit = user.referralCredit || 0;

  let discount = 0;
  let creditUsed = 0;
  let referrerUid = null;
  let codeValid = null;
  let error = null;

  const code = String(referralCode || user.referralCodeUsed || '').trim();
  if (code && firstPayment) {
    const referrer = await findUserByReferralCode(code);
    if (!referrer) {
      error = 'invalid-referral-code';
    } else if (referrer.uid === uid) {
      error = 'self-referral-not-allowed';
    } else {
      codeValid = true;
      referrerUid = referrer.uid;
      discount = REFERRAL_DISCOUNT;
    }
  }

  if (!firstPayment && credit > 0) {
    creditUsed = Math.min(credit, Math.max(0, base - discount));
  }

  const total = Math.max(0, base - discount - creditUsed);
  return { base, discount, creditUsed, total, firstPayment, credit, referrerUid, codeValid, error };
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

  const pricing = await computePricing(uid, plan, duration, data.referralCode);
  if (!pricing) {
    throw new HttpsError('invalid-argument', 'Invalid plan or duration.');
  }
  if (pricing.error) {
    throw new HttpsError('invalid-argument', pricing.error);
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
      amount: pricing.total * 100,
      currency: 'NGN',
      reference,
      callback_url: callbackUrl,
      metadata: { uid, plan, duration, amount: pricing.total }
    })
  });

  const initData = await initResp.json();
  if (!initResp.ok || !initData.status || !initData.data) {
    throw new HttpsError('internal', 'Paystack could not initialize the payment.');
  }

  await db.collection('transactions').doc(reference).set({
    uid,
    email,
    plan,
    duration,
    amount: pricing.total,
    baseAmount: pricing.base,
    discount: pricing.discount,
    creditUsed: pricing.creditUsed,
    referrerUid: pricing.referrerUid,
    status: 'pending',
    createdAt: new Date()
  });

  return {
    authorizationUrl: initData.data.authorization_url,
    reference,
    amount: pricing.total,
    discount: pricing.discount,
    creditUsed: pricing.creditUsed
  };
});

/**
 * Aperçu du prix (callable — auth requis) : renvoie le montant final calculé
 * côté serveur (prix - remise parrainage - crédit utilisé) SANS initialiser
 * de paiement. Utilisé par la page de checkout pour afficher la remise.
 */
exports.previewPayment = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const data = request.data || {};
  const pricing = await computePricing(uid, data.plan, Number(data.duration), data.referralCode);
  if (!pricing) {
    throw new HttpsError('invalid-argument', 'Invalid plan or duration.');
  }
  return {
    base: pricing.base,
    discount: pricing.discount,
    creditUsed: pricing.creditUsed,
    total: pricing.total,
    firstPayment: pricing.firstPayment,
    credit: pricing.credit,
    codeValid: pricing.codeValid,
    error: pricing.error
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

  const txSnap = await db.collection('transactions').doc(reference).get();
  if (!txSnap.exists) {
    throw new HttpsError('not-found', 'Unknown payment reference.');
  }
  const txDoc = txSnap.data();
  if (txDoc.uid !== uid) {
    throw new HttpsError('permission-denied', 'This payment does not belong to you.');
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
  const paidAmount = Math.round((tx.amount || 0) / 100);

  if (tx.status !== 'success') {
    return { status: 'failed', reference };
  }
  if (paidAmount !== txDoc.amount) {
    throw new HttpsError('invalid-argument', 'Payment amount does not match.');
  }

  const granted = await grantSubscription({
    uid,
    plan: txDoc.plan,
    duration: txDoc.duration,
    amount: paidAmount,
    reference,
    referrerUid: txDoc.referrerUid || null,
    creditUsed: txDoc.creditUsed || 0
  });
  if (granted) {
    await sendPaymentConfirmation({
      to: txDoc.email, plan: txDoc.plan, duration: txDoc.duration,
      amount: paidAmount, reference
    }).catch(() => {});
  }
  return { status: 'success', reference };
});

/**
 * Active l'abonnement (idempotent). Étend un abonnement actif non expiré.
 * Écrit via l'Admin SDK (contourne les règles client — le client ne peut pas
 * forger un abonnement actif).
 */
async function grantSubscription({ uid, plan, duration, amount, reference, referrerUid, creditUsed }) {
  const txRef = db.collection('transactions').doc(reference);
  const subRef = db.collection('subscriptions').doc(uid);
  const userRef = db.collection('users').doc(uid);
  const referrerRef = referrerUid ? db.collection('users').doc(referrerUid) : null;

  return db.runTransaction(async (t) => {
    // Toutes les lectures AVANT toutes les écritures (règle Firestore).
    const txDoc = await t.get(txRef);
    if (txDoc.exists && txDoc.data().status === 'success') {
      return false; // déjà accordé — idempotent
    }
    const subDoc = await t.get(subRef);
    const refDoc = referrerRef ? await t.get(referrerRef) : null;
    const uDoc = await t.get(userRef);

    const now = new Date();
    let start = now;
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

    // Parrainage : crédite le parrain (+10000 NGN) au premier paiement du filleul.
    if (referrerRef) {
      const current = refDoc && refDoc.exists ? (refDoc.data().referralCredit || 0) : 0;
      t.set(referrerRef, { referralCredit: current + REFERRAL_CREDIT }, { merge: true });
    }

    // Marque le 1er paiement effectué + consomme le crédit éventuel.
    const uData = uDoc.exists ? uDoc.data() : {};
    const patch = { firstPaymentDone: true };
    if (referrerRef) patch.referralDiscountApplied = true;
    if (creditUsed && creditUsed > 0) {
      patch.referralCredit = Math.max(0, (uData.referralCredit || 0) - creditUsed);
    }
    t.set(userRef, patch, { merge: true });
    return true;
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
    const reference = data.reference;
    if (reference) {
      const txSnap = await db.collection('transactions').doc(reference).get();
      if (txSnap.exists) {
        const txDoc = txSnap.data();
        const paidAmount = Math.round((data.amount || 0) / 100);
        if (paidAmount === txDoc.amount) {
          try {
            const granted = await grantSubscription({
              uid: txDoc.uid,
              plan: txDoc.plan,
              duration: txDoc.duration,
              amount: paidAmount,
              reference,
              referrerUid: txDoc.referrerUid || null,
              creditUsed: txDoc.creditUsed || 0
            });
            if (granted) {
              await sendPaymentConfirmation({
                to: txDoc.email, plan: txDoc.plan, duration: txDoc.duration,
                amount: paidAmount, reference
              }).catch(() => {});
            }
          } catch (err) {
            console.error('webhook grant failed', err);
            res.status(500).send('grant failed');
            return;
          }
        }
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

/* ============================================================
   JALON 5 — Expiration + notifications + tableau de bord
   ============================================================ */
function ts(v) {
  if (!v) return null;
  if (v.toMillis) return v.toMillis();
  if (v instanceof Date) return v.getTime();
  return v;
}

async function sendEmail({ to, subject, text }) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    console.log(`[email:log] to=${to} subject="${subject}"`);
    return;
  }
  const from = process.env.SENDGRID_FROM || 'noreply@elearnlanguage.ng';
  try {
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: 'text/plain', value: text }]
      })
    });
    if (!resp.ok) console.error('sendgrid error', resp.status);
  } catch (err) {
    console.error('sendgrid send failed', err && err.message);
  }
}

function planLabel(plan) {
  const labels = { general: 'General Path', premium: 'Premium Path', business: 'Business Language' };
  return labels[plan] || plan;
}

async function sendPaymentConfirmation({ to, plan, duration, amount, reference }) {
  const text =
    'E-Learn Language Academy (ELA)\n\n' +
    'Thank you for your payment.\n\n' +
    'Plan: ' + planLabel(plan) + '\n' +
    'Duration: ' + duration + ' month(s)\n' +
    'Amount: NGN ' + Number(amount).toLocaleString('en-NG') + '\n' +
    'Reference: ' + reference + '\n\n' +
    'Your subscription is now active. Welcome to ELA.\n\n' +
    'E-Learn Language Academy — One Academy. Five Languages.';
  await sendEmail({ to, subject: 'ELA — Payment confirmed', text });
}

async function emailForUser(uid) {
  const u = await db.collection('users').doc(uid).get();
  return u.exists ? (u.data().email || null) : null;
}

/**
 * Vérifie quotidiennement les abonnements : expire ceux dont la date est
 * passée, et envoie un rappel J-7 (log-only si SENDGRID_API_KEY absente).
 */
exports.checkSubscriptionExpiry = onSchedule({ region: 'europe-west1', schedule: 'every day 00:00', timeZone: 'Africa/Lagos' }, async () => {
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);

  const activeSnap = await db.collection('subscriptions').where('status', '==', 'active').get();
  let expired = 0, reminded = 0;

  for (const doc of activeSnap.docs) {
    const s = doc.data();
    const end = s.endDate && s.endDate.toDate ? s.endDate.toDate() : null;
    if (!end) continue;

    if (end <= now) {
      await doc.ref.set({ status: 'expired' }, { merge: true });
      expired++;
      const to = await emailForUser(doc.id);
      if (to) {
        await sendEmail({
          to, subject: 'ELA — Subscription expired',
          text: 'E-Learn Language Academy (ELA)\n\nYour subscription has expired. Renew to keep learning.\n\nE-Learn Language Academy — One Academy. Five Languages.'
        }).catch(() => {});
      }
    } else if (end <= in7 && !s.reminderSent) {
      await doc.ref.set({ reminderSent: true }, { merge: true });
      reminded++;
      const to = await emailForUser(doc.id);
      if (to) {
        await sendEmail({
          to, subject: 'ELA — Your subscription renews soon',
          text: 'E-Learn Language Academy (ELA)\n\nYour subscription renews in 7 days or less. Keep your learning uninterrupted.\n\nE-Learn Language Academy — One Academy. Five Languages.'
        }).catch(() => {});
      }
    }
  }

  console.log(`checkSubscriptionExpiry done: expired=${expired} reminded=${reminded}`);
  return { expired, reminded };
});

/** Données du tableau de bord (callable — auth requis). */
exports.getDashboardData = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;

  const subSnap = await db.collection('subscriptions').doc(uid).get();
  const userSnap = await db.collection('users').doc(uid).get();
  const txSnap = await db.collection('transactions').where('uid', '==', uid).limit(20).get();

  const subscription = subSnap.exists ? {
    plan: subSnap.data().plan,
    duration: subSnap.data().duration,
    status: subSnap.data().status,
    amount: subSnap.data().amount,
    startDate: ts(subSnap.data().startDate),
    endDate: ts(subSnap.data().endDate)
  } : null;

  const user = userSnap.exists ? {
    referralCode: userSnap.data().referralCode || null,
    referralCredit: userSnap.data().referralCredit || 0
  } : { referralCode: null, referralCredit: 0 };

  const transactions = txSnap.docs.map((d) => ({
    id: d.id,
    plan: d.data().plan,
    duration: d.data().duration,
    amount: d.data().amount,
    status: d.data().status,
    createdAt: ts(d.data().createdAt)
  })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return { subscription, user, transactions };
});

/* ============================================================
   MISSION ENSEIGNANT — Attribution des rôles (admin only)
   ============================================================ */
const VALID_ROLES = ['student', 'teacher', 'admin'];
const VALID_ACADEMIES = ['german', 'mandarin', 'english', 'arabic', 'russian'];

/**
 * Attribue un rôle à un utilisateur (student/teacher/admin). Réservé à l'admin.
 * Un rôle "teacher" exige une académie valide (obligatoire).
 */
exports.setUserRole = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const callerUid = request.auth.uid;

  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists || callerSnap.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'admin-only');
  }

  const data = request.data || {};
  const uid = data.uid;
  const role = data.role;
  const academy = data.academy;

  if (!uid) {
    throw new HttpsError('invalid-argument', 'missing-uid');
  }
  if (!VALID_ROLES.includes(role)) {
    throw new HttpsError('invalid-argument', 'invalid-role');
  }

  const patch = { role };
  if (role === 'teacher') {
    if (!VALID_ACADEMIES.includes(academy)) {
      throw new HttpsError('invalid-argument', 'teacher-requires-valid-academy');
    }
    patch.academy = academy;
  }

  await db.collection('users').doc(uid).set(patch, { merge: true });
  return { ok: true, uid, role };
});
