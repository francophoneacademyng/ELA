/* ============================================================
   inject-a1.js — Injection locale du contenu A1 (5 académies).
   Lit data/seed/*.json et écrit dans Firestore via le SDK Admin.
   Idempotent : relancer n'ajoute pas de doublon, ne supprime rien.

   Prérequis (au choix) :
     1) GOOGLE_APPLICATION_CREDENTIALS=/chemin/service-account.json
     2) ou firebase emulators:exec (émulateur Firestore local)
   Usage :
     node scripts/inject-a1.js                      # Firebase prod
     FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/inject-a1.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { injectSeed } = require('./inject-core.js');

// firebase-admin est une dépendance du dossier functions/.
const admin = module.parent
  ? null
  : (function () {
      try { return require('../functions/node_modules/firebase-admin'); } catch (e) { return null; }
    })();

async function main() {
  if (!admin) {
    console.error('firebase-admin introuvable. Exécutez d’abord : (cd functions && npm install)');
    process.exit(1);
  }

  const projectId = process.env.GCLOUD_PROJECT || 'ela-academy-7f868';
  admin.initializeApp({ projectId });
  const db = admin.firestore();
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    db.settings({ host: '127.0.0.1:8080', ssl: false });
  }

  const files = [
    'germanophone-a1.json',
    'sinophone-a1.json',
    'anglophone-a1.json',
    'arabophone-a1.json',
    'russophone-a1.json'
  ];
  const seedDir = path.join(__dirname, '..', 'data', 'seed');

  const summary = {};
  for (const f of files) {
    const fp = path.join(seedDir, f);
    if (!fs.existsSync(fp)) { console.log(`[skip] ${f} : absent de data/seed`); continue; }
    const seed = JSON.parse(fs.readFileSync(fp, 'utf8'));
    console.log(`[inject] ${seed.academyCode} (${seed.course.title})…`);
    const r = await injectSeed(db, seed);
    summary[seed.academyCode] = r;
    console.log(`   course=${r.course} lessons=${r.lessons} quizzes=${r.quizzes} courseId=${r.courseId}`);
  }

  console.log('\n=== RÉSUMÉ INJECTION A1 ===');
  Object.keys(summary).forEach((k) => {
    const s = summary[k];
    console.log(`${k}: ${s.course} cours / ${s.lessons} leçons / ${s.quizzes} quiz`);
  });
  console.log('Terminé. (Aucune donnée n’a été supprimée.)');
}

main().catch((err) => {
  console.error('Erreur d’injection :', err && err.message ? err.message : err);
  process.exit(1);
});