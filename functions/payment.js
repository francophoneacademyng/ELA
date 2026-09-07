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
// Imports scheduler/firestore retirés : non utilisés (fix timeout déploiement).
const crypto = require('crypto');
const admin = require('firebase-admin');

// admin.initializeApp() removed - initialized in index.js
// Firestore paresseux (fix timeout déploiement — voir index.js).
const db = new Proxy({}, {
  get: function (_t, prop) {
    return admin.firestore()[prop];
  }
});

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

