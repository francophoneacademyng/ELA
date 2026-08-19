const admin = require('firebase-admin');

const PROJECT = 'ela-academy-7f868';
const REGION = 'africa-south1';
const AUTH_SIGNUP = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp';
const FS = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/%28default%29/documents`;
const LINK = `http://127.0.0.1:5001/${PROJECT}/${REGION}/getLiveMeetingLink`;

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
function s(v) { return { stringValue: v }; }

async function fsCreate(idToken, collection, docId, fieldMap) {
  const res = await fetch(`${FS}/${collection}?documentId=${docId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ fields: fieldMap })
  });
  return res.status;
}
async function fsRead(idToken, collection, docId) {
  const res = await fetch(`${FS}/${collection}/${docId}`, { headers: { 'Authorization': 'Bearer ' + idToken } });
  return res.status;
}
async function callLink(idToken, liveClassId) {
  const res = await fetch(LINK, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ data: { liveClassId } })
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
async function clean(paths) { for (const p of paths) { try { await db.doc(p).delete(); } catch (e) {} } }

(async () => {
  console.log('== MODULE PÉDAGOGIQUE PHASE 2 — tests émulateur ==');

  const A = await signup('studA-' + Date.now() + '@ela.test');
  const B = await signup('studB-' + Date.now() + '@ela.test');
  const aUid = A.localId, aTok = A.idToken;
  const bUid = B.localId, bTok = B.idToken;

  const future = new Date(); future.setMonth(future.getMonth() + 1);
  await db.collection('users').doc(aUid).set({ role: 'student', academy: 'german', academies: ['german'] });
  await db.collection('users').doc(bUid).set({ role: 'student', academy: 'german', academies: ['german'] });
  await db.collection('subscriptions').doc(aUid).set({ status: 'active', endDate: future, plan: 'general', duration: 1 });
  // B : pas d'abonnement

  await db.collection('lessons').doc('lesson-approved').set({ title: 'A1 Intro', academy: 'german', status: 'approved', level: 'beginner', teacherUid: 't1', content: 'Hello' });
  await db.collection('lessons').doc('lesson-pending').set({ title: 'A1 Draft', academy: 'german', status: 'pending', level: 'beginner', teacherUid: 't1' });

  // T1 : élève abonné lit une leçon approved -> OK
  let st = await fsRead(aTok, 'lessons', 'lesson-approved');
  if (st === 200) ok('T1 élève abonné lit une leçon approved -> OK');
  else bad('T1', { status: st });

  // T2 : non-abonné -> REFUSÉ
  st = await fsRead(bTok, 'lessons', 'lesson-approved');
  if (st === 403) ok('T2 non-abonné lit une leçon approved -> REFUSÉ (403)');
  else bad('T2', { status: st });

  // T3 : contenu pending -> REFUSÉ
  st = await fsRead(aTok, 'lessons', 'lesson-pending');
  if (st === 403) ok('T3 contenu pending -> REFUSÉ (403)');
  else bad('T3', { status: st });

  // T4 : lien live avant l'heure -> MASQUÉ (class-not-open)
  const soon = new Date(Date.now() + 5 * 60000);
  const later = new Date(Date.now() + 60 * 60000);
  await db.collection('liveClasses').doc('lc-later').set({ title: 'Grammar', academy: 'german', status: 'approved', scheduledAt: later, meetingLink: 'https://meet.example/later' });
  await db.collection('liveClasses').doc('lc-soon').set({ title: 'Speaking', academy: 'german', status: 'approved', scheduledAt: soon, meetingLink: 'https://meet.example/soon' });

  let r = await callLink(aTok, 'lc-later');
  if (r.body && r.body.error && r.body.error.status === 'FAILED_PRECONDITION') ok('T4 lien live >15min -> MASQUÉ (FAILED_PRECONDITION)');
  else bad('T4', r.body);

  // Bonus : lien live dans les 15 min -> OK
  r = await callLink(aTok, 'lc-soon');
  if (r.body && r.body.result && r.body.result.meetingLink === 'https://meet.example/soon') ok('T4b lien live dans les 15 min -> OK');
  else bad('T4b', r.body);

  // T5 : écriture progression d'un autre élève -> REFUSÉ
  st = await fsCreate(aTok, 'progress', bUid, { completedLessons: { arrayValue: { values: [s('x')] } } });
  if (st === 403) ok('T5 écriture progression d\'un autre élève -> REFUSÉ (403)');
  else bad('T5', { status: st });

  // Bonus : écriture de SA propre progression -> OK
  st = await fsCreate(aTok, 'progress', aUid, { completedLessons: { arrayValue: { values: [s('lesson-approved')] } } });
  if (st === 200) ok('T5b écriture de sa propre progression -> OK');
  else bad('T5b', { status: st });

  await clean([`users/${aUid}`, `users/${bUid}`, `subscriptions/${aUid}`, 'lessons/lesson-approved', 'lessons/lesson-pending', 'liveClasses/lc-later', 'liveClasses/lc-soon', `progress/${aUid}`, `progress/${bUid}`]);

  console.log(`\nRésultat: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
