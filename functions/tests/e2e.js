const fs = require('fs');
const crypto = require('crypto');

function loadEnv() {
  const env = {};
  const c = fs.readFileSync('functions/.env', 'utf8');
  for (const line of c.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}
const env = loadEnv();
const SECRET = env.PAYSTACK_SECRET;
const hasOpenRouter = !!env.OPENROUTER_KEY;
const hasSendGrid = !!env.SENDGRID_API_KEY;
console.log('config: PAYSTACK_SECRET=' + (SECRET ? 'SET(len ' + SECRET.length + ')' : 'EMPTY')
  + ' | OPENROUTER_KEY=' + (hasOpenRouter ? 'SET' : 'EMPTY')
  + ' | SENDGRID=' + (hasSendGrid ? 'SET' : 'EMPTY'));

const cfgSrc = fs.readFileSync('js/firebase-config.js', 'utf8');
const apiKey = (cfgSrc.match(/apiKey:\s*"([^"]+)"/) || [])[1];

const PROJECT = 'ela-academy-7f868';
const FN = `https://africa-south1-${PROJECT}.cloudfunctions.net`;
const AUTH_SIGNUP = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + apiKey;

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log('PASS ' + n); };
const bad = (n, d) => { fail++; console.log('FAIL ' + n + ' :: ' + JSON.stringify(d)); };
const hmac = (s) => crypto.createHmac('sha512', SECRET).update(s).digest('hex');

async function callable(name, idToken, data) {
  const res = await fetch(`${FN}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
    body: JSON.stringify({ data: data || {} })
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
async function postWebhook(payload, sig) {
  const body = JSON.stringify(payload);
  const headers = { 'Content-Type': 'application/json' };
  if (sig !== undefined) headers['x-paystack-signature'] = sig;
  const res = await fetch(`${FN}/paystackWebhook`, { method: 'POST', headers, body });
  return { status: res.status, text: await res.text() };
}

(async () => {
  console.log('== TESTS E2E REELS (fonctions deployees) ==');

  const email = 'e2e-' + Date.now() + '@gmail.com';
  const s = await (await fetch(AUTH_SIGNUP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'TestPass!12345', returnSecureToken: true }) })).json();
  const uid = s.localId, idToken = s.idToken;
  if (!uid) { console.log('FAIL signup :: ' + JSON.stringify(s)); process.exit(1); }
  ok('1 signup utilisateur test (uid ' + uid.slice(0, 8) + '...)');

  let r = await callable('initializePayment', idToken, { plan: 'general', duration: 1 });
  const init = r.body && r.body.result;
  const reference = init && init.reference;
  if (init && reference && init.authorizationUrl && init.amount === 75000) {
    ok('2 initializePayment -> reference + authorizationUrl + amount 75000 (7 500 000 kobo)');
    console.log('   reference=' + reference);
  } else bad('2 initializePayment', r.body);

  if (init && init.authorizationUrl) {
    const au = await fetch(init.authorizationUrl, { redirect: 'manual' });
    console.log('   authorizationUrl GET -> HTTP ' + au.status + ' (checkout Paystack joignable)');
  }

  const chargePayload = { event: 'charge.success', data: { reference, amount: 7500000, currency: 'NGN', metadata: { uid, plan: 'general', duration: 1, amount: 75000 } } };

  r = await postWebhook(chargePayload, 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef');
  if (r.status === 401 && /invalid signature/.test(r.text)) ok('3 webhook FAUSSE signature -> 401 (rien ecrit)');
  else bad('3 fake signature', r);

  r = await postWebhook(chargePayload, hmac(JSON.stringify(chargePayload)));
  if (r.status === 200 && /received/.test(r.text)) ok('4 webhook signature valide (HMAC SHA-512) -> 200');
  else bad('4 valid signature', r);

  r = await callable('getDashboardData', idToken, {});
  const dash = r.body && r.body.result;
  const sub = dash && dash.subscription;
  const txs = (dash && dash.transactions) || [];
  const txOk = txs.find((t) => t.id === reference);
  if (sub && sub.status === 'active' && txOk && txOk.status === 'success') {
    ok('5 dashboard -> subscription active + transaction success (chain Firestore OK)');
    console.log('   plan=' + sub.plan + ' duration=' + sub.duration + ' endDate=' + new Date(sub.endDate).toISOString() + ' amount=' + sub.amount);
  } else bad('5 dashboard', { sub, txOk });

  if (sub && sub.endDate) {
    const diffDays = (sub.endDate - Date.now()) / 86400000;
    if (Math.abs(diffDays - 30) <= 3) ok('6 endDate ~ +1 mois (' + Math.round(diffDays) + ' jours)');
    else bad('6 endDate', { diffDays });
  } else bad('6 endDate', { sub });

  if (sub && sub.endDate) {
    const before = sub.endDate;
    r = await postWebhook(chargePayload, hmac(JSON.stringify(chargePayload)));
    const r2 = await callable('getDashboardData', idToken, {});
    const sub2 = r2.body && r2.body.result && r2.body.result.subscription;
    if (r.status === 200 && sub2 && sub2.endDate === before) ok('7 idempotence double webhook -> endDate inchangee (une seule activation)');
    else bad('7 idempotence', { r, before, after: sub2 && sub2.endDate });
  }

  r = await callable('verifyPaystackPayment', idToken, { reference });
  console.log('   verifyPaystackPayment (ref non debitee reelement) -> ' + JSON.stringify(r.body));

  r = await callable('learningAssistant', idToken, { message: 'Say a short German greeting and one beginner tip.' });
  const la = r.body && r.body.result;
  if (la && la.degraded === false && la.reply) {
    ok('8 learningAssistant -> vraie reponse OpenRouter (plus de mode degrade)');
    console.log('   reply=' + JSON.stringify(String(la.reply).slice(0, 120)));
  } else bad('8 learningAssistant', r.body);

  // nettoyage : suppression de l'utilisateur Auth de test
  try {
    await fetch('https://identitytoolkit.googleapis.com/v1/accounts:delete?key=' + apiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) });
    console.log('   (utilisateur Auth de test supprime)');
  } catch (e) { console.log('   (auth delete ignore)'); }

  console.log('\nResultat: ' + pass + ' PASS, ' + fail + ' FAIL');
  console.log('CLEANUP: uid=' + uid + ' reference=' + reference + ' email=' + email);
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
