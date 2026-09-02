/* ============================================================
   build-seed-json.js — Génère data/seed/*.json depuis
   data/seed/seed-library.js (source canonique du contenu A1).
   Garantit un JSON valide et vérifie la structure attendue.
   Usage : node scripts/build-seed-json.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const library = require('../data/seed/seed-library.js');
const outDir = path.join(__dirname, '..', 'data', 'seed');

const FILES = {
  DE: 'germanophone-a1.json',
  ZH: 'sinophone-a1.json',
  EN: 'anglophone-a1.json',
  AR: 'arabophone-a1.json',
  RU: 'russophone-a1.json'
};

function validateAcademy(ac) {
  if (!ac.lessons || ac.lessons.length < 10) {
    throw new Error(`${ac.academyCode} : attendu >= 10 leçons, reçu ${ac.lessons && ac.lessons.length}`);
  }
  if (!ac.quizzes || ac.quizzes.length < 5) {
    throw new Error(`${ac.academyCode} : attendu >= 5 quiz, reçu ${ac.quizzes && ac.quizzes.length}`);
  }
  ac.lessons.forEach((l) => {
    if (!l.title || !l.objective || !l.content || !l.cecrLevel || !l.academyCode) {
      throw new Error(`${ac.academyCode}/${l.id} : champs obligatoires manquants`);
    }
    if (!l.vocabulary || l.vocabulary.length < 15) {
      throw new Error(`${ac.academyCode}/${l.id} : vocabulaire attendu >= 15 mots`);
    }
    if (!l.exercises || l.exercises.length < 3) {
      throw new Error(`${ac.academyCode}/${l.id} : attendu >= 3 exercices`);
    }
    if (!l.audioScript || !l.audioScript.lines || l.audioScript.lines.length < 2) {
      throw new Error(`${ac.academyCode}/${l.id} : audioScript manquant`);
    }
  });
  ac.quizzes.forEach((q) => {
    if (!q.questions || q.questions.length !== 20) {
      throw new Error(`${ac.academyCode}/${q.id} : attendu 20 questions, reçu ${q.questions && q.questions.length}`);
    }
  });
}

let anyWritten = false;
Object.keys(FILES).forEach((code) => {
  if (!library[code]) {
    console.log(`[skip] ${code} : pas encore dans seed-library.js`);
    return;
  }
  validateAcademy(library[code]);
  const file = path.join(outDir, FILES[code]);
  fs.writeFileSync(file, JSON.stringify(library[code], null, 2), 'utf8');
  // Re-parser pour garantir la validité.
  JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`[ok] ${code} -> ${FILES[code]} (${library[code].lessons.length} leçons, ${library[code].quizzes.length} quiz)`);
  anyWritten = true;
});

if (!anyWritten) {
  console.log('Aucun fichier généré (académies manquantes dans seed-library.js).');
  process.exit(1);
}