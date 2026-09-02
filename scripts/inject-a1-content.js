/**
 * ============================================================
 * ELA — Injection A1 (5 académies) dans Firestore
 * ------------------------------------------------------------
 * Lit data/seed/{academy}-a1.json et injecte de façon idempotente :
 *   academies/{key}/curriculum/levels/A1/units/UNIT-01/modules/MOD-01/lessons/{lessonId}
 *   academies/{key}/quizzes/{quizId}
 *   academies/{key}/courses/COURSE-A1   (doc racine qui référence les leçons)
 *
 * Usage : node scripts/inject-a1-content.js
 * Prérequis : credentials Admin SDK (GOOGLE_APPLICATION_CREDENTIALS
 *   ou service account) — le .env du projet ne suffit pas pour l'Admin SDK.
 * ============================================================ */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_CONFIG) {
  console.error('ERREUR : aucun service account détecté. Exporte GOOGLE_APPLICATION_CREDENTIALS=<path.json> puis relance.');
  process.exit(1);
}
admin.initializeApp();
const db = admin.firestore();

const SEED_DIR = path.join(__dirname, '..', 'data', 'seed');
const FILES = [
  'germanophone-a1.json',
  'sinophone-a1.json',
  'anglophone-a1.json',
  'arabophone-a1.json',
  'russophone-a1.json'
];

// Récupère l'id d'académie Firestore (academyKey si présent, sinon slug du code).
function academyKey(file) {
  const j = JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf8'));
  if (j.academyKey) return j.academyKey;
  if (j.academyCode) return j.academyCode.toLowerCase();
  return file.replace('-a1.json', '');
}

function lessonIdOf(l) {
  if (l.id) return l.id;
  return 'A1_L' + String((l.order || 0)).padStart(2, '0');
}

function toDoc(l) {
  // Découpe proprement les champs disponibles (tolérant au schéma).
  return {
    order: l.order || 0,
    title: l.title || l.titleTargetLang || '',
    titleNative: l.titleTargetLang || l.titleNative || '',
    objective: l.objective || '',
    objectives: l.objectives || [],
    content: l.content || [],
    vocabulary: l.vocabulary || [],
    grammar: l.grammar || [],
    exercises: l.exercises || [],
    audioScript: l.audioScript || '',
    cecrLevel: l.cecrLevel || l.level || 'A1',
    level: l.cecrLevel || l.level || 'A1',
    isTrial: l.isTrial === true,
    academyCode: l.academyCode || '',
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
    const ref = db
      .collection('academies').doc(key)
      .collection('curriculum').doc('levels')
      .collection('A1').doc('units')
      .collection('UNIT-01').doc('modules')
      .collection('MOD-01').doc('lessons').doc(lid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set(toDoc(l));
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
