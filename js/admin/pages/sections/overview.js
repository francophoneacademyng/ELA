/* ============================================================
   ELA — admin/pages/sections/overview.js
   Section « Vue d'ensemble » : KPI + répartition par plan +
   académies + actions rapides.
   ============================================================ */

import { kpiCardHtml, revenueKpiHtml } from '../../components/kpi-card.js';
import { buildKpis, buildPlanBreakdown, buildAcademyOverview } from '../../services/admin-metrics.service.js';
import { t } from '../../../core/i18n-helpers.js';
import { getState } from '../../services/admin-state.js';

const ACADEMY_KEYS = ['german', 'mandarin', 'english', 'arabic', 'russian'];

export function overviewHtml() {
  const s = getState();
  const k = buildKpis(s);

  const kpis =
    revenueKpiHtml(t('admin.revenueThisMonth'), k.revenueThisMonth, k.revenueTrendPct) +
    kpiCardHtml({ label: t('admin.activeSubs'), value: String(k.activeSubs) }) +
    kpiCardHtml({ label: t('admin.users'), value: String(k.totalUsers) }) +
    kpiCardHtml({ label: t('admin.newUsers7d'), value: String(k.newUsers7d) });

  const plans = buildPlanBreakdown(s.subscriptions)
    .map(function (p) {
      return '<div class="plan-line"><span>' + p.plan + '</span><strong>' + p.count + '</strong></div>';
    }).join('') || '<p class="muted">—</p>';

  const academies = buildAcademyOverview(s.users, s.liveClasses, ACADEMY_KEYS)
    .map(function (a) {
      return '<div class="academy-card"><h4>' + a.academy + '</h4>' +
        '<p>' + t('admin.users') + ' : <strong>' + a.users + '</strong></p>' +
        '<p>' + t('admin.upcoming') + ' : <strong>' + a.live + '</strong></p></div>';
    }).join('');

  return '<section class="dashboard-section">' +
    '<div class="kpi-grid">' + kpis + '</div>' +
    '<h3>' + t('admin.activeSubs') + '</h3><div class="plan-lines">' + plans + '</div>' +
    '<h3>' + t('admin.academiesCount') + '</h3><div class="academy-grid">' + academies + '</div>' +
  '</section>';
}
