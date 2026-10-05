/**
 * ELA — functions/test/fr-a1-consolidation.test.js   (PURE, no Firebase)
 * Tests de la consolidation FR-A1 (blueprint humain + contenu réel).
 * Exécution : node functions/test/fr-a1-consolidation.test.js
 */
const assert = require('assert');
const fw = require('../academic-framework.js');
const content = require('../curriculum-content.js');

let passed = 0, failed = 0;
function ok(name, fn) {
  try { fn(); passed++; console.log('  PASS  ' + name); }
  catch (e) { failed++; console.error('  FAIL  ' + name + ' -- ' + e.message); }
}

const framework = fw.buildFullFramework();
const frA1 = framework.curricula.find((c) => c.programmeId === 'prog_FR_A1');
const deA1 = framework.curricula.find((c) => c.programmeId === 'prog_DE_A1');

function flatLessons(cur) {
  const out = [];
  for (const m of cur.modules) for (const u of m.units) for (const l of u.lessons) out.push(l);
  return out;
}

console.log('--- structure + IDs ---');
ok('FR-A1 has 6 modules / 18 units / 36 lessons', () => {
  assert.strictEqual(frA1.modules.length, 6);
  const units = frA1.modules.reduce((n, m) => n + m.units.length, 0);
  const lessons = flatLessons(frA1).length;
  assert.strictEqual(units, 18);
  assert.strictEqual(lessons, 36);
});
ok('FR-A1 remains DRAFT', () => {
  assert.strictEqual(frA1.contentState, 'DRAFT');
});
ok('FR-A1 node IDs preserved (prog_FR_A1-… scheme)', () => {
  for (const l of flatLessons(frA1)) {
    assert.ok(/^prog_FR_A1-M\d{2}-U\d{2}-L\d{2}$/.test(l.id), 'unexpected id ' + l.id);
  }
});
ok('no duplicate FR-A1 lesson IDs', () => {
  const ids = flatLessons(frA1).map((l) => l.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

console.log('--- content preservation ---');
ok('real vocabulary preserved (module 0 still contains "bonjour")', () => {
  const l = frA1.modules[0].units[0].lessons[0];
  const vocab = (l.vocabularyFocus || []).concat(l.languageContent || []);
  assert.ok(vocab.some((v) => String(v).toLowerCase().indexOf('bonjour') >= 0), JSON.stringify(vocab));
});
ok('lesson body preserved (explanation + practice + assessment + mastery)', () => {
  const l = frA1.modules[0].units[0].lessons[0];
  assert.ok(l.explanation && l.explanation.length > 20);
  assert.ok(l.guidedPractice && l.independentPractice && l.assessment && l.masteryCriteria);
});
ok('outcomes and competencies remain linked', () => {
  const l = frA1.modules[0].units[0].lessons[0];
  assert.ok(l.outcomeIds.length > 0 && l.competencyIds.length > 0);
});

console.log('--- enrichment (curated) ---');
ok('curated lesson M01-U01-L01 objective is specific (blueprint)', () => {
  const l = frA1.modules[0].units[0].lessons[0];
  assert.strictEqual(l.objective, 'Greet and take leave appropriately.');
});
ok('curated lesson M01-U01-L02 objective is specific', () => {
  assert.strictEqual(frA1.modules[0].units[0].lessons[1].objective, 'State and ask names.');
});
ok('curated lesson M02-U01-L01 objective is specific', () => {
  assert.strictEqual(frA1.modules[1].units[0].lessons[0].objective, 'Give and ask age.');
});
ok('curated lesson M03-U01-L01 objective is specific', () => {
  assert.strictEqual(frA1.modules[2].units[0].lessons[0].objective, 'Tell the time.');
});
ok('curated lessons carry specific activities', () => {
  const l = frA1.modules[0].units[0].lessons[0];
  assert.ok(Array.isArray(l.activities) && l.activities.length > 0);
  assert.ok(l.activities.indexOf('jeu de rôle') >= 0 || l.activities.indexOf('écoute') >= 0, JSON.stringify(l.activities));
});

console.log('--- non-curated lessons left unchanged ---');
ok('non-corresponding lesson (Nationalités) keeps generator objective', () => {
  const l = frA1.modules[0].units[1].lessons[0]; // [0,1,0] not in CURATED
  assert.ok(l.objective && l.objective.indexOf('maîtriser la structure cible') >= 0, l.objective);
});
ok('module 5 (Culture) is not renamed', () => {
  assert.strictEqual(frA1.modules[5].title, 'Culture et intégration');
});

console.log('--- other programmes untouched ---');
ok('DE-A1 is NOT enriched (template objective preserved)', () => {
  const l = deA1.modules[0].units[0].lessons[0];
  assert.ok(/master the target structure/.test(l.objective), l.objective);
});
ok('all 36 programmes still present, DRAFT 24 / REVIEW_REQUIRED 12', () => {
  const draft = framework.curricula.filter((c) => c.contentState === 'DRAFT').length;
  const review = framework.curricula.filter((c) => c.contentState === 'REVIEW_REQUIRED').length;
  assert.strictEqual(draft, 24);
  assert.strictEqual(review, 12);
});

console.log('\nFR-A1-CONSOLIDATION-PURE: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
