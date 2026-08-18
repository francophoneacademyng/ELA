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
