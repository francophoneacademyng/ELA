/* ============================================================
   ELA — admin/services/admin-metrics.service.js
   Calculs purs du dashboard admin (testables, sans DOM ni I/O).
   Les montants proviennent TOUJOURS des transactions serveur.
   ============================================================ */

/** KPI principaux. metrics vient du callable getAdminPanelData. */
export function buildKpis(data) {
  const m = (data && data.metrics) || {};
  const prev = m.revenuePrevMonth || 0;
  const cur = m.revenueThisMonth || 0;
  return {
    totalUsers: (data && data.users ? data.users.length : 0),
    activeSubs: m.activeSubs || 0,
    revenueThisMonth: cur,
    newUsers7d: m.newUsers7d || 0,
    revenueTrendPct: prev > 0 ? Math.round(((cur - prev) / prev) * 100) : (cur > 0 ? 100 : 0)
  };
}

/**
 * Série de revenus pour le graphe SVG.
 * @param {Payment[]} transactions
 * @param {number} days 7 | 30 | 90
 * @returns {{label:string,total:number}[]} un point par jour (asc)
 */
export function buildRevenueSeries(transactions, days) {
  const n = days === 7 || days === 90 ? days : 30;
  const byDay = {};
  (transactions || []).forEach(function (tx) {
    if (!tx.isSuccessful() || !tx.createdAt) return;
    byDay[tx.dayKey()] = (byDay[tx.dayKey()] || 0) + tx.amount;
  });
  const out = [];
  const start = new Date(); start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
    out.push({
      label: (d.getMonth() + 1) + '/' + d.getDate(),
      total: byDay[key] || 0
    });
  }
  return out;
}

/** Répartition des abonnements actifs par plan → [{plan,count}]. */
export function buildPlanBreakdown(subscriptions) {
  const byPlan = {};
  (subscriptions || []).forEach(function (s) {
    if (s.isActive()) byPlan[s.plan] = (byPlan[s.plan] || 0) + 1;
  });
  return Object.keys(byPlan).sort().map(function (p) {
    return { plan: p, count: byPlan[p] };
  });
}

/** Vue par académie (users + live à venir). */
export function buildAcademyOverview(users, liveClasses, academyKeys) {
  const stats = {};
  (academyKeys || []).forEach(function (a) { stats[a] = { users: 0, live: 0 }; });
  (users || []).forEach(function (u) {
    if (u.academy && stats[u.academy]) stats[u.academy].users++;
  });
  (liveClasses || []).forEach(function (l) {
    if (l.academy && stats[l.academy]) stats[l.academy].live++;
  });
  return Object.keys(stats).map(function (a) {
    return { academy: a, users: stats[a].users, live: stats[a].live };
  });
}
