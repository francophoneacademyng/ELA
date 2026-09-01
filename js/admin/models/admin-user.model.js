/* ============================================================
   ELA — admin/models/admin-user.model.js
   Domain model « utilisateur vu par l'admin ».
   Mapping strict du document Firestore users/{uid} (existant —
   ne jamais renommer les champs).
   ============================================================ */

export function AdminUser(id, data) {
  this.id = id || '';
  this.name = data.name || '';
  this.email = data.email || '';
  this.role = data.role || 'student';
  this.academy = data.academy || null;
  this.referralCodeUsed = data.referralCodeUsed || null;
  this.referralCredit = data.referralCredit || 0;
  this.createdAt = data.createdAt || 0;   // ms
}

/** Factory depuis un QueryDocumentSnapshot Firestore. */
AdminUser.fromDoc = function (doc) {
  const x = doc.data() || {};
  return new AdminUser(doc.id, {
    name: x.displayName || '',
    email: x.email || '',
    role: x.role || 'student',
    academy: x.academy || null,
    referralCodeUsed: x.referralCodeUsed || null,
    referralCredit: x.referralCredit || 0,
    createdAt: AdminUser.toMillis(x.createdAt)
  });
};

AdminUser.toMillis = function (v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

/** Nom affichable (nom sinon email sinon '—'). */
AdminUser.prototype.displayName = function () {
  return this.name || this.email || '—';
};

/** Initiale pour l'avatar. */
AdminUser.prototype.initial = function () {
  return (this.displayName().charAt(0) || 'A').toUpperCase();
};

/** Filtre de recherche client (nom ou email, insensible à la casse). */
AdminUser.prototype.matches = function (query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return (this.name || '').toLowerCase().indexOf(q) >= 0 ||
         (this.email || '').toLowerCase().indexOf(q) >= 0;
};
