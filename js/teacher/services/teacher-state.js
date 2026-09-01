/* ============================================================
   ELA — teacher/services/teacher-state.js
   Store minimal de l'espace enseignant (remplace la variable
   globale teacherAcademy).
   ============================================================ */

const initial = {
  profile: null,        // TeacherProfile
  loading: false,
  submitting: false,
  error: null,
  submissions: [],
  contentLoading: false,
  formErrors: {}        // {champ: clé i18n} du formulaire actif
};

let state = Object.assign({}, initial);
const listeners = [];

export function getState() { return state; }

export function setState(patch) {
  state = Object.assign({}, state, patch);
  listeners.forEach(function (fn) { try { fn(state); } catch (e) { /* isolé */ } });
}

export function reset() {
  state = Object.assign({}, initial);
  listeners.forEach(function (fn) { try { fn(state); } catch (e) { /* isolé */ } });
}

export function subscribe(fn) {
  listeners.push(fn);
  return function () {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}
