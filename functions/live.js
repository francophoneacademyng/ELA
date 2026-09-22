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

/* Garde admin (correction : helper précédemment référencé mais non défini). */
async function requireAdmin(uid) {
  const snap = await db.collection('users').doc(String(uid)).get();
  const role = snap.exists ? (snap.data().role || '') : '';
  if (role !== 'admin' && role !== 'system') {
    throw new HttpsError('permission-denied', 'Admin/system only.');
  }
  return role;
}
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
exports.seedLiveClasses = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  await requireAdmin(request.auth.uid);

  const now = Date.now();
  const day = 24 * 3600 * 1000;

  const sampleClasses = [
    {
      id: 'live-french-conversation-b1',
      title: 'French Conversation Workshop — B1',
      academy: 'german',
      academyCode: 'FR',
      cecrLevel: 'B1',
      description: 'Interactive conversation practice for intermediate learners. Topics: daily life, travel, culture.',
      teacherUid: null,
      teacherName: 'Prof. Marie Laurent',
      scheduledAt: new Date(now + 2 * day),
      duration: 60,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      maxParticipants: 20,
      currentParticipants: 0,
      status: 'approved',
      createdAt: new Date()
    },
    {
      id: 'live-german-grammar-a2',
      title: 'German Grammar Masterclass — A2',
      academy: 'german',
      academyCode: 'DE',
      cecrLevel: 'A2',
      description: 'Focus on German sentence structure, cases (Nominativ, Akkusativ, Dativ) with exercises.',
      teacherUid: null,
      teacherName: 'Lehrer Hans Müller',
      scheduledAt: new Date(now + 3 * day),
      duration: 45,
      meetingLink: 'https://zoom.us/j/1234567890',
      maxParticipants: 15,
      currentParticipants: 0,
      status: 'approved',
      createdAt: new Date()
    },
    {
      id: 'live-english-business-c1',
      title: 'Business English — C1 Networking',
      academy: 'english',
      academyCode: 'EN',
      cecrLevel: 'C1',
      description: 'Advanced business communication: presentations, negotiations, and professional networking.',
      teacherUid: null,
      teacherName: 'Dr. Sarah Johnson',
      scheduledAt: new Date(now + 5 * day),
      duration: 90,
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/abc123',
      maxParticipants: 25,
      currentParticipants: 0,
      status: 'approved',
      createdAt: new Date()
    },
    {
      id: 'live-arabic-culture-b2',
      title: 'Arabic Culture & Language — B2',
      academy: 'arabic',
      academyCode: 'AR',
      cecrLevel: 'B2',
      description: 'Explore Arabic culture through language: idioms, media, and regional dialects.',
      teacherUid: null,
      teacherName: 'أستاذة فاطمة العلي',
      scheduledAt: new Date(now + 7 * day),
      duration: 60,
      meetingLink: 'https://meet.google.com/xyz-abcd-efg',
      maxParticipants: 18,
      currentParticipants: 0,
      status: 'approved',
      createdAt: new Date()
    },
    {
      id: 'live-mandarin-hsk-a1',
      title: 'Mandarin HSK Prep — A1 Foundation',
      academy: 'mandarin',
      academyCode: 'ZH',
      cecrLevel: 'A1',
      description: 'Introduction to Mandarin: tones, pinyin, and basic greetings for HSK 1 preparation.',
      teacherUid: null,
      teacherName: '老师 李小龙',
      scheduledAt: new Date(now + 10 * day),
      duration: 45,
      meetingLink: 'https://zoom.us/j/9876543210',
      maxParticipants: 20,
      currentParticipants: 0,
      status: 'approved',
      createdAt: new Date()
    }
  ];

  let seeded = 0;
  for (const cls of sampleClasses) {
    const existing = await db.collection('liveClasses').doc(cls.id).get();
    if (!existing.exists) {
      await db.collection('liveClasses').doc(cls.id).set(cls);
      seeded++;
    }
  }

  return { seeded, total: sampleClasses.length, message: seeded + ' live classes created (' + (sampleClasses.length - seeded) + ' already existed)' };
});

/* ============================================================
   TEACHER STATS — Statistiques pour le dashboard enseignant
   ============================================================ */
