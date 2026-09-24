'use strict';
/* ============================================================
   ELA — scripts/audit-full.js  (LECTURE SEULE — aucune écriture)
   ------------------------------------------------------------
   Audit complet de la production : intégrité référentielle,
   classification des leçons legacy, qualité du contenu,
   cohérence niveau/langue/académie. Produit un rapport JSON.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const rest = require('./lib/firestore-rest.js');

const VALID_AC = ['FR', 'DE', 'ZH', 'EN', 'AR', 'RU'];

async function main() {
  const token = await rest.accessToken();
  const cols = {};
  for (const c of ['courses', 'lessons', 'quizzes', 'programmes', 'curriculum_nodes', 'learning_outcomes', 'competencies', 'assessment_blueprints']) {
    cols[c] = await rest.listAll(c, token);
  }
  const report = { timestamp: new Date().toISOString(), checks: {}, legacy: {} };

  const courses = cols.courses, lessons = cols.lessons, quizzes = cols.quizzes;
  const nodes = cols.curriculum_nodes, outcomes = cols.learning_outcomes;
  const courseIds = new Set(courses.map((c) => c.id));
  const quizIds = new Set(quizzes.map((q) => q.id));
  const outcomeIds = new Set(outcomes.map((o) => o.id));

  /* --- Intégrité lessons --- */
  report.checks.duplicateLessons = lessons.length - new Set(lessons.map((l) => l.id)).size;
  report.checks.duplicateCourses = courses.length - new Set(courses.map((c) => c.id)).size;
  report.checks.duplicateNodes = nodes.length - new Set(nodes.map((n) => n.id)).size;
  report.checks.orphanLessons = lessons.filter((l) => l.courseId && !courseIds.has(l.courseId)).map((l) => l.id);
  report.checks.brokenQuizRefs = lessons.filter((l) => l.quizId && !quizIds.has(l.quizId)).map((l) => l.id);
  report.checks.badAcademyLessons = lessons.filter((l) => l.academyCode && VALID_AC.indexOf(l.academyCode) < 0).map((l) => l.id);
  report.checks.wrongStatusLessons = lessons.filter((l) => l.status !== 'approved').map((l) => l.id + ':' + l.status);

  /* --- Intégrité curriculum_nodes --- */
  const nodeIds = new Set(nodes.map((n) => n.id));
  report.checks.nodeMissingId = nodes.filter((n) => !n.id).length;
  report.checks.nodeBrokenParent = nodes.filter((n) => n.parentId && n.parentId !== 'root' && !nodeIds.has(n.parentId)).map((n) => n.id);
  report.checks.nodeBrokenProgramme = nodes.filter((n) => n.programmeId && !cols.programmes.some((p) => p.id === n.programmeId)).map((n) => n.id + ':' + n.programmeId);
  report.checks.nodeBrokenOutcome = nodes.filter((n) => (n.outcomeIds || []).some((oid) => !outcomeIds.has(oid))).length;

  /* --- Cohérence niveau/langue --- */
  const langMap = { FR: 'French', DE: 'German', ZH: 'Mandarin', EN: 'English', AR: 'Arabic', RU: 'Russian' };
  report.checks.generatedLessonEmptyBodies = lessons.filter((l) => l.sourceType === 'GENERATED_DRAFT' && (!l.content || (typeof l.content === 'string' && l.content.length < 40))).map((l) => l.id);
  report.checks.generatedLessonNoVocab = lessons.filter((l) => l.sourceType === 'GENERATED_DRAFT' && (!Array.isArray(l.vocabulary) || !l.vocabulary.length)).map((l) => l.id);
  report.checks.generatedLessonNoExercises = lessons.filter((l) => l.sourceType === 'GENERATED_DRAFT' && (!Array.isArray(l.exercises) || !l.exercises.length)).map((l) => l.id);

  /* --- Classification legacy (sans courseId) --- */
  const legacy = lessons.filter((l) => !l.courseId);
  const legacyClass = { total: legacy.length, withContent: 0, empty: 0, trial: 0, byAcademy: {} };
  for (const l of legacy) {
    const hasContent = Array.isArray(l.content) ? l.content.length > 0 : (typeof l.content === 'string' && l.content.length > 40);
    if (hasContent) legacyClass.withContent++; else legacyClass.empty++;
    if (l.isTrial) legacyClass.trial++;
    legacyClass.byAcademy[l.academyCode] = (legacyClass.byAcademy[l.academyCode] || 0) + 1;
  }
  report.legacy = legacyClass;

  /* --- Couverture cours/académie/niveau --- */
  const coverage = {};
  for (const c of courses) { const k = c.academyCode + ' ' + c.level; coverage[k] = (coverage[k] || 0) + 1; }
  report.coverage = coverage;

  report.summary = {
    courses: courses.length, lessons: lessons.length, quizzes: quizzes.length,
    programmes: cols.programmes.length, nodes: nodes.length, outcomes: outcomes.length,
    competencies: cols.competencies.length, assessmentBlueprints: cols.assessment_blueprints.length,
    legacyLessons: legacy.length
  };

  const outPath = path.join(__dirname, 'data', 'full-audit-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('REPORT:', outPath);
  console.log('SUMMARY:', JSON.stringify(report.summary));
  console.log('CHECKS (non-zero = issue):');
  for (const [k, v] of Object.entries(report.checks)) {
    const n = Array.isArray(v) ? v.length : v;
    if (n !== 0) console.log('  ' + k + ' = ' + n);
  }
  console.log('LEGACY:', JSON.stringify(report.legacy));
  console.log('DONE.');
  process.exit(0);
}
main().catch((e) => { console.error('AUDIT FAILED:', e.message); process.exit(1); });
