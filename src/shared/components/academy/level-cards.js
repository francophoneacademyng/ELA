/* ============================================================
   ELA — shared/components/academy/level-cards.js
   Cartes de niveaux (A1→C2 / HSK1→HSK6) avec états
   déverrouillé / verrouillé / terminé.
   ============================================================ */

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
    const icon = state === 'locked' ? '🔒' : (state === 'done' ? '✓' : '▶');
    html += '' +
      '<a class="ac-level-card ac-' + state + '" ' +
         (state === 'locked' ? '' : 'href="' + baseHref + '?level=' + encodeURIComponent(level) + '" ') +
         'style="--ac:' + color + '">' +
        '<span class="ac-level-badge">' + level + '</span>' +
        '<span class="ac-level-name">' + (names[level] || '') + '</span>' +
        '<span class="ac-level-state" aria-hidden="true">' + icon + '</span>' +
        '<span class="ac-level-track"><span class="ac-level-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="ac-level-pct">' + pct + '%</span>' +
      '</a>';
  });
  html += '</div>';
  if (cert) {
    html += '<p class="ac-levels-cert">Certification de référence : <strong>' + cert + '</strong></p>';
  }
  return html;
}
