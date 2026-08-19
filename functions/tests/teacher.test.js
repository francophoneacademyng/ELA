const admin = require('firebase-admin');

const PROJECT = 'ela-academy-7f868';
const REGION = 'africa-south1';
const AUTH_SIGNUP = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp';
const FS = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/%28default%29/documents`;
const SETROLE = `http://127.0.0.1:5001/${PROJECT}/${REGION}/setUserRole`;

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

function fields(f) { return { fields: f }; }
function s(v) { return { stringValue: v }; }

async function fsCreate(idToken, collection, docId, fieldMap) {
  const res = await fetch(`${FS}/${collection}?documentId=${docId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify(fields(fieldMap))
  });
  return res.status;
}
async function fsRead(idToken, collection, docId) {
  const res = await fetch(`${FS}/${collection}/${docId}`, {
    headers: { 'Authorization': 'Bearer ' + idToken }
  });
  return res.status;
}
async function callSetRole(idToken, data) {
  const res = await fetch(SETROLE, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ data })
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
async function clean(paths) { for (const p of paths) { try { await db.doc(p).delete(); } catch (e) {} } }

(async () => {
  console.log('== MISSION ENSEIGNANT 1/5 — tests émulateur ==');

  const teacher = await signup('teacher-' + Date.now() + '@ela.test');
  const student = await signup('student-' + Date.now() + '@ela.test');
  const adminUser = await signup('admin-' + Date.now() + '@ela.test');
  const teacherUid = teacher.localId, teacherTok = teacher.idToken;
  const studentUid = student.localId, studentTok = student.idToken;
  const adminUid = adminUser.localId, adminTok = adminUser.idToken;

  await db.collection('users').doc(teacherUid).set({ role: 'teacher', academy: 'german', email: 't@ela.test' });
  await db.collection('users').doc(studentUid).set({ role: 'student', email: 's@ela.test' });
  await db.collection('users').doc(adminUid).set({ role: 'admin', email: 'a@ela.test' });

  // T1 : teacher publie dans SA académie (german) -> OK (200)
  let st = await fsCreate(teacherTok, 'lessons', 'lesson-ok', {
    title: s('Test lesson'), teacherUid: s(teacherUid), academy: s('german'), status: s('pending')
  });
  if (st === 200) ok('T1 teacher publie dans son académie -> OK');
  else bad('T1', { status: st });

  // T2 : teacher publie dans UNE AUTRE académie (mandarin) -> REFUSÉ (403)
  st = await fsCreate(teacherTok, 'lessons', 'lesson-other', {
    title: s('Test lesson 2'), teacherUid: s(teacherUid), academy: s('mandarin'), status: s('pending')
  });
  if (st === 403) ok('T2 teacher publie dans une autre académie -> REFUSÉ (403)');
  else bad('T2', { status: st });

  // T3 : student tente de publier -> REFUSÉ (403)
  st = await fsCreate(studentTok, 'lessons', 'lesson-student', {
    title: s('Student lesson'), teacherUid: s(studentUid), academy: s('german'), status: s('pending')
  });
  if (st === 403) ok('T3 student tente de publier -> REFUSÉ (403)');
  else bad('T3', { status: st });

  // T4 : student lit une leçon pending -> REFUSÉ (403)
  st = await fsRead(studentTok, 'lessons', 'lesson-ok');
  if (st === 403) ok('T4 student lit un contenu pending -> REFUSÉ (403)');
  else bad('T4', { status: st });

  // T5 : admin attribue le rôle teacher -> OK
  const target = await signup('target-' + Date.now() + '@ela.test');
  await db.collection('users').doc(target.localId).set({ role: 'student', email: 'x@ela.test' });
  let r = await callSetRole(adminTok, { uid: target.localId, role: 'teacher', academy: 'mandarin' });
  const targetDoc = (await db.collection('users').doc(target.localId).get()).data();
  if (r.body && r.body.result && r.body.result.ok === true && targetDoc.role === 'teacher' && targetDoc.academy === 'mandarin')
    ok('T5 admin attribue rôle teacher + académie -> OK');
  else bad('T5', { r: r.body, targetDoc });

  // T6 : non-admin (student) tente d'attribuer un rôle -> REFUSÉ
  r = await callSetRole(studentTok, { uid: target.localId, role: 'admin' });
  if (r.body && r.body.error && r.body.error.status === 'PERMISSION_DENIED') ok('T6 non-admin setUserRole -> REFUSÉ');
  else bad('T6', r.body);

  await clean([`users/${teacherUid}`, `users/${studentUid}`, `users/${adminUid}`, `users/${target.localId}`, 'lessons/lesson-ok', 'lessons/lesson-other', 'lessons/lesson-student']);

  console.log(`\nRésultat: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
