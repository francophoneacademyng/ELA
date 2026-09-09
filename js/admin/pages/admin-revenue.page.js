/* ============================================================
   ELA - admin/pages/admin-revenue.page.js
   Page « Revenus » (/admin/revenue).
   KPIs (mois / année / moyenne par abonnement) + graphe
   7/30/90 jours + tableau des paiements. Données via
   getAdminPanelData (aucune lecture directe Firestore).
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { fmtNaira, formatDate, escapeHtml } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { getState } from '../services/admin-state.js';
import { buildKpis, buildRevenueSeries } from '../services/admin-metrics.service.js';
import { statusBadgeHtml } from '../components/badge.js';

var range = 30;

export function renderAdminRevenue() {
  renderAdminShell({
    active: '#/admin/revenue',
    title: t('admin.revenue'),
    subtitle: t('admin.revenue.subtitle'),
    renderContent: function (s) { return layoutHtml(s); },
    onBind: function (app) {
      app.querySelectorAll('[data-rev-range]').forEach(function (b) {
        b.addEventListener('click', function () {
          range = Number(b.getAttribute('data-rev-range')) || 30;
          renderAdminRevenue();
        });
      });
    }
  });
}

function fmtKey(key, map) {
  var v = t(key);
  for (var k in map) v = v.split('{' + k + '}').join(map[k]);
  return v;
}

function layoutHtml(s) {
  var k = buildKpis(s);
  var year = new Date().getFullYear();
  var yearTotal = (s.transactions || []).reduce(function (sum, tx) {
    if (!tx.isSuccessful() || !tx.createdAt) return sum;
    return new Date(tx.createdAt).getFullYear() === year ? sum + tx.amount : sum;
  }, 0);
  var avgPerSub = k.activeSubs > 0 ? Math.round(k.revenueThisMonth / k.activeSubs) : 0;

  var series = buildRevenueSeries(s.transactions, range);
  var barMax = 1;
  series.forEach(function (p) { if (p.total > barMax) barMax = p.total; });
  var bars = series.map(function (p) {
    var h = Math.max(4, Math.round((p.total / barMax) * 120));
    return '<div class="bar' + (p.total ? '' : ' bar-empty') + '" style="height:' + h + 'px" ' +
      'title="' + p.label + ' · ' + fmtNaira(p.total) + '"></div>';
  }).join('');

  var rows = (s.transactions || []).slice(0, 20).map(function (tx) {
    var u = (s.users || []).filter(function (x) { return x.id === tx.uid; })[0];
    return '<tr><td>' + formatDate(tx.createdAt) + '</td>' +
      '<td><span class="user-name">' + escapeHtml(u ? u.displayName() : (tx.uid || '—')) + '</span></td>' +
      '<td>' + escapeHtml(tx.plan || '—') + '</td>' +
      '<td>' + fmtNaira(tx.amount) + '</td>' +
      '<td>' + statusBadgeHtml(tx.status) + '</td></tr>';
  }).join('');

  var trend = (k.revenueTrendPct > 0 ? '+' : '') + k.revenueTrendPct + ' % ' + t('admin.vsLastMonth');

  return '' +
    '<section class="kpi-grid">' +
      kpi(t('admin.monthRevenue'), fmtNaira(k.revenueThisMonth), trend) +
      kpi(fmtKey('admin.revenue.kpi.year', { year: year }), fmtNaira(yearTotal), t('admin.revenue.kpi.yearSub')) +
      kpi(t('admin.revenue.kpi.avg'), avgPerSub ? fmtNaira(avgPerSub) : '—',
        fmtKey('admin.revenue.kpi.avgSub', { count: k.activeSubs })) +
    '</section>' +
    '<section class="section-title">' + fmtKey('admin.revenue.evolution', { days: range }) + '</section>' +
    '<div class="card">' +
      '<div class="chart-filters">' +
        '<button class="filter-btn' + (range === 7 ? ' active' : '') + '" data-rev-range="7">' + t('admin.revenue.days7') + '</button>' +
        '<button class="filter-btn' + (range === 30 ? ' active' : '') + '" data-rev-range="30">' + t('admin.revenue.days30') + '</button>' +
        '<button class="filter-btn' + (range === 90 ? ' active' : '') + '" data-rev-range="90">' + t('admin.revenue.days90') + '</button>' +
      '</div>' +
      '<div class="bar-chart">' + bars + '</div>' +
    '</div>' +
    '<section class="section-title">' + t('admin.revenue.recent') + '</section>' +
    '<div class="card">' +
      (s.transactions && s.transactions.length
        ? '<div class="table-responsive"><table class="data-table">' +
          '<thead><tr><th>' + t('admin.revenue.col.date') + '</th><th>' + t('admin.revenue.col.user') + '</th><th>' + t('admin.revenue.col.plan') + '</th><th>' + t('admin.revenue.col.amount') + '</th><th>' + t('admin.revenue.col.status') + '</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table></div>'
        : '<div class="empty-state"><div class="empty-icon">💸</div>' +
          '<p>' + t('admin.revenue.empty') + '</p></div>') +
    '</div>';
}

function kpi(label, value, delta) {
  return '<div class="kpi-card"><span class="kpi-label">' + label + '</span>' +
    '<div class="kpi-value">' + value + '</div>' +
    '<div class="kpi-delta">' + (delta || '—') + '</div></div>';
}