/* ============================================================
   ELA — admin/pages/refresh.js
   Bus de re-rendu minimal : la page s'enregistre ici, les
   sections déclenchent un re-rendu SANS dépendance circulaire
   (sections n'importent jamais la page).
   ============================================================ */

let renderFn = null;

export function registerRenderer(fn) { renderFn = fn; }

export function rerender() {
  if (renderFn) { try { renderFn(); } catch (e) { /* isolé */ } }
}
