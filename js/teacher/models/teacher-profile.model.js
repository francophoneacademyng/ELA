/* ============================================================
   ELA — teacher/models/teacher-profile.model.js
   Domain model « profil enseignant ». Source : users/{uid}
   (rôle teacher exige une académie — voir setUserRole côté serveur).
   ============================================================ */

export function TeacherProfile(uid, data) {
  this.uid = uid || '';
  this.role = data.role || 'student';
  this.academy = data.academy || null;
  this.displayName = data.displayName || '';
  this.email = data.email || '';
}

TeacherProfile.fromDoc = function (doc) {
  const d = doc && doc.exists ? doc.data() : {};
  return new TeacherProfile(doc ? doc.id : '', {
    role: d.role, academy: d.academy,
    displayName: d.displayName || d.email || '', email: d.email || ''
  });
};

/** Le profil peut-il accéder à l'espace enseignant ? */
TeacherProfile.prototype.canManage = function () {
  return this.role === 'teacher' || this.role === 'admin';
};

/** L'académie imposée pour la création de contenu (admin → null = libre). */
TeacherProfile.prototype.requiredAcademy = function () {
  return this.role === 'teacher' ? this.academy : null;
};
