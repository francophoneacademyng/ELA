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
// Firestore paresseux (fix timeout déploiement — voir index.js) : reporte le
// chargement gRPC (~5 s) au premier appel réel au lieu du chargement du module.
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
    payment: (p) => 'E-Learn Language Academy (ELA)\n\nThank you for your payment.\n\nPlan: ' + p.plan + '\nDuration: ' + p.duration + ' month(s)\nAmount: NGN ' + p.amount + '\nReference: ' + p.reference + '\n\nYour subscription is now active. Welcome to ELA.\n\nE-Learn Language Academy — One Academy. Six Languages.',
    expired: 'E-Learn Language Academy (ELA)\n\nYour subscription has expired. Renew to keep learning.\n\nE-Learn Language Academy — One Academy. Six Languages.',
    renew: 'E-Learn Language Academy (ELA)\n\nYour subscription renews in 7 days or less. Keep your learning uninterrupted.\n\nE-Learn Language Academy — One Academy. Six Languages.'
  },
  fr: {
    paymentSubject: 'ELA — Paiement confirmé',
    expiredSubject: 'ELA — Abonnement expiré',
    renewSubject: 'ELA — Votre abonnement arrive à échéance',
    payment: (p) => 'E-Learn Language Academy (ELA)\n\nMerci pour votre paiement.\n\nFormule : ' + p.plan + '\nDurée : ' + p.duration + ' mois\nMontant : NGN ' + p.amount + '\nRéférence : ' + p.reference + '\n\nVotre abonnement est désormais actif. Bienvenue chez ELA.\n\nE-Learn Language Academy — Une académie. Six langues.',
    expired: 'E-Learn Language Academy (ELA)\n\nVotre abonnement a expiré. Renouvelez pour continuer à apprendre.\n\nE-Learn Language Academy — Une académie. Six langues.',
    renew: 'E-Learn Language Academy (ELA)\n\nVotre abonnement arrive à échéance dans 7 jours ou moins. Gardez votre apprentissage ininterrompu.\n\nE-Learn Language Academy — Une académie. Six langues.'
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
  const ACADEMY_ORDER = ['french', 'german', 'mandarin', 'english', 'arabic', 'russian'];
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

  // --- Progression par niveau CECRL (pour le dashboard utilisateur) ---
  const completedByLevel = {};
  {
    // Récupérer les leçons complétées avec leur niveau CECRL
    const completedLessonDetails = allLessonsSnap.docs
      .filter((d) => completedSet[d.id])
      .map((d) => {
        const data = d.data() || {};
        return {
          id: d.id,
          level: data.level || '',
          cecrLevel: data.cecrLevel || data.level || ''
        };
      });

    // Compter par niveau CECRL
    completedLessonDetails.forEach((l) => {
      const lvl = l.cecrLevel || l.level || 'A1';
      if (!completedByLevel[lvl]) completedByLevel[lvl] = 0;
      completedByLevel[lvl]++;
    });

    // Calculer le total par niveau CECRL
    const totalByLevel = {};
    allLessonsSnap.forEach((d) => {
      const data = d.data() || {};
      const lvl = data.cecrLevel || data.level || 'A1';
      if (!totalByLevel[lvl]) totalByLevel[lvl] = 0;
      totalByLevel[lvl]++;
    });

    // Convertir en pourcentage
    Object.keys(totalByLevel).forEach((lvl) => {
      const completed = completedByLevel[lvl] || 0;
      const total = totalByLevel[lvl];
      completedByLevel[lvl] = total > 0 ? Math.round((completed / total) * 100) : 0;
    });
  }

  return {
    subscription,
    user,
    transactions,
    progress: { completed: completedLessons.length, total: totalLessons },
    academyProgress,
    completedByLevel,
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
exports.seedAcademyA1 = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  await requireAdmin(request.auth.uid);

  const keys = ['DE', 'ZH', 'EN', 'AR', 'RU'];
  const files = {
    DE: 'germanophone-a1.json', ZH: 'sinophone-a1.json', EN: 'anglophone-a1.json',
    AR: 'arabophone-a1.json', RU: 'russophone-a1.json'
  };

  const normalize = (q) => {
    if (q.type === 'tf') {
      const correct = q.correct === true;
      return { text: q.text, options: ['Vrai', 'Faux'], correctIndex: correct ? 0 : 1 };
    }
    return { text: q.text, options: q.options || [], correctIndex: q.correctIndex };
  };
  const exText = (ex) => {
    const parts = [ex.instruction, ex.question];
    if (ex.answer) parts.push('Réponse : ' + ex.answer);
    return parts.filter(Boolean).join(' — ');
  };

  const summary = {};
  for (const code of keys) {
    const seed = require('./seed-a1/' + files[code]);
    const courseId = slugify(seed.academyKey + '-' + seed.course.title);

    await db.collection('courses').doc(courseId).set({
      academy: seed.academyKey, level: seed.level, title: seed.course.title,
      titleNative: seed.course.titleNative || '', description: seed.course.description || '',
      category: seed.course.category || 'All', learningOutcomes: seed.course.learningOutcomes || [],
      order: seed.course.order || 1, cecrLevel: seed.cecrLevel, academyCode: code,
      certification: seed.certification || '', status: 'approved', createdAt: new Date()
    });

    let nL = 0;
    for (const lesson of seed.lessons) {
      const linked = seed.quizzes.find((q) => Array.isArray(q.lessons) && q.lessons.indexOf(lesson.id) !== -1);
      await db.collection('lessons').doc(courseId + '-l' + lesson.order).set({
        courseId, academy: seed.academyKey, level: seed.level, order: lesson.order,
        title: lesson.title, titleNative: lesson.titleNative || '', objective: lesson.objective || '',
        objectives: lesson.objectives || [], content: lesson.content || '',
        vocabulary: lesson.vocabulary || [], grammar: lesson.grammar || [],
        exercises: (lesson.exercises || []).map(exText),
        audioScript: lesson.audioScript || null, videoUrl: lesson.videoUrl || '',
        quizId: linked ? linked.id : null,
        isTrial: lesson.order >= 1 && lesson.order <= 6,
        trialAccess: lesson.order <= 2 ? 'instant' : 'signup',
        cecrLevel: lesson.cecrLevel || seed.cecrLevel, academyCode: code,
        teacherUid: null, status: 'approved', createdAt: new Date()
      });
      nL++;
    }

    let nQ = 0;
    for (const quiz of seed.quizzes) {
      const firstLesson = Array.isArray(quiz.lessons) && quiz.lessons.length
        ? seed.lessons.find((l) => l.id === quiz.lessons[0]) : null;
      await db.collection('quizzes').doc(quiz.id).set({
        courseId, lessonId: firstLesson ? courseId + '-l' + firstLesson.order : null,
        academy: seed.academyKey, level: seed.level, title: quiz.title,
        questions: (quiz.questions || []).map(normalize), isTrial: false,
        cecrLevel: seed.cecrLevel, academyCode: code, teacherUid: null,
        status: 'approved', createdAt: new Date()
      });
      nQ++;
    }

    summary[code] = { course: 1, lessons: nL, quizzes: nQ };
  }

  return { academies: summary };
});
/**
 * Liste des académies accessibles pour l'utilisateur courant.
 * - general        → [users/{uid}.academy] (une seule académie)
 * - premium/business → les 6 académies
 * - admin/teacher  → les 6 académies
 * - sinon          → []
 * Source de vérité serveur pour la garde d'accès des pages académies.
 */
/**
 * getTrialLessons — Liste publique des leçons d'échantillon (sans auth).
 * Filtre côté serveur sur isTrial == true pour ne retourner que le
 * contenu gratuit, groupé par académie. Les leçons 1-2 sont accessibles
 * instantanément, les leçons 3-6 nécessitent un compte gratuit.
 */
exports.getTrialLessons = onCall({ region: REGION }, async () => {
  const academies = ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'];
  const out = {};
  for (const code of academies) {
    const snap = await db.collection('lessons')
      .where('academyCode', '==', code)
      .where('isTrial', '==', true)
      .orderBy('order')
      .get();
    out[code] = snap.docs.map((d) => {
      const v = d.data();
      return {
        id: d.id, title: v.title || '', titleNative: v.titleNative || '',
        objective: v.objective || '', order: v.order || 0,
        level: v.level || '', cecrLevel: v.cecrLevel || '',
        trialAccess: v.trialAccess || (v.order <= 2 ? 'instant' : 'signup'),
        quizId: v.quizId || null
      };
    });
  }
  return { academies: out };
});

exports.getMyAcademies = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const userSnap = await db.collection('users').doc(uid).get();
  const u = userSnap.exists ? userSnap.data() : {};
  const role = u.role || 'student';

  if (role === 'admin' || role === 'teacher') {
    return { academies: ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'], plan: role };
  }

  const subSnap = await db.collection('subscriptions').doc(uid).get();
  const sub = subSnap.exists ? subSnap.data() : null;
  const now = new Date();
  const active = sub && sub.status === 'active' && sub.endDate && sub.endDate.toDate && sub.endDate.toDate() > now;

  if (!active) {
    return { academies: [], plan: (sub && sub.plan) || null };
  }

  const plan = sub.plan || 'general';
  if (plan === 'premium' || plan === 'business') {
    return { academies: ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'], plan: plan };
  }

  // general (ou défaut) : une seule académie
  const academyKey = u.academy || (Array.isArray(u.academies) && u.academies[0]) || 'german';
  const code = { french: 'FR', francophone: 'FR', fr: 'FR', german: 'DE', de: 'DE', mandarin: 'ZH', chinese: 'ZH', zh: 'ZH', english: 'EN', en: 'EN', arabic: 'AR', ar: 'AR', russian: 'RU', ru: 'RU' }[academyKey] || 'DE';
  return { academies: [code], plan: plan };
});


/** Seed du curriculum (admin only, idempotent : IDs déterministes). */
exports.seedCurriculum = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  await requireAdmin(request.auth.uid);

  const curriculum = require('./curriculum');
  const quizzes = require('./curriculum-quizzes');
  const ac = { german: 'DE', mandarin: 'ZH', english: 'EN', arabic: 'AR', russian: 'RU' };
  let nCourses = 0, nLessons = 0, nQuizzes = 0;

  for (const course of curriculum) {
    const courseId = slugify(course.academy + '-' + course.title);
    await db.collection('courses').doc(courseId).set({
      academy: course.academy, level: course.level, title: course.title,
      description: course.description, category: course.category,
      learningOutcomes: course.learningOutcomes || [], order: course.order || 1,
      academyCode: ac[course.academy] || '',
      status: 'approved', createdAt: new Date()
    });
    nCourses++;

    for (let i = 0; i < course.lessons.length; i++) {
      const lesson = course.lessons[i];
      const lessonId = courseId + '-l' + (i + 1);
      const quizId = lessonId + '-quiz';
      const isTrial = i < 6; // leçons 1-6 = essai gratuit (2 instant + 4 signup)
      const trialAccess = i < 2 ? 'instant' : 'signup';

      const quizKey = course.academy + '|' + lesson.title;
      const quiz = quizzes[quizKey];

      await db.collection('lessons').doc(lessonId).set({
        courseId: courseId, academy: course.academy, level: course.level,
        order: i + 1, title: lesson.title, objectives: lesson.objectives || [],
        content: lesson.content, vocabulary: lesson.vocabulary || [],
        grammar: lesson.grammar || [], exercises: lesson.exercises || [],
        videoUrl: lesson.videoUrl || '', quizId: quiz ? quizId : null,
        isTrial: isTrial, trialAccess: trialAccess,
        academyCode: ac[course.academy] || '',
        teacherUid: null, status: 'approved', createdAt: new Date()
      });
      nLessons++;

      if (quiz && quiz.questions && quiz.questions.length) {
        await db.collection('quizzes').doc(quizId).set({
          lessonId: lessonId, courseId: courseId, academy: course.academy,
          level: course.level, title: lesson.title + ' — Quiz',
          questions: quiz.questions, isTrial: isTrial, trialAccess: trialAccess,
          academyCode: ac[course.academy] || '',
          teacherUid: null, status: 'approved', createdAt: new Date()
        });
        nQuizzes++;
      }
    }
  }

  return { courses: nCourses, lessons: nLessons, quizzes: nQuizzes };
});

/**
 * Seed de la structure arborescente du curriculum par académie
 * (admin only, idempotent, IDs déterministes).
 *
 * Structure : academies/{code}/curriculum/levels/{levelId}/units/{unitId}/modules/{moduleId}/lessons/{lessonId}
 *
 * Squelette uniquement (pas de contenu pédagogique) :
 *   - 6 niveaux par académie (A1→C2 ou HSK1→HSK6)
 *   - 3 unités par niveau
 *   - 3 modules par unité
 *   - 2 leçons par module
 *
 * Retourne le décompte créé par académie.
 */
exports.seedAcademyTree = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  await requireAdmin(request.auth.uid);

  // Mapping code → niveaux (miroir de academies.config.js)
  const ACADEMY_LEVELS = {
    FR: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    DE: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    ZH: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
    EN: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    AR: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    RU: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  };
  const ACADEMY_KEY = {
    FR: 'french', DE: 'german', ZH: 'mandarin',
    EN: 'english', AR: 'arabic', RU: 'russian'
  };
  const UNITS_PER_LEVEL = 3;
  const MODULES_PER_UNIT = 3;
  const LESSONS_PER_MODULE = 2;

  const summary = {};

  for (const code of Object.keys(ACADEMY_LEVELS)) {
    const levels = ACADEMY_LEVELS[code];
    const academyKey = ACADEMY_KEY[code];
    let nLevels = 0, nUnits = 0, nModules = 0, nLessons = 0;

    for (const level of levels) {
      const levelId = code + '_' + level;
      // Document niveau (sous-collection levels)
      await db.collection('academies').doc(code)
        .collection('curriculum').doc('singleton')
        .collection('levels').doc(levelId).set({
          id: levelId,
          code: code,
          level: level,
          academyKey: academyKey,
          title: level,
          order: levels.indexOf(level) + 1,
          createdAt: new Date()
        }, { merge: true });
      nLevels++;

      for (let u = 1; u <= UNITS_PER_LEVEL; u++) {
        const unitId = levelId + '_U' + u;
        await db.collection('academies').doc(code)
          .collection('curriculum').doc('singleton')
          .collection('levels').doc(levelId)
          .collection('units').doc(unitId).set({
            id: unitId,
            levelId: levelId,
            code: code,
            title: 'Unit ' + u,
            order: u,
            createdAt: new Date()
          }, { merge: true });
        nUnits++;

        for (let m = 1; m <= MODULES_PER_UNIT; m++) {
          const moduleId = unitId + '_M' + m;
          await db.collection('academies').doc(code)
            .collection('curriculum').doc('singleton')
            .collection('levels').doc(levelId)
            .collection('units').doc(unitId)
            .collection('modules').doc(moduleId).set({
              id: moduleId,
              unitId: unitId,
              levelId: levelId,
              code: code,
              title: 'Module ' + m,
              order: m,
              createdAt: new Date()
            }, { merge: true });
          nModules++;

          for (let l = 1; l <= LESSONS_PER_MODULE; l++) {
            const lessonId = moduleId + '_L' + l;
            await db.collection('academies').doc(code)
              .collection('curriculum').doc('singleton')
              .collection('levels').doc(levelId)
              .collection('units').doc(unitId)
              .collection('modules').doc(moduleId)
              .collection('lessons').doc(lessonId).set({
                id: lessonId,
                moduleId: moduleId,
                unitId: unitId,
                levelId: levelId,
                code: code,
                title: 'Lesson ' + l,
                order: l,
                content: '',
                objectives: [],
                vocabulary: [],
                grammar: [],
                exercises: [],
                videoUrl: '',
                isTrial: false,
                status: 'draft',
                createdAt: new Date()
              }, { merge: true });
            nLessons++;
          }
        }
      }
    }

    summary[code] = { levels: nLevels, units: nUnits, modules: nModules, lessons: nLessons };
  }

  return { academies: summary };
});



/**
 * Arbre du curriculum d'une académie (callable).
 * Lecture côté serveur (Admin SDK) → ignore les règles Firestore.
 * Structure : { levels: [{ id, level, title, units: [{ id, title, modules: [{ id, title, lessons: [{ id, title }]}] }] }] }
 * - Admin/teacher : accès à toutes les académies.
 * - Student abonné : accès à son académie (ou toutes si plan Premium/Business).
 * - Student non abonné : refus (la garde client checkAcademyAccess
 *   empêche l'appel depuis une académie verrouillée).
 */
exports.getAcademyTree = onCall({ region: REGION }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  const uid = request.auth.uid;
  const code = String(request.data.code || '').toUpperCase();
  if (!['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'].includes(code)) {
    throw new HttpsError('invalid-argument', 'Invalid academy code: ' + code);
  }

  const userSnap = await db.collection('users').doc(uid).get();
  const u = userSnap.exists ? userSnap.data() : {};
  const role = u.role || 'student';
  if (role === 'admin' || role === 'teacher') {
    // OK, access to all academies
  } else {
    const subSnap = await db.collection('subscriptions').doc(uid).get();
    const sub = subSnap.exists ? subSnap.data() : null;
    const now = new Date();
    const active = sub && sub.status === 'active' &&
      sub.endDate && sub.endDate.toDate && sub.endDate.toDate() > now;
    if (!active) {
      throw new HttpsError('permission-denied', 'Active subscription required to read curriculum.');
    }
    const plan = sub.plan || 'general';
    if (plan !== 'premium' && plan !== 'business') {
      // General path: one academy only
      const keyMap = {
        french: 'FR', francophone: 'FR', fr: 'FR',
        german: 'DE', de: 'DE',
        mandarin: 'ZH', chinese: 'ZH', zh: 'ZH',
        english: 'EN', en: 'EN',
        arabic: 'AR', ar: 'AR',
        russian: 'RU', ru: 'RU'
      };
      const userAcademy = u.academy || (Array.isArray(u.academies) && u.academies[0]) || 'german';
      const allowedCode = keyMap[String(userAcademy || '').toLowerCase()] || 'DE';
      if (code !== allowedCode) {
        throw new HttpsError('permission-denied', 'This academy is not included in your subscription.');
      }
    }
  }

  // Build the tree from Firestore
  const treeRef = db.collection('academies').doc(code)
    .collection('curriculum').doc('singleton')
    .collection('levels');
  const levelSnap = await treeRef.get();

  const levels = [];
  for (const ldoc of levelSnap.docs) {
    const levelData = ldoc.data();
    const unitSnap = await treeRef.doc(ldoc.id).collection('units').orderBy('order').get();
    const units = [];
    for (const udoc of unitSnap.docs) {
      const unitData = udoc.data();
      const moduleSnap = await treeRef.doc(ldoc.id).collection('units').doc(udoc.id)
        .collection('modules').orderBy('order').get();
      const modules = [];
      for (const mdoc of moduleSnap.docs) {
        const moduleData = mdoc.data();
        const lessonSnap = await treeRef.doc(ldoc.id).collection('units').doc(udoc.id)
          .collection('modules').doc(mdoc.id).collection('lessons').orderBy('order').get();
        const lessons = lessonSnap.docs.map(function (l) {
          var d = l.data();
          return { id: d.id, title: d.title || '', order: d.order || 0, status: d.status || 'draft' };
        });
        modules.push({ id: moduleData.id, title: moduleData.title || '', order: moduleData.order || 0, lessons: lessons });
      }
      units.push({ id: unitData.id, title: unitData.title || '', order: unitData.order || 0, modules: modules });
    }
    levels.push({ id: levelData.id, level: levelData.level || '', title: levelData.title || '', order: levelData.order || 0, units: units });
  }

  levels.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

  return { code: code, levels: levels };
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

/* ============================================================
   SÉCURITÉ ÉLÈVE (mission quiz) — getPublicQuiz : représentation
   publique d'un quiz SANS correctIndex. Le corrigé reste côté
   serveur (quizzes_bank / submitAssessmentAttempt). Entitlement
   décidé côté serveur (miroir de canStudentReadContent) :
   trial → public ; sinon abonné actif (ou admin/teacher).
   ============================================================ */
exports.getPublicQuiz = onCall({ region: REGION }, async (request) => {
  const quizId = String((request.data && request.data.quizId) || '').slice(0, 160);
  if (!quizId) throw new HttpsError('invalid-argument', 'missing-quiz-id');
  const snap = await db.collection('quizzes').doc(quizId).get();
  if (!snap.exists) throw new HttpsError('not-found', 'quiz-not-found');
  const q = snap.data() || {};
  if (q.status !== 'approved') throw new HttpsError('permission-denied', 'quiz-not-available');
  const isTrial = q.isTrial === true;
  const uid = request.auth && request.auth.uid;
  if (!uid) {
    if (!isTrial) throw new HttpsError('unauthenticated', 'Sign-in required.');
  } else {
    const uSnap = await db.collection('users').doc(uid).get();
    const role = uSnap.exists ? (uSnap.data().role || 'student') : 'student';
    if (role !== 'admin' && role !== 'teacher' && !isTrial) {
      const subSnap = await db.collection('subscriptions').doc(uid).get();
      const s = subSnap.exists ? subSnap.data() : null;
      const end = s && s.endDate && s.endDate.toDate ? s.endDate.toDate() : null;
      if (!(s && s.status === 'active' && end && end > new Date())) {
        throw new HttpsError('permission-denied', 'Active subscription required.');
      }
      // PHASE 1C (miroir de assessment.js) : plan premium/business → toutes
      // académies ; plan general → académie unique de l'élève.
      const plan = s.plan || 'general';
      if (plan !== 'premium' && plan !== 'business') {
        const u = uSnap.data() || {};
        const key = u.academy || (Array.isArray(u.academies) && u.academies[0]) || 'german';
        const codeMap = { french: 'FR', francophone: 'FR', fr: 'FR', german: 'DE', de: 'DE', mandarin: 'ZH', chinese: 'ZH', zh: 'ZH', english: 'EN', en: 'EN', arabic: 'AR', ar: 'AR', russian: 'RU', ru: 'RU' };
        const myCode = codeMap[String(key).toLowerCase()] || 'DE';
        const qa = String(q.academy || q.academyCode || '').toUpperCase();
        if (qa && qa !== myCode) {
          throw new HttpsError('permission-denied', 'Not authorized for this academy.');
        }
      }
    }
  }
  // Questions publiques : texte + options UNIQUEMENT. Aucun corrigé,
  // aucun poids de notation, ordre original du document.
  const questions = (Array.isArray(q.questions) ? q.questions : []).map(function (x) {
    const qq = x || {};
    return {
      text: String(qq.text || '').slice(0, 2000),
      options: (Array.isArray(qq.options) ? qq.options : []).map(function (o) { return String(o || '').slice(0, 2000); })
    };
  });
  return {
    quiz: {
      id: quizId, title: q.title || '', level: q.level || '',
      academy: q.academy || '', isTrial: isTrial, questions: questions
    }
  };
});

/** Liste publique des cours live à venir (sans le lien de réunion). */
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
   CERTIFICATS — délégation à la certification centralisée ELA.
   Ancien flux (PDF inline + collection 'certificates') déplacé
   dans functions/_legacy/generate-certificate-legacy.js.
   L'émission passe désormais par ela-certificate-core
   (ela_certificates + event ISSUED), le PDF par ela-pdf.js.
   ============================================================ */

/* ============================================================
   HELPERS PARTAGÉS (export additif, audit inscription 2026-09-07)
   ts, sendEmail, EMAIL, emailForUser sont utilisés par auth.js
   (checkSubscriptionExpiry, previewFor). Source unique de vérité,
   aucune logique modifiée.
   ============================================================ */
module.exports.ts = ts;
module.exports.sendEmail = sendEmail;
module.exports.EMAIL = EMAIL;
module.exports.emailForUser = emailForUser;
