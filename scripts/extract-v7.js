'use strict';
/* ============================================================
   ELA — scripts/extract-v7.js
   Extrait le contenu pédagogique de Francophone Academy V7
   (lecture seule, parsing d'arrays, AUCUNE exécution du code V7
   qui écrit en base) et produit scripts/data/v7-french.json
   normalisé au schéma ELA.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const N = require('./lib/normalize.js');

const V7 = process.env.V7_PATH ||
  'C:\\Users\\11e\\Desktop\\VERSION 8\\Kimi_Agent_Discussions avec pièces jointes\\francophone-academy-v7';
const OUT = path.join(__dirname, 'data', 'v7-french.json');

/* --- scanner d'array literal (gère ' " ` et commentaires) --- */
function extractArray(src, decl) {
  const re = new RegExp('const\\s+' + decl + '\\s*=');
  const m = re.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  while (i < src.length && src[i] !== '[') i++;
  const start = i;
  let depth = 0, inStr = null, esc = false, inLine = false, inBlock = false;
  for (; i < src.length; i++) {
    const ch = src[i], nx = src[i + 1];
    if (inLine) { if (ch === '\n') inLine = false; continue; }
    if (inBlock) { if (ch === '*' && nx === '/') { inBlock = false; i++; } continue; }
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '/' && nx === '/') { inLine = true; i++; continue; }
    if (ch === '/' && nx === '*') { inBlock = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}

/* extrait un objet { ... } équilibré à partir d'un marqueur */
function extractObjectAfter(src, marker) {
  const i0 = src.indexOf(marker);
  if (i0 < 0) return null;
  let i = i0 + marker.length;
  while (i < src.length && src[i] !== '{') i++;
  const start = i;
  let depth = 0, inStr = null, esc = false, inLine = false, inBlock = false;
  for (; i < src.length; i++) {
    const ch = src[i], nx = src[i + 1];
    if (inLine) { if (ch === '\n') inLine = false; continue; }
    if (inBlock) { if (ch === '*' && nx === '/') { inBlock = false; i++; } continue; }
    if (inStr) { if (esc) { esc = false; continue; } if (ch === '\\') { esc = true; continue; } if (ch === inStr) inStr = null; continue; }
    if (ch === '/' && nx === '/') { inLine = true; i++; continue; }
    if (ch === '/' && nx === '*') { inBlock = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}

function evalArray(literal, bindings) {
  if (!literal) return [];
  const keys = Object.keys(bindings || {});
  const fn = new Function(...keys, 'return ' + literal);
  return fn(...keys.map((k) => bindings[k]));
}

function main() {
  const seedSrc = fs.readFileSync(path.join(V7, 'scripts', 'seed-data.js'), 'utf8');
  const lessonsSrc = fs.readFileSync(path.join(V7, 'scripts', 'update-all-lessons.js'), 'utf8');
  const quizzesSrc = fs.readFileSync(path.join(V7, 'scripts', 'update-quizzes.js'), 'utf8');

  const courses = evalArray(extractArray(seedSrc, 'courses'));
  const seedLessons = evalArray(extractArray(seedSrc, 'lessons'));
  const seedQuizzes = evalArray(extractArray(seedSrc, 'quizzes'));
  const liveClasses = evalArray(extractArray(seedSrc, 'liveClasses'), {
    inDays: function (d, h) { return { __daysFromNow: d, __hour: h }; },
  });
  const pricingDocs = evalArray(extractArray(seedSrc, 'pricingDocs'), { now: function () { return null; } });
  const rich = evalArray(extractArray(lessonsSrc, 'RICH'));
  const qFn = function (n, question, options, correctAnswer, explanation) {
    return { id: 'q' + n, type: 'multiple_choice', question, options, correctAnswer, explanation, points: 5 };
  };
  const quizzes = evalArray(extractArray(quizzesSrc, 'QUIZZES'), { q: qFn });

  // Plan hebdomadaire A1 (12 semaines) — structure réelle V7 (codée en dur)
  const teacherSrc = fs.readFileSync(path.join(V7, 'public', 'js', 'teacher', 'pages', 'teacher-programs.page.js'), 'utf8');
  const weeklyObj = evalArray(extractObjectAfter(teacherSrc, 'const data ='), {});
  const weeklyPlan = Object.keys(weeklyObj).map((k) => Object.assign({ week: Number(k) }, weeklyObj[k])).sort((a, b) => a.week - b.week);

  const academyKey = 'french', academyCode = 'FR';
  const normCourses = courses.map((c) => N.courseFromV7(c, academyKey, academyCode));
  const courseById = {};
  normCourses.forEach((c) => { courseById[c.id] = c; });

  // lessons: RICH (23 rich bodies) is authoritative for content; seedLessons supplies isFree/order
  const seedByCourseOrder = {};
  seedLessons.forEach((l) => { seedByCourseOrder[l.courseId + '#' + l.order] = l; });
  const sourceLessons = rich.length ? rich : seedLessons;
  const normLessons = sourceLessons.map((l) => {
    const meta = seedByCourseOrder[l.courseId + '#' + l.order] || {};
    const merged = Object.assign({}, meta, l, { isFree: (l.isFree != null ? l.isFree : meta.isFree) });
    return N.lessonFromV7(merged, courseById[l.courseId], academyKey, academyCode);
  });

  // quizzes: update-quizzes.js (6 x 20) is authoritative; seed quizzes superseded
  const courseIdForLevel = {
    A1: 'french-foundations-a1', A2: 'everyday-conversations-a2',
    B1: 'intermediate-grammar-b1', B2: 'advanced-writing-b2', C1: null, C2: null,
  };
  const normQuizzes = quizzes.map((q) => N.quizFromV7(q, academyKey, academyCode, courseIdForLevel));

  const out = {
    meta: {
      sourceProject: 'francophone-academy-v7',
      sourcePath: V7,
      extractedAt: new Date().toISOString(),
      academy: { key: academyKey, code: academyCode, label: 'Francophone Academy', language: 'French' },
      counts: { courses: normCourses.length, lessons: normLessons.length, quizzes: normQuizzes.length, liveClasses: liveClasses.length },
      superseded: { seedQuizzes: seedQuizzes.length, note: 'seed-data quizzes (A1/A2, 10 q) superseded by update-quizzes.js (20 q)' },
    },
    courses: normCourses,
    lessons: normLessons,
    quizzes: normQuizzes,
    weeklyPlan: weeklyPlan,
    liveClasses: liveClasses.map((l) => Object.assign({}, l, { sourceType: 'TEST_DATA', requiresReview: true, note: 'placeholder instructors from V7 seed — DATA_REQUIRED' })),
    pricing: pricingDocs[0] || null,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log('WROTE', OUT);
  console.log('courses=' + normCourses.length, 'lessons=' + normLessons.length, 'quizzes=' + normQuizzes.length, 'liveClasses=' + liveClasses.length);
  console.log('questions total=' + normQuizzes.reduce((a, q) => a + q.questions.length, 0));
}
main();
