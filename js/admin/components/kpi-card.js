/* ============================================================
   ELA — admin/components/kpi-card.js
   Carte KPI réutilisable (réutilise les classes CSS existantes
   kpi-card / dash-stat-* de assets/css/main.css).
   ============================================================ */

import { fmtNaira } from '../../core/dom.js';

/**
 * @param {{labelKey:string,value:string,trend?:number,icon?:string}} kpi
 * @returns {string} HTML
 */
export function kpiCardHtml(kpi) {
  let trend = '';
  if (typeof kpi.trend === 'number' && isFinite(kpi.trend)) {
    const cls = kpi.trend >= 0 ? 'trend-up' : 'trend-down';
    const arrow = kpi.trend >= 0 ? '▲' : '▼';
    trend = '<span class="kpi-trend ' + cls + '">' + arrow + ' ' + Math.abs(kpi.trend) + '%</span>';
  }
  return '<div class="kpi-card">' +
    '<span class="kpi-label">' + kpi.label + '</span>' +
    '<strong class="kpi-value">' + kpi.value + '</strong>' +
    trend +
  '</div>';
}

/** KPI « revenu du mois » (montant Naira). */
export function revenueKpiHtml(label, amount, trendPct) {
  return kpiCardHtml({ label: label, value: fmtNaira(amount), trend: trendPct });
}
