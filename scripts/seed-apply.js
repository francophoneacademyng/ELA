'use strict';
/* ============================================================
   ELA — scripts/seed-apply.js
   Seed production CONTRÔLÉ (Admin SDK, credential local).
   - allowlist collections + champs
   - validation relations/statuts
   - upsert idempotent (merge), IDs stables
   - AUCUNE suppression
   - audit log local
   Usage: node scripts/seed-apply.js --confirm
   ============================================================ */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const admin = require(path.join(ROOT, 'functions', 'node_modules', 'firebase-admin'));
const { validateDataset } = require('./lib/validate.js');
const { buildPlan, manualReview } = require('./lib/plan.js');
const rest = require('./lib/firestore-rest.js');

const args = process.argv.slice(2);
if (!args.includes('--confirm')) { console.log('ABORT: --confirm required.'); process.exit(2); }

const SA_PATH = process.env.ELA_SA || path.join(ROOT, 'service-account.json.json');
if (!fs.existsSync(SA_PATH)) { console.log('ABORT: service account not found at ' + SA_PATH); process.exit(2); }

const ALLOWED = {
  courses: ['academy', 'academyCode', 'language', 'title', 'slug', 'description', 'level', 'category', 'planRequired', 'instructorName', 'durationMinutes', 'lessonCount', 'order', 'learningOutcomes', 'status', 'contentState', 'sourceAcademy', 'sourceVersion', 'sourceType'],
  lessons: ['academy', 'academyCode', 'academyName', 'courseId', 'level', 'order', 'lessonNumber', 'title', 'description', 'content', 'vocabulary', 'duration', 'videoUrl', 'videoDuration', 'isTrial', 'trialAccess', 'status', 'contentState', 'sourceAcademy', 'sourceVersion', 'sourceType'],
  quizzes: ['academy', 'academyCode', 'level', 'title', 'category', 'timeLimit', 'passingScore', 'isTrial', 'courseId', 'lessonId', 'questions', 'status', 'contentState', 'sourceAcademy', 'sourceVersion', 'sourceType'],
  programmes: ['academyCode', 'academyLabel', 'language', 'title', 'shortTitle', 'description', 'targetLearners', 'entryRequirements', 'level', 'framework', 'frameworkAlignment', 'levelSystem', 'durationWeeks', 'guidedLearningHours', 'independentLearningHours', 'totalEstimatedWorkload', 'workloadNote', 'learningOutcomes', 'competencyDomains', 'courseStructure', 'assessmentStructure', 'examinationStructure', 'progressionRequirements', 'completionRequirements', 'certificateType', 'version', 'status', 'contentState', 'reviewDate', 'academicOwner', 'qualityReviewStatus', 'currentVersion', 'sourceAcademy', 'sourceVersion', 'sourceType'],
};

function pick(collection, doc) {
  const out = {};
  for (const k of ALLOWED[collection]) if (doc[k] !== undefined) out[k] = doc[k];
  return out;
}

async function main() {
  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  const db = admin.firestore();
  const dataset = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'ela-dataset.json'), 'utf8'));
  const reg = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'academies.json'), 'utf8'));

  // validation bloquante
  const v = validateDataset(dataset, reg.academies);
  if (!v.pass) { console.log('ABORT: validation failed'); v.issues.filter((i) => i.level === 'FAIL').forEach((i) => console.log('  ' + i.detail)); process.exit(2); }

  // 36 programmes (GENERATED_DRAFT) — programme metadata only (strict 36-item scope)
  const fw = require(path.join(ROOT, 'functions', 'academic-framework.js'));
  const framework = fw.buildFullFramework();
  const programmes = framework.programmes.map((p) => Object.assign({}, p, {
    sourceAcademy: 'ELA', sourceVersion: 'ELA-generated', sourceType: 'GENERATED_DRAFT', contentState: 'DRAFT',
  }));

  const stamp = new Date().toISOString();
  const audit = { timestamp: stamp, project: rest.PROJECT, actor: 'seed-apply', collections: {}, items: [] };
  const now = admin.firestore.FieldValue.serverTimestamp();

  async function upsert(collection, docs) {
    let created = 0, updated = 0;
    for (const d of docs) {
      const ref = db.collection(collection).doc(d.id);
      const snap = await ref.get();
      const data = Object.assign(pick(collection, d), { seedUpdatedAt: now });
      if (!snap.exists) data.seedCreatedAt = now;
      await ref.set(data, { merge: true });
      if (snap.exists) updated++; else created++;
      audit.items.push({ collection, id: d.id, action: snap.exists ? 'update' : 'create', sourceType: d.sourceType || '' });
    }
    audit.collections[collection] = { desired: docs.length, created, updated };
    console.log(`  ${collection}: created=${created} updated=${updated} (desired=${docs.length})`);
  }

  console.log('=== SEED APPLY ===');
  await upsert('courses', dataset.courses);
  await upsert('lessons', dataset.lessons);
  await upsert('quizzes', dataset.quizzes);
  await upsert('programmes', programmes);

  const auditPath = path.join(__dirname, 'data', 'seed-audit-' + stamp.replace(/[:.]/g, '-') + '.json');
  fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2));
  console.log('\nAUDIT:', auditPath);
  console.log('TOTALS:', JSON.stringify(Object.fromEntries(Object.entries(audit.collections).map(([k, x]) => [k, x.created + '/' + x.updated]))));
}
main().catch((e) => { console.error('SEED FAILED:', e.message); process.exit(1); });
