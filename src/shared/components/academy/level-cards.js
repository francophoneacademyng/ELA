/* ============================================================
   ELA — shared/components/academy/level-cards.js
   Cartes de niveaux (A1→C2 / HSK1→HSK6) avec états
   déverrouillé / verrouillé / terminé.
   ============================================================ */

import { t } from '../../../js/core/i18n-helpers.js';

var LEVEL_KEYS = {
  'Beginner': 'academies.level.beginner',
  'Elementary': 'academies.level.elementary',
  'Intermediate': 'academies.level.intermediate',
  'Upper Intermediate': 'academies.level.upper',
  'Advanced': 'academies.level.advanced',
  'Mastery': 'academies.level.mastery'
};

/** Traduit un nom de niveau affiché (libellé) sans toucher au code technique. */
export function levelDisplayName(name) {
  const key = LEVEL_KEYS[String(name || '')];
  return key ? t(key) : (name || '');
}

/* Icônes d'état en SVG inline (trait currentColor). */
var STATE_ICONS = {
  locked: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  done: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6L9 17l-5-5"/></svg>',
  open: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>'
};

/**
 * @param {{levels:string[], levelNames:Object, unlockedIndex:number,
 *          progressByLevel:Object, color:string, baseHref:string,
 *          certificationLabel:string}} opts
 *   - unlockedIndex : plus haut niveau accessible (index dans levels).
 *   - progressByLevel : { A1: 45, ... } pourcentage par niveau.
 */
export function levelCards(opts) {
  const levels = (opts && opts.levels) || [];
  const names = (opts && opts.levelNames) || {};
  const unlockedIndex = Number(opts && opts.unlockedIndex) || 0;
  const progress = (opts && opts.progressByLevel) || {};
  const color = (opts && opts.color) || '#0B6B4F';
  const baseHref = (opts && opts.baseHref) || '#/courses';
  const cert = (opts && opts.certificationLabel) || '';

  let html = '<div class="ac-levels">';
  levels.forEach(function (level, i) {
    const pct = Math.max(0, Math.min(100, Number(progress[level]) || 0));
    const state = i <= unlockedIndex ? (pct >= 100 ? 'done' : 'open') : 'locked';
    const icon = STATE_ICONS[state];
    html += '' +
      '<a class="ac-level-card ac-' + state + '" ' +
         (state === 'locked' ? 'aria-disabled="true" ' : 'href="' + baseHref + '?level=' + encodeURIComponent(level) + '" ') +
         'style="--ac:' + color + '">' +
        '<span class="ac-level-badge">' + level + '</span>' +
        '<span class="ac-level-name">' + levelDisplayName(names[level]) + '</span>' +
        '<span class="ac-level-state" aria-hidden="true">' + icon + '</span>' +
        '<span class="ac-level-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="' + level + '"><span class="ac-level-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="ac-level-pct">' + pct + '%</span>' +
      '</a>';
  });
  html += '</div>';
  if (cert) {
    html += '<p class="ac-levels-cert">' + t('academies.dashboard.referenceCert').replace('{cert}', cert) + '</p>';
  }
  return html;
}
