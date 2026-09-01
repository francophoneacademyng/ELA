/* ============================================================
   ELA — admin/models/content-item.model.js
   Domain model « élément en attente de validation ».
   Format renvoyé par le callable getAdminQueue (serveur) :
   { collection, id, title, academy, teacherName, submittedAt, preview }.
   ============================================================ */

export const CONTENT_COLLECTIONS = ['lessons', 'quizzes', 'liveClasses'];

export function ContentItem(data) {
  this.collection = data.collection || 'lessons';
  this.id = data.id || '';
  this.title = data.title || '';
  this.academy = data.academy || null;
  this.teacherName = data.teacherName || null;
  this.submittedAt = data.submittedAt || 0;   // ms
  this.preview = data.preview || {};          // { kind, ... } construit côté serveur
  this.rejecting = false;                     // état UI (formulaire de rejet ouvert)
}

ContentItem.fromQueueItem = function (item) {
  return new ContentItem(item || {});
};

/** Clé technique stable (collection + id) pour les data-attributes. */
ContentItem.prototype.key = function () {
  return encodeURIComponent(this.collection + ':' + this.id);
};

/** Décode une clé technique → { collection, id }. */
ContentItem.parseKey = function (encoded) {
  const raw = decodeURIComponent(encoded || '');
  const i = raw.indexOf(':');
  if (i < 0) return null;
  return { collection: raw.slice(0, i), id: raw.slice(i + 1) };
};

ContentItem.prototype.isLesson = function () { return this.collection === 'lessons'; };
ContentItem.prototype.isQuiz = function () { return this.collection === 'quizzes'; };
ContentItem.prototype.isLive = function () { return this.collection === 'liveClasses'; };
