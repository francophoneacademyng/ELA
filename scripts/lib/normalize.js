'use strict';
/* ============================================================
   ELA — scripts/lib/normalize.js
   Normalisation des données source (Francophone Academy V7 + ELA
   seed) vers le schéma Firestore ELA. Fonctions pures, aucune I/O,
   aucune écriture Firestore.
   ============================================================ */

const PROVENANCE = {
  v7: { sourceAcademy: 'Francophone Academy', sourceVersion: 'V7', sourceType: 'SOURCE_DERIVED' },
  ela: { sourceAcademy: 'ELA', sourceVersion: 'ELA-seed', sourceType: 'SOURCE_DERIVED' },
  gen: { sourceAcademy: 'ELA', sourceVersion: 'ELA-generated', sourceType: 'GENERATED_DRAFT' },
};

function courseLevelFromId(id) {
  const m = String(id || '').match(/-(a1|a2|b1|b2|c1|c2|hsk[1-6])/i);
  return m ? m[1].toUpperCase().replace('HSK', 'HSK') : '';
}

function lessonIdFor(courseId, order) {
  return `${courseId}-l${Number(order) || 0}`;
}

function quizIdFor(academyKey, level) {
  return `${academyKey}-level-${String(level || '').toLowerCase()}-quiz`;
}

/* V7 course -> ELA course */
function courseFromV7(c, academyKey, academyCode) {
  return {
    id: c.id,
    academy: academyKey,
    academyCode,
    language: 'French',
    title: c.title || '',
    slug: c.slug || c.id,
    description: c.description || '',
    level: c.level || courseLevelFromId(c.id),
    category: c.category || 'general',
    planRequired: c.planRequired || 'general',
    instructorName: c.instructorName || '',
    durationMinutes: c.durationMinutes || 0,
    lessonCount: c.lessonCount || 0,
    order: c.order || 0,
    learningOutcomes: Array.isArray(c.learningOutcomes) ? c.learningOutcomes : [],
    status: c.isPublished === true ? 'approved' : 'draft',
    contentState: 'SOURCE_DERIVED',
    ...PROVENANCE.v7,
  };
}

/* V7 lesson -> ELA lesson (stable id, provenance) */
function lessonFromV7(l, course, academyKey, academyCode) {
  const level = (course && course.level) || '';
  return {
    id: lessonIdFor(l.courseId, l.order),
    academy: academyKey,
    academyCode,
    academyName: 'Francophone Academy',
    courseId: l.courseId,
    level,
    order: Number(l.order) || 0,
    lessonNumber: Number(l.order) || 0,
    title: l.title || '',
    description: '',
    content: l.content || '',
    vocabulary: [],
    duration: l.videoDuration ? Math.round(l.videoDuration / 60) + ' min' : '',
    videoUrl: l.videoUrl || '',
    videoDuration: l.videoDuration || 0,
    isTrial: l.isFree === true,
    trialAccess: l.isFree === true ? 'instant' : 'account',
    status: 'approved',
    contentState: 'SOURCE_DERIVED',
    ...PROVENANCE.v7,
  };
}

/* V7 quiz -> ELA quiz (correctAnswer -> correctIndex, server-only) */
function quizFromV7(q, academyKey, academyCode, courseIdForLevel) {
  const questions = (q.questions || []).map(function (x) {
    return {
      text: String(x.question || x.text || ''),
      options: Array.isArray(x.options) ? x.options.map(String) : [],
      correctIndex: (typeof x.correctAnswer === 'number') ? x.correctAnswer : (typeof x.correctIndex === 'number' ? x.correctIndex : 0),
      explanation: String(x.explanation || ''),
      points: Number(x.points) || 0,
    };
  });
  const level = q.level || '';
  return {
    id: quizIdFor(academyKey, level),
    academy: academyKey,
    academyCode,
    level,
    title: q.title || '',
    category: q.category || 'mixed',
    timeLimit: q.timeLimit || 15,
    passingScore: q.passingScore || 80,
    isTrial: false,
    courseId: courseIdForLevel ? (courseIdForLevel[level] || null) : null,
    lessonId: null,
    questions,
    status: q.isPublished === true ? 'approved' : 'draft',
    contentState: 'SOURCE_DERIVED',
    ...PROVENANCE.v7,
  };
}

/* ELA A1 seed ({academyCode, academyName, cecrLevel, lessons[], quizzes[]}) -> ELA
   `academy` = { key, code, canonicalCourseId?, levelMap? } (réconciliation d'ID) */
function normalizeElaSeed(seed, academy) {
  const academyKey = academy.key;
  const academyCode = academy.code;
  const courses = [];
  const lessons = [];
  const quizzes = [];
  const rawLevel = seed.cecrLevel || 'A1';
  const levelMap = academy.levelMap || {};
  const courseLevel = levelMap[rawLevel] || rawLevel;
  const courseId = academy.canonicalCourseId || `${academyKey}-${academyKey}-${String(rawLevel).toLowerCase()}-foundations`;
  courses.push({
    id: courseId, academy: academyKey, academyCode, language: seed.academyName || academyKey,
    title: `${seed.academyName || academyKey} ${courseLevel} — Foundations`, slug: courseId,
    description: `ELA ${seed.academyName || academyKey} ${courseLevel} foundations course.`,
    level: courseLevel, category: 'general', planRequired: 'general', order: 1,
    lessonCount: (seed.lessons || []).length, learningOutcomes: [],
    status: 'approved', contentState: 'SOURCE_DERIVED', ...PROVENANCE.ela,
  });
  (seed.lessons || []).forEach(function (l, i) {
    lessons.push({
      id: lessonIdFor(courseId, l.order || i + 1), academy: academyKey, academyCode,
      academyName: seed.academyName || '', courseId, level: courseLevel,
      order: l.order || i + 1, lessonNumber: l.lessonNumber || i + 1,
      title: l.title || '', description: l.description || '',
      content: l.content || '', vocabulary: l.vocabulary || [],
      duration: l.duration || '', videoUrl: l.videoUrl || '', videoDuration: 0,
      isTrial: l.isTrial === true, trialAccess: l.isTrial === true ? 'instant' : 'account',
      status: 'approved', contentState: 'SOURCE_DERIVED', ...PROVENANCE.ela,
    });
  });
  (seed.quizzes || []).forEach(function (q, i) {
    const questions = (q.questions || []).map(function (x) {
      return {
        text: String(x.question || x.text || ''),
        options: Array.isArray(x.options) ? x.options.map(String) : [],
        correctIndex: (typeof x.correctAnswer === 'number') ? x.correctAnswer : (typeof x.correctIndex === 'number' ? x.correctIndex : 0),
        explanation: String(x.explanation || ''), points: Number(x.points) || 0,
      };
    });
    quizzes.push({
      id: q.id || `${academyKey}-${String(rawLevel).toLowerCase()}-quiz-${i + 1}`,
      academy: academyKey, academyCode, level: levelMap[q.level || rawLevel] || q.level || rawLevel,
      title: q.title || '', category: q.category || 'mixed',
      timeLimit: q.timeLimit || 15, passingScore: q.passingScore || 80,
      isTrial: q.isTrial === true, courseId, lessonId: q.lessonId || null,
      questions, status: q.isPublished === false ? 'draft' : 'approved',
      contentState: 'SOURCE_DERIVED', ...PROVENANCE.ela,
    });
  });
  return { courses, lessons, quizzes };
}

module.exports = {
  PROVENANCE,
  lessonIdFor,
  quizIdFor,
  courseFromV7,
  lessonFromV7,
  quizFromV7,
  normalizeElaSeed,
};
