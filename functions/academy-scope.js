/* ============================================================
   ELA — functions/academy-scope.js   (PUR, sans accès base)
   ------------------------------------------------------------
   Helpers partagés d'isolation par académie + rôle, utilisés par
   teacher.js (roster des élèves), examination.js (filtrage par
   académie) et toute fonction qui doit borner la visibilité d'un
   enseignant à SA académie.

   Modèle canonique :
     users/{uid}.academy   = clé interne ('french','german',…)
     users/{uid}.academies = tableau de clés (élève multi-académie)
   Les codes courts (FR/DE/ZH/EN/AR/RU) et clés longues sont
   normalisés vers un CODE unique pour les comparaisons.
   ============================================================ */

'use strict';

const KEY_TO_CODE = {
  FRENCH: 'FR', FRANCOPHONE: 'FR', FR: 'FR',
  GERMAN: 'DE', DE: 'DE',
  MANDARIN: 'ZH', CHINESE: 'ZH', ZH: 'ZH',
  ENGLISH: 'EN', EN: 'EN',
  ARABIC: 'AR', AR: 'AR',
  RUSSIAN: 'RU', RU: 'RU'
};

/* Rôles qui ne sont PAS des élèves (jamais visibles comme "students"). */
const NON_STUDENT_ROLES = ['teacher', 'admin', 'system', 'superadmin', 'examiner'];

function normalizeAcademyKey(value) {
  const s = String(value == null ? '' : value).trim().toUpperCase();
  return KEY_TO_CODE[s] || null;
}

/* Codes d'académie d'un utilisateur (academies[] puis academy). */
function userAcademyCodes(userData) {
  const out = [];
  if (userData && Array.isArray(userData.academies)) {
    for (const a of userData.academies) {
      const c = normalizeAcademyKey(a);
      if (c && out.indexOf(c) === -1) out.push(c);
    }
  }
  if (userData && userData.academy) {
    const c = normalizeAcademyKey(userData.academy);
    if (c && out.indexOf(c) === -1) out.push(c);
  }
  return out;
}

function isStudentRole(role) {
  return NON_STUDENT_ROLES.indexOf(String(role || 'student')) === -1;
}

/**
 * Filtre une liste d'enregistrements utilisateurs pour n'en garder que
 * les élèves que l'appelant est autorisé à voir.
 *   records         : [{ uid, role, academy, academies }]
 *   teacherAcademy  : clé/code de l'académie de l'enseignant (null si admin)
 *   isAdmin         : true → tous les élèves
 * Règle de sécurité :
 *   - admin        → tous les élèves (aucune restriction d'académie)
 *   - teacher      → élèves de SA SEULE académie ; SANS académie → personne
 *   - rôle non élève (teacher/admin/examiner/…) → jamais inclus
 * Retourne un tableau d'uid.
 */
function filterTeacherStudents(records, teacherAcademy, isAdmin) {
  const out = [];
  if (isAdmin) {
    for (const r of (records || [])) {
      if (r && r.uid && isStudentRole(r.role)) out.push(r.uid);
    }
    return out;
  }
  const teacherCode = normalizeAcademyKey(teacherAcademy);
  if (!teacherCode) return []; // enseignant sans académie → aucune visibilité
  for (const r of (records || [])) {
    if (!r || !r.uid) continue;
    if (!isStudentRole(r.role)) continue;
    const codes = userAcademyCodes(r);
    if (codes.length && codes.indexOf(teacherCode) === -1) continue; // mauvaise académie
    out.push(r.uid);
  }
  return out;
}

module.exports = {
  KEY_TO_CODE,
  NON_STUDENT_ROLES,
  normalizeAcademyKey,
  userAcademyCodes,
  isStudentRole,
  filterTeacherStudents
};
