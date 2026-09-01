/* ============================================================
   ELA — teacher/models/quiz-draft.model.js
   Domain model « brouillon de quizz » + validation.
   Champs cibles Firestore quizzes/ : title, questions[{text,
   options[4], correctIndex}], academy, teacherUid, status, createdAt.
   ============================================================ */

export const QUIZ_OPTIONS = 4;

export function QuizDraft(data) {
  data = data || {};
  this.title = data.title || '';
  this.questions = (data.questions || []).map(function (q) {
    return {
      text: q.text || '',
      options: (q.options || []).slice(0, QUIZ_OPTIONS),
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
    };
  });
}

QuizDraft.fromForm = function (values) { return new QuizDraft(values); };

QuizDraft.prototype.addQuestion = function (q) {
  this.questions.push(new QuizDraft({ questions: [q || {}] }).questions[0]);
};

QuizDraft.prototype.removeQuestion = function (index) {
  if (index >= 0 && index < this.questions.length) this.questions.splice(index, 1);
};

/**
 * Valide le brouillon. Renvoie { ok, errors } où errors est un tableau
 * de messages (clés i18n) : titre requis + au moins une question complète
 * (énoncé + les 4 options remplies + index de réponse valide).
 */
QuizDraft.prototype.validate = function () {
  const errors = [];
  if (!String(this.title).trim()) errors.push('teacher.error.titleRequired');
  if (!this.questions.length) errors.push('teacher.error.quizEmpty');
  this.questions.forEach(function (q, i) {
    const complete = String(q.text).trim() &&
      q.options.length === QUIZ_OPTIONS &&
      q.options.every(function (o) { return String(o).trim(); }) &&
      q.correctIndex >= 0 && q.correctIndex < QUIZ_OPTIONS;
    if (!complete) errors.push('teacher.error.quizQuestionIncomplete:' + (i + 1));
  });
  return { ok: errors.length === 0, errors: errors };
};

/** Payload prêt pour la soumission (l'académie/uid sont injectés par le service). */
QuizDraft.prototype.toPayload = function () {
  return {
    title: String(this.title).trim(),
    questions: this.questions.map(function (q) {
      return {
        text: String(q.text).trim(),
        options: q.options.map(function (o) { return String(o).trim(); }),
        correctIndex: q.correctIndex
      };
    })
  };
};
