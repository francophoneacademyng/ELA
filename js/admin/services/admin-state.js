/* ============================================================
   ELA — admin/services/admin-state.js
   Store minimal du panel admin (remplace la variable globale
   adminState). API get/set/subscribe — pas de mutation externe.
   ============================================================ */

const initial = {
  loading: false,
  error: null,
  users: [],
  transactions: [],
  subscriptions: [],
  liveClasses: [],
  metrics: {},
  queue: [],
  queueLoading: false,
  rejectingKey: null   // clé 'collection:id' du formulaire de rejet ouvert
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
