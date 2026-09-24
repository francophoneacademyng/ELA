'use strict';
/* ============================================================
   ELA — scripts/seed-curriculum.js
   Seed production CONTRÔLÉ du curriculum (Admin SDK, credential local).
   Collections : curriculum_nodes, learning_outcomes, competencies,
                 assessment_blueprints.
   - allowlist collections + champs, validation, merge idempotent,
     IDs stables, audit log, AUCUNE suppression.
   - Ne touche PAS aux programmes (restent DRAFT).
   Usage: node scripts/seed-curriculum.js --confirm
   ============================================================ */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const admin = require(path.join(ROOT, 'functions', 'node_modules', 'firebase-admin'));
const rest = require('./lib/firestore-rest.js');

const args = process.argv.slice(2);
if (!args.includes('--confirm')) { console.log('ABORT: --confirm required.'); process.exit(2); }
const SA_PATH = process.env.ELA_SA || path.join(ROOT, 'service-account.json.json');
if (!fs.existsSync(SA_PATH)) { console.log('ABORT: service account not found.'); process.exit(2); }

const ALLOWED = {
  curriculum_nodes: ['id', 'programmeId', 'academyCode', 'level', 'type', 'parentId', 'order', 'title', 'description', 'duration', 'durationMinutes', 'vocabularyCount', 'theme', 'vocabularyFocus', 'grammarFocus', 'pronunciationFocus', 'culturalContext', 'activities', 'objective', 'competencyIds', 'outcomeIds', 'state', 'sourceType', 'sourceAcademy', 'sourceVersion', 'courseRef', 'lessonRef', 'lessonType', 'lessonTypeName', 'prerequisites', 'estimatedDuration', 'explanation', 'languageContent', 'examples', 'dialogue', 'guidedPractice', 'independentPractice', 'interaction', 'assessment', 'masteryCriteria', 'exercises'],
  learning_outcomes: ['id', 'academyCode', 'level', 'skill', 'statement', 'measurable', 'status', 'sourceType', 'sourceAcademy', 'sourceVersion'],
  competencies: ['id', 'domain', 'label', 'sourceType', 'sourceAcademy'],
  assessment_blueprints: ['id', 'academyCode', 'level', 'purpose', 'types', 'passMark', 'rationale', 'status', 'sourceType', 'sourceAcademy'],
};
function pick(c, d) { const o = {}; for (const k of ALLOWED[c]) if (d[k] !== undefined) o[k] = d[k]; return o; }

async function main() {
  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  const db = admin.firestore();
  const cur = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'ela-curriculum.json'), 'utf8'));

  const sets = {
    curriculum_nodes: cur.nodes,
    learning_outcomes: cur.outcomes.concat(cur.frameworkOutcomes),
    competencies: cur.competencies,
    assessment_blueprints: cur.assessmentBlueprints,
  };

  const stamp = new Date().toISOString();
  const audit = { timestamp: stamp, project: rest.PROJECT, actor: 'seed-curriculum', collections: {}, items: [] };
  const now = admin.firestore.FieldValue.serverTimestamp();

  const CHUNK = 450;
  for (const [collection, docs] of Object.entries(sets)) {
    let created = 0, updated = 0;
    for (let i = 0; i < docs.length; i += CHUNK) {
      const chunk = docs.slice(i, i + CHUNK);
      const refs = chunk.map((d) => db.collection(collection).doc(d.id));
      const snaps = await db.getAll(...refs);
      const batch = db.batch();
      chunk.forEach((d, j) => {
        const data = Object.assign(pick(collection, d), { seedUpdatedAt: now });
        if (!snaps[j].exists) data.seedCreatedAt = now;
        batch.set(refs[j], data, { merge: true });
        if (snaps[j].exists) updated++; else created++;
        audit.items.push({ collection, id: d.id, action: snaps[j].exists ? 'update' : 'create', sourceType: d.sourceType || '' });
      });
      await batch.commit();
    }
    audit.collections[collection] = { desired: docs.length, created, updated };
    console.log(`  ${collection}: created=${created} updated=${updated} (desired=${docs.length})`);
  }

  const auditPath = path.join(__dirname, 'data', 'curriculum-seed-audit-' + stamp.replace(/[:.]/g, '-') + '.json');
  fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2));
  console.log('\nAUDIT:', auditPath);
  console.log('TOTALS:', JSON.stringify(Object.fromEntries(Object.entries(audit.collections).map(([k, x]) => [k, x.created + ' created / ' + x.updated + ' updated']))));
}
main().then(() => { console.log('DONE.'); process.exit(0); }).catch((e) => { console.error('SEED FAILED:', e.message); process.exit(1); });
