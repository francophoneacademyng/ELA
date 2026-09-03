/**
 * ============================================================
 * ELA — Injection A1 (5 académies) dans Firestore
 * ------------------------------------------------------------
 * Lit data/seed/{academy}-a1.json et injecte de façon idempotente :
 *   academies/{CODE}/curriculum/levels/A1/units/UNIT-01/modules/MOD-01/lessons/{lessonId}
 *   academies/{CODE}/quizzes/{quizId}
 *   academies/{CODE}/courses/COURSE-A1   (doc racine qui référence les leçons)
 *
 * Usage : node scripts/inject-a1-content.js
 * Prérequis (l'un des deux) :
 *   1) export GOOGLE_APPLICATION_CREDENTIALS=/chemin/serviceAccount.json
 *   2) gcloud auth application-default login   (ADC du même compte Google)
 * ============================================================ */
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

// firebase-admin est installé dans functions/node_modules → on résout là-bas.
const requireFn = createRequire(path.join(__dirname, '..', 'functions', 'package.json'));
const admin = requireFn('firebase-admin');

// Pré-contrôle rapide : sans credential ADC le script échouerait confusément.
const gcloudAdc = path.join(process.env.USERPROFILE || process.env.HOME || '', '.config', 'gcloud', 'application_default_credentials.json');
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(gcloudAdc)) {
  console.error('ERREUR : aucune credential Admin SDK trouvée sur cette machine.');
  console.error('  → export GOOGLE_APPLICATION_CREDENTIALS=<serviceAccount.json>');
  console.error('  → OU exécute : gcloud auth application-default login');
  process.exit(1);
}

let db;
try {
  admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'ela-academy-7f868' });
  db = admin.firestore();
} catch (e) {
  console.error('ERREUR : échec d\'initialisation Admin SDK :', e.message);
  process.exit(1);
}

const SEED_DIR = path.join(__dirname, '..', 'data', 'seed');
const FILES = [
  'germanophone-a1.json',
  'sinophone-a1.json',
  'anglophone-a1.json',
  'arabophone-a1.json',
  'russophone-a1.json'
];

// Id d'académie Firestore = academyCode (DE / ZH / EN / AR / RU).
function academyKey(file) {
  const j = JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf8'));
  if (j.academyCode) return j.academyCode;
  return file.replace('-a1.json', '').toUpperCase();
}

function lessonIdOf(l) {
  if (l.id) return l.id;
  return 'A1_L' + String((l.order || 0)).padStart(2, '0');
}

function toDoc(l, code) {
  // Schéma uniforme : title (FR), titleTargetLang, objective, content[3],
  // vocabulary[15+], exercises[3], audioScript, cecrLevel.
  return {
    order: l.order || 0,
    title: l.title || '',
    titleNative: l.titleTargetLang || '',
    objective: l.objective || '',
    content: l.content || [],
    vocabulary: l.vocabulary || [],
    exercises: l.exercises || [],
    audioScript: l.audioScript || '',
    cecrLevel: l.cecrLevel || 'A1',
    level: l.cecrLevel || 'A1',
    isTrial: l.order >= 1 && l.order <= 6,
    trialAccess: l.order <= 2 ? 'instant' : 'signup',
    academyCode: code,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };
}

async function injectFile(file) {
  const raw = fs.readFileSync(path.join(SEED_DIR, file), 'utf8');
  const j = JSON.parse(raw);
  const key = academyKey(file);
  const code = j.academyCode || key.toUpperCase();

  const lessonRefs = [];
  let nLessons = 0, nQuizzes = 0;

  for (const l of (j.lessons || [])) {
    const lid = lessonIdOf(l);
    // Chemin valide Firestore : academies/{CODE}/curriculum/A1/units/UNIT-01/modules/MOD-01/lessons/{lessonId}
    const ref = db
      .collection('academies').doc(key)
      .collection('curriculum').doc('A1')
      .collection('units').doc('UNIT-01')
      .collection('modules').doc('MOD-01')
      .collection('lessons').doc(lid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set(toDoc(l, code));
      nLessons++;
    }
    lessonRefs.push(lid);
    console.log('  Injecting ' + code + ' lesson ' + (l.order || '?') + '/' + (j.lessons || []).length + ' ...');
  }

  for (const q of (j.quizzes || [])) {
    if (!q.id) continue;
    const ref = db.collection('academies').doc(key).collection('quizzes').doc(q.id);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        title: q.title || '',
        level: q.level || 'A1',
        academyCode: code,
        questions: q.questions || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      nQuizzes++;
    }
  }

  // Doc racine COURSE-A1 (métadonnées + références des leçons).
  const courseRef = db.collection('academies').doc(key).collection('courses').doc('COURSE-A1');
  const cSnap = await courseRef.get();
  if (!cSnap.exists) {
    await courseRef.set({
      title: (j.course && j.course.title) || (j.academyName || '') + ' A1 — Foundations',
      titleNative: (j.course && j.course.titleNative) || '',
      description: (j.course && j.course.description) || '',
      level: 'A1',
      levelId: j.levelId || code + '_A1',
      academyCode: code,
      certification: j.certification || '',
      nativeName: j.nativeName || '',
      lessonIds: lessonRefs,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  console.log('  [OK] ' + file + ' → lessons créés: ' + nLessons + ' · quizzes créés: ' + nQuizzes);
  return { nLessons, nQuizzes };
}

(async () => {
  console.log('== ELA — Injection curriculum A1 ==');
  for (const f of FILES) {
    if (!fs.existsSync(path.join(SEED_DIR, f))) {
      console.log('  [skip] fichier absent: ' + f);
      continue;
    }
    await injectFile(f);
  }
  console.log('== Terminé ==');
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
