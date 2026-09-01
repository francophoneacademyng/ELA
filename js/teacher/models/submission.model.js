/* ============================================================
   ELA — teacher/models/submission.model.js
   Domain model « soumission de l'enseignant » (leçon/quizz/live)
   avec son statut de validation. Lecture depuis Firestore
   (teacherUid === uid) ou depuis la file admin (getAdminQueue).
   ============================================================ */

export const SUBMISSION_STATUS = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' };

export const SUBMISSION_TYPE = { LESSON: 'lesson', QUIZ: 'quiz', LIVE: 'live' };

export function Submission(data) {
  this.type = data.type || SUBMISSION_TYPE.LESSON;
  this.title = data.title || '';
  this.status = data.status || SUBMISSION_STATUS.PENDING;
  this.rejectReason = data.rejectReason || '';
  this.createdAt = data.createdAt || 0;   // ms
}

/** Factory depuis un document Firestore (lessons/quizzes/liveClasses). */
Submission.fromDoc = function (type, doc) {
  const d = doc.data() || {};
  return new Submission({
    type: type,
    title: d.title || '',
    status: d.status || SUBMISSION_STATUS.PENDING,
    rejectReason: d.rejectReason || '',
    createdAt: toMillis(d.createdAt)
  });
};

Submission.prototype.isApproved = function () { return this.status === SUBMISSION_STATUS.APPROVED; };
Submission.prototype.isRejected = function () { return this.status === SUBMISSION_STATUS.REJECTED; };
Submission.prototype.isPending = function () { return this.status === SUBMISSION_STATUS.PENDING; };

/** Tri anti-chronologique (plus récentes d'abord). */
Submission.compareByDate = function (a, b) {
  return (b.createdAt || 0) - (a.createdAt || 0);
};

function toMillis(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}
