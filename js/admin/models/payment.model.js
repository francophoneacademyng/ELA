/* ============================================================
   ELA — admin/models/payment.model.js
   Domain model « transaction Paystack ». Le document transactions/
   {reference} est écrit UNIQUEMENT par le serveur (règles Firestore :
   allow write: false côté client).
   ============================================================ */

export const PAYMENT_STATUS = { PENDING: 'pending', SUCCESS: 'success', FAILED: 'failed' };

export function Payment(id, data) {
  this.id = id || '';
  this.uid = data.uid || '';
  this.plan = data.plan || 'general';
  this.duration = data.duration || 0;
  this.amount = data.amount || 0;          // montant final (base - remise - crédit), NGN
  this.baseAmount = data.baseAmount || 0;
  this.discount = data.discount || 0;      // remise parrainage
  this.creditUsed = data.creditUsed || 0;  // crédit parrain consommé
  this.referrerUid = data.referrerUid || null;
  this.status = data.status || PAYMENT_STATUS.PENDING;
  this.createdAt = data.createdAt || 0;    // ms
}

Payment.fromDoc = function (doc) {
  const x = doc.data() || {};
  return new Payment(doc.id, {
    uid: x.uid, plan: x.plan, duration: Number(x.duration) || 0,
    amount: x.amount, baseAmount: x.baseAmount, discount: x.discount,
    creditUsed: x.creditUsed, referrerUid: x.referrerUid,
    status: x.status, createdAt: toMillis(x.createdAt)
  });
};

function toMillis(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

Payment.prototype.isSuccessful = function () { return this.status === PAYMENT_STATUS.SUCCESS; };
Payment.prototype.isPending = function () { return this.status !== PAYMENT_STATUS.SUCCESS; };

/** Clé de jour 'YYYY-M-D' (agrégation pour le graphe de revenus). */
Payment.prototype.dayKey = function () {
  if (!this.createdAt) return '';
  const d = new Date(this.createdAt);
  return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
};

/** Clé de mois 'YYYY-M' (comparaison M vs M-1). */
Payment.prototype.monthKey = function () {
  if (!this.createdAt) return '';
  const d = new Date(this.createdAt);
  return d.getFullYear() + '-' + d.getMonth();
};
