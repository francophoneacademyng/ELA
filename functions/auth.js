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
// Import firestore retiré : non utilisé (fix timeout déploiement).
const { onSchedule } = require('firebase-functions/v2/scheduler');
const crypto = require('crypto');
const admin = require('firebase-admin');
// Helpers partagés exportés par core.js (JALON 5) : ts, sendEmail, EMAIL,
// emailForUser — utilisés par checkSubscriptionExpiry/previewFor (reliquats
// du split résolus, audit inscription 2026-09-07).
const { ts, sendEmail, EMAIL, emailForUser } = require('./core');

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

/** Rôles acceptés (miroir live.js/management.js) — requis par setUserRole. */
const VALID_ROLES = ['student', 'teacher', 'admin'];

/** Académies valides (clés internes stockées dans users/{uid}.academy). */
const VALID_ACADEMIES = ['french', 'german', 'mandarin', 'english', 'arabic', 'russian'];

/* ============================================================
   INSCRIPTION SÉCURISÉE (audit 2026-09-07)
   - createAccount    : inscription 100 % serveur. Auth + doc Firestore rendus
                        atomiques (create-then-compensate : si l'écriture échoue,
                        le compte Auth est supprimé — jamais d'orphelin).
                        Rate limit 3 tentatives/min/IP. role forcé 'student'.
   - checkEmailUnique : vérification d'unicité pour l'UX (on-blur), côté serveur.
   - ensureProfile    : cohérence auth ↔ users au login (répare les orphelins
                        hérités du flux client historique).
   Règle d'or : le client ne peut plus écrire users/{uid} (firestore.rules) ;
   toute création passe ici (Admin SDK), donc jamais un rôle admin/teacher.
   ============================================================ */

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const VALID_INTERFACE_LANGS = ['en', 'fr', 'ar'];
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_CREATE = 3;  // tentatives d'inscription / minute / IP
const RATE_LIMIT_CHECK = 20;  // checks d'unicité / minute / IP (ne bloque pas la frappe)

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

/**
 * serverTimestamp() — statique fiable, chargée à l'exécution via le sous-chemin
 * `firebase-admin/firestore`. admin.firestore.FieldValue n'est PAS garanti dans
 * le runtime émulateur ; un require au top-level réintroduirait le timeout de
 * déploiement (fix documenté plus haut). Import différé = aucun impact au load.
 */
function serverTimestamp() {
  return require('firebase-admin/firestore').FieldValue.serverTimestamp();
}

function isAuthNotFound(err) {
  const code = err && (err.code || (err.errorInfo && err.errorInfo.code));
  return code === 'auth/user-not-found';
}

/** IP du client (callable v2 : rawRequest). Jamais stockée en clair. */
function clientIp(request) {
  const req = request && request.rawRequest;
  if (!req || !req.headers) return null;
  const fwd = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
  if (fwd) return String(fwd).split(',')[0].trim() || null;
  return (req.ip && req.ip !== '::1') ? req.ip : null;
}

/* Fallback mémoire (jamais bloquant à l'échelle) quand l'IP n'est pas résolue. */
const MEMORY_BUCKETS = {};
function memoryRateLimit(bucketKey, max) {
  const now = Date.now();
  const b = MEMORY_BUCKETS[bucketKey] || { count: 0, start: now };
  if (now - b.start >= RATE_WINDOW_MS) { b.count = 0; b.start = now; }
  if (b.count >= max) return false;
  b.count += 1;
  MEMORY_BUCKETS[bucketKey] = b;
  return true;
}

/**
 * Rate limit par bucket (create/check). Un document par IP hashée (sha256),
 * mise à jour transactionnelle — compteur fiable en concurrence.
 * Aucune IP brute stockée, aucun index composite requis.
 */
async function enforceRateLimit(ip, bucket, max) {
  const now = Date.now();
  if (!ip) {
    if (!memoryRateLimit('no-ip', Math.max(1, max))) {
      throw new HttpsError('resource-exhausted', 'rate-limit-exceeded', { retryAfterSeconds: 60 });
    }
    return;
  }
  const hash = crypto.createHash('sha256').update(ip).digest('hex');
  const ref = admin.firestore().collection('signupAttempts').doc(hash);
  await admin.firestore().runTransaction(async (txn) => {
    const snap = await txn.get(ref);
    let count = 0;
    let start = now;
    if (snap.exists) {
      const prev = (snap.data() && snap.data()[bucket]) || {};
      if (prev.start && now - prev.start < RATE_WINDOW_MS) {
        count = prev.count || 0;
        start = prev.start;
      }
    }
    if (count >= max) {
      const retry = Math.max(1, Math.ceil((start + RATE_WINDOW_MS - now) / 1000));
      throw new HttpsError('resource-exhausted', 'rate-limit-exceeded', { retryAfterSeconds: retry });
    }
    txn.set(ref, { [bucket]: { count: count + 1, start: start }, last: now }, { merge: true });
  });
}

/** Email déjà pris ? (collection emails/* ET Firebase Auth — autorité canonique). */
async function emailAlreadyTaken(email) {
  const doc = await admin.firestore().collection('emails').doc(email).get();
  if (doc.exists) return true;
  try {
    await admin.auth().getUserByEmail(email);
    return true;
  } catch (err) {
    if (isAuthNotFound(err)) return false;
    throw err;
  }
}

/** Construit le doc users/{uid} canonique (role toujours 'student'). */
function buildUserDoc(uid, params) {
  const doc = {
    displayName: params.name,
    email: params.email,
    role: 'student',
    interfaceLang: params.interfaceLang,
    academies: params.academy ? [params.academy] : [],
    academy: params.academy || '',
    referralCode: 'ELA-' + uid.slice(0, 6).toUpperCase(),
    referralCodeUsed: params.referral || null,
    referralCredit: 0,
    createdAt: serverTimestamp()
  };
  if (params.source === 'trial') {
    doc.trialProgress = { startedAt: Date.now(), lessonsCompleted: [] };
  }
  return doc;
}

/**
 * createAccount — inscription sécurisée.
 * Ordre : rate-limit → validations → unicité → création Auth →
 *         transaction Firestore (emails/* + users/*) → compensation si échec.
 */
exports.createAccount = onCall({ region: REGION }, async (request) => {
  await enforceRateLimit(clientIp(request), 'create', RATE_LIMIT_CREATE);

  const data = request.data || {};
  const email = normalizeEmail(data.email);
  const password = String(data.password || '');
  const name = String(data.displayName || data.name || '').trim();
  const academy = String(data.academy || '').trim();
  const referral = String(data.referral || data.referralCode || '').trim().toUpperCase();
  const source = String(data.source || '').trim();
  const interfaceLang = String(data.interfaceLang || '').trim();

  if (!EMAIL_RE.test(email)) throw new HttpsError('invalid-argument', 'invalid-email');
  if (password.length < 8) throw new HttpsError('invalid-argument', 'weak-password');
  if (!name) throw new HttpsError('invalid-argument', 'missing-name');
  if (academy && !VALID_ACADEMIES.includes(academy)) throw new HttpsError('invalid-argument', 'invalid-academy');
  const lang = VALID_INTERFACE_LANGS.includes(interfaceLang) ? interfaceLang : 'en';

  if (await emailAlreadyTaken(email)) throw new HttpsError('already-exists', 'email-in-use');

  let uid = null;
  try {
    const record = await admin.auth().createUser({ email: email, password: password, displayName: name });
    uid = record.uid;
  } catch (err) {
    if (err && (err.code === 'auth/email-already-exists' || (err.errorInfo && err.errorInfo.code === 'auth/email-already-exists'))) {
      throw new HttpsError('already-exists', 'email-in-use');
    }
    throw err;
  }

  const firestore = admin.firestore();
  const emailRef = firestore.collection('emails').doc(email);
  const userRef = firestore.collection('users').doc(uid);
  const userDoc = buildUserDoc(uid, { name: name, email: email, interfaceLang: lang, academy: academy, referral: referral, source: source });

  try {
    await firestore.runTransaction(async (txn) => {
      const existing = await txn.get(emailRef);
      if (existing.exists) {
        throw new HttpsError('already-exists', 'email-in-use');
      }
      txn.set(emailRef, { uid: uid, createdAt: serverTimestamp() });
      txn.set(userRef, userDoc);
    });
  } catch (err) {
    /* Compensation : suppression du compte Auth → jamais d'orphelin. */
    if (uid) await admin.auth().deleteUser(uid).catch(function () {});
    if (err && typeof err === 'object'
        && (err.code === 'already-exists' || String(err.message || '').indexOf('email-in-use') >= 0)) {
      throw new HttpsError('already-exists', 'email-in-use');
    }
    throw new HttpsError('aborted', 'account-creation-failed');
  }

  return { ok: true, uid: uid };
});

/** checkEmailUnique — pour le check on-blur du frontend (aucun leak de données). */
exports.checkEmailUnique = onCall({ region: REGION }, async (request) => {
  await enforceRateLimit(clientIp(request), 'check', RATE_LIMIT_CHECK);

  const email = normalizeEmail((request.data && request.data.email) || '');
  if (!EMAIL_RE.test(email)) throw new HttpsError('invalid-argument', 'invalid-email');

  const exists = await emailAlreadyTaken(email);
  return { available: !exists, exists: exists };
});

/**
 * ensureProfile — cohérence auth ↔ users au login.
 * Crée le doc manquant (orphelin) ou normalise l'email stocké (merge).
 * Authentifié : uid = request.auth.uid, aucune donnée arbitraire acceptée.
 */
exports.ensureProfile = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const authUser = await admin.auth().getUser(uid);
  const email = normalizeEmail(authUser.email);

  const userRef = admin.firestore().collection('users').doc(uid);
  await admin.firestore().runTransaction(async (txn) => {
    const snap = await txn.get(userRef);
    if (!snap.exists) {
      const name = authUser.displayName || email.split('@')[0] || 'Student';
      txn.set(userRef, {
        displayName: name,
        email: email,
        role: 'student',
        interfaceLang: 'en',
        academies: [],
        academy: '',
        referralCode: 'ELA-' + uid.slice(0, 6).toUpperCase(),
        referralCodeUsed: null,
        referralCredit: 0,
        createdAt: serverTimestamp()
      });
      return;
    }
    const current = snap.data();
    const patch = {};
    if (!current.email || current.email !== email) patch.email = email;
    if (!current.displayName && authUser.displayName) patch.displayName = authUser.displayName;
    if (Object.keys(patch).length > 0) {
      txn.set(userRef, patch, { merge: true });
    }
  });

  return { ok: true, uid: uid };
});
