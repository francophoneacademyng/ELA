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

/** Timestamp Firestore / Date / ISO / ms → millisecondes (0 si absent). */
function ts(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
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
   INTERFACE ADMIN — données agrégées du panel (réplique FA)
   Remplace les 6 lectures pleine collection du client :
   l'agrégation est faite côté serveur, paginée et bornée.
   ============================================================ */
const ADMIN_PAGE_SIZE = 100;

exports.getAdminPanelData = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  await requireAdmin(request.auth.uid);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  // --- Utilisateurs (borné) — PAS de orderBy Firestore : les documents
  // sans champ `createdAt` seraient exclus du résultat (comportement
  // Firestore). Tri en mémoire à la place. ---
  const usersSnap = await db.collection('users').limit(ADMIN_PAGE_SIZE).get();
  const users = usersSnap.docs.map((d) => {
    const u = d.data() || {};
    return {
      id: d.id,
      name: u.displayName || '',
      email: u.email || '',
      role: u.role || 'student',
      academy: u.academy || null,
      referralCodeUsed: u.referralCodeUsed || null,
      referralCredit: u.referralCredit || 0,
      createdAt: ts(u.createdAt)
    };
  });
  users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // --- Transactions (borné, tri desc) ---
  const txSnap = await db.collection('transactions')
    .orderBy('createdAt', 'desc').limit(ADMIN_PAGE_SIZE).get();
  const transactions = txSnap.docs.map((d) => {
    const x = d.data() || {};
    return {
      id: d.id,
      uid: x.uid || '',
      plan: x.plan || 'general',
      amount: x.amount || 0,
      discount: x.discount || 0,
      creditUsed: x.creditUsed || 0,
      status: x.status || 'pending',
      createdAt: ts(x.createdAt)
    };
  });

  // --- Abonnements ---
  const subsSnap = await db.collection('subscriptions').get();
  const subscriptions = subsSnap.docs.map((d) => {
    const s = d.data() || {};
    return { uid: d.id, plan: s.plan || 'general', status: s.status || '', endDate: ts(s.endDate) };
  });

  // --- Live classes à venir (30 jours glissants) ---
  const horizon = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
  const liveSnap = await db.collection('liveClasses')
    .where('scheduledAt', '>=', now).where('scheduledAt', '<=', horizon)
    .orderBy('scheduledAt', 'asc').limit(50).get();
  const liveClasses = liveSnap.docs.map((d) => {
    const l = d.data() || {};
    return {
      id: d.id, title: l.title || '', academy: l.academy || null,
      teacherUid: l.teacherUid || null, scheduledAt: ts(l.scheduledAt), status: l.status || ''
    };
  });

  // --- Agrégats (KPI + revenus) — calculés ici, jamais côté client ---
  let revenueThisMonth = 0;
  let revenuePrevMonth = 0;
  let newUsers7d = 0;
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  for (const t of transactions) {
    if (t.status !== 'success') continue;
    if (t.createdAt >= monthStart.getTime()) revenueThisMonth += t.amount;
    else if (t.createdAt >= prevMonthStart.getTime()) revenuePrevMonth += t.amount;
  }
  for (const u of users) {
    if (u.createdAt >= weekAgo.getTime()) newUsers7d++;
  }
  const activeSubs = subscriptions.filter((s) =>
    s.status === 'active' && s.endDate > now.getTime()).length;
  const byPlan = {};
  for (const s of subscriptions) {
    if (s.status === 'active' && s.endDate > now.getTime()) {
      byPlan[s.plan] = (byPlan[s.plan] || 0) + 1;
    }
  }
  const dailyRevenue = {};
  for (const t of transactions) {
    if (t.status !== 'success' || !t.createdAt) continue;
    const d = new Date(t.createdAt);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    dailyRevenue[key] = (dailyRevenue[key] || 0) + t.amount;
  }

  return {
    users, transactions, subscriptions, liveClasses,
    metrics: {
      revenueThisMonth, revenuePrevMonth, newUsers7d, activeSubs,
      byPlan, dailyRevenue, totalUsersCounted: users.length
    }
  };
});


/* ============================================================
   INTERFACE TEACHER — soumission de contenu (réplique FA)
   Les écritures teacher passent par le serveur : mêmes règles
   que firestore.rules (canCreateContent) appliquées ici.
   Les documents atterrissent dans lessons/quizzes/liveClasses
   avec status:'pending' — aucune donnée existante modifiée.
   ============================================================ */
const MAX_CONTENT_LENGTH = 20000;
const MAX_QUESTIONS = 50;

function validateContentPayload(type, p) {
  if (!p || typeof p !== 'object') {
    throw new HttpsError('invalid-argument', 'missing-payload');
  }
  const title = String(p.title || '').trim();
  if (!title || title.length > 200) {
    throw new HttpsError('invalid-argument', 'invalid-title');
  }
  if (type === 'lesson') {
    const content = String(p.content || '').trim();
    if (!content || content.length > MAX_CONTENT_LENGTH) {
      throw new HttpsError('invalid-argument', 'invalid-content');
    }
    const levels = ['beginner', 'intermediate', 'advanced'];
    if (!levels.includes(p.level)) {
      throw new HttpsError('invalid-argument', 'invalid-level');
    }
    return { title, description: String(p.description || '').trim(), content, level: p.level };
  }
  if (type === 'quiz') {
    const qs = Array.isArray(p.questions) ? p.questions : [];
    if (!qs.length || qs.length > MAX_QUESTIONS) {
      throw new HttpsError('invalid-argument', 'invalid-questions');
    }
    const questions = qs.map((q) => {
      const text = String((q && q.text) || '').trim();
      const options = Array.isArray(q && q.options) ? q.options.map((o) => String(o || '').trim()) : [];
      const correctIndex = Number(q && q.correctIndex);
      if (!text || options.length !== 4 || options.some((o) => !o) ||
          !(correctIndex >= 0 && correctIndex < 4)) {
        throw new HttpsError('invalid-argument', 'invalid-question');
      }
      return { text, options, correctIndex };
    });
    return { title, questions };
  }
  if (type === 'live') {
    const link = String(p.meetingLink || '').trim();
    if (!/^https?:\/\/.+/i.test(link)) {
      throw new HttpsError('invalid-argument', 'invalid-meeting-link');
    }
    const when = new Date(p.scheduledAt || '');
    if (isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      throw new HttpsError('invalid-argument', 'invalid-scheduled-at');
    }
    return { title, scheduledAt: when, meetingLink: link };
  }
  throw new HttpsError('invalid-argument', 'invalid-type');
}

exports.submitContent = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const callerSnap = await db.collection('users').doc(uid).get();
  if (!callerSnap.exists) {
    throw new HttpsError('permission-denied', 'teacher-only');
  }
  const caller = callerSnap.data();
  const role = caller.role || 'student';
  if (role !== 'teacher' && role !== 'admin') {
    throw new HttpsError('permission-denied', 'teacher-only');
  }

  const data = request.data || {};
  const type = data.type;
  if (!['lesson', 'quiz', 'live'].includes(type)) {
    throw new HttpsError('invalid-argument', 'invalid-type');
  }

  // L'académie est imposée pour un teacher (jamais fournie par le client).
  const academy = role === 'teacher'
    ? caller.academy
    : (VALID_ACADEMIES.includes(data.academy) ? data.academy : caller.academy || VALID_ACADEMIES[0]);
  if (!VALID_ACADEMIES.includes(academy)) {
    throw new HttpsError('invalid-argument', 'teacher-requires-valid-academy');
  }

  const clean = validateContentPayload(type, data.payload);
  const target = type === 'lesson' ? 'lessons' : type === 'quiz' ? 'quizzes' : 'liveClasses';
  const docData = Object.assign({}, clean, {
    academy,
    teacherUid: uid,
    status: 'pending',
    createdAt: new Date()
  });
  const ref = await db.collection(target).add(docData);
  return { ok: true, id: ref.id, collection: target, status: 'pending' };
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

/* ============================================================
   seedAcademyA1 — Injection du contenu A1 Foundations (5 académies).
   Lit les fichiers JSON bundleés dans ./seed-a1/*.json et écrit
   dans courses / lessons / quizzes (idempotent : IDs déterministes,
   jamais de doublon, aucune suppression). Admin uniquement.
   ============================================================ */

/* ============================================================
   updateUserProfile — Mise à jour ciblée d'un profil utilisateur
   (admin uniquement). Champs autorisés : role, academy, displayName.
   ============================================================ */
exports.updateUserProfile = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  await requireAdmin(request.auth.uid);

  const data = request.data || {};
  const uid = data.uid;
  const updates = data.updates || null;
  if (!uid || !updates || typeof updates !== 'object') {
    throw new HttpsError('invalid-argument', 'missing-uid-or-updates');
  }

  const allowed = ['role', 'academy', 'displayName'];
  const clean = {};
  for (const k of allowed) {
    if (updates[k] !== undefined && updates[k] !== null) clean[k] = updates[k];
  }
  if (clean.role !== undefined && !['student', 'teacher', 'admin'].includes(clean.role)) {
    throw new HttpsError('invalid-argument', 'invalid-role');
  }
  if (clean.academy !== undefined && !VALID_ACADEMIES.includes(clean.academy)) {
    throw new HttpsError('invalid-argument', 'invalid-academy');
  }
  if (clean.displayName !== undefined && (typeof clean.displayName !== 'string' || clean.displayName.length > 120)) {
    throw new HttpsError('invalid-argument', 'invalid-displayName');
  }
  if (!Object.keys(clean).length) {
    throw new HttpsError('invalid-argument', 'no-valid-field');
  }

  await db.collection('users').doc(uid).update(clean);
  return { ok: true, uid, updated: Object.keys(clean) };
});

/** Académies valides (clés internes stockées dans users/{uid}.academy). */
const VALID_ACADEMIES = ['french', 'german', 'mandarin', 'english', 'arabic', 'russian'];
