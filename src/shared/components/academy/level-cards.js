/* ============================================================
   ELA â€” shared/components/academy/level-cards.js
   Cartes de niveaux (A1â†’C2 / HSK1â†’HSK6) avec Ã©tats
   dÃ©verrouillÃ© / verrouillÃ© / terminÃ©.
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
    const icon = state === 'locked' ? 'ðŸ”’' : (state === 'done' ? 'âœ“' : 'â–¶');
    html += '' +
      '<a class="ac-level-card ac-' + state + '" ' +
         (state === 'locked' ? '' : 'href="' + baseHref + '?level=' + encodeURIComponent(level) + '" ') +
         'style="--ac:' + color + '">' +
        '<span class="ac-level-badge">' + level + '</span>' +
        '<span class="ac-level-name">' + levelDisplayName(names[level]) + '</span>' +
        '<span class="ac-level-state" aria-hidden="true">' + icon + '</span>' +
        '<span class="ac-level-track"><span class="ac-level-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="ac-level-pct">' + pct + '%</span>' +
      '</a>';
  });
  html += '</div>';
  if (cert) {
    html += '<p class="ac-levels-cert">' + t('academies.dashboard.referenceCert').replace('{cert}', cert) + '</p>';
  }
  return html;
}
