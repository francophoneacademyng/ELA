'use strict';
/* ============================================================
   ELA — scripts/lib/validate.js
   Validation du dataset normalisé : schéma, relations, doublons,
   orphelins, statuts, langues/académies/niveaux, corrigés.
   Retourne { pass, fail, warnings, issues[] }.
   ============================================================ */

const STATUS_OK = ['approved', 'published', 'draft', 'pending_review', 'hidden'];
const CONTENT_STATE_OK = ['SOURCE_DERIVED', 'SOURCE_VERIFIED', 'GENERATED_DRAFT', 'TEST_DATA', 'DRAFT', 'APPROVED', 'PUBLISHED'];
const SOURCE_TYPE_OK = ['SOURCE_DERIVED', 'SOURCE_VERIFIED', 'GENERATED_DRAFT', 'TEST_DATA'];

function validateDataset(dataset, academies) {
  const issues = [];
  const add = (level, code, detail) => issues.push({ level, code, detail });

  const byCode = {};
  const levelSet = {};
  const bandSet = {};
  const { band } = require('./plan.js');
  academies.forEach((a) => {
    byCode[a.code] = a;
    levelSet[a.code] = new Set(a.levels);
    bandSet[a.code] = new Set(a.levels.map(band));
  });
  const levelOk = (code, level) => !code || !bandSet[code] || !level || bandSet[code].has(band(level));

  const ids = { course: new Set(), lesson: new Set(), quiz: new Set() };
  const courseIds = new Set(dataset.courses.map((c) => c.id));

  // courses
  dataset.courses.forEach((c) => {
    if (!c.id) add('FAIL', 'course.id', 'course missing id');
    if (ids.course.has(c.id)) add('FAIL', 'course.dup', 'duplicate course id ' + c.id);
    ids.course.add(c.id);
    if (!c.academyCode || !byCode[c.academyCode]) add('FAIL', 'course.academy', `course ${c.id} invalid academy ${c.academyCode}`);
    if (!levelOk(c.academyCode, c.level)) add('WARN', 'course.level', `course ${c.id} level ${c.level} not in ${c.academyCode} levels`);
    if (!STATUS_OK.includes(c.status)) add('FAIL', 'course.status', `course ${c.id} invalid status ${c.status}`);
    if (!CONTENT_STATE_OK.includes(c.contentState)) add('FAIL', 'course.contentState', `course ${c.id} invalid contentState ${c.contentState}`);
    if (!SOURCE_TYPE_OK.includes(c.sourceType)) add('FAIL', 'course.sourceType', `course ${c.id} invalid sourceType ${c.sourceType}`);
  });

  // lessons
  dataset.lessons.forEach((l) => {
    if (!l.id) add('FAIL', 'lesson.id', 'lesson missing id');
    if (ids.lesson.has(l.id)) add('FAIL', 'lesson.dup', 'duplicate lesson id ' + l.id);
    ids.lesson.add(l.id);
    if (!l.courseId || !courseIds.has(l.courseId)) add('FAIL', 'lesson.orphan', `lesson ${l.id} references missing course ${l.courseId}`);
    if (!l.academyCode || !byCode[l.academyCode]) add('FAIL', 'lesson.academy', `lesson ${l.id} invalid academy ${l.academyCode}`);
    if (!STATUS_OK.includes(l.status)) add('FAIL', 'lesson.status', `lesson ${l.id} invalid status ${l.status}`);
    if (!SOURCE_TYPE_OK.includes(l.sourceType)) add('FAIL', 'lesson.sourceType', `lesson ${l.id} invalid sourceType ${l.sourceType}`);
    if (!l.content) add('WARN', 'lesson.content', `lesson ${l.id} has empty content`);
    if (!levelOk(l.academyCode, l.level)) add('WARN', 'lesson.level', `lesson ${l.id} level ${l.level} not in ${l.academyCode}`);
  });

  // quizzes
  dataset.quizzes.forEach((q) => {
    if (!q.id) add('FAIL', 'quiz.id', 'quiz missing id');
    if (ids.quiz.has(q.id)) add('FAIL', 'quiz.dup', 'duplicate quiz id ' + q.id);
    ids.quiz.add(q.id);
    if (q.courseId && !courseIds.has(q.courseId)) add('FAIL', 'quiz.orphan', `quiz ${q.id} references missing course ${q.courseId}`);
    if (!q.courseId) add('WARN', 'quiz.course', `quiz ${q.id} has no courseId (level assessment) — requires review`);
    if (!q.academyCode || !byCode[q.academyCode]) add('FAIL', 'quiz.academy', `quiz ${q.id} invalid academy ${q.academyCode}`);
    if (!STATUS_OK.includes(q.status)) add('FAIL', 'quiz.status', `quiz ${q.id} invalid status ${q.status}`);
    if (!SOURCE_TYPE_OK.includes(q.sourceType)) add('FAIL', 'quiz.sourceType', `quiz ${q.id} invalid sourceType ${q.sourceType}`);
    if (!Array.isArray(q.questions) || q.questions.length === 0) add('FAIL', 'quiz.questions', `quiz ${q.id} has no questions`);
    (q.questions || []).forEach((x, i) => {
      if (typeof x.correctIndex !== 'number' || x.correctIndex < 0 || x.correctIndex >= (x.options || []).length) {
        add('FAIL', 'quiz.correctIndex', `quiz ${q.id} q${i} correctIndex out of range`);
      }
      if (!x.text) add('WARN', 'quiz.question.text', `quiz ${q.id} q${i} empty text`);
    });
  });

  // relations croisées : quiz -> course / lesson / level ; academy/language
  dataset.quizzes.forEach((q) => {
    if (q.lessonId && !ids.lesson.has(q.lessonId)) add('WARN', 'quiz.lessonId', `quiz ${q.id} lessonId ${q.lessonId} not in dataset`);
    if (q.courseId && !courseIds.has(q.courseId)) add('FAIL', 'quiz.courseId', `quiz ${q.id} courseId ${q.courseId} not in dataset`);
    if (!levelOk(q.academyCode, q.level)) add('WARN', 'quiz.level', `quiz ${q.id} level ${q.level} not in ${q.academyCode}`);
  });
  academies.forEach((a) => { if (!a.key || !a.code || !a.language) add('FAIL', 'academy.meta', `academy ${a.code} missing key/language`); });

  const fails = issues.filter((i) => i.level === 'FAIL');
  const warns = issues.filter((i) => i.level === 'WARN');
  return {
    pass: fails.length === 0,
    fail: fails.length,
    warnings: warns.length,
    issues,
    stats: { courses: dataset.courses.length, lessons: dataset.lessons.length, quizzes: dataset.quizzes.length, questions: dataset.quizzes.reduce((a, q) => a + (q.questions || []).length, 0) },
  };
}

module.exports = { validateDataset, STATUS_OK, CONTENT_STATE_OK, SOURCE_TYPE_OK };
