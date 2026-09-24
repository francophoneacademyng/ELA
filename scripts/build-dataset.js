'use strict';
/* ============================================================
   ELA — scripts/build-dataset.js
   Construit le dataset unifié (6 académies) au schéma ELA à partir
   de : v7-french.json (SOURCE_DERIVED, référence) + data/seed/*.json
   (SOURCE_DERIVED, 5 autres académies). Aucune écriture Firestore.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const N = require('./lib/normalize.js');

const DATA = path.join(__dirname, 'data');
const SEED = path.join(__dirname, '..', 'data', 'seed');
const OUT = path.join(DATA, 'ela-dataset.json');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function main() {
  const reg = readJson(path.join(DATA, 'academies.json'));
  const dataset = { meta: { builtAt: new Date().toISOString(), academies: [], counts: {} }, courses: [], lessons: [], quizzes: [], academies: reg.academies };

  for (const a of reg.academies) {
    if (a.code === 'FR') {
      const v7 = readJson(path.join(DATA, 'v7-french.json'));
      dataset.courses.push(...v7.courses);
      dataset.lessons.push(...v7.lessons.map((l) => Object.assign({}, l, { status: l.status === 'published' ? 'approved' : l.status })));
      dataset.quizzes.push(...v7.quizzes);
      dataset.meta.academies.push({ code: a.code, key: a.key, courses: v7.courses.length, lessons: v7.lessons.length, quizzes: v7.quizzes.length, source: 'V7 SOURCE_DERIVED' });
    } else {
      const seed = readJson(path.join(SEED, a.seedFile));
      const norm = N.normalizeElaSeed(seed, a);
      dataset.courses.push(...norm.courses);
      dataset.lessons.push(...norm.lessons);
      dataset.quizzes.push(...norm.quizzes);
      dataset.meta.academies.push({ code: a.code, key: a.key, courses: norm.courses.length, lessons: norm.lessons.length, quizzes: norm.quizzes.length, source: 'ELA seed SOURCE_DERIVED' });
    }
  }

  dataset.meta.counts = {
    courses: dataset.courses.length,
    lessons: dataset.lessons.length,
    quizzes: dataset.quizzes.length,
    questions: dataset.quizzes.reduce((a, q) => a + q.questions.length, 0),
  };
  fs.writeFileSync(OUT, JSON.stringify(dataset, null, 2));
  console.log('WROTE', OUT);
  console.log('counts', JSON.stringify(dataset.meta.counts));
  dataset.meta.academies.forEach((a) => console.log('  ' + a.code, a.courses + 'c', a.lessons + 'l', a.quizzes + 'q', '|', a.source));
}
main();
