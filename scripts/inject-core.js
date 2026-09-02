/* ============================================================
   inject-core.js — Injection du contenu A1 Foundations dans Firestore.
   Lecture d'un objet seed (parsé depuis data/seed/*.json) et
   écriture idempotente dans les collections top-level consommées
   par le frontend (getCatalog / getQuizCatalog / getCourse) :
     - courses/{courseId}
     - lessons/{lessonId}
     - quizzes/{quizId}
   Règles :
   - IDs déterministes  => relancer n'ajoute jamais de doublon.
   - doc().set(...)     => ne supprime AUCUNE donnée existante.
   - status='approved'  => visible par les abonnés.
   Usage : injectSeed(db, seed) -> {course, lessons, quizzes}
   ============================================================ */
'use strict';

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeQuestion(q) {
  if (q.type === 'tf') {
    const correct = q.correct === true;
    return {
      text: q.text,
      options: ['Vrai', 'Faux'],
      correctIndex: correct ? 0 : 1
    };
  }
  // mcq / match : options + correctIndex déjà fournis.
  return { text: q.text, options: q.options || [], correctIndex: q.correctIndex };
}

function lessonExerciseText(ex) {
  // Les exercices Firestore sont rendus en liste de chaînes (js/app.js).
  const parts = [ex.instruction, ex.question];
  if (ex.answer) parts.push('Réponse : ' + ex.answer);
  return parts.filter(Boolean).join(' — ');
}

async function injectSeed(db, seed) {
  const code = seed.academyCode;
  const key = seed.academyKey;
  const level = seed.level || 'A1';
  const course = seed.course;

  const courseId = slugify(key + '-' + course.title);

  // --- Course ------------------------------------------------
  const courseRef = db.collection('courses').doc(courseId);
  await courseRef.set({
    academy: key,
    level: level,
    title: course.title,
    titleNative: course.titleNative || '',
    description: course.description || '',
    category: course.category || 'All',
    learningOutcomes: course.learningOutcomes || [],
    order: course.order || 1,
    cecrLevel: seed.cecrLevel || 'A1',
    academyCode: code,
    certification: seed.certification || '',
    status: 'approved',
    createdAt: new Date()
  });

  let nLessons = 0;
  for (const lesson of seed.lessons) {
    const lessonId = courseId + '-l' + lesson.order;
    // Le quiz lié à la leçon (le cas échéant).
    const linked = seed.quizzes.find((q) => Array.isArray(q.lessons) && q.lessons.indexOf(lesson.id) !== -1);
    const quizId = linked ? linked.id : null;

    const lessonRef = db.collection('lessons').doc(lessonId);
    await lessonRef.set({
      courseId: courseId,
      academy: key,
      level: level,
      order: lesson.order,
      title: lesson.title,
      titleNative: lesson.titleNative || '',
      objective: lesson.objective || '',
      objectives: lesson.objectives || [],
      content: lesson.content || '',
      vocabulary: lesson.vocabulary || [],
      grammar: lesson.grammar || [],
      exercises: (lesson.exercises || []).map(lessonExerciseText),
      audioScript: lesson.audioScript || null,
      videoUrl: lesson.videoUrl || '',
      quizId: quizId,
      isTrial: lesson.isTrial === true,
      cecrLevel: lesson.cecrLevel || seed.cecrLevel,
      academyCode: lesson.academyCode || code,
      teacherUid: null,
      status: 'approved',
      createdAt: new Date()
    });
    nLessons++;
  }

  let nQuizzes = 0;
  for (const quiz of seed.quizzes) {
    const quizRef = db.collection('quizzes').doc(quiz.id);
    await quizRef.set({
      courseId: courseId,
      lessonId: Array.isArray(quiz.lessons) && quiz.lessons.length
        ? courseId + '-l' + seed.lessons.find((l) => l.id === quiz.lessons[0]).order
        : null,
      academy: key,
      level: level,
      title: quiz.title,
      questions: (quiz.questions || []).map(normalizeQuestion),
      isTrial: false,
      cecrLevel: seed.cecrLevel,
      academyCode: code,
      teacherUid: null,
      status: 'approved',
      createdAt: new Date()
    });
    nQuizzes++;
  }

  return { courseId, course: 1, lessons: nLessons, quizzes: nQuizzes };
}

module.exports = { slugify, normalizeQuestion, lessonExerciseText, injectSeed };