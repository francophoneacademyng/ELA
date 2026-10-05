/**
 * ELA — functions/test/publication-policy.test.js   (PURE, no Firebase)
 * Tests de la politique de publication (P0-5 : publication path consistency).
 * Exécution : node functions/test/publication-policy.test.js
 */
const assert = require('assert');
const policy = require('../publication-policy.js');
const framework = require('../academic-framework.js');

let passed = 0, failed = 0;
function ok(name, fn) {
  try { fn(); passed++; console.log('  PASS  ' + name); }
  catch (e) { failed++; console.error('  FAIL  ' + name + ' -- ' + e.message); }
}

console.log('--- publication-policy: canPublishContent ---');
ok('READY is publishable', () => {
  const d = policy.canPublishContent('READY');
  assert.strictEqual(d.ok, true);
  assert.strictEqual(d.reason, null);
});
ok('DRAFT is rejected', () => {
  const d = policy.canPublishContent('DRAFT');
  assert.strictEqual(d.ok, false);
  assert.strictEqual(d.reason, 'content-draft');
});
ok('REVIEW_REQUIRED is rejected', () => {
  const d = policy.canPublishContent('REVIEW_REQUIRED');
  assert.strictEqual(d.ok, false);
  assert.strictEqual(d.reason, 'review-required');
});
ok('MISSING is rejected', () => {
  const d = policy.canPublishContent('MISSING');
  assert.strictEqual(d.ok, false);
  assert.strictEqual(d.reason, 'content-missing');
});
ok('missing/undefined state treated as MISSING', () => {
  assert.strictEqual(policy.canPublishContent(undefined).ok, false);
  assert.strictEqual(policy.canPublishContent(null).reason, 'content-missing');
});
ok('unknown state is rejected', () => {
  assert.strictEqual(policy.canPublishContent('BOGUS').ok, false);
});
ok('isPublishable mirrors canPublishContent', () => {
  assert.strictEqual(policy.isPublishable('READY'), true);
  assert.strictEqual(policy.isPublishable('DRAFT'), false);
});

console.log('--- publication-policy: applied to the real framework ---');
ok('all 36 programmes are NOT publishable (DRAFT/REVIEW_REQUIRED)', () => {
  const fw = framework.buildFullFramework();
  for (const c of fw.curricula) {
    const d = policy.canPublishContent(c.contentState);
    assert.strictEqual(d.ok, false, c.programmeId + ' state=' + c.contentState);
  }
});
ok('no programme is silently READY', () => {
  const fw = framework.buildFullFramework();
  assert.ok(fw.curricula.every((c) => c.contentState !== 'READY'));
});
ok('DRAFT count 24 + REVIEW_REQUIRED 12 = 36 (honesty)', () => {
  const fw = framework.buildFullFramework();
  const draft = fw.curricula.filter((c) => c.contentState === 'DRAFT').length;
  const review = fw.curricula.filter((c) => c.contentState === 'REVIEW_REQUIRED').length;
  assert.strictEqual(draft, 24);
  assert.strictEqual(review, 12);
  assert.strictEqual(draft + review, 36);
});

console.log('\nPUBLICATION-POLICY-PURE: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
