/**
 * ============================================================
 * ELA — Double injection A1 : structure LEGACY (frontend actuel)
 * ------------------------------------------------------------
 * Lit data/seed/{academy}-a1.json et injecte le MÊME contenu dans
 * l'ancienne structure lue par le frontend :
 *   courses/{CODE}-A1-FOUNDATIONS
 *   lessons/{CODE}-A1-L01..L10
 *   quizzes/{CODE}-A1-Q01..Q05
 * ------------------------------------------------------------
 * Champs de compatibilité ajoutés (frontend actuel) :
 *   - academy : clé d'académie ('german'/'mandarin'/'english'/...) → grouping /courses
 *   - status : 'approved'            → getCatalog/getCourse/règles Firestore
 *   - isTrial : true sur la 1re leçon → essai gratuit (règles)
 *   - courseId : lien lesson → course
 * ------------------------------------------------------------
 * Idempotent (skip si le doc existe). Usage : node scripts/inject-legacy-a1.js
 * Prérequis : GOOGLE_APPLICATION_CREDENTIALS ou gcloud auth application-default login
 * ============================================================ */
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const requireFn = createRequire(path.join(__dirname, '..', 'functions', 'package.json'));
const admin = requireFn('firebase-admin');

const gcloudAdc = path.join(process.env.USERPROFILE || process.env.HOME || '', '.config', 'gcloud', 'application_default_credentials.json');
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(gcloudAdc)) {
  console.error('ERREUR : aucune credential Admin SDK trouvée sur cette machine.');
  console.error('  → export GOOGLE_APPLICATION_CREDENTIALS=<serviceAccount.json>');
  console.error('  → OU exécute : gcloud auth application-default login');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'ela-academy-7f868' });
const db = admin.firestore();

const SEED_DIR = path.join(__dirname, '..', 'data', 'seed');
const FILES = ['germanophone-a1.json', 'sinophone-a1.json', 'anglophone-a1.json', 'arabophone-a1.json', 'russophone-a1.json'];

// CODE → clé d'académie (pour le frontend /courses et les règles d'accès)
const ACADEMY_KEY = { DE: 'german', ZH: 'mandarin', EN: 'english', AR: 'arabic', RU: 'russian' };
// CODE → adjectif utilisé dans le titre du course
const LANG_NAME = { DE: 'Germanophone', ZH: 'Sinophone', EN: 'Anglophone Pro', AR: 'Arabophone', RU: 'Russophone' };

async function injectLegacy(file) {
  const j = JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf8'));
  const code = j.academyCode;
  const akey = ACADEMY_KEY[code] || code.toLowerCase();
  const courseId = code + '-A1-FOUNDATIONS';
  const lang = LANG_NAME[code] || code;
  const ts = admin.firestore.FieldValue.serverTimestamp();

  let nLessons = 0, nQuizzes = 0;

  // 1) COURSE
  const cRef = db.collection('courses').doc(courseId);
  if (!(await cRef.get()).exists) {
    await cRef.set({
      id: courseId,
      academyCode: code,
      academy: akey,
      title: lang + ' A1 — Foundations',
      description: 'Your first steps in ' + code + ' — greetings, numbers, daily life, food, housing, time, shopping and travel at CEFR level A1.',
      level: 'A1',
      lessons: (j.lessons || []).map(function (l) { return l.id; }),
      order: 1,
      status: 'approved',
      createdAt: ts,
      updatedAt: ts
    });
    console.log('  course created: ' + courseId);
  } else {
    console.log('  course skip (existe): ' + courseId);
  }

  // 2) LESSONS
  for (const l of (j.lessons || [])) {
    const ref = db.collection('lessons').doc(l.id);
    if (!(await ref.get()).exists) {
      await ref.set({
        id: l.id,
        courseId: courseId,
        academyCode: code,
        academy: akey,
        title: l.title || '',
        titleNative: l.titleTargetLang || '',
        objective: l.objective || '',
        content: l.content || [],
        vocabulary: l.vocabulary || [],
        exercises: l.exercises || [],
        audioScript: l.audioScript || '',
        cecrLevel: 'A1',
        level: 'A1',
        order: l.order || 0,
        isTrial: l.order === 1,
        status: 'approved',
        createdAt: ts
      });
      nLessons++;
    }
    console.log('  Injecting ' + code + ' lesson ' + (l.order || '?') + '/' + (j.lessons || []).length + ' ...');
  }

  // 3) QUIZZES
  for (const q of (j.quizzes || [])) {
    const ref = db.collection('quizzes').doc(q.id);
    if (!(await ref.get()).exists) {
      await ref.set({
        id: q.id,
        courseId: courseId,
        academyCode: code,
        academy: akey,
        title: q.title || '',
        level: 'A1',
        questions: q.questions || [],
        status: 'approved',
        createdAt: ts
      });
      nQuizzes++;
    }
  }

  console.log('  Injecting ' + code + ' legacy: course → ' + nLessons + ' lessons → ' + nQuizzes + ' quizzes → done');
  return { courseId, nLessons, nQuizzes };
}

(async () => {
  console.log('== ELA — Injection A1 structure LEGACY ==');
  for (const f of FILES) {
    if (!fs.existsSync(path.join(SEED_DIR, f))) { console.log('  [skip] absent: ' + f); continue; }
    await injectLegacy(f);
  }
  console.log('== Terminé ==');
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
