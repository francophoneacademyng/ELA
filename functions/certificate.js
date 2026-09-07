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
// Import scheduler retiré : non utilisé (fix timeout déploiement).
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
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

exports.generateCertificate = onDocumentWritten({ region: REGION, document: 'quizScores/{docId}' }, async (event) => {
  const data = event.data.after.data();
  if (!data) return;
  const uid = data.uid;
  const quizId = data.quizId;
  const total = data.total || 1;
  const bestScore = data.bestScore || 0;
  if (!uid || !quizId || bestScore / total < 0.8) return;

  // Idempotence : un seul certificat ELA par (élève, quizz).
  const existing = await db.collection('ela_certificates')
    .where('studentId', '==', uid).where('sourceQuizId', '==', quizId).limit(1).get();
  if (!existing.empty) return;

  const quizSnap = await db.collection('quizzes').doc(quizId).get();
  const quiz = quizSnap.exists ? quizSnap.data() : null;
  const userSnap = await db.collection('users').doc(uid).get();
  const studentName = userSnap.exists ? (userSnap.data().displayName || 'Student') : 'Student';
  const academy = quiz ? (quiz.academy || '') : '';

  const certCore = require('./ela-certificate-core.js');
  const academyCode = certCore.ACADEMY_KEY_TO_CODE[String(academy).toLowerCase()] || 'FR';
  const percentage = Math.round((bestScore / total) * 100);

  try {
    // 1) Émission centralisée ELA (event ISSUED écrit par le core).
    const cert = await certCore.issueCertificate({
      academyCode: academyCode,
      studentId: uid,
      studentName: studentName,
      cecrLevel: quiz && certCore.CECRL_LEVELS.indexOf(String(quiz.level || '').toUpperCase()) >= 0
        ? String(quiz.level).toUpperCase() : 'A1',
      score: percentage,
      certificateType: 'achievement',
      createdBy: 'trigger:quiz',
      sourceQuizId: quizId
    });

    // 2) PDF officiel unique (template ela-pdf.js) → Storage.
    try {
      const pdfBuffer = await require('./ela-pdf.js').makeOfficialPdfBuffer(cert);
      const filePath = 'ela-certificates/' + cert.id + '.pdf';
      const bucket = admin.storage().bucket();
      await bucket.file(filePath).save(pdfBuffer, { contentType: 'application/pdf', resumable: false });
      await bucket.file(filePath).makePublic();
      await db.collection('ela_certificates').doc(cert.id).update({
        pdfUrl: 'https://storage.googleapis.com/' + bucket.name + '/' + filePath,
        pdfStoragePath: filePath,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('[Certificate] PDF/Storage failed (metadata only):', err && err.message);
    }

    console.log('[Certificate] issued via ELA centralization:', cert.id);
  } catch (err) {
    console.error('[Certificate] ELA issuance failed:', err && err.message);
  }
  return null;
});

/* ============================================================
   SEED LIVE CLASSES — Crée 3-5 sessions live d'exemple (admin only)
   ============================================================ */
