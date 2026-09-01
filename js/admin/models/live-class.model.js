/* ============================================================
   ELA — admin/models/live-class.model.js
   Domain model « classe live ». Document liveClasses/{id}.
   Le lien de réunion n'est jamais exposé ici : sa révélation
   passe par le callable getLiveMeetingLink (fenêtre J-15min → J+4h).
   ============================================================ */

export function LiveClass(id, data) {
  this.id = id || '';
  this.title = data.title || '';
  this.academy = data.academy || null;
  this.teacherUid = data.teacherUid || null;
  this.scheduledAt = data.scheduledAt || 0;   // ms
  this.status = data.status || 'pending';
}

LiveClass.fromDoc = function (doc) {
  const x = doc.data() || {};
  return new LiveClass(doc.id, {
    title: x.title, academy: x.academy, teacherUid: x.teacherUid,
    scheduledAt: toMillis(x.scheduledAt), status: x.status
  });
};

function toMillis(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

LiveClass.prototype.isUpcoming = function (now) {
  return !!this.scheduledAt && this.scheduledAt > (now || Date.now());
};

/** { hours, minutes } restant avant la classe (0 si passée). */
LiveClass.prototype.countdown = function (now) {
  const diff = this.scheduledAt - (now || Date.now());
  if (diff <= 0) return { hours: 0, minutes: 0 };
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.round((diff % 3600000) / 60000)
  };
};

/** Tri chronologique croissant. */
LiveClass.compareByDate = function (a, b) {
  return (a.scheduledAt || 0) - (b.scheduledAt || 0);
};
