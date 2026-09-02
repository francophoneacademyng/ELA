const admin = require('firebase-admin');

const PROJECT = 'ela-academy-7f868';
const REGION = 'africa-south1';
const AUTH_SIGNUP = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp';
const FS = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/%28default%29/documents`;
const FN = `http://127.0.0.1:5001/${PROJECT}/${REGION}`;

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
async function callFn(name, idToken, data) {
  const res = await fetch(`${FN}/${name}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ data: data || {} })
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
function s(v) { return { stringValue: v }; }
function i(v) { return { integerValue: String(v) }; }
async function fsRead(idToken, collection, docId) {
  const res = await fetch(`${FS}/${collection}/${docId}`, { headers: { 'Authorization': 'Bearer ' + idToken } });
  return res.status;
}
async function fsCreate(idToken, collection, docId, fieldMap) {
  const res = await fetch(`${FS}/${collection}?documentId=${docId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ fields: fieldMap })
  });
  return res.status;
}
async function clean(paths) { for (const p of paths) { try { await db.doc(p).delete(); } catch (e) {} } }

(async () => {
  console.log('== RÉPLIQUE FA — tests émulateur ==');

  const ad = await signup('admin-' + Date.now() + '@ela.test');
  const A = await signup('german-stud-' + Date.now() + '@ela.test');
  const B = await signup('nosub-' + Date.now() + '@ela.test');
  const C = await signup('mandarin-stud-' + Date.now() + '@ela.test');
  const adminUid = ad.localId, adminTok = ad.idToken;
  const aUid = A.localId, aTok = A.idToken;
  const bUid = B.localId, bTok = B.idToken;
  const cUid = C.localId, cTok = C.idToken;

  const future = new Date(); future.setMonth(future.getMonth() + 1);
  await db.collection('users').doc(adminUid).set({ role: 'admin', displayName: 'Admin' });
  await db.collection('users').doc(aUid).set({ role: 'student', academy: 'german', displayName: 'Ada' });
  await db.collection('users').doc(bUid).set({ role: 'student', academy: 'german', displayName: 'Bob' });
  await db.collection('users').doc(cUid).set({ role: 'student', academy: 'mandarin', displayName: 'Chen' });
  await db.collection('subscriptions').doc(aUid).set({ status: 'active', endDate: future, plan: 'general', duration: 1 });
  await db.collection('subscriptions').doc(cUid).set({ status: 'active', endDate: future, plan: 'general', duration: 1 });

  // T1 : seed du curriculum (admin) -> 5 cours / 32 leçons / 32 quizz
  let r = await callFn('seedCurriculum', adminTok, {});
  const seed = r.body && r.body.result;
  if (seed && seed.courses === 5 && seed.lessons === 32 && seed.quizzes === 32)
    ok('T1 seedCurriculum -> 5 cours, 32 leçons, 32 quizz');
  else bad('T1', r.body);

  // T2 : catalogue public -> 5 cours (toutes académies)
  r = await callFn('getCatalog', aTok, {});
  const courses = (r.body && r.body.result && r.body.result.courses) || [];
  if (r.body && r.body.result && courses.length === 5) ok('T2 getCatalog (public) -> 5 cours');
  else bad('T2', { n: courses.length });
  const germanCourse = courses.filter(function (c) { return c.academy === 'german'; })[0] || courses[0];
  const courseId = germanCourse ? germanCourse.id : null;

  // T3 : getCourse -> leçons + quizz
  r = await callFn('getCourse', aTok, { courseId: courseId });
  const lessons = (r.body && r.body.result && r.body.result.lessons) || [];
  if (r.body && r.body.result && lessons.length === 8 && lessons[0].quizId)
    ok('T3 getCourse -> 8 leçons, quizz lié');
  else bad('T3', { n: lessons.length, first: lessons[0] });
  const lessonId = lessons.length ? lessons[0].id : null;
  const quizId = lessons.length ? lessons[0].quizId : null;

  // T4 : l'élève lit une leçon (doc approved) -> OK
  let st = await fsRead(aTok, 'lessons', lessonId);
  if (st === 200) ok('T4 élève abonné lit une leçon -> OK');
  else bad('T4', { status: st });

  // T5 : l'élève lit le quizz -> OK
  st = await fsRead(aTok, 'quizzes', quizId);
  if (st === 200) ok('T5 élève abonné lit le quizz -> OK');
  else bad('T5', { status: st });

  // T6 : l'élève enregistre son score -> OK
  st = await fsCreate(aTok, 'quizScores', aUid + '_' + quizId, {
    uid: s(aUid), quizId: s(quizId), title: s('Q'), score: i(4), total: i(5), bestScore: i(4)
  });
  if (st === 200) ok('T6 élève enregistre son score -> OK');
  else bad('T6', { status: st });

  // T7 : progression mise à jour -> OK
  st = await fsCreate(aTok, 'progress', aUid, { completedLessons: { arrayValue: { values: [s(lessonId)] } } });
  if (st === 200) ok('T7 progression mise à jour -> OK');
  else bad('T7', { status: st });

  // T8 : non-abonné tente d'ouvrir un cours -> REFUSÉ (abonnement requis)
  r = await callFn('getCourse', bTok, { courseId: courseId });
  if (r.body && r.body.error && r.body.error.status === 'FAILED_PRECONDITION') ok('T8 non-abonné ouvre un cours -> REFUSÉ');
  else bad('T8', r.body);

    // T9 : isolation entre académies (mandarin tente un cours german) -> REFUSÉ
  r = await callFn('getCourse', cTok, { courseId: courseId });
  if (r.body && r.body.error && r.body.error.status === 'PERMISSION_DENIED') ok('T9 isolation académie -> REFUSÉ');
  else bad('T9', r.body);

  // --- Tests académies immersives ELA ---

  // T10 : seedAcademyTree (admin) -> 6 académies, 6 levels chacune, 3 unités, 3 modules, 2 leçons
  r = await callFn('seedAcademyTree', adminTok, {});
  const treeSeed = r.body && r.body.result && r.body.result.academies;
  if (treeSeed && treeSeed.FR && treeSeed.DE && treeSeed.ZH && treeSeed.EN && treeSeed.AR && treeSeed.RU
    && treeSeed.FR.levels === 6 && treeSeed.FR.units === 18 && treeSeed.FR.modules === 54 && treeSeed.FR.lessons === 108)
    ok('T10 seedAcademyTree -> 6 académies x (6L/18U/54M/108L)');
  else bad('T10', { treeSeed: treeSeed });

  // T11 : getMyAcademies (student general) -> 1 académie (german → DE)
  r = await callFn('getMyAcademies', aTok, {});
  const academiesA = (r.body && r.body.result && r.body.result.academies) || [];
  if (academiesA.length === 1 && academiesA[0] === 'DE')
    ok('T11 getMyAcademies (general) -> [DE]');
  else bad('T11', { academies: academiesA, body: r.body });

  // T12 : getMyAcademies (non-abonné) -> []
  r = await callFn('getMyAcademies', bTok, {});
  const academiesB = (r.body && r.body.result && r.body.result.academies) || [];
  if (academiesB.length === 0)
    ok('T12 getMyAcademies (pas abonné) -> []');
  else bad('T12', { academies: academiesB, body: r.body });

  // T13 : getAcademyTree (abonné general → DE) -> 6 niveaux
  r = await callFn('getAcademyTree', aTok, { code: 'DE' });
  const tree = (r.body && r.body.result && r.body.result.levels) || [];
  if (r.status === 200 && tree.length === 6)
    ok('T13 getAcademyTree (DE) -> 6 niveaux');
  else bad('T13', { status: r.status, levels: tree.length, body: r.body });

  // T14 : getAcademyTree (abonné general → ZH, pas autorisé) -> REFUSÉ
  r = await callFn('getAcademyTree', aTok, { code: 'ZH' });
  if (r.body && r.body.error && r.body.error.status === 'PERMISSION_DENIED')
    ok('T14 getAcademyTree (ZH, general) -> REFUSÉ');
  else bad('T14', { status: r.status, body: r.body });

  // T15 : getAcademyTree (admin → AR) -> 6 niveaux HSK-like (6 levels)
  r = await callFn('getAcademyTree', adminTok, { code: 'AR' });
  const treeAr = (r.body && r.body.result && r.body.result.levels) || [];
  if (r.status === 200 && treeAr.length === 6)
    ok('T15 getAcademyTree (admin → AR) -> 6 niveaux');
  else bad('T15', { status: r.status, levels: treeAr.length, body: r.body });

  console.log(`\nRésultat: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
