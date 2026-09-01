/* ============================================================
   ELA — teacher/models/lesson-draft.model.js
   Domain model « brouillon de leçon » + validation avant soumission.
   Champs cibles Firestore lessons/ : title, description, content,
   level, academy, teacherUid, status:'pending', createdAt.
   ============================================================ */

export const LESSON_LEVELS = ['beginner', 'intermediate', 'advanced'];

export function LessonDraft(data) {
  data = data || {};
  this.title = data.title || '';
  this.description = data.description || '';
  this.content = data.content || '';
  this.level = LESSON_LEVELS.indexOf(data.level) >= 0 ? data.level : 'beginner';
}

LessonDraft.fromForm = function (values) { return new LessonDraft(values); };

/** Valide le brouillon. Renvoie { ok, errors: {champ: message} } (clés i18n teacher.error.*). */
LessonDraft.prototype.validate = function () {
  const errors = {};
  if (!String(this.title).trim()) errors.title = 'teacher.error.titleRequired';
  if (!String(this.content).trim()) errors.content = 'teacher.error.contentRequired';
  if (LESSON_LEVELS.indexOf(this.level) < 0) errors.level = 'teacher.error.levelInvalid';
  return { ok: Object.keys(errors).length === 0, errors: errors };
};

/** Payload prêt pour la soumission (l'académie/uid sont injectés par le service). */
LessonDraft.prototype.toPayload = function () {
  return {
    title: String(this.title).trim(),
    description: String(this.description).trim(),
    content: String(this.content).trim(),
    level: this.level
  };
};
