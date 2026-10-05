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
const academyScope = require('./academy-scope.js');

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

/** Timestamp Firestore / Date / ISO / ms → millisecondes (null si absent). */
function ts(v) {
  if (!v) return null;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

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

exports.getTeacherStats = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;

  // Vérifier que l'utilisateur est teacher ou admin
  const userSnap = await db.collection('users').doc(uid).get();
  const role = userSnap.exists ? (userSnap.data().role || 'student') : 'student';
  if (role !== 'teacher' && role !== 'admin') {
    throw new HttpsError('permission-denied', 'teacher-or-admin-only');
  }

  const isAdmin = role === 'admin';

  // Récupérer les soumissions de l'enseignant
  const collections = ['lessons', 'quizzes', 'liveClasses'];
  const stats = { total: 0, pending: 0, approved: 0, rejected: 0, byType: { lesson: 0, quiz: 0, live: 0 } };
  const recent = [];

  for (const col of collections) {
    const snap = await db.collection(col).where('teacherUid', '==', uid).get();
    for (const doc of snap.docs) {
      const d = doc.data() || {};
      stats.total++;
      stats[d.status] = (stats[d.status] || 0) + 1;
      const type = col === 'lessons' ? 'lesson' : col === 'quizzes' ? 'quiz' : 'live';
      stats.byType[type]++;
      recent.push({
        id: doc.id,
        type: type,
        title: d.title || '',
        academy: d.academy || '',
        status: d.status || 'pending',
        createdAt: ts(d.createdAt)
      });
    }
  }

  // Trier par date (plus récent d'abord)
  recent.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  /* ------------------------------------------------------------
     Roster des élèves (isolation par académie + rôle).
     - admin   : tous les élèves (rôle student)
     - teacher : élèves de SA SEULE académie (jamais d'autres académies)
     La logique de filtrage est PURE et testée (academy-scope.js).
     ------------------------------------------------------------ */
  const students = await loadTeacherStudents(uid, role);

  return {
    stats: Object.assign({}, stats, { students: students.length }),
    recent: recent.slice(0, 10),
    students: students
  };
});

/* Charge les élèves visibles par l'appelant (roster), borné et enrichi.
   Le filtrage (rôle + académie) est délégué à academy-scope.js (PUR). */
async function loadTeacherStudents(uid, role) {
  const isAdmin = role === 'admin';
  const callerSnap = await db.collection('users').doc(uid).get();
  const callerAcademy = callerSnap.exists ? callerSnap.data().academy : null;

  // Élèves = role 'student' (canonique ; createAccount/ensureProfile le fixent).
  const snap = await db.collection('users').where('role', '==', 'student').limit(500).get();
  const records = snap.docs.map((d) => ({
    uid: d.id,
    role: d.data().role || 'student',
    academy: d.data().academy || null,
    academies: d.data().academies || null,
    displayName: d.data().displayName || '',
    email: d.data().email || ''
  }));

  const allowedUids = academyScope.filterTeacherStudents(records, callerAcademy, isAdmin);
  const allowedSet = {};
  allowedUids.forEach((x) => { allowedSet[x] = true; });

  const students = records
    .filter((r) => allowedSet[r.uid])
    .map((r) => ({
      uid: r.uid,
      displayName: r.displayName,
      email: r.email,
      academy: academyScope.normalizeAcademyKey(r.academy || (Array.isArray(r.academies) && r.academies[0])) || null
    }));

  // Enrichissement borné : progression (leçons complétées) + dernière activité.
  const MAX_ENRICH = 100;
  const toEnrich = students.slice(0, MAX_ENRICH);
  for (const s of toEnrich) {
    try {
      const progSnap = await db.collection('progress').doc(s.uid).get();
      if (progSnap.exists) {
        const p = progSnap.data();
        const completed = Array.isArray(p.completedLessons) ? p.completedLessons.length : 0;
        s.progress = completed;
        s.lastActive = ts(p.updatedAt) || null;
      }
    } catch (e) {
      s.progress = null;
      s.lastActive = null;
    }
    if (s.progress == null) s.progress = null;
  }

  return students;
}

/* ============================================================
   CERTIFICATS ELA � centralisation (cf. ela-certificates.js)
   ============================================================ */
Object.assign(module.exports, require('./ela-certificates.js'));


