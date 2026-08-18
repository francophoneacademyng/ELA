const crypto = require('crypto');
const admin = require('firebase-admin');

const PROJECT = 'ela-academy-7f868';
const REGION = 'africa-south1';
const SECRET = 'sk_test_emulator_dummy_0000000000000000';
const PREVIEW = `http://127.0.0.1:5001/${PROJECT}/${REGION}/previewPayment`;
const WEBHOOK = `http://127.0.0.1:5001/${PROJECT}/${REGION}/paystackWebhook`;
const AUTH_SIGNUP = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp';

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log('PASS ' + n); };
const bad = (n, d) => { fail++; console.log('FAIL ' + n + ' :: ' + JSON.stringify(d)); };
const hmac = (s) => crypto.createHmac('sha512', SECRET).update(s).digest('hex');

async function signup(email) {
  const res = await fetch(AUTH_SIGNUP + '?key=fake', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'TestPass!12345', returnSecureToken: true })
  });
  return res.json();
}

async function callPreview(idToken, payload) {
  const res = await fetch(PREVIEW, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ data: payload })
  });
  return res.json();
}

async function postWebhook(reference, amountNaira) {
  const payload = { event: 'charge.success', data: { reference, amount: amountNaira * 100 } };
  const body = JSON.stringify(payload);
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-paystack-signature': hmac(body) },
    body
  });
  return { status: res.status, text: await res.text() };
}

async function clean(paths) { for (const p of paths) { try { await db.doc(p).delete(); } catch (e) {} } }

(async () => {
  console.log('== JALON 4 — tests émulateur (parrainage) ==');

  // --- setup referrer + referred ---
  const referrerUid = 'ref-er-' + Date.now();
  await db.collection('users').doc(referrerUid).set({ email: 'ref@ela.test', referralCode: 'ELA-ABCDEF', referralCredit: 0 });

  const referred = await signup('referred-' + Date.now() + '@ela.test');
  const referredUid = referred.localId, referredToken = referred.idToken;

  // T1 : premier paiement + code valide -> remise 15000 (75000 -> 60000)
  let r = await callPreview(referredToken, { plan: 'general', duration: 1, referralCode: 'ELA-ABCDEF' });
  if (r.result && r.result.discount === 15000 && r.result.total === 60000 && r.result.codeValid === true)
    ok('T1 first payment + valid code -> discount 15000, total 60000');
  else bad('T1', r);

  // T2 : auto-parrainage refusé (le code du filleul est le sien)
  await db.collection('users').doc(referredUid).set({ referralCode: 'ELA-SELF01' }, { merge: true });
  r = await callPreview(referredToken, { plan: 'general', duration: 1, referralCode: 'ELA-SELF01' });
  if (r.result && r.result.error === 'self-referral-not-allowed') ok('T2 self-referral -> refusé');
  else bad('T2', r);

  // T3 : code invalide refusé
  r = await callPreview(referredToken, { plan: 'general', duration: 1, referralCode: 'ELA-NOPE' });
  if (r.result && r.result.error === 'invalid-referral-code') ok('T3 invalid code -> refusé');
  else bad('T3', r);

  // T4 : paiement suivant + crédit -> crédit consommé (75000 -> 65000)
  await db.collection('users').doc(referredUid).set({ firstPaymentDone: true, referralCredit: 10000 }, { merge: true });
  r = await callPreview(referredToken, { plan: 'general', duration: 1 });
  if (r.result && r.result.firstPayment === false && r.result.creditUsed === 10000 && r.result.total === 65000)
    ok('T4 subsequent payment + credit -> creditUsed 10000, total 65000');
  else bad('T4', r);

  // --- webhook : crédite le parrain +10000 au 1er paiement du filleul ---
  const rRef = 'ref-referral-' + Date.now();
  await clean([`transactions/${rRef}`, `subscriptions/${referredUid}`, `users/referred-target`]);
  await db.collection('users').doc('referred-target').set({ email: 'r2@ela.test' });
  await db.collection('transactions').doc(rRef).set({
    uid: 'referred-target', plan: 'general', duration: 1, amount: 60000,
    referrerUid: referrerUid, creditUsed: 0, status: 'pending', createdAt: new Date()
  });
  let wh = await postWebhook(rRef, 60000);
  const referrerAfter = (await db.collection('users').doc(referrerUid).get()).data();
  const referredTarget = (await db.collection('users').doc('referred-target').get()).data();
  if (wh.status === 200 && referrerAfter.referralCredit === 10000 && referredTarget.firstPaymentDone === true)
    ok('T5 webhook -> parrain crédité +10000, filleul firstPaymentDone');
  else bad('T5', { wh, referrerAfter, referredTarget });

  // --- webhook : consommation du crédit au paiement suivant ---
  const cRef = 'ref-credit-' + Date.now();
  await clean([`transactions/${cRef}`, `subscriptions/credit-user`, `users/credit-user`]);
  await db.collection('users').doc('credit-user').set({ email: 'c@ela.test', firstPaymentDone: true, referralCredit: 10000 });
  await db.collection('transactions').doc(cRef).set({
    uid: 'credit-user', plan: 'general', duration: 1, amount: 65000,
    creditUsed: 10000, status: 'pending', createdAt: new Date()
  });
  wh = await postWebhook(cRef, 65000);
  const creditUserAfter = (await db.collection('users').doc('credit-user').get()).data();
  if (wh.status === 200 && creditUserAfter.referralCredit === 0)
    ok('T6 webhook -> crédit soldé (referralCredit 0)');
  else bad('T6', { wh, creditUserAfter });

  await clean([`users/${referrerUid}`, `users/${referredUid}`, `users/referred-target`, `users/credit-user`]);

  console.log(`\nRésultat: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
