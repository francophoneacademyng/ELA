const crypto = require('crypto');
const admin = require('firebase-admin');

const PROJECT = 'ela-academy-7f868';
const REGION = 'africa-south1';
const SECRET = 'sk_test_emulator_dummy_0000000000000000';
const DASH = `http://127.0.0.1:5001/${PROJECT}/${REGION}/getDashboardData`;
const WEBHOOK = `http://127.0.0.1:5001/${PROJECT}/${REGION}/paystackWebhook`;
const EXPIRY = `http://127.0.0.1:5001/${PROJECT}/${REGION}/checkSubscriptionExpiry`;
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

async function callDash(idToken) {
  const res = await fetch(DASH, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ data: {} })
  });
  return res.json();
}

async function clean(paths) { for (const p of paths) { try { await db.doc(p).delete(); } catch (e) {} } }

(async () => {
  console.log('== JALON 5 — tests émulateur (dashboard + expiration) ==');

  // T1 : getDashboardData sans auth -> UNAUTHENTICATED
  let r = await fetch(DASH, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: {} }) });
  let rb = await r.json();
  if (rb.error && rb.error.status === 'UNAUTHENTICATED') ok('T1 getDashboardData sans auth -> UNAUTHENTICATED');
  else bad('T1', rb);

  // setup utilisateur + abonnement + transactions
  const sign = await signup('dash-' + Date.now() + '@ela.test');
  const uid = sign.localId, idToken = sign.idToken;
  const end = new Date(); end.setMonth(end.getMonth() + 1);
  await db.collection('users').doc(uid).set({ email: 'dash@ela.test', referralCode: 'ELA-ABC123', referralCredit: 10000 });
  await db.collection('subscriptions').doc(uid).set({ plan: 'premium', duration: 3, status: 'active', startDate: new Date(), endDate: end });
  await db.collection('transactions').doc('tx1-' + uid).set({ uid, plan: 'premium', duration: 3, amount: 320000, status: 'success', createdAt: new Date() });
  await db.collection('transactions').doc('tx2-' + uid).set({ uid, plan: 'general', duration: 1, amount: 75000, status: 'pending', createdAt: new Date(Date.now() - 86400000) });

  r = await callDash(idToken);
  const d = r.result;
  if (d && d.subscription && d.subscription.status === 'active' && d.subscription.plan === 'premium'
    && d.user && d.user.referralCode === 'ELA-ABC123' && d.user.referralCredit === 10000
    && Array.isArray(d.transactions) && d.transactions.length === 2)
    ok('T2 getDashboardData -> abonnement + code + crédit + 2 transactions');
  else bad('T2', r);

  // T3 : email log-mode (SENDGRID absent) — un webhook valide ne doit pas casser
  const ref = 'ref-email-' + Date.now();
  await clean([`transactions/${ref}`, `subscriptions/email-user`, `users/email-user`]);
  await db.collection('users').doc('email-user').set({ email: 'email-user@ela.test' });
  await db.collection('transactions').doc(ref).set({ uid: 'email-user', email: 'email-user@ela.test', plan: 'general', duration: 1, amount: 75000, status: 'pending', createdAt: new Date() });
  const payload = { event: 'charge.success', data: { reference: ref, amount: 7500000 } };
  const body = JSON.stringify(payload);
  const wh = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-paystack-signature': hmac(body) }, body });
  const subEmail = (await db.collection('subscriptions').doc('email-user').get()).data();
  if (wh.status === 200 && subEmail && subEmail.status === 'active') ok('T3 webhook + email log-mode -> 200 + sub active (pas de crash)');
  else bad('T3', { status: wh.status, subEmail });

  // T4 : expiration (déclenchement du scheduler via Pub/Sub)
  const expUid = 'exp-' + Date.now();
  const past = new Date(); past.setDate(past.getDate() - 2);
  await clean([`subscriptions/${expUid}`, `users/${expUid}`]);
  await db.collection('users').doc(expUid).set({ email: 'exp@ela.test' });
  await db.collection('subscriptions').doc(expUid).set({ plan: 'general', duration: 1, status: 'active', startDate: new Date(past.getTime() - 30 * 86400000), endDate: past });
  try {
    const topic = 'firebase-schedule-checkSubscriptionExpiry';
    const pubUrl = `http://127.0.0.1:8089/v1/projects/${PROJECT}/topics/${topic}:publish`;
    const pubBody = JSON.stringify({ messages: [{ data: Buffer.from('{}').toString('base64') }] });
    const er = await fetch(pubUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: pubBody });
    let expAfter = null;
    for (let i = 0; i < 10; i++) {
      await new Promise((res) => setTimeout(res, 500));
      expAfter = (await db.collection('subscriptions').doc(expUid).get()).data();
      if (expAfter && expAfter.status === 'expired') break;
    }
    if (er.status === 200 && expAfter && expAfter.status === 'expired') ok('T4 expiration -> statut expired');
    else bad('T4', { pubStatus: er.status, expAfter });
  } catch (e) {
    bad('T4', { error: 'trigger failed: ' + e.message });
  }

  await clean([`users/${uid}`, `subscriptions/${uid}`, `transactions/tx1-${uid}`, `transactions/tx2-${uid}`, `users/email-user`, `subscriptions/email-user`, `users/${expUid}`, `subscriptions/${expUid}`]);

  console.log(`\nRésultat: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
