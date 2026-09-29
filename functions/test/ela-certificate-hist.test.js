/* ============================================================
   ELA — functions/tests/ela-certificate.test.js
   ------------------------------------------------------------
   Tests unitaires (sans Firebase) des fonctions pures du noyau
   de certification ELA. Exécution : node functions/tests/ela-certificate.test.js
   ============================================================ */
const assert = require('assert');
const core = require('../ela-certificate-core.js');

let passed = 0, failed = 0;
function ok(name, fn) {
  try { fn(); passed++; console.log('  ✔', name); }
  catch (e) { failed++; console.error('  ✘', name, '-', e.message); }
}

console.log('ela-certificate-core');

ok('generateCertificateId : format ELA-XX-Y-XXXXXX', () => {
  const id = core.generateCertificateId('FR', 'B1');
  assert.ok(/^ELA-[A-Z]{2}-[A-C][1-2]-[A-Z0-9]{6}$/.test(id), id);
});

ok('generateCertificateId : unicité', () => {
  const a = new Set();
  for (let i = 0; i < 200; i++) a.add(core.generateCertificateId('FR', 'A1'));
  assert.strictEqual(a.size, 200);
});

ok('canonicalJson : clés triées, déterministe', () => {
  assert.strictEqual(core.canonicalJson({ b: 1, a: 2 }), '{"a":2,"b":1}');
  assert.strictEqual(core.canonicalJson({ b: 1, a: 2 }), core.canonicalJson({ a: 2, b: 1 }));
});

ok('sha256Hex : valeur connue', () => {
  assert.strictEqual(core.sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

ok('publicView : aucune donnée sensible', () => {
  const v = core.publicView({
    id: 'ELA-FR-B1-8X92KD', studentName: 'Awa Diop', institution: 'E-Learn Language Academy',
    academyLabel: 'Francophone Academy', cecrLevel: 'B1', issueDate: '2026-01-01',
    expiryDate: '2029-01-01', status: 'active',
    studentId: 'uid-123', studentEmail: 'awa@example.com', skills: { x: 1 },
    signatureHash: 'deadbeef', scoreGlobal: 79
  });
  assert.strictEqual(v.certificateId, 'ELA-FR-B1-8X92KD');
  assert.strictEqual(v.valid, true);
  const s = JSON.stringify(v);
  ['studentId', 'studentEmail', 'skills', 'signatureHash', 'scoreGlobal', 'uid-123', 'awa@example.com']
    .forEach((banned) => assert.ok(s.indexOf(banned) < 0, 'fuite: ' + banned));
});

ok('publicView : statut revoked → valid=false', () => {
  const v = core.publicView({ id: 'X', status: 'revoked', expiryDate: '2099-01-01' });
  assert.strictEqual(v.valid, false);
  assert.strictEqual(v.status, 'revoked');
});

ok('ownerView : sans hash ni email', () => {
  const v = core.ownerView({ id: 'ELA-FR-B1-8X92KD', status: 'active', signatureHash: 'h', studentEmail: 'x@y.z' });
  const s = JSON.stringify(v);
  assert.ok(s.indexOf('signatureHash') < 0 && s.indexOf('studentEmail') < 0);
});

ok('mapping académies : francophone → FR', () => {
  assert.strictEqual(core.ACADEMY_KEY_TO_CODE['french'], 'FR');
  assert.strictEqual(core.ACADEMY_KEY_TO_CODE['francophone'], 'FR');
  assert.strictEqual(core.ACADEMY_KEY_TO_CODE['german'], 'DE');
});

ok('whitelist callable : FR uniquement (extensible)', () => {
  assert.deepStrictEqual(core.CALLABLE_ACADEMY_WHITELIST, ['FR']);
});

ok('CECRL valides', () => {
  assert.deepStrictEqual(core.CECRL_LEVELS, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
});

console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
