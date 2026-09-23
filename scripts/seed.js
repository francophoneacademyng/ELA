'use strict';
/* ============================================================
   ELA — scripts/seed.js
   CLI de seed contrôlé (idempotent, non destructif).

     node scripts/seed.js --dry-run     (défaut) diff vs Firestore, AUCUNE écriture
     node scripts/seed.js --validate    validation schéma/relations
     node scripts/seed.js --report      écrit le plan JSON + résumé
     node scripts/seed.js --seed --confirm  ÉCRIT en production (Admin SDK requis)

   Le mode --seed REFUSE de s'exécuter sans GOOGLE_APPLICATION_CREDENTIALS
   (ou GOOGLE_CLOUD_PROJECT + ADC) et sans --confirm. Aucune suppression.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { validateDataset } = require('./lib/validate.js');
const { buildPlan, manualReview } = require('./lib/plan.js');

const DATA = path.join(__dirname, 'data');
const args = process.argv.slice(2);
const has = (f) => args.includes(f);

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

async function readCurrent() {
  try {
    const rest = require('./lib/firestore-rest.js');
    const token = await rest.accessToken();
    const [courses, lessons, quizzes] = await Promise.all([
      rest.listAll('courses', token), rest.listAll('lessons', token), rest.listAll('quizzes', token),
    ]);
    return { ok: true, courses, lessons, quizzes };
  } catch (e) {
    return { ok: false, error: e.message, courses: [], lessons: [], quizzes: [] };
  }
}

async function main() {
  const dataset = readJson(path.join(DATA, 'ela-dataset.json'));
  const reg = readJson(path.join(DATA, 'academies.json'));

  console.log('=== ELA SEED (mode ' + (has('--seed') ? 'SEED' : 'DRY-RUN') + ') ===');
  console.log('dataset counts:', JSON.stringify(dataset.meta.counts));

  const v = validateDataset(dataset, reg.academies);
  console.log(`\nVALIDATE: pass=${v.pass} fail=${v.fail} warnings=${v.warnings}`);
  v.issues.slice(0, 60).forEach((i) => console.log(`  [${i.level}] ${i.code}: ${i.detail}`));
  if (v.issues.length > 60) console.log(`  ... +${v.issues.length - 60} more`);

  if (has('--validate') && !has('--report') && !has('--dry-run') && !has('--seed')) return;

  const current = await readCurrent();
  if (!current.ok) console.log('\nWARN: Firestore read unavailable (' + current.error + ') — plan assumes all CREATE.');
  else console.log('\nFirestore current: courses=' + current.courses.length + ' lessons=' + current.lessons.length + ' quizzes=' + current.quizzes.length);

  const plan = buildPlan(dataset, current);
  const review = manualReview(dataset);

  console.log('\n=== PLAN (dry-run) ===');
  for (const k of ['courses', 'lessons', 'quizzes']) {
    const p = plan[k];
    console.log(`  ${k}: create=${p.counts.create} update=${p.counts.update} skip=${p.counts.skip} conflict=${p.counts.conflict} (existing-not-in-dataset=${p.orphanExisting.length})`);
  }
  console.log('\nMANUAL REVIEW (' + review.length + '):');
  review.forEach((r) => console.log('  - ' + r.id + ' :: ' + r.reason));

  const report = {
    generatedAt: new Date().toISOString(),
    mode: has('--seed') ? 'seed' : 'dry-run',
    datasetCounts: dataset.meta.counts,
    validation: { pass: v.pass, fail: v.fail, warnings: v.warnings },
    firestoreReadable: current.ok,
    plan,
    manualReview: review,
    academies: dataset.meta.academies,
  };
  const out = path.join(DATA, 'dry-run-plan.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log('\nWROTE', out);

  if (has('--seed')) {
    if (!has('--confirm')) { console.log('\nSEED ABORTED: --confirm required.'); process.exit(2); }
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) { console.log('\nSEED ABORTED: GOOGLE_APPLICATION_CREDENTIALS (service account) required. No production write performed.'); process.exit(2); }
    console.log('\nSEED MODE not enabled in this build (dry-run only). No production write performed.');
    process.exit(2);
  }
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
