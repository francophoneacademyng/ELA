const admin = require('firebase-admin');

const PROJECT = 'ela-academy-7f868';
const REGION = 'africa-south1';
const CALL = `http://127.0.0.1:5001/${PROJECT}/${REGION}/learningAssistant`;
const AUTH_SIGNUP = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp';

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log('PASS ' + n); };
const bad = (n, d) => { fail++; console.log('FAIL ' + n + ' :: ' + JSON.stringify(d)); };

async function signup(email, password) {
  const res = await fetch(AUTH_SIGNUP + '?key=fake', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  return res.json();
}

async function callAssistant(idToken, payload) {
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = 'Bearer ' + idToken;
  const res = await fetch(CALL, { method: 'POST', headers, body: JSON.stringify({ data: payload || {} }) });
  return { status: res.status, body: await res.json() };
}

async function clean(paths) { for (const p of paths) { try { await db.doc(p).delete(); } catch (e) {} } }

(async () => {
  console.log('== JALON 3 — tests émulateur ==');

  let r = await callAssistant(null, { message: 'hi' });
  if (r.body && r.body.error && r.body.error.status === 'UNAUTHENTICATED') ok('T1 unauthenticated -> UNAUTHENTICATED');
  else bad('T1', r);

  const email = 'assistant-test-' + Date.now() + '@ela.test';
  const sign = await signup(email, 'TestPass!12345');
  const uid = sign.localId, idToken = sign.idToken;
  if (!uid || !idToken) { console.log('FAIL signup', sign); process.exit(1); }

  r = await callAssistant(idToken, { message: 'hi' });
  if (r.body && r.body.error && r.body.error.status === 'FAILED_PRECONDITION') ok('T2 no subscription -> FAILED_PRECONDITION');
  else bad('T2', r);

  await db.collection('users').doc(uid).set({ displayName: 'T', email, academies: ['german'], interfaceLang: 'en' });
  const end = new Date(); end.setMonth(end.getMonth() + 1);
  await db.collection('subscriptions').doc(uid).set({ plan: 'general', duration: 1, status: 'active', startDate: new Date(), endDate: end });

  r = await callAssistant(idToken, { message: 'hello' });
  if (r.body && r.body.result && r.body.result.degraded === true) ok('T3 degraded mode (no key) -> degraded:true');
  else bad('T3', r);

  let limitHit = false, last = null;
  for (let i = 0; i < 5; i++) {
    last = await callAssistant(idToken, { message: 'msg ' + i });
    if (last.body && last.body.error && (last.body.error.status === 'RESOURCE_EXHAUSTED' || last.body.error.message === 'daily-limit-reached')) { limitHit = true; break; }
  }
  if (limitHit) ok('T4 daily limit -> RESOURCE_EXHAUSTED');
  else bad('T4', last);

  await clean(['users/' + uid, 'subscriptions/' + uid]);

  console.log(`\nRésultat: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
