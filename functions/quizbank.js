/**
 * ELA — PHASE 1B : banque de questions serveur (LOCAL, non déployé).
 * quizzes_bank/{quizId}  = source de vérité (corrigés, serveur seul).
 * quizPublic/{quizId}    = représentation publique SANS correctIndex.
 * publishQuizBank(quizId, { overwrite }) : callable admin/teacher.
 * AUCUNE migration production ici : architecture + tests locaux seuls.
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

const db = new Proxy({}, { get: function (_t, p) { return admin.firestore()[p]; } });
const REGION = 'africa-south1';
const MAX_Q = 100;
const MAX_OPT = 16;

function cleanStr(v, max) {
  const s = String(v == null ? '' : v);
  return s.length > (max || 200) ? s.slice(0, max || 200) : s;
}

function cleanBankQuestion(q) {
  const text = cleanStr(q.text, 2000);
  const options = Array.isArray(q.options) ? q.options.slice(0, MAX_OPT).map(function (o) { return cleanStr(o, 2000); }) : [];
  const correctIndex = q.correctIndex;
  if (!text || options.length < 2) throw new HttpsError('invalid-argument', 'Invalid bank question.');
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    throw new HttpsError('invalid-argument', 'Invalid correctIndex.');
  }
  return { text: text, options: options, correctIndex: correctIndex };
}

function toPublic(bank) {
  return {
    quizId: bank.quizId, academy: bank.academy || '', level: bank.level || '',
    title: bank.title || '', total: bank.questions.length, schemaVersion: 1,
    questions: bank.questions.map(function (q) { return { text: q.text, options: q.options }; })
  };
}

async function requireStaff(uid) {
  const snap = await db.collection('users').doc(uid).get();
  const role = snap.exists ? (snap.data().role || 'student') : 'student';
  if (role !== 'admin' && role !== 'teacher') throw new HttpsError('permission-denied', 'Staff only.');
  return role;
}

async function publishQuizBankImpl(uid, quizId, overwrite) {
  const id = cleanStr(quizId, 160);
  if (!id) throw new HttpsError('invalid-argument', 'quizId required.');
  const bankRef = db.collection('quizzes_bank').doc(id);
  if (!overwrite && (await bankRef.get()).exists) throw new HttpsError('already-exists', 'Bank entry exists.');
  const qSnap = await db.collection('quizzes').doc(id).get();
  if (!qSnap.exists) throw new HttpsError('not-found', 'Quiz not found.');
  const q = qSnap.data() || {};
  const questions = Array.isArray(q.questions) ? q.questions : [];
  if (!questions.length || questions.length > MAX_Q) throw new HttpsError('failed-precondition', 'Invalid quiz content.');
  const bank = {
    quizId: id, academy: cleanStr(q.academy || q.academyCode || '', 16),
    level: cleanStr(q.level || q.cecrLevel || '', 16), title: cleanStr(q.title || '', 200),
    questions: questions.map(cleanBankQuestion),
    source: 'bank', schemaVersion: 1,
    publishedBy: uid, publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const pub = toPublic(bank);
  await bankRef.set(bank);
  await db.collection('quizPublic').doc(id).set(pub);
  await db.collection('assessment_events').add({
    quizId: id, studentId: uid, type: 'BANK_PUBLISHED', total: bank.questions.length,
    at: admin.firestore.FieldValue.serverTimestamp(), source: 'authoritative'
  });
  return { quizId: id, total: bank.questions.length, overwritten: !!overwrite };
}

exports.publishQuizBank = onCall({ region: REGION }, async (request) => {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required.');
  await requireStaff(uid);
  return publishQuizBankImpl(uid, request.data && request.data.quizId, !!(request.data && request.data.overwrite));
});

exports._bankInternals = { cleanBankQuestion: cleanBankQuestion, toPublic: toPublic, publishQuizBankImpl: publishQuizBankImpl };
