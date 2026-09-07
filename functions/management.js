/* ============================================================
   management.js — Fonctions de gestion admin premium (réplique FA)
   updateUserProfile (étendu : plan, durée, abonnement),
   getContentStats, createCustomInvoice, getInvoiceList,
   getWhatsAppLogs. NE PAS modifier admin.js.
   ============================================================ */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
// Firestore paresseux (même pattern que index.js — fix timeout déploiement).
const db = new Proxy({}, {
  get: function (_t, prop) { return admin.firestore()[prop]; }
});

const REGION = 'africa-south1';
const MAX_PAGE = 100;


const VALID_ACADEMIES = ['french', 'german', 'mandarin', 'english', 'arabic', 'russian'];
const VALID_PLANS = ['free', 'general', 'premium', 'business'];
const VALID_ROLES = ['student', 'teacher', 'admin'];

/** Garde : appelant authentifié + rôle admin dans Firestore. */
async function requireAdmin(req) {
  if (!req.auth || !req.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const doc = await db.collection('users').doc(req.auth.uid).get();
  if (!doc.exists || doc.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'admin-only');
  }
}

function ts(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/* ============================================================
   updateUserProfile — Mise à jour d'un utilisateur (admin only).
   Champs autorisés : role, academy, displayName, plan,
   durationMonths, subscriptionStatus.
   Si plan/durée fournis : la subscription {uid} est synchronisée
   (status active + endDate = now + mois). Révocation : plan free +
   subscriptionStatus 'revoked' → subscription désactivée.
   ============================================================ */
exports.updateUserProfile = onCall({ region: REGION }, async (req) => {
  await requireAdmin(req);
  const data = req.data || {};
  const uid = data.uid;
  const updates = data.updates;
  if (!uid || !updates || typeof updates !== 'object') {
    throw new HttpsError('invalid-argument', 'missing-uid-or-updates');
  }

  const allowed = ['role', 'academy', 'displayName', 'plan', 'durationMonths', 'subscriptionStatus'];
  const clean = {};
  for (const k of allowed) {
    if (updates[k] !== undefined) clean[k] = updates[k];
  }
  if (clean.role !== undefined && !VALID_ROLES.includes(clean.role)) {
    throw new HttpsError('invalid-argument', 'invalid-role');
  }
  if (clean.academy !== undefined && clean.academy !== '' && !VALID_ACADEMIES.includes(clean.academy)) {
    throw new HttpsError('invalid-argument', 'invalid-academy');
  }
  if (clean.academy === '') clean.academy = null;
  if (clean.plan !== undefined && !VALID_PLANS.includes(clean.plan)) {
    throw new HttpsError('invalid-argument', 'invalid-plan');
  }
  if (clean.durationMonths !== undefined && clean.durationMonths !== null) {
    const d = Number(clean.durationMonths);
    if (![1, 3, 6].includes(d)) throw new HttpsError('invalid-argument', 'invalid-duration');
    clean.durationMonths = d;
  }

  await db.collection('users').doc(uid).update(clean);

  // --- Synchronisation de la subscription (comme le webhook Paystack) ---
  const revoked = clean.subscriptionStatus === 'revoked';
  const planChanged = clean.plan !== undefined;
  if (revoked || planChanged) {
    const subRef = db.collection('subscriptions').doc(uid);
    if (revoked || clean.plan === 'free') {
      await subRef.set({
        plan: clean.plan || 'free',
        status: 'revoked',
        endDate: new Date(),
        updatedAt: new Date()
      }, { merge: true });
    } else if (planChanged && clean.plan) {
      const months = clean.durationMonths || 1;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);
      await subRef.set({
        plan: clean.plan,
        status: 'active',
        endDate: endDate,
        updatedAt: new Date()
      }, { merge: true });
    }
  }

  return { ok: true, uid, updated: Object.keys(clean) };
});

/* ============================================================
   getContentStats — KPIs contenus (cours, publiés, brouillons,
   quiz, live classes). Admin only.
   ============================================================ */
exports.getContentStats = onCall({ region: REGION }, async (req) => {
  await requireAdmin(req);
  const lessonsSnap = await db.collection('lessons').get();
  const quizzesSnap = await db.collection('quizzes').get();
  const liveSnap = await db.collection('liveClasses').get();
  let published = 0;
  let drafts = 0;
  lessonsSnap.forEach(function (d) {
    const st = d.data().status || 'published';
    if (st === 'draft') drafts++; else published++;
  });
  return {
    courses: lessonsSnap.size,
    published: published,
    drafts: drafts,
    quizzes: quizzesSnap.size,
    liveClasses: liveSnap.size
  };
});

/* ============================================================
   createCustomInvoice — Facture manuelle (admin only).
   ============================================================ */
exports.createCustomInvoice = onCall({ region: REGION }, async (req) => {
  await requireAdmin(req);
  const d = req.data || {};
  const clientEmail = String(d.clientEmail || '').trim();
  const amount = Number(d.amount);
  if (!clientEmail || !amount || amount <= 0) {
    throw new HttpsError('invalid-argument', 'missing-email-or-amount');
  }
  const ref = db.collection('invoices').doc();
  const invoiceNumber = 'ELA-' + Date.now();
  await ref.set({
    id: ref.id,
    invoiceNumber: invoiceNumber,
    clientEmail: clientEmail,
    clientName: String(d.clientName || '').trim(),
    program: String(d.program || '').trim(),
    duration: String(d.duration || '1 mois'),
    frequency: String(d.frequency || '').trim(),
    amount: amount,
    status: 'pending',
    createdAt: new Date(),
    createdBy: req.auth.uid
  });
  return { ok: true, invoiceId: ref.id, invoiceNumber: invoiceNumber };
});

/* ============================================================
   getInvoiceList — Factures personnalisées (admin only, borné).
   ============================================================ */
exports.getInvoiceList = onCall({ region: REGION }, async (req) => {
  await requireAdmin(req);
  const snap = await db.collection('invoices')
    .orderBy('createdAt', 'desc').limit(MAX_PAGE).get();
  return {
    invoices: snap.docs.map(function (doc) {
      const x = doc.data() || {};
      return {
        id: doc.id,
        invoiceNumber: x.invoiceNumber || doc.id,
        clientEmail: x.clientEmail || '',
        clientName: x.clientName || '',
        program: x.program || '',
        duration: x.duration || '',
        frequency: x.frequency || '',
        amount: x.amount || 0,
        status: x.status || 'pending',
        createdAt: ts(x.createdAt)
      };
    })
  };
});

/* ============================================================
   getWhatsAppLogs — Logs d'envoi WhatsApp (admin only, borné).
   ============================================================ */
exports.getWhatsAppLogs = onCall({ region: REGION }, async (req) => {
  await requireAdmin(req);
  const snap = await db.collection('whatsappLogs')
    .orderBy('createdAt', 'desc').limit(MAX_PAGE).get();
  return {
    logs: snap.docs.map(function (doc) {
      const x = doc.data() || {};
      return {
        id: doc.id,
        type: x.type || '',
        to: x.to || '',
        status: x.status || '',
        template: x.template || '',
        detail: x.detail || '',
        createdAt: ts(x.createdAt)
      };
    })
  };
});
