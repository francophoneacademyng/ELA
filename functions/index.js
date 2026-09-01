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
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const crypto = require('crypto');
const admin = require('firebase-admin');

admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'ela-academy-7f868' });
const db = admin.firestore();

const REGION = 'africa-south1';
const PAYSTACK_BASE = 'https://api.paystack.co';
const DEFAULT_CALLBACK_URL = 'https://elaacademy.ng/#/payment/result';

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
exports.healthCheck = onRequest({ region: REGION }, (req, res) => {
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
      to: txDoc.email, uid: uid, plan: txDoc.plan, duration: txDoc.duration,
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
                to: txDoc.email, uid: txDoc.uid, plan: txDoc.plan, duration: txDoc.duration,
                amount: paidAmount, reference
              }).catch(() => {});
              // Tracking Phase 0 — payment_success (valeur NGN réelle, serveur uniquement).
              try {
                await db.collection('marketingEvents').add({
                  event: 'payment_success',
                  ts: Date.now(),
                  valueNGN: paidAmount,
                  plan: txDoc.plan,
                  duration: txDoc.duration,
                  uid: txDoc.uid,
                  reference
                }).catch(() => {});
              } catch (e) { /* silencieux */ }
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
  const from = process.env.SENDGRID_FROM || 'languageacademyelearn@gmail.com';
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

function planLabel(plan, lang) {
  const labels = {
    en: { general: 'General Path', premium: 'Premium Path', business: 'Business Language' },
    fr: { general: 'General Path', premium: 'Premium Path', business: 'Business Language' },
    ar: { general: 'المسار العام', premium: 'المسار المميز', business: 'لغة الأعمال' }
  };
  return ((labels[lang] || labels.en)[plan]) || plan;
}

/* Emails transactionnels — 3 langues (en/fr/ar), sélection selon interfaceLang. */
const EMAIL = {
  en: {
    paymentSubject: 'ELA — Payment confirmed',
    expiredSubject: 'ELA — Subscription expired',
    renewSubject: 'ELA — Your subscription renews soon',
    payment: (p) => 'E-Learn Language Academy (ELA)\n\nThank you for your payment.\n\nPlan: ' + p.plan + '\nDuration: ' + p.duration + ' month(s)\nAmount: NGN ' + p.amount + '\nReference: ' + p.reference + '\n\nYour subscription is now active. Welcome to ELA.\n\nE-Learn Language Academy — One Academy. Five Languages.',
    expired: 'E-Learn Language Academy (ELA)\n\nYour subscription has expired. Renew to keep learning.\n\nE-Learn Language Academy — One Academy. Five Languages.',
    renew: 'E-Learn Language Academy (ELA)\n\nYour subscription renews in 7 days or less. Keep your learning uninterrupted.\n\nE-Learn Language Academy — One Academy. Five Languages.'
  },
  fr: {
    paymentSubject: 'ELA — Paiement confirmé',
    expiredSubject: 'ELA — Abonnement expiré',
    renewSubject: 'ELA — Votre abonnement arrive à échéance',
    payment: (p) => 'E-Learn Language Academy (ELA)\n\nMerci pour votre paiement.\n\nFormule : ' + p.plan + '\nDurée : ' + p.duration + ' mois\nMontant : NGN ' + p.amount + '\nRéférence : ' + p.reference + '\n\nVotre abonnement est désormais actif. Bienvenue chez ELA.\n\nE-Learn Language Academy — Une académie. Cinq langues.',
    expired: 'E-Learn Language Academy (ELA)\n\nVotre abonnement a expiré. Renouvelez pour continuer à apprendre.\n\nE-Learn Language Academy — Une académie. Cinq langues.',
    renew: 'E-Learn Language Academy (ELA)\n\nVotre abonnement arrive à échéance dans 7 jours ou moins. Gardez votre apprentissage ininterrompu.\n\nE-Learn Language Academy — Une académie. Cinq langues.'
  },
  ar: {
    paymentSubject: 'ELA — تم تأكيد الدفع',
    expiredSubject: 'ELA — انتهى الاشتراك',
    renewSubject: 'ELA — اشتراكك يقترب من التجديد',
    payment: (p) => 'أكاديمية إي-ليرن للغات (ELA)\n\nشكراً لك على الدفع.\n\nالخطة: ' + p.plan + '\nالمدة: ' + p.duration + ' شهر\nالمبلغ: NGN ' + p.amount + '\nالمرجع: ' + p.reference + '\n\nاشتراكك نشط الآن. مرحباً بك في ELA.\n\nأكاديمية إي-ليرن للغات — أكاديمية واحدة. خمس لغات.',
    expired: 'أكاديمية إي-ليرن للغات (ELA)\n\nانتهى اشتراكك. جدّد لمواصلة التعلّم.\n\nأكاديمية إي-ليرن للغات — أكاديمية واحدة. خمس لغات.',
    renew: 'أكاديمية إي-ليرن للغات (ELA)\n\nينتهي اشتراكك خلال 7 أيام أو أقل. حافظ على استمرارية تعلّمك.\n\nأكاديمية إي-ليرن للغات — أكاديمية واحدة. خمس لغات.'
  }
};

async function userLang(uid) {
  try {
    const u = await db.collection('users').doc(uid).get();
    const lang = u.exists ? (u.data().interfaceLang || 'en') : 'en';
    return EMAIL[lang] ? lang : 'en';
  } catch (e) { return 'en'; }
}

async function sendPaymentConfirmation({ to, uid, plan, duration, amount, reference }) {
  const lang = await userLang(uid);
  const m = EMAIL[lang];
  const text = m.payment({
    plan: planLabel(plan, lang),
    duration: duration,
    amount: Number(amount).toLocaleString('en-NG'),
    reference: reference
  });
  await sendEmail({ to, subject: m.paymentSubject, text });
}

async function emailForUser(uid) {
  const u = await db.collection('users').doc(uid).get();
  if (!u.exists) return null;
  const data = u.data();
  const lang = EMAIL[data.interfaceLang] ? data.interfaceLang : 'en';
  return { email: data.email || null, lang };
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
      const user = await emailForUser(doc.id);
      if (user && user.email) {
        const m = EMAIL[user.lang];
        await sendEmail({ to: user.email, subject: m.expiredSubject, text: m.expired }).catch(() => {});
      }
    } else if (end <= in7 && !s.reminderSent) {
      await doc.ref.set({ reminderSent: true }, { merge: true });
      reminded++;
      const user = await emailForUser(doc.id);
      if (user && user.email) {
        const m = EMAIL[user.lang];
        await sendEmail({ to: user.email, subject: m.renewSubject, text: m.renew }).catch(() => {});
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

  // Code de parrainage : généré côté serveur s'il est absent (logique Francophone).
  let referralCode = userSnap.exists ? userSnap.data().referralCode : null;
  if (userSnap.exists && !referralCode) {
    referralCode = 'ELA-' + uid.slice(0, 6).toUpperCase();
    await db.collection('users').doc(uid).set({ referralCode }, { merge: true });
  }
  const user = {
    referralCode: referralCode || null,
    referralCredit: (userSnap.exists ? userSnap.data().referralCredit : 0) || 0,
    displayName: userSnap.exists ? (userSnap.data().displayName || '') : '',
    role: userSnap.exists ? (userSnap.data().role || 'student') : 'student',
    academy: userSnap.exists ? (userSnap.data().academy || null) : null
  };

  const transactions = txSnap.docs.map((d) => ({
    id: d.id,
    plan: d.data().plan,
    duration: d.data().duration,
    amount: d.data().amount,
    status: d.data().status,
    createdAt: ts(d.data().createdAt)
  })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // --- Enrichissement élève ---
  // Total sur TOUTES les académies (l'abonnement ouvre le plan entier).
  const ACADEMY_ORDER = ['german', 'mandarin', 'english', 'arabic', 'russian'];
  const allLessonsSnap = await db.collection('lessons').where('status', '==', 'approved').get();
  const totalLessons = allLessonsSnap.size;

  const lessonMap = {};
  allLessonsSnap.forEach((d) => {
    lessonMap[d.id] = {
      academy: d.data().academy || 'german',
      order: d.data().order || 0,
      courseId: d.data().courseId || '',
      title: d.data().title || '',
      level: d.data().level || ''
    };
  });

  const progSnap = await db.collection('progress').doc(uid).get();
  const completedLessons = progSnap.exists ? (progSnap.data().completedLessons || []) : [];
  const completedSet = {};
  completedLessons.forEach((id) => { completedSet[id] = true; });

  // Progression par académie (anneaux %).
  const academyTotals = {};
  allLessonsSnap.forEach((d) => {
    const a = d.data().academy || 'german';
    academyTotals[a] = (academyTotals[a] || 0) + 1;
  });
  const academyDone = {};
  completedLessons.forEach((id) => {
    const l = lessonMap[id];
    if (l) academyDone[l.academy] = (academyDone[l.academy] || 0) + 1;
  });
  const academyProgress = ACADEMY_ORDER.filter((a) => academyTotals[a]).map((a) => ({
    academy: a,
    completed: academyDone[a] || 0,
    total: academyTotals[a] || 0,
    pct: academyTotals[a] ? Math.round(((academyDone[a] || 0) / academyTotals[a]) * 100) : 0
  }));

  // Prochaine leçon à reprendre (première leçon approuvée non terminée).
  let nextLesson = null;
  {
    const sorted = allLessonsSnap.docs
      .map((d) => {
        const m = lessonMap[d.id];
        return { id: d.id, academy: m.academy, order: m.order, courseId: m.courseId, title: m.title, level: m.level };
      })
      .sort((a, b) => {
        const ao = ACADEMY_ORDER.indexOf(a.academy);
        const bo = ACADEMY_ORDER.indexOf(b.academy);
        if (ao !== bo) return ao - bo;
        if (a.courseId !== b.courseId) return a.courseId.localeCompare(b.courseId);
        return (a.order || 0) - (b.order || 0);
      });
    for (const l of sorted) {
      if (!completedSet[l.id]) { nextLesson = l; break; }
    }
  }

  // Quiz : meilleurs scores, moyennes et série (streak).
  const qsSnap = await db.collection('quizScores').where('uid', '==', uid).get();
  const bestQuizScores = qsSnap.docs.map((d) => ({
    quizId: d.data().quizId,
    title: d.data().title,
    bestScore: d.data().bestScore,
    total: d.data().total
  }));
  const quizzesTaken = qsSnap.size;
  let avgScore = 0;
  if (quizzesTaken) {
    let sum = 0, cnt = 0;
    qsSnap.docs.forEach((d) => {
      const t = d.data().total, b = d.data().bestScore;
      if (t) { sum += (b || 0) / t; cnt++; }
    });
    avgScore = cnt ? Math.round((sum / cnt) * 100) : 0;
  }
  let streak = 0;
  {
    const dayKey = (dt) => dt.getFullYear() + '-' + dt.getMonth() + '-' + dt.getDate();
    const days = new Set();
    qsSnap.docs.forEach((d) => {
      const u = d.data().updatedAt;
      if (!u) return;
      const dt = u.toDate ? u.toDate() : new Date(u);
      days.add(dayKey(dt));
    });
    const today = new Date();
    let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (!days.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - 86400000);
    while (days.has(dayKey(cursor))) {
      streak++;
      cursor = new Date(cursor.getTime() - 86400000);
    }
  }

  // Certificats délivrés.
  const certSnap = await db.collection('certificates').where('userId', '==', uid).get();
  const certificates = certSnap.docs.map((d) => ({
    id: d.id,
    title: d.data().quizTitle,
    academy: d.data().academy,
    level: d.data().level,
    percentage: d.data().percentage,
    pdfUrl: d.data().pdfUrl,
    issuedAt: ts(d.data().issuedAt)
  })).sort((a, b) => (b.issuedAt || 0) - (a.issuedAt || 0));

  let nextLiveClass = null;
  {
    const lcSnap = await db.collection('liveClasses').where('status', '==', 'approved').get();
    const nowMs = Date.now();
    const upcoming = lcSnap.docs
      .map((d) => ({ id: d.id, title: d.data().title, scheduledAt: ts(d.data().scheduledAt) }))
      .filter((l) => l.scheduledAt && l.scheduledAt > nowMs)
      .sort((a, b) => a.scheduledAt - b.scheduledAt);
    if (upcoming.length) nextLiveClass = upcoming[0];
  }

  return {
    subscription,
    user,
    transactions,
    progress: { completed: completedLessons.length, total: totalLessons },
    academyProgress,
    nextLesson,
    quizStats: { taken: quizzesTaken, avg: avgScore, streak: streak },
    bestQuizScores,
    certificates,
    nextLiveClass
  };
});

/**
 * Lien de réunion (Zoom/Meet) — visible uniquement aux abonnés actifs de la
 * même académie, à partir de 15 minutes avant le début du cours.
 */
exports.getLiveMeetingLink = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const liveClassId = request.data && request.data.liveClassId;
  if (!liveClassId) {
    throw new HttpsError('invalid-argument', 'missing-live-class-id');
  }

  const lcSnap = await db.collection('liveClasses').doc(liveClassId).get();
  if (!lcSnap.exists) {
    throw new HttpsError('not-found', 'not-found');
  }
  const lc = lcSnap.data();

  const access = await academyAndSubscription(uid);
  if (!canAccess(access, lc)) {
    throw new HttpsError('failed-precondition', 'active-subscription-required');
  }

  const scheduledAt = lc.scheduledAt && lc.scheduledAt.toDate ? lc.scheduledAt.toDate() : new Date(lc.scheduledAt);
  const now = new Date();
  const gateStart = new Date(scheduledAt.getTime() - 15 * 60000);
  const gateEnd = new Date(scheduledAt.getTime() + 4 * 3600000);
  if (now < gateStart || now > gateEnd) {
    throw new HttpsError('failed-precondition', 'class-not-open');
  }

  return { meetingLink: lc.meetingLink, title: lc.title, scheduledAt: scheduledAt.getTime() };
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

/* ============================================================
   INTERFACE ADMIN — validation du contenu
   ============================================================ */
const CONTENT_COLLECTIONS = ['lessons', 'quizzes', 'liveClasses'];

function previewFor(collection, d) {
  if (collection === 'lessons') {
    return { kind: 'lesson', description: d.description || '', content: d.content || '', level: d.level || '' };
  }
  if (collection === 'quizzes') {
    return { kind: 'quiz', questionCount: (d.questions || []).length, questions: (d.questions || []).map((q) => q.text) };
  }
  if (collection === 'liveClasses') {
    return { kind: 'live', scheduledAt: ts(d.scheduledAt), meetingLink: d.meetingLink || '' };
  }
  return {};
}

/** File d'attente de validation (admin only) : tout le contenu "pending". */
exports.getAdminQueue = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const caller = await db.collection('users').doc(request.auth.uid).get();
  if (!caller.exists || caller.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'admin-only');
  }

  const items = [];
  for (const c of CONTENT_COLLECTIONS) {
    const snap = await db.collection(c).where('status', '==', 'pending').get();
    for (const doc of snap.docs) {
      const d = doc.data();
      let teacherName = null;
      if (d.teacherUid) {
        const tu = await db.collection('users').doc(d.teacherUid).get();
        teacherName = tu.exists ? (tu.data().displayName || tu.data().email || null) : null;
      }
      items.push({
        collection: c,
        id: doc.id,
        title: d.title,
        academy: d.academy,
        teacherName: teacherName,
        submittedAt: ts(d.createdAt),
        preview: previewFor(c, d)
      });
    }
  }
  items.sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0));
  return { items };
});

/** Approuve ou rejette un contenu (admin only). */
exports.reviewContent = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const caller = await db.collection('users').doc(request.auth.uid).get();
  if (!caller.exists || caller.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'admin-only');
  }

  const data = request.data || {};
  const collection = data.collection;
  const docId = data.docId;
  const decision = data.decision;
  const reason = String(data.reason || '').trim();

  if (!CONTENT_COLLECTIONS.includes(collection)) {
    throw new HttpsError('invalid-argument', 'invalid-collection');
  }
  if (!docId) {
    throw new HttpsError('invalid-argument', 'missing-doc-id');
  }
  if (decision !== 'approve' && decision !== 'reject') {
    throw new HttpsError('invalid-argument', 'invalid-decision');
  }
  if (decision === 'reject' && !reason) {
    throw new HttpsError('invalid-argument', 'reason-required');
  }

  const patch = {
    status: decision === 'approve' ? 'approved' : 'rejected',
    reviewedAt: new Date()
  };
  if (decision === 'reject') patch.rejectReason = reason;

  await db.collection(collection).doc(docId).set(patch, { merge: true });
  return { ok: true, docId, status: patch.status };
});

/* ============================================================
   CURRICULUM — seed + catalogue + cours (réplique FA)
   ============================================================ */
function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function requireAdmin(uid) {
  const caller = await db.collection('users').doc(uid).get();
  if (!caller.exists || caller.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'admin-only');
  }
}

async function academyAndSubscription(uid) {
  const userSnap = await db.collection('users').doc(uid).get();
  const u = userSnap.exists ? userSnap.data() : {};
  const academy = u.academy || (Array.isArray(u.academies) && u.academies[0]) || null;
  const role = u.role || 'student';
  const subSnap = await db.collection('subscriptions').doc(uid).get();
  const sub = subSnap.exists ? subSnap.data() : null;
  const active = sub && sub.status === 'active' && sub.endDate && sub.endDate.toDate && sub.endDate.toDate() > new Date();
  return { academy, role, active };
}

/** Règle d'accès (modèle Francophone) :
    admin → total ; teacher → son académie ; abonné actif → total ;
    compte gratuit/trial → contenu trial uniquement ; sinon refus. */
function canAccess(access, content) {
  if (!access) return false;
  if (access.role === 'admin') return true;
  if (access.role === 'teacher') return !content || content.academy === access.academy;
  if (content && content.isTrial) return true;
  return !!access.active;
}

/** Seed du curriculum (admin only, idempotent : IDs déterministes). */
exports.seedCurriculum = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  await requireAdmin(request.auth.uid);

  const curriculum = require('./curriculum');
  const quizzes = require('./curriculum-quizzes');
  let nCourses = 0, nLessons = 0, nQuizzes = 0;

  for (const course of curriculum) {
    const courseId = slugify(course.academy + '-' + course.title);
    await db.collection('courses').doc(courseId).set({
      academy: course.academy, level: course.level, title: course.title,
      description: course.description, category: course.category,
      learningOutcomes: course.learningOutcomes || [], order: course.order || 1,
      status: 'approved', createdAt: new Date()
    });
    nCourses++;

    for (let i = 0; i < course.lessons.length; i++) {
      const lesson = course.lessons[i];
      const lessonId = courseId + '-l' + (i + 1);
      const quizId = lessonId + '-quiz';
      const isTrial = i === 0; // 1re leçon de chaque académie = essai gratuit

      const quizKey = course.academy + '|' + lesson.title;
      const quiz = quizzes[quizKey];

      await db.collection('lessons').doc(lessonId).set({
        courseId: courseId, academy: course.academy, level: course.level,
        order: i + 1, title: lesson.title, objectives: lesson.objectives || [],
        content: lesson.content, vocabulary: lesson.vocabulary || [],
        grammar: lesson.grammar || [], exercises: lesson.exercises || [],
        videoUrl: lesson.videoUrl || '', quizId: quiz ? quizId : null,
        isTrial: isTrial,
        teacherUid: null, status: 'approved', createdAt: new Date()
      });
      nLessons++;

      if (quiz && quiz.questions && quiz.questions.length) {
        await db.collection('quizzes').doc(quizId).set({
          lessonId: lessonId, courseId: courseId, academy: course.academy,
          level: course.level, title: lesson.title + ' — Quiz',
          questions: quiz.questions, isTrial: isTrial,
          teacherUid: null, status: 'approved', createdAt: new Date()
        });
        nQuizzes++;
      }
    }
  }

  return { courses: nCourses, lessons: nLessons, quizzes: nQuizzes };
});

/** Catalogue des cours de l'académie de l'élève (abonné). */
/** Catalogue public des cours (toutes académies) — sans auth, sans abonnement.
    Seules les métadonnées (titre/niveau/description) sont exposées ;
    le contenu des leçons reste derrière abonnement (getCourse + règles). */
exports.getCatalog = onCall({ region: REGION }, async () => {
  const snap = await db.collection('courses').where('status', '==', 'approved').get();
  const courses = snap.docs.map((d) => ({ id: d.id, title: d.data().title, level: d.data().level, description: d.data().description, category: d.data().category, academy: d.data().academy, learningOutcomes: d.data().learningOutcomes || [], order: d.data().order || 0 }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return { courses };
});

/** Liste publique des quizz (métadonnées seules, sans les questions). */
exports.getQuizCatalog = onCall({ region: REGION }, async () => {
  const snap = await db.collection('quizzes').where('status', '==', 'approved').get();
  const quizzes = snap.docs.map((d) => ({ id: d.id, title: d.data().title, level: d.data().level, academy: d.data().academy }))
    .sort((a, b) => String(a.academy).localeCompare(String(b.academy)) || String(a.level).localeCompare(String(b.level)));
  return { quizzes };
});

/** Liste publique des cours live à venir (sans le lien de réunion). */
exports.getLiveCatalog = onCall({ region: REGION }, async () => {
  const snap = await db.collection('liveClasses').where('status', '==', 'approved').get();
  const now = Date.now();
  const classes = snap.docs
    .map((d) => ({ id: d.id, title: d.data().title, scheduledAt: ts(d.data().scheduledAt), academy: d.data().academy }))
    .filter((c) => c.scheduledAt && c.scheduledAt > now)
    .sort((a, b) => a.scheduledAt - b.scheduledAt);
  return { classes };
});

/** Détail d'un cours : leçons (liste légère, public) + progression + quizz associés.
    Le contenu des leçons/quizz reste géré par les règles Firestore. */
exports.getCourse = onCall({ region: REGION }, async (request) => {
  const courseId = request.data && request.data.courseId;
  if (!courseId) {
    throw new HttpsError('invalid-argument', 'missing-course-id');
  }

  const courseSnap = await db.collection('courses').doc(courseId).get();
  if (!courseSnap.exists) {
    throw new HttpsError('not-found', 'course-not-found');
  }
  const c = courseSnap.data();
  const course = {
    id: courseId, title: c.title, level: c.level, description: c.description,
    category: c.category, academy: c.academy, learningOutcomes: c.learningOutcomes || []
  };

  const lessonsSnap = await db.collection('lessons').where('courseId', '==', courseId).get();
  const lessons = lessonsSnap.docs.map((d) => ({
    id: d.id, title: d.data().title, order: d.data().order || 0,
    objectives: d.data().objectives || [], quizId: d.data().quizId || null,
    isTrial: d.data().isTrial === true
  })).sort((a, b) => (a.order || 0) - (b.order || 0));

  let completedLessons = [];
  if (request.auth && request.auth.uid) {
    const progSnap = await db.collection('progress').doc(request.auth.uid).get();
    completedLessons = progSnap.exists ? (progSnap.data().completedLessons || []) : [];
  }

  return { course, lessons, completedLessons, total: lessons.length };
});

/* ============================================================
   CERTIFICATS — génération PDF (pdfkit) à 80 % de réussite
   ============================================================ */
exports.generateCertificate = onDocumentWritten({ region: REGION, document: 'quizScores/{docId}' }, async (event) => {
  const data = event.data.after.data();
  if (!data) return;
  const uid = data.uid;
  const quizId = data.quizId;
  const total = data.total || 1;
  const bestScore = data.bestScore || 0;
  if (!uid || !quizId || bestScore / total < 0.8) return;

  // Idempotence : un seul certificat par quizz.
  const existing = await db.collection('certificates').where('userId', '==', uid).where('quizId', '==', quizId).limit(1).get();
  if (!existing.empty) return;

  const quizSnap = await db.collection('quizzes').doc(quizId).get();
  const quiz = quizSnap.exists ? quizSnap.data() : null;
  const userSnap = await db.collection('users').doc(uid).get();
  const studentName = userSnap.exists ? (userSnap.data().displayName || 'Student') : 'Student';
  const academy = quiz ? (quiz.academy || '') : '';
  const courseId = quiz ? (quiz.courseId || '') : '';
  const verificationCode = 'ELA-' + (academy || 'XX').toUpperCase().slice(0, 4) + '-' + Math.floor(10000 + Math.random() * 90000);

  let pdfUrl = null;
  try {
    const PDFDocument = require('pdfkit');
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = 841.89, H = 595.28;
      doc.rect(0, 0, W, H).fill('#063D2C');
      doc.lineWidth(2).rect(24, 24, W - 48, H - 48).stroke('#C9A227');
      doc.lineWidth(0.5).rect(30, 30, W - 60, H - 60).stroke('#C9A227');
      doc.fillColor('#C9A227').fontSize(16).font('Times-Bold').text('E-LEARN LANGUAGE ACADEMY', 0, 70, { align: 'center' });
      doc.fillColor('#FAF6EC').fontSize(34).text('Certificate of Achievement', 0, 110, { align: 'center' });
      doc.fillColor('#8ea79b').fontSize(12).font('Helvetica').text('This certifies that', 0, 175, { align: 'center' });
      doc.fillColor('#FAF6EC').fontSize(26).font('Times-Bold').text(studentName, 0, 200, { align: 'center' });
      doc.fillColor('#8ea79b').fontSize(12).font('Helvetica').text('has successfully completed the assessment', 0, 242, { align: 'center' });
      doc.fillColor('#C9A227').fontSize(18).font('Times-Bold').text((quiz ? quiz.title : 'Assessment'), 0, 266, { align: 'center' });
      doc.fillColor('#FAF6EC').fontSize(13).font('Helvetica').text('Level ' + (quiz ? quiz.level : '') + '  —  Score ' + Math.round((bestScore / total) * 100) + '%', 0, 300, { align: 'center' });
      doc.fillColor('#8ea79b').fontSize(10).text('Issued: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 60, H - 80);
      doc.fillColor('#C9A227').font('Courier-Bold').text('Code: ' + verificationCode, 60, H - 62);
      doc.fillColor('#8ea79b').font('Helvetica').text('E-Learn Language Academy — One Academy. Five Languages.', W - 60, H - 62, { align: 'right' });
      doc.end();
    });

    const bucket = admin.storage().bucket();
    const filePath = 'certificates/' + uid + '/' + verificationCode + '.pdf';
    const file = bucket.file(filePath);
    await file.save(pdfBuffer, { contentType: 'application/pdf' });
    await file.makePublic();
    pdfUrl = 'https://storage.googleapis.com/' + bucket.name + '/' + filePath;
  } catch (err) {
    console.error('[Certificate] PDF/Storage failed (metadata only):', err && err.message);
  }

  await db.collection('certificates').add({
    userId: uid, quizId: quizId, quizTitle: quiz ? quiz.title : 'Assessment',
    academy: academy, courseId: courseId, level: quiz ? quiz.level : '',
    score: bestScore, total: total, percentage: Math.round((bestScore / total) * 100),
    studentName: studentName, pdfUrl: pdfUrl, verificationCode: verificationCode,
    issuedAt: new Date()
  });

  console.log('[Certificate] generated:', verificationCode);
  return null;
});
