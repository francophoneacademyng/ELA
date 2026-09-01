/* ============================================================
   ELA — admin/components/revenue-chart.js
   Graphe de revenus en SVG pur (réplique du graphe admin existant,
   extrait en composant paramétrable — fin de duplication).
   ============================================================ */

import { fmtNaira } from '../../core/dom.js';

/**
 * @param {{label:string,total:number}[]} series (asc, 1 point/jour)
 * @returns {string} HTML <svg>
 */
export function revenueChartHtml(series) {
  const data = series || [];
  if (!data.length) return '<p class="muted">—</p>';
  const W = 560, H = 180, PAD = 8;
  const max = Math.max.apply(null, data.map(function (d) { return d.total; }).concat([1]));
  const step = (W - PAD * 2) / Math.max(data.length - 1, 1);
  const scaleY = function (v) { return H - PAD - (v / max) * (H - PAD * 3); };

  let bars = '';
  data.forEach(function (d, i) {
    const x = PAD + i * step;
    const y = scaleY(d.total);
    const h = (H - PAD * 2) - y + PAD;
    bars += '<rect x="' + (x - Math.max(step * 0.35, 2)) + '" y="' + y + '" width="' +
      Math.max(step * 0.7, 3) + '" height="' + h + '" rx="3" class="rev-bar">' +
      '<title>' + d.label + ' : ' + fmtNaira(d.total) + '</title></rect>';
  });

  const labels = data.map(function (d, i) {
    if (data.length > 14 && i % Math.ceil(data.length / 7) !== 0) return '';
    const x = PAD + i * step;
    return '<text x="' + x + '" y="' + (H - 2) + '" text-anchor="middle" class="rev-label">' + d.label + '</text>';
  }).join('');

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="revenue-chart" role="img" aria-label="revenue">' +
    bars + labels + '</svg>';
}
