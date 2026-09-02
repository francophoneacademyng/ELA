/* ============================================================
   ELA — shared/components/academy/academy-shell.js
   Coque immersive d'une académie : sidebar de navigation
   (Dashboard, My Courses, Quiz, Live, Certificates) + header
   coloré (drapeau, label, référentiel) + zone de contenu.
   ============================================================ */

/**
 * Construit le HTML de la coque.
 * @param {{code:string, label:string, native:string, flag:string, color:string,
 *          certification:string, activePage:string, contentHtml:string}} opts
 * activePage ∈ dashboard | courses | quiz | live | certificates
 */
export function academyShell(opts) {
  const pages = [
    { id: 'dashboard', icon: '◧', label: 'Dashboard' },
    { id: 'courses', icon: '▤', label: 'My Courses' },
    { id: 'quiz', icon: '✎', label: 'Quiz & Assessments' },
    { id: 'live', icon: '◉', label: 'Live Classes' },
    { id: 'certificates', icon: '❖', label: 'Certificates' }
  ];
  const active = (opts && opts.activePage) || 'dashboard';
  const href = function (p) { return '#/academy/' + (opts.code) + '/' + p; };

  let nav = '';
  pages.forEach(function (p) {
    nav += '<a class="ac-nav-item' + (p.id === active ? ' active' : '') + '" href="' + href(p.id) + '">' +
      '<span class="ac-nav-icon" aria-hidden="true">' + p.icon + '</span>' + p.label + '</a>';
  });

  return '' +
    '<div class="ac-shell" style="--ac:' + (opts.color || '#0B6B4F') + '">' +
      '<aside class="ac-sidebar">' +
        '<a class="ac-brand" href="#/dashboard" title="Back to ELA hub">' +
          '<span class="ac-brand-back">← ELA Hub</span>' +
        '</a>' +
        '<div class="ac-brand-academy">' +
          '<span class="ac-flag" aria-hidden="true">' + (opts.flag || '') + '</span>' +
          '<span class="ac-label">' + (opts.label || '') + '</span>' +
          '<span class="ac-native">' + (opts.native || '') + '</span>' +
        '</div>' +
        '<nav class="ac-nav">' + nav + '</nav>' +
        '<div class="ac-side-footer">' + (opts.certification || '') + '</div>' +
      '</aside>' +
      '<section class="ac-main">' +
        '<header class="ac-header"><h2>' + (opts.label || '') + '</h2>' +
          '<span class="ac-header-cert">' + (opts.certification || '') + '</span></header>' +
        '<div class="ac-content">' + (opts.contentHtml || '') + '</div>' +
      '</section>' +
    '</div>';
}

/** Injecte le HTML de la coque dans le root de l'app (#app). */
export function mountShell(opts) {
  const app = document.getElementById('app');
  if (app) app.innerHTML = academyShell(opts);
  window.scrollTo(0, 0);
  return app ? app.querySelector('.ac-content') : null;
}
