/* ============================================================
   ELA — Test d'intégration nurturing (Mission 7)
   À lancer via l'émulateur :
     firebase emulators:exec --only firestore,functions "node test/integration.js"
   Vérifie le COMPORTEMENT réel : trigger lead, anti-doublon,
   désabonnement, transition inscription, transition paiement.
   NURTURE_SEND_ENABLED reste "false" → aucun email réel.
   ============================================================ */
const admin = require('firebase-admin');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PROJECT = process.env.GCLOUD_PROJECT || 'ela-academy-7f868';

/* Utiliser le même secret que la fonction émulateur (functions/.env). */
function envFromFile() {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, '..', '.env'), 'utf8');
    const out = {};
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    });
    return out;
  } catch (e) { return {}; }
}
const FILE_ENV = envFromFile();
const TOKEN_SECRET = process.env.NURTURE_TOKEN_SECRET || FILE_ENV.NURTURE_TOKEN_SECRET || 'test-secret-1234567890';
const FUNCTIONS_ORIGIN = 'http://127.0.0.1:5001';

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
function check(label, cond, detail) {
  if (!cond) fail++;
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + label + (detail !== undefined ? '  [' + detail + ']' : ''));
}
async function waitFor(fn, timeoutMs, intervalMs) {
  const end = Date.now() + (timeoutMs || 15000);
  while (Date.now() < end) {
    const v = await fn();
    if (v) return v;
    await sleep(intervalMs || 500);
  }
  return null;
}
function signToken(leadId, email) {
  const payload = Buffer.from(JSON.stringify({ id: leadId, e: email, exp: Date.now() + 3600000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return payload + '.' + sig;
}

(async () => {
  const stamp = Date.now();
  const emailA = 'lead-a-' + stamp + '@example.com';
  const emailB = 'lead-b-' + stamp + '@example.com';

  // 1. Création d'un lead → trigger → statut active + séquence initialisée
  const leadA = await db.collection('leadMagnetLeads').add({
    name: 'Amina', email: emailA, academy: 'DE', goal: 'study', leadMagnetId: 'de',
    source: 'lead-magnet-de', consent: true, locale: 'en', ts: Date.now()
  });
  const aAny = await waitFor(async () => {
    const s = await leadA.get();
    const d = s.data();
    return (d && d.status) ? d : null;
  }, 60000);
  console.log('DEBUG leadA status=' + (aAny && aAny.status) + ' err=' + (aAny && aAny.errorMessage));
  const aData = (aAny && aAny.status === 'active' && aAny.sequence) ? aAny : null;
  check('lead créé → status active', !!aData, aData && aData.status);
  check('séquence initialisée', !!aData && aData.sequence && aData.sequence.lastSentStep === 0, aData && aData.sequence && aData.sequence.lastSentStep);
  check('envoi désactivé (aucun pas avancé)', !!aData && aData.sequence.lastSentStep === 0);

  // 2. Anti-doublon : même email → duplicate
  const leadA2 = await db.collection('leadMagnetLeads').add({
    name: 'Amina', email: emailA, academy: 'DE', goal: 'study', leadMagnetId: 'de',
    source: 'lead-magnet-de', consent: true, locale: 'en', ts: Date.now() + 1
  });
  const a2Any = await waitFor(async () => {
    const s = await leadA2.get();
    const d = s.data();
    return (d && d.status && d.status !== 'active') ? d : null;
  }, 30000);
  console.log('DEBUG leadA2 status=' + (a2Any && a2Any.status) + ' err=' + (a2Any && a2Any.errorMessage));
  const a2Data = (a2Any && a2Any.status === 'duplicate') ? a2Any : null;
  check('même email → duplicate', !!a2Data, a2Data && a2Data.status);
  check('duplicateOf renseigné', !!a2Data && a2Data.duplicateOf === leadA.id, a2Data && a2Data.duplicateOf);

  // 3. Consentement absent → stopped
  const leadNoConsent = await db.collection('leadMagnetLeads').add({
    name: 'No', email: 'noconsent-' + stamp + '@example.com', academy: 'FR',
    leadMagnetId: 'fr', consent: false, locale: 'fr', ts: Date.now()
  });
  const nc = await waitFor(async () => {
    const s = await leadNoConsent.get(); const d = s.data();
    return (d && d.status === 'stopped') ? d : null;
  }, 30000);
  check('sans consentement → stopped', !!nc, nc && nc.status);

  // 4. Désabonnement via endpoint HTTP signé
  const token = signToken(leadA.id, emailA);
  const url = FUNCTIONS_ORIGIN + '/' + PROJECT + '/africa-south1/nurtureUnsubscribe?token=' + encodeURIComponent(token);
  let unsubStatus = 0;
  try { const resp = await fetch(url); unsubStatus = resp.status; } catch (e) { unsubStatus = -1; }
  check('unsubscribe HTTP 200', unsubStatus === 200, unsubStatus);
  const unsub = await waitFor(async () => {
    const s = await leadA.get(); const d = s.data();
    return (d && d.status === 'unsubscribed') ? d : null;
  }, 30000);
  check('lead désabonné', !!unsub, unsub && unsub.status);

  // 4b. Token invalide → 400
  let badStatus = 0;
  try { const resp = await fetch(FUNCTIONS_ORIGIN + '/' + PROJECT + '/africa-south1/nurtureUnsubscribe?token=bad'); badStatus = resp.status; } catch (e) { badStatus = -1; }
  check('unsubscribe token invalide → 400', badStatus === 400, badStatus);

  // 5. Transition inscription : users/{uid} créé → lead registered
  const leadB = await db.collection('leadMagnetLeads').add({
    name: 'Bello', email: emailB, academy: 'EN', goal: 'work', leadMagnetId: 'en',
    source: 'lead-magnet-en', consent: true, locale: 'en', ts: Date.now()
  });
  const bActive = await waitFor(async () => { const s = await leadB.get(); const d = s.data(); return (d && d.status) ? d : null; }, 60000);
  console.log('DEBUG leadB status=' + (bActive && bActive.status) + ' err=' + (bActive && bActive.errorMessage));
  const uid = 'test-uid-' + stamp;
  await db.collection('users').doc(uid).set({ email: emailB, displayName: 'Bello', role: 'student', academy: 'english' });
  const reg = await waitFor(async () => {
    const s = await leadB.get(); const d = s.data();
    return (d && d.status === 'registered') ? d : null;
  }, 30000);
  check('inscription → lead registered', !!reg, reg && reg.status);

  // 6. Transition paiement : subscriptions/{uid} active → lead customer
  await db.collection('subscriptions').doc(uid).set({ status: 'active', plan: 'general', duration: 1, endDate: new Date(Date.now() + 30 * 86400000) });
  const cust = await waitFor(async () => {
    const s = await leadB.get(); const d = s.data();
    return (d && d.status === 'customer') ? d : null;
  }, 30000);
  check('paiement → lead customer', !!cust, cust && cust.status);

  // 7. Un désabonné ne doit pas être réactivé par l'inscription
  const leadC = await db.collection('leadMagnetLeads').add({
    name: 'C', email: 'lead-c-' + stamp + '@example.com', academy: 'AR',
    leadMagnetId: 'ar', consent: true, locale: 'ar', ts: Date.now()
  });
  await waitFor(async () => { const s = await leadC.get(); return s.data().status === 'active'; }, 30000);
  await leadC.set({ status: 'unsubscribed', unsubscribed: true }, { merge: true });
  await db.collection('users').doc('test-uid-c-' + stamp).set({ email: 'lead-c-' + stamp + '@example.com', role: 'student' });
  await sleep(4000);
  const cAfter = await leadC.get();
  check('désabonné non réactivé par inscription', cAfter.data().status === 'unsubscribed', cAfter.data().status);

  console.log(fail === 0 ? '\nALL INTEGRATION CHECKS PASSED' : '\n' + fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.log('ERR ' + (e && e.message)); process.exit(1); });

