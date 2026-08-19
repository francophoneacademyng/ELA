const admin = require('firebase-admin');

const PROJECT = 'ela-academy-7f868';
const REGION = 'africa-south1';
const AUTH_SIGNUP = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp';
const FS = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/%28default%29/documents`;
const REVIEW = `http://127.0.0.1:5001/${PROJECT}/${REGION}/reviewContent`;
const QUEUE = `http://127.0.0.1:5001/${PROJECT}/${REGION}/getAdminQueue`;

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log('PASS ' + n); };
const bad = (n, d) => { fail++; console.log('FAIL ' + n + ' :: ' + JSON.stringify(d)); };

async function signup(email) {
  const res = await fetch(AUTH_SIGNUP + '?key=fake', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'TestPass!12345', returnSecureToken: true })
  });
  return res.json();
}
async function callFn(url, idToken, data) {
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ data: data || {} })
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
async function fsPatchStatus(idToken, collection, docId, status) {
  const res = await fetch(`${FS}/${collection}/${docId}?updateMask.fieldPaths=status`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ fields: { status: { stringValue: status } } })
  });
  return res.status;
}
async function clean(paths) { for (const p of paths) { try { await db.doc(p).delete(); } catch (e) {} } }

(async () => {
  console.log('== INTERFACE ADMIN — tests émulateur ==');

  const ad = await signup('admin-' + Date.now() + '@ela.test');
  const te = await signup('teacher-' + Date.now() + '@ela.test');
  const st = await signup('student-' + Date.now() + '@ela.test');
  const adminUid = ad.localId, adminTok = ad.idToken;
  const teacherUid = te.localId, teacherTok = te.idToken;
  const studentTok = st.idToken;

  await db.collection('users').doc(adminUid).set({ role: 'admin', displayName: 'Admin User' });
  await db.collection('users').doc(teacherUid).set({ role: 'teacher', academy: 'german', displayName: 'Teacher User' });
  await db.collection('users').doc(st.localId).set({ role: 'student', academy: 'german' });

  await db.collection('lessons').doc('les-pending').set({ title: 'Lesson A', academy: 'german', status: 'pending', teacherUid: teacherUid, content: 'Hello', createdAt: new Date() });
  await db.collection('quizzes').doc('quiz-pending').set({ title: 'Quiz A', academy: 'german', status: 'pending', teacherUid: teacherUid, questions: [{ text: 'Q1', options: ['a', 'b', 'c', 'd'], correctIndex: 0 }], createdAt: new Date() });

  // T1 : admin approuve -> OK (status approved)
  let r = await callFn(REVIEW, adminTok, { collection: 'lessons', docId: 'les-pending', decision: 'approve' });
  const lesAfter = (await db.collection('lessons').doc('les-pending').get()).data();
  if (r.body && r.body.result && r.body.result.ok === true && lesAfter.status === 'approved')
    ok('T1 admin approuve -> status approved');
  else bad('T1', { r: r.body, lesAfter });

  // T2 : teacher tente d'approuver (callable) -> REFUSÉ
  r = await callFn(REVIEW, teacherTok, { collection: 'quizzes', docId: 'quiz-pending', decision: 'approve' });
  if (r.body && r.body.error && r.body.error.status === 'PERMISSION_DENIED') ok('T2 teacher approuve via callable -> REFUSÉ');
  else bad('T2', r.body);

  // T2b : teacher tente de changer status directement (règles) -> REFUSÉ (403)
  const stPatch = await fsPatchStatus(teacherTok, 'lessons', 'les-pending', 'pending');
  if (stPatch === 403) ok('T2b teacher modifie status (règles) -> REFUSÉ (403)');
  else bad('T2b', { status: stPatch });

  // T3 : student accède à la file admin -> REFUSÉ
  r = await callFn(QUEUE, studentTok, {});
  if (r.body && r.body.error && r.body.error.status === 'PERMISSION_DENIED') ok('T3 student accède à /admin -> REFUSÉ');
  else bad('T3', r.body);

  // Bonus : admin rejette avec motif -> status rejected + reason
  r = await callFn(REVIEW, adminTok, { collection: 'quizzes', docId: 'quiz-pending', decision: 'reject', reason: 'Too short' });
  const quizAfter = (await db.collection('quizzes').doc('quiz-pending').get()).data();
  if (r.body && r.body.result && r.body.result.ok === true && quizAfter.status === 'rejected' && quizAfter.rejectReason === 'Too short')
    ok('T4 admin rejette avec motif -> status rejected + reason');
  else bad('T4', { r: r.body, quizAfter });

  // Bonus : getAdminQueue admin -> OK (liste pending)
  await db.collection('liveClasses').doc('lc-pending').set({ title: 'Live A', academy: 'german', status: 'pending', teacherUid: teacherUid, scheduledAt: new Date(), meetingLink: 'https://m.example', createdAt: new Date() });
  r = await callFn(QUEUE, adminTok, {});
  const items = (r.body && r.body.result && r.body.result.items) || [];
  if (r.body && r.body.result && items.length === 1 && items[0].id === 'lc-pending')
    ok('T5 getAdminQueue admin -> liste pending (1 élément restant)');
  else bad('T5', { r: r.body });

  await clean([`users/${adminUid}`, `users/${teacherUid}`, `users/${st.localId}`, 'lessons/les-pending', 'quizzes/quiz-pending', 'liveClasses/lc-pending']);

  console.log(`\nRésultat: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
