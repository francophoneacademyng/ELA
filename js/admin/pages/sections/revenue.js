/* ============================================================
   ELA — admin/pages/sections/revenue.js
   Graphe de revenus (7/30/90 jours) + dernières transactions.
   ============================================================ */

import { revenueChartHtml } from '../../components/revenue-chart.js';
import { buildRevenueSeries } from '../../services/admin-metrics.service.js';
import { statusBadgeHtml } from '../../components/badge.js';
import { t } from '../../../core/i18n-helpers.js';
import { fmtNaira, formatDate } from '../../../core/dom.js';
import { getState } from '../../services/admin-state.js';

export function revenueHtml(range) {
  const s = getState();
  const days = range === 7 || range === 90 ? range : 30;
  const chart = revenueChartHtml(buildRevenueSeries(s.transactions, days));

  const ranges = [7, 30, 90].map(function (r) {
    return '<button class="btn btn-sm ' + (r === days ? 'btn-solid' : 'btn-ghost') +
      '" data-rev-range="' + r + '">' + r + ' j</button>';
  }).join(' ');

  const rows = s.transactions.slice(0, 20).map(function (tx) {
    return '<tr><td>' + formatDate(tx.createdAt) + '</td><td>' + tx.plan + '</td>' +
      '<td>' + fmtNaira(tx.amount) + '</td><td>' + statusBadgeHtml(tx.status) + '</td></tr>';
  }).join('') || '<tr><td colspan="4" class="muted">—</td></tr>';

  return '<section class="dashboard-section">' +
    '<h3>' + t('admin.revenueThisMonth') + '</h3>' +
    '<div class="rev-ranges">' + ranges + '</div>' +
    chart +
    '<h3>' + t('admin.payments') + '</h3>' +
    '<table class="dash-table"><thead><tr>' +
      '<th>' + t('admin.date') + '</th><th>' + t('admin.plan') + '</th>' +
      '<th>' + t('admin.amount') + '</th><th>' + t('admin.status') + '</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>' +
  '</section>';
}
