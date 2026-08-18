const crypto = require('crypto');
const admin = require('firebase-admin');

const PROJECT = 'ela-academy-7f868';
const REGION = 'africa-south1';
const SECRET = 'sk_test_emulator_dummy_0000000000000000';
const WEBHOOK = `http://127.0.0.1:5001/${PROJECT}/${REGION}/paystackWebhook`;

const PRICE = {
  general:  { 1: 75000,  3: 200000, 6: 405000 },
  premium:  { 1: 120000, 3: 320000, 6: 648000 },
  business: { 1: 150000, 3: 420000, 6: 840000 }
};

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log('PASS ' + n); };
const bad = (n, d) => { fail++; console.log('FAIL ' + n + ' :: ' + JSON.stringify(d)); };

const hmac = (s) => crypto.createHmac('sha512', SECRET).update(s).digest('hex');

async function postWebhook(payload, sig) {
  const body = JSON.stringify(payload);
  const headers = { 'Content-Type': 'application/json' };
  if (sig !== undefined) headers['x-paystack-signature'] = sig;
  const res = await fetch(WEBHOOK, { method: 'POST', headers, body });
  return { status: res.status, text: await res.text() };
}

function charge(uid, plan, duration, ref) {
  const naira = PRICE[plan][duration];
  return {
    event: 'charge.success',
    data: { reference: ref, amount: naira * 100, currency: 'NGN',
      metadata: { uid, plan, duration, amount: naira } }
  };
}

async function seedTx(ref, uid, plan, duration) {
  await db.collection('transactions').doc(ref).set({
    uid, plan, duration, amount: PRICE[plan][duration], status: 'pending', createdAt: new Date()
  });
}

async function clean(paths) {
  for (const p of paths) { try { await db.doc(p).delete(); } catch (e) {} }
}

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (r.status === 400 || r.status === 401 || r.status === 500) return;
    } catch (e) { /* pas encore prêt */ }
    await new Promise((res) => setTimeout(res, 1000));
  }
  throw new Error('functions emulator did not become ready');
}

(async () => {
  console.log('== JALON 2 — tests émulateur ==');
  await waitReady();

  // T1 : signature manquante -> 400
  let r = await postWebhook(charge('u1', 'general', 1, 'ref-nosig'), undefined);
  if (r.status === 400 && /missing signature/.test(r.text)) ok('T1 missing signature -> 400');
  else bad('T1 missing signature', r);

  // T2 : signature invalide -> 401 + aucune écriture
  await clean(['transactions/ref-bad', 'subscriptions/u-bad', 'users/u-bad']);
  r = await postWebhook(charge('u-bad', 'general', 1, 'ref-bad'), 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef');
  const badSub = await db.collection('subscriptions').doc('u-bad').get();
  if (r.status === 401 && /invalid signature/.test(r.text) && !badSub.exists) ok('T2 invalid signature -> 401 + no write');
  else bad('T2 invalid signature', { r, exists: badSub.exists });

  // T3 : HMAC valide -> 200 + abonnement actif + transaction success
  await clean(['transactions/ref-ok', 'subscriptions/u-ok', 'users/u-ok']);
  await seedTx('ref-ok', 'u-ok', 'general', 1);
  const evOk = charge('u-ok', 'general', 1, 'ref-ok');
  r = await postWebhook(evOk, hmac(JSON.stringify(evOk)));
  const subOkSnap = await db.collection('subscriptions').doc('u-ok').get();
  const txOkSnap = await db.collection('transactions').doc('ref-ok').get();
  const subOk = subOkSnap.data(), txOk = txOkSnap.data();
  if (r.status === 200 && /received/.test(r.text) && subOk && subOk.status === 'active' && subOk.amount === 75000 && txOk && txOk.status === 'success')
    ok('T3 valid HMAC -> 200 + active sub (amount 75000) + tx success');
  else bad('T3 valid HMAC', { r, subOk, txOk });

  // T4 : idempotence (double envoi du même événement -> endDate inchangée)
  const endBefore = subOk.endDate.toMillis();
  r = await postWebhook(evOk, hmac(JSON.stringify(evOk)));
  const subOk2 = (await db.collection('subscriptions').doc('u-ok').get()).data();
  if (r.status === 200 && subOk2.endDate.toMillis() === endBefore) ok('T4 idempotence (double envoi, endDate inchangée)');
  else bad('T4 idempotence', { before: endBefore, after: subOk2.endDate.toMillis() });

  // T5 : extension d'un abonnement actif (+3 mois depuis endDate)
  await clean(['transactions/ref-ext']);
  await seedTx('ref-ext', 'u-ok', 'premium', 3);
  const evExt = charge('u-ok', 'premium', 3, 'ref-ext');
  r = await postWebhook(evExt, hmac(JSON.stringify(evExt)));
  const subExt = (await db.collection('subscriptions').doc('u-ok').get()).data();
  const expectedEnd = new Date(endBefore); expectedEnd.setMonth(expectedEnd.getMonth() + 3);
  const gotEnd = new Date(subExt.endDate.toMillis());
  const monthMatch = gotEnd.getFullYear() === expectedEnd.getFullYear()
    && gotEnd.getMonth() === expectedEnd.getMonth()
    && gotEnd.getDate() === expectedEnd.getDate();
  if (r.status === 200 && subExt.status === 'active' && subExt.plan === 'premium' && monthMatch) ok('T5 extension (+3 mois)');
  else bad('T5 extension', { got: gotEnd.toISOString(), expected: expectedEnd.toISOString() });

  // T6 : 9 combinaisons montant (kobo exacts) -> écrites ; montant faux -> ignoré
  let t6ok = true;
  for (const plan of Object.keys(PRICE)) {
    for (const duration of [1, 3, 6]) {
      const uid = `u-${plan}-${duration}`;
      const ref = `ref-${plan}-${duration}`;
      await clean([`transactions/${ref}`, `subscriptions/${uid}`, `users/${uid}`]);
      await seedTx(ref, uid, plan, duration);
      const ev = charge(uid, plan, duration, ref);
      const rr = await postWebhook(ev, hmac(JSON.stringify(ev)));
      const s = await db.collection('subscriptions').doc(uid).get();
      if (rr.status !== 200 || !s.exists || s.data().amount !== PRICE[plan][duration]) {
        t6ok = false; console.log(`  FAIL combo ${plan}/${duration} -> status ${rr.status}, amount ${s.exists ? s.data().amount : 'none'}`);
      }
      // montant faux (off by 100 kobo) sur un uid frais -> ne doit PAS écrire
      const wUid = uid + '-w';
      await clean([`transactions/${ref}-w`, `subscriptions/${wUid}`, `users/${wUid}`]);
      await seedTx(ref + '-w', wUid, plan, duration);
      const wrong = charge(wUid, plan, duration, ref + '-w');
      wrong.data.amount = PRICE[plan][duration] * 100 - 100;
      const rw = await postWebhook(wrong, hmac(JSON.stringify(wrong)));
      const sw = await db.collection('subscriptions').doc(wUid).get();
      if (rw.status !== 200 || sw.exists) {
        t6ok = false; console.log(`  FAIL wrong-amount ${plan}/${duration} -> wrote despite wrong amount`);
      }
      await clean([`subscriptions/${wUid}`, `users/${wUid}`]);
    }
  }
  if (t6ok) ok('T6 9 combos kobo corrects + montant faux rejeté');
  else bad('T6 9 combos', 'see details');

  console.log(`\nRésultat: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
