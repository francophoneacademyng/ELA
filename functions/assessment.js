/**
 * ELA - functions/assessment.js (PHASE 1 - local, non deploys)
 * Socle d'evaluation securisee : tentative + correction serveur.
 * startAssessmentAttempt : cree attempts/{id} (seed serveur,
 * ordre melange, SANS corrige) - jamais de score client.
 * submitAssessmentAttempt : corrige cote serveur, ecrit
 * results/{attemptId} immuable + miroir quizScores marque
 * source:'authoritative' pour compat dashboard (lecture seule).
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const crypto = require('crypto');
const db = new Proxy({}, { get: function (_t, prop) { return admin.firestore()[prop]; } });
const REGION = 'africa-south1';
const ATTEMPT_TTL_MS = 45 * 60 * 1000;
const MAX_QUESTIONS = 100;
function ensureAuth(request) {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required.');
  return uid;
}
function cleanStr(v, max) {
  const s = String(v == null ? '' : v);
  const m = max || 120;
  return s.length > m ? s.slice(0, m) : s;
}
function rngFromSeed(seedHex) {
  let h = 0;
  const s = String(seedHex || '');
  for (let i = 0; i < s.length; i++) { h = (Math.imul(h ^ s.charCodeAt(i), 2654435761) >>> 0); }
  let a = h >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffledIndexes(n, rand) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
async function requireActiveSubscription(uid) {
  const userSnap = await db.collection('users').doc(uid).get();
  const u = userSnap.exists ? userSnap.data() : {};
  const role = u.role || 'student';
  if (role === 'admin' || role === 'teacher') return { role: role, plan: role, academies: ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'] };
  const subSnap = await db.collection('subscriptions').doc(uid).get();
  const sub = subSnap.exists ? subSnap.data() : null;
  const now = new Date();
  const end = sub && sub.endDate && sub.endDate.toDate ? sub.endDate.toDate() : null;
  if (!(sub && sub.status === 'active' && end && end > now)) throw new HttpsError('permission-denied', 'Active subscription required.');
  const plan = sub.plan || 'general';
  if (plan === 'premium' || plan === 'business') return { role: role, plan: plan, academies: ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'] };
  // PHASE 1C : plan general = une seule academie (miroir de core.js getMyAcademies).
  const key = u.academy || (Array.isArray(u.academies) && u.academies[0]) || 'german';
  const code = { french: 'FR', francophone: 'FR', fr: 'FR', german: 'DE', de: 'DE', mandarin: 'ZH', chinese: 'ZH', zh: 'ZH', english: 'EN', en: 'EN', arabic: 'AR', ar: 'AR', russian: 'RU', ru: 'RU' }[String(key).toLowerCase()] || 'DE';
  return { role: role, plan: plan, academies: [code] };
}
function requireAcademyAccess(authz, quiz) {
  // PHASE 1C : l'academie/le niveau sont derives cote serveur depuis la
  // banque ; le client ne peut pas les choisir. Un eleve general ne peut
  // demarrer que les quiz de son academie.
  const qa = String(quiz.academy || quiz.academyCode || '').toUpperCase();
  if (!qa) return; // quiz sans code : pas de restriction supplementaire
  if ((authz.academies || []).indexOf(qa) === -1) throw new HttpsError('permission-denied', 'Not authorized for this academy.');
}
function publicQuestion(q) {
  const qq = q || {};
  return {
    text: cleanStr(qq.text, 2000),
    options: (qq.options || []).map(function (o) { return cleanStr(o, 2000); })
  };
}

exports.startAssessmentAttempt = onCall({ region: REGION }, async (request) => {
  const uid = ensureAuth(request);
  const authz = await requireActiveSubscription(uid);
  const quizId = cleanStr(request.data && request.data.quizId, 160);
  if (!quizId) throw new HttpsError('invalid-argument', 'quizId required.');
  const bankSnap = await db.collection('quizzes_bank').doc(quizId).get();
  const quizSnap = bankSnap.exists
    ? bankSnap
    : await db.collection('quizzes').doc(quizId).get(); // LEGACY temporaire
  if (!quizSnap.exists) throw new HttpsError('not-found', 'Quiz not found.');
  const quiz = quizSnap.data() || {};
  requireAcademyAccess(authz, quiz);
  if (quiz.status && quiz.status !== 'approved') throw new HttpsError('permission-denied', 'Quiz not available.');
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  if (!questions.length || questions.length > MAX_QUESTIONS) throw new HttpsError('failed-precondition', 'Invalid quiz content.');
  const seed = crypto.randomBytes(16).toString('hex');
  const order = shuffledIndexes(questions.length, rngFromSeed(seed));
  const now = admin.firestore.FieldValue.serverTimestamp();
  const ref = db.collection('attempts').doc();
  await ref.set({
    studentId: uid, quizId: quizId,
    academy: cleanStr(quiz.academy || quiz.academyCode || '', 16),
    level: cleanStr(quiz.level || quiz.cecrLevel || '', 16),
    status: 'active', seed: seed,
    questionOrder: order, total: questions.length,
    answers: [], submittedAt: null, score: null, passed: null,
    source: 'authoritative', schemaVersion: 1,
    startedAt: now, expiresAt: new Date(Date.now() + ATTEMPT_TTL_MS), updatedAt: now
  });
  await db.collection('assessment_events').add({
    attemptId: ref.id, studentId: uid, quizId: quizId,
    type: 'ATTEMPT_CREATED', at: now, source: 'authoritative'
  });
  return {
    attemptId: ref.id, quizId: quizId, total: questions.length,
    questions: order.map(function (qi) { return publicQuestion(questions[qi]); })
  };
});
exports.submitAssessmentAttempt = onCall({ region: REGION }, async (request) => {
  const uid = ensureAuth(request);
  const attemptId = cleanStr(request.data && request.data.attemptId, 160);
  const answers = request.data ? request.data.answers : null;
  if (!attemptId || !Array.isArray(answers)) throw new HttpsError('invalid-argument', 'attemptId and answers required.');
  const ref = db.collection('attempts').doc(attemptId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Attempt not found.');
  const att = snap.data() || {};
  if (att.studentId !== uid) throw new HttpsError('permission-denied', 'Not your attempt.');
  if (att.status === 'graded' || att.status === 'finalized') {
    const r = await db.collection('results').doc(attemptId).get();
    const rv = r.exists ? r.data() : {};
    return { attemptId: attemptId, score: rv.score || 0, total: rv.total || att.total || 0, passed: !!rv.passed, duplicate: true };
  }
  if (att.status !== 'active') throw new HttpsError('failed-precondition', 'Attempt is not active.');
  const expMs = att.expiresAt && att.expiresAt.toMillis ? att.expiresAt.toMillis() : 0;
  if (expMs && expMs < Date.now()) {
    await ref.update({ status: 'expired', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    throw new HttpsError('deadline-exceeded', 'Attempt expired.');
  }
  const bankSnap = await db.collection('quizzes_bank').doc(att.quizId).get();
  const quizSnap = bankSnap.exists
    ? bankSnap
    : await db.collection('quizzes').doc(att.quizId).get(); // LEGACY temporaire
  if (!quizSnap.exists) throw new HttpsError('not-found', 'Quiz not found.');
  const questions = quizSnap.data().questions || [];
  const order = att.questionOrder || [];
  if (answers.length !== order.length) throw new HttpsError('invalid-argument', 'answers length mismatch.');
  answers.forEach(function (a) {
    if (a !== null && (!Number.isInteger(a) || a < 0 || a > 15)) throw new HttpsError('invalid-argument', 'Invalid answer format.');
  });
  let score = 0;
  const detail = order.map(function (qi, pos) {
    const q = questions[qi] || {};
    const ok = answers[pos] !== null && answers[pos] === q.correctIndex;
    if (ok) score++;
    return { pos: pos, ok: ok };
  });
  const total = order.length;
  const percentage = total ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 80;
  const resRef = db.collection('results').doc(attemptId);
  // PHASE 1C : finalisation transactionnelle — un seul résultat autorisé,
  // même en cas de soumissions concurrentes. La transaction relit
  // attempt + result ; si déjà finalisé, elle renvoie l'existant.
  const outcome = await admin.firestore().runTransaction(async function (tx) {
    const aSnap = await tx.get(ref);
    if (!aSnap.exists) throw new HttpsError('not-found', 'Attempt not found.');
    const cur = aSnap.data() || {};
    if (cur.studentId !== uid) throw new HttpsError('permission-denied', 'Not your attempt.');
    if (cur.status === 'graded' || cur.status === 'finalized') {
      const rSnap = await tx.get(resRef);
      const rv = rSnap.exists ? rSnap.data() : {};
      return { score: rv.score || 0, total: rv.total || cur.total || 0, percentage: rv.percentage || 0, passed: !!rv.passed, duplicate: true };
    }
    if (cur.status !== 'active') throw new HttpsError('failed-precondition', 'Attempt is not active.');
    tx.update(ref, { answers: answers, status: 'finalized', submittedAt: admin.firestore.FieldValue.serverTimestamp(), score: score, passed: passed, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    tx.set(resRef, {
      attemptId: attemptId, studentId: uid, quizId: att.quizId,
      academy: att.academy || '', level: att.level || '',
      score: score, total: total, percentage: percentage, passed: passed,
      detail: detail, source: 'authoritative', schemaVersion: 1,
      finalized: true, createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { score: score, total: total, percentage: percentage, passed: passed, duplicate: false };
  });
  const now = admin.firestore.FieldValue.serverTimestamp();
  try {
    await db.collection('quizScores').doc(uid + '_' + att.quizId).set({
      uid: uid, quizId: att.quizId, score: outcome.score, total: outcome.total,
      bestScore: outcome.score, source: 'authoritative', attemptId: attemptId, updatedAt: now
    }, { merge: true });
  } catch (e) { /* best-effort */ }
  await db.collection('assessment_events').add({
    attemptId: attemptId, studentId: uid, quizId: att.quizId,
    type: 'ATTEMPT_GRADED', score: outcome.score, total: outcome.total,
    percentage: outcome.percentage, passed: outcome.passed, at: now, source: 'authoritative'
  });
  return { attemptId: attemptId, score: outcome.score, total: outcome.total, percentage: outcome.percentage, passed: outcome.passed, duplicate: outcome.duplicate };
});


