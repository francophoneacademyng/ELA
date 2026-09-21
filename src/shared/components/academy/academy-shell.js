/* ============================================================
   ELA — shared/components/academy/academy-shell.js
   Coque immersive d'une académie : sidebar de navigation
   (Dashboard, My Courses, Quiz, Live, Certificates) + header
   coloré (drapeau, label, référentiel) + zone de contenu.
   ============================================================ */

import { t } from '../../../js/core/i18n-helpers.js';

var OPT_KEY = { FR: 'francophone', DE: 'germanophone', ZH: 'sinophone', EN: 'anglophone', AR: 'arabophone', RU: 'russophone' };

/** Nom affiché traduit d'une académie à partir de son code. */
export function academyDisplayName(code, fallback) {
  var opt = OPT_KEY[String(code || '').toUpperCase()];
  return opt ? t('academies.option.' + opt) : (fallback || code || '');
}

/* Icônes SVG inline (trait currentColor, harmonisées Teacher Area). */
var ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  courses: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  live: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
  certificates: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="6"/><path d="M15.5 13l1.5 9-5-3-5 3 1.5-9"/></svg>'
};

/**
 * Construit le HTML de la coque.
 * @param {{code:string, label:string, native:string, flag:string, color:string,
 *          certification:string, activePage:string, contentHtml:string}} opts
 * activePage ∈ dashboard | courses | quiz | live | certificates
 */
export function academyShell(opts) {
  const pages = [
    { id: 'dashboard', icon: ICONS.dashboard, key: 'academies.shell.dashboard' },
    { id: 'courses', icon: ICONS.courses, key: 'academies.shell.courses' },
    { id: 'quiz', icon: ICONS.quiz, key: 'academies.shell.quiz' },
    { id: 'live', icon: ICONS.live, key: 'academies.shell.live' },
    { id: 'certificates', icon: ICONS.certificates, key: 'academies.shell.certificates' }
  ];
  const active = (opts && opts.activePage) || 'dashboard';
  const href = function (p) { return '#/academy/' + (opts.code) + '/' + p; };
  const label = academyDisplayName(opts.code, opts.label);

  let nav = '';
  pages.forEach(function (p) {
    nav += '<a class="ac-nav-item' + (p.id === active ? ' active' : '') + '" href="' + href(p.id) + '"' +
      (p.id === active ? ' aria-current="page"' : '') + '>' +
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
