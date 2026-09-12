/* ============================================================
   ELA — Tests unitaires du nurturing (Mission 7)
   Exécution : cd functions && node --test test/
   Ne contacte aucun service externe. Ne déclenche aucun email.
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert');

// Les clés ne doivent pas être requises pour charger le module (proxys paresseux).
process.env.NURTURE_SEND_ENABLED = 'false';
process.env.NURTURE_TOKEN_SECRET = 'test-secret-1234567890';

const nurture = require('../nurture');
const T = nurture.__test;

test('sequence: 7 steps, délais strictement croissants', () => {
  assert.strictEqual(T.SEQUENCE.length, 7);
  assert.strictEqual(T.MAX_STEP, 7);
  for (let i = 1; i < T.SEQUENCE.length; i++) {
    assert.ok(T.SEQUENCE[i].delayHours > T.SEQUENCE[i - 1].delayHours, 'délai croissant');
  }
  assert.strictEqual(T.SEQUENCE[0].delayHours, 0);
});

test('langues supportées : en/fr/ar ; de/ru/zh non supportés (repli EN)', () => {
  assert.deepStrictEqual(T.SUPPORTED_LANGS, ['en', 'fr', 'ar']);
  assert.ok(T.isSupportedLang('fr'));
  assert.ok(T.isSupportedLang('AR'));
  assert.ok(!T.isSupportedLang('de'));
  assert.ok(!T.isSupportedLang('ru'));
  assert.ok(!T.isSupportedLang('zh'));
  assert.ok(!T.isSupportedLang('es'));
});

test('normalizeEmail', () => {
  assert.strictEqual(T.normalizeEmail('  User@Example.COM '), 'user@example.com');
  assert.strictEqual(T.normalizeEmail(null), '');
});

test('academyFor: 6 académies + repli', () => {
  ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'].forEach((c) => {
    assert.ok(T.academyFor(c).slug, c + ' a un slug');
  });
  assert.strictEqual(T.academyFor('XX').slug, 'en');
  assert.strictEqual(T.academyFor('fr').slug, 'fr');
});

test('token: sign/verify round-trip + invalides rejetés', () => {
  const tok = T.signToken('lead123', 'a@b.co');
  const data = T.verifyToken(tok);
  assert.ok(data, 'token valide');
  assert.strictEqual(data.id, 'lead123');
  assert.strictEqual(data.e, 'a@b.co');
  assert.strictEqual(T.verifyToken(tok + 'x'), null, 'signature altérée');
  assert.strictEqual(T.verifyToken('not-a-token'), null);
  assert.strictEqual(T.verifyToken(''), null);
  assert.strictEqual(T.verifyToken(null), null);
});

test('renderEmail: 7 pas × 3 langues, aucun placeholder non résolu', () => {
  const lead = { id: 'L1', email: 'Test@Example.com', name: 'Amina', academy: 'DE', locale: 'en' };
  T.SEQUENCE.forEach((s) => {
    ['en', 'fr', 'ar'].forEach((lang) => {
      const r = T.renderEmail(Object.assign({}, lead, { locale: lang }), s.key);
      assert.ok(r.subject && r.subject.length > 3, s.key + '/' + lang + ' sujet');
      assert.ok(r.text && r.text.length > 30, s.key + '/' + lang + ' corps');
      assert.ok(r.text.indexOf('{{') < 0, s.key + '/' + lang + ' placeholders résolus');
      assert.ok(r.subject.indexOf('{{') < 0, s.key + '/' + lang + ' sujet résolu');
      assert.ok(r.text.indexOf('https://elaacademy.ng/unsubscribe?token=') >= 0, 'lien unsubscribe présent');
      const hasCta = r.text.indexOf('https://elaacademy.ng/free-trial') >= 0
        || r.text.indexOf('https://elaacademy.ng/lead-magnets/') >= 0
        || r.text.indexOf('https://elaacademy.ng/academies') >= 0;
      assert.ok(hasCta, s.key + '/' + lang + ' CTA présent');
      assert.ok(r.text.indexOf('contact@') < 0, 'pas de fuite de contact');
    });
  });
});

test('renderEmail: repli EN pour de/ru/zh/es', () => {
  const lead = { id: 'L2', email: 'x@y.co', name: 'Test', academy: 'FR', locale: 'de' };
  const de = T.renderEmail(lead, 'e1');
  const en = T.renderEmail(Object.assign({}, lead, { locale: 'en' }), 'e1');
  assert.strictEqual(de.subject, en.subject, 'de → EN');
  const es = T.renderEmail(Object.assign({}, lead, { locale: 'es' }), 'e1');
  assert.strictEqual(es.subject, en.subject, 'es → EN (jamais espagnol)');
  assert.ok(es.text.indexOf('Bienvenue') < 0 && es.text.indexOf('مرحب') < 0, 'pas de contenu non-anglais');
});

test('renderEmail: arabe contient de l\'arabe, français du français', () => {
  const lead = { id: 'L3', email: 'x@y.co', name: 'Test', academy: 'AR', locale: 'ar' };
  const ar = T.renderEmail(lead, 'e1');
  assert.ok(/[\u0600-\u06FF]/.test(ar.text), 'caractères arabes présents');
  const fr = T.renderEmail(Object.assign({}, lead, { locale: 'fr' }), 'e1');
  assert.ok(/[éèàçûô]/.test(fr.text), 'accents français présents');
});

test('renderEmail: le lien guide pointe vers la bonne académie et ?lang', () => {
  const de = T.renderEmail({ id: 'L4', email: 'x@y.co', name: 'T', academy: 'DE', locale: 'fr' }, 'e1');
  assert.ok(de.text.indexOf('https://elaacademy.ng/lead-magnets/de?lang=fr') >= 0, 'guide DE en FR');
  const en = T.renderEmail({ id: 'L5', email: 'x@y.co', name: 'T', academy: 'ZH', locale: 'en' }, 'e1');
  assert.ok(en.text.indexOf('https://elaacademy.ng/lead-magnets/zh') >= 0, 'guide ZH sans query');
});

test('renderEmail: le token du lien unsubscribe est valide et lié au lead', () => {
  const lead = { id: 'LEAD-XYZ', email: 'sub@example.com', name: 'T', academy: 'EN', locale: 'en' };
  const r = T.renderEmail(lead, 'e1');
  const m = r.text.match(/unsubscribe\?token=([^&\s]+)/);
  assert.ok(m, 'token présent');
  const decoded = decodeURIComponent(m[1]);
  const data = T.verifyToken(decoded);
  assert.ok(data, 'token vérifiable');
  assert.strictEqual(data.id, 'LEAD-XYZ');
  assert.strictEqual(data.e, 'sub@example.com');
});

test('fill: remplace les variables et laisse vide si absente', () => {
  assert.strictEqual(T.fill('Hi {{name}} in {{academy_label}}', { name: 'A', academy_label: 'ELA' }), 'Hi A in ELA');
  assert.strictEqual(T.fill('X{{missing}}Y', {}), 'XY');
});

test('nextDueStep: cadence, idempotence et fin de séquence', () => {
  const H = 3600000;
  const start = 1_000_000_000_000; // startedAt de référence
  // Pas 1 dû immédiatement
  assert.strictEqual(T.nextDueStep({ lastSentStep: 0, startedAt: start }, start).step, 1);
  // Après pas 1 : pas 2 dû seulement après 24h
  assert.strictEqual(T.nextDueStep({ lastSentStep: 1, startedAt: start }, start + 23 * H).step, null);
  assert.strictEqual(T.nextDueStep({ lastSentStep: 1, startedAt: start }, start + 24 * H).step, 2);
  // Idempotence : si lastSentStep a déjà avancé, on ne renvoie pas le même pas
  assert.strictEqual(T.nextDueStep({ lastSentStep: 2, startedAt: start }, start + 24 * H).step, null);
  // Pas 7 dû à 336h
  assert.strictEqual(T.nextDueStep({ lastSentStep: 6, startedAt: start }, start + 336 * H).step, 7);
  // Après le pas 7 : séquence terminée
  const done = T.nextDueStep({ lastSentStep: 7, startedAt: start }, start + 1000 * H);
  assert.strictEqual(done.complete, true);
  assert.strictEqual(done.step, null);
});

test('aucun contenu interdit (garanties/témoignages) dans les emails', () => {
  const banned = [/guarantee/i, /guaranteed/i, /testimonial/i, /\bvisa\b/i, /scholarship guaranteed/i];
  T.SEQUENCE.forEach((s) => {
    ['en', 'fr', 'ar'].forEach((lang) => {
      const r = T.renderEmail({ id: 'L', email: 'x@y.co', name: 'T', academy: 'EN', locale: lang }, s.key);
      banned.forEach((re) => assert.ok(!re.test(r.text), s.key + '/' + lang + ' contient un terme interdit ' + re));
    });
  });
});
