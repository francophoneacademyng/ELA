/* ============================================================
   ELA — core/auth.service.js
   ------------------------------------------------------------
   Service d'authentification / rôles partagé Admin & Teacher.
   - Profil utilisateur lu dans users/{uid} (rôle + académie).
   - Cache mémoire avec invalidation à chaque changement d'auth.
   - Gardes : requireAdmin() / requireTeacher().
   Règle projet : les liens Teacher/Admin ne vivent JAMAIS dans le
   HTML statique — voir updateTeacherNav (js/app.js).
   ============================================================ */

import { callFunction } from './api-client.js';

let cachedProfile = null;   // { uid, role, academy, displayName, email, referralCredit }
let authListenerBound = false;
const listeners = [];

function fb() {
  const w = typeof window !== 'undefined' ? window : null;
  if (!w || !w.firebase || !w.firebase.auth || !w.firebase.firestore) return null;
  return w.firebase;
}

/** Récupère (et met en cache) le profil Firestore de l'utilisateur connecté. */
export function getProfile(force) {
  const f = fb();
  if (!f) return Promise.resolve(null);
  const user = f.auth().currentUser;
  if (!user) { cachedProfile = null; return Promise.resolve(null); }
  if (cachedProfile && cachedProfile.uid === user.uid && !force) {
    return Promise.resolve(cachedProfile);
  }
  return f.firestore().collection('users').doc(user.uid).get()
    .then(function (snap) {
      const d = snap.exists ? snap.data() : {};
      cachedProfile = {
        uid: user.uid,
        email: d.email || user.email || '',
        displayName: d.displayName || d.email || '',
        role: d.role || 'student',
        academy: d.academy || (Array.isArray(d.academies) && d.academies[0]) || null,
        referralCredit: d.referralCredit || 0
      };
      notify();
      return cachedProfile;
    })
    .catch(function () { return null; });
}

export function getCachedProfile() { return cachedProfile; }

/** Change l'attribution de rôle via le serveur (admin only, côté Functions). */
export function setUserRole(uid, role, academy) {
  return callFunction('setUserRole', { uid: uid, role: role, academy: academy });
}

/**
 * Garde admin. Résout { ok:true, profile } ou rejette { ok:false, reason }
 * où reason ∈ 'not-signed-in' | 'forbidden' | 'firebase-not-ready'.
 */
export function requireAdmin() {
  return requireRole(['admin']);
}

/** Garde teacher : rôle 'teacher' (académie obligatoire) ou 'admin'. */
export function requireTeacher() {
  return requireRole(['teacher', 'admin']);
}

function requireRole(roles) {
  return getProfile().then(function (p) {
    if (!p) return { ok: false, reason: 'not-signed-in' };
    if (roles.indexOf(p.role) < 0) return { ok: false, reason: 'forbidden' };
    if (p.role === 'teacher' && !p.academy) return { ok: false, reason: 'forbidden' };
    return { ok: true, profile: p };
  });
}

function notify() {
  listeners.forEach(function (fn) {
    try { fn(cachedProfile); } catch (e) { /* un listener ne doit pas casser les autres */ }
  });
}

/** S'abonne aux changements d'auth + de profil. Renvoie la fonction de désabonnement. */
export function onChange(fn) {
  listeners.push(fn);
  const f = fb();
  if (f && !authListenerBound) {
    authListenerBound = true;
    f.auth().onAuthStateChanged(function () {
      cachedProfile = null;       // invalide le cache à chaque changement de session
      getProfile(true);
    });
  }
  return function () {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

if (typeof window !== 'undefined') {
  window.ELA_AUTH = { getProfile: getProfile, requireAdmin: requireAdmin, requireTeacher: requireTeacher, onChange: onChange, setUserRole: setUserRole };
}
