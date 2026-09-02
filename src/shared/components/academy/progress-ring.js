/* ============================================================
   ELA — shared/components/academy/progress-ring.js
   Anneau de progression SVG (vanilla, sans dépendance).
   ============================================================ */

/**
 * Anneau de progression.
 * @param {{percent:number, size?:number, stroke?:number, color?:string,
 *          trackColor?:string, label?:string}} opts
 */
export function progressRing(opts) {
  const percent = Math.max(0, Math.min(100, Number(opts && opts.percent) || 0));
  const size = Number(opts && opts.size) || 64;
  const stroke = Number(opts && opts.stroke) || 6;
  const color = (opts && opts.color) || '#0B6B4F';
  const trackColor = (opts && opts.trackColor) || 'rgba(6,61,44,0.12)';
  const label = (opts && opts.label) != null ? String(opts.label) : percent + '%';
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = (percent / 100) * c;
  return '' +
    '<span class="ac-ring" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + label + '">' +
        '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + r + '" fill="none" stroke="' + trackColor + '" stroke-width="' + stroke + '"/>' +
        '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + filled.toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 ' + (size / 2) + ' ' + (size / 2) + ')"/>' +
      '</svg>' +
      '<span class="ac-ring-label" style="color:' + color + '">' + label + '</span>' +
    '</span>';
}
