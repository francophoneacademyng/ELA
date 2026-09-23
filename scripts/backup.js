'use strict';
/* ============================================================
   ELA — scripts/backup.js
   Sauvegarde LECTURE SEULE des collections cibles avant tout seed.
   Écrit un JSON par collection + un manifeste (comptes + horodatage).
   Aucune écriture Firestore.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const rest = require('./lib/firestore-rest.js');

const COLLECTIONS = [
  'courses', 'lessons', 'quizzes',
  'programmes', 'programme_versions', 'curriculum_nodes',
  'competencies', 'learning_outcomes', 'assessment_blueprints', 'examination_blueprints', 'rubrics',
];

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(__dirname, 'data', 'backup', stamp);
  fs.mkdirSync(dir, { recursive: true });
  const token = await rest.accessToken();
  const manifest = { timestamp: new Date().toISOString(), project: rest.PROJECT, collections: {} };
  for (const c of COLLECTIONS) {
    const docs = await rest.listAll(c, token);
    fs.writeFileSync(path.join(dir, c + '.json'), JSON.stringify(docs, null, 2));
    manifest.collections[c] = docs.length;
    console.log('backed up ' + c + ': ' + docs.length + ' docs');
  }
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\nBACKUP DIR:', dir);
  console.log('MANIFEST:', JSON.stringify(manifest.collections));
}
main().catch((e) => { console.error('BACKUP FAILED:', e.message); process.exit(1); });
