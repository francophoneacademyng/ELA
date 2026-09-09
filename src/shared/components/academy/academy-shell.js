/* ============================================================
   ELA â€” shared/components/academy/academy-shell.js
   Coque immersive d'une acadÃ©mie : sidebar de navigation
   (Dashboard, My Courses, Quiz, Live, Certificates) + header
   colorÃ© (drapeau, label, rÃ©fÃ©rentiel) + zone de contenu.
   ============================================================ */

import { t } from '../../../js/core/i18n-helpers.js';

var OPT_KEY = { FR: 'francophone', DE: 'germanophone', ZH: 'sinophone', EN: 'anglophone', AR: 'arabophone', RU: 'russophone' };

/** Nom affichÃ© traduit d'une acadÃ©mie Ã  partir de son code. */
export function academyDisplayName(code, fallback) {
  var opt = OPT_KEY[String(code || '').toUpperCase()];
  return opt ? t('academies.option.' + opt) : (fallback || code || '');
}

/**
 * Construit le HTML de la coque.
 * @param {{code:string, label:string, native:string, flag:string, color:string,
 *          certification:string, activePage:string, contentHtml:string}} opts
 * activePage âˆˆ dashboard | courses | quiz | live | certificates
 */
export function academyShell(opts) {
  const pages = [
    { id: 'dashboard', icon: 'â—§', key: 'academies.shell.dashboard' },
    { id: 'courses', icon: 'â–¤', key: 'academies.shell.courses' },
    { id: 'quiz', icon: 'âœŽ', key: 'academies.shell.quiz' },
    { id: 'live', icon: 'â—‰', key: 'academies.shell.live' },
    { id: 'certificates', icon: 'â–', key: 'academies.shell.certificates' }
  ];
  const active = (opts && opts.activePage) || 'dashboard';
  const href = function (p) { return '#/academy/' + (opts.code) + '/' + p; };
  const label = academyDisplayName(opts.code, opts.label);

  let nav = '';
  pages.forEach(function (p) {
    nav += '<a class="ac-nav-item' + (p.id === active ? ' active' : '') + '" href="' + href(p.id) + '">' +
      '<span class="ac-nav-icon" aria-hidden="true">' + p.icon + '</span>' + t(p.key) + '</a>';
  });

  return '' +
    '<div class="ac-shell" style="--ac:' + (opts.color || '#0B6B4F') + '">' +
      '<aside class="ac-sidebar">' +
        '<a class="ac-brand" href="#/dashboard" title="' + t('academies.shell.backToHubTitle') + '">' +
          '<span class="ac-brand-back">' + t('academies.shell.backToHub') + '</span>' +
        '</a>' +
        '<div class="ac-brand-academy">' +
          '<span class="ac-flag" aria-hidden="true">' + (opts.flag || '') + '</span>' +
          '<span class="ac-label">' + label + '</span>' +
          '<span class="ac-native">' + (opts.native || '') + '</span>' +
        '</div>' +
        '<nav class="ac-nav">' + nav + '</nav>' +
        '<div class="ac-side-footer">' + (opts.certification || '') + '</div>' +
      '</aside>' +
      '<section class="ac-main">' +
        '<header class="ac-header"><h2>' + label + '</h2>' +
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
