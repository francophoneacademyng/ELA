/* ============================================================
   ELA — admin/models/subscription.model.js
   Domain model « abonnement ». Document subscriptions/{uid},
   écrit uniquement côté serveur (webhook Paystack / verify).
   ============================================================ */

export function Subscription(uid, data) {
  this.uid = uid || '';
  this.plan = data.plan || 'general';
  this.status = data.status || '';
  this.endDate = data.endDate || 0;   // ms
}

Subscription.fromDoc = function (doc) {
  const x = doc.data() || {};
  return new Subscription(doc.id, {
    plan: x.plan, status: x.status, endDate: toMillis(x.endDate)
  });
};

function toMillis(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/** Abonnement actif : status==='active' ET endDate dans le futur. */
Subscription.prototype.isActive = function (now) {
  return this.status === 'active' && !!this.endDate && this.endDate > (now || Date.now());
};
