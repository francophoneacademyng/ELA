/* ============================================================
   ELA — teacher/models/live-draft.model.js
   Domain model « brouillon de classe live » + validation.
   Champs cibles Firestore liveClasses/ : title, scheduledAt (Date),
   meetingLink, academy, teacherUid, status:'pending', createdAt.
   ============================================================ */

export function LiveDraft(data) {
  data = data || {};
  this.title = data.title || '';
  this.datetime = data.datetime || '';     // valeur input datetime-local (YYYY-MM-DDTHH:mm)
  this.meetingLink = data.meetingLink || '';
}

LiveDraft.fromForm = function (values) { return new LiveDraft(values); };

/** Valide : titre, date future et lien http(s) requis. */
LiveDraft.prototype.validate = function () {
  const errors = {};
  if (!String(this.title).trim()) errors.title = 'teacher.error.titleRequired';

  const d = this.datetime ? new Date(this.datetime) : null;
  if (!d || isNaN(d.getTime())) {
    errors.datetime = 'teacher.error.dateInvalid';
  } else if (d.getTime() <= Date.now()) {
    errors.datetime = 'teacher.error.datePast';
  }

  const link = String(this.meetingLink).trim();
  if (!link) {
    errors.meetingLink = 'teacher.error.linkRequired';
  } else if (!/^https?:\/\/.+/i.test(link)) {
    errors.meetingLink = 'teacher.error.linkInvalid';
  }
  return { ok: Object.keys(errors).length === 0, errors: errors };
};

/** Payload prêt pour la soumission (l'académie/uid sont injectés par le service). */
LiveDraft.prototype.toPayload = function () {
  return {
    title: String(this.title).trim(),
    scheduledAt: new Date(this.datetime).toISOString(),
    meetingLink: String(this.meetingLink).trim()
  };
};
