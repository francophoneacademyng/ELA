/* ============================================================
   ELA — admin/pages/sections/users.js
   Table utilisateurs + recherche client + parrainage.
   ============================================================ */

import { roleBadgeHtml } from '../../components/badge.js';
import { t } from '../../../core/i18n-helpers.js';
import { escapeHtml, formatDate, fmtNaira } from '../../../core/dom.js';
import { ReferralStats } from '../../models/referral-stats.model.js';
import { getState } from '../../services/admin-state.js';

export function usersHtml(query) {
  const s = getState();
  const q = String(query || '');
  const rows = s.users.filter(function (u) { return u.matches(q); }).map(function (u) {
    return '<tr><td>' + escapeHtml(u.displayName()) + '</td>' +
      '<td>' + escapeHtml(u.email) + '</td>' +
      '<td>' + roleBadgeHtml(u.role) + '</td>' +
      '<td>' + (u.academy ? escapeHtml(u.academy) : '—') + '</td>' +
      '<td>' + formatDate(u.createdAt) + '</td></tr>';
  }).join('') || '<tr><td colspan="5" class="muted">—</td></tr>';

  const ref = ReferralStats.fromUsers(s.users);
  const referrals =
    '<div class="kpi-grid">' +
    '<div class="kpi-card"><span class="kpi-label">' + t('admin.referralsUsed') + '</span>' +
      '<strong class="kpi-value">' + ref.codesUsed + '</strong></div>' +
    '<div class="kpi-card"><span class="kpi-label">' + t('admin.referralCredits') + '</span>' +
      '<strong class="kpi-value">' + fmtNaira(ref.creditsTotal) + '</strong></div>' +
    '</div>';

  return '<section class="dashboard-section">' +
    '<input type="search" id="admin-users-search" class="input" placeholder="' +
      t('admin.searchUsers') + '" value="' + escapeHtml(q) + '">' +
    '<table class="dash-table"><thead><tr>' +
      '<th>' + t('admin.name') + '</th><th>Email</th><th>' + t('admin.role') + '</th>' +
      '<th>' + t('admin.academy') + '</th><th>' + t('admin.date') + '</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>' +
    '<h3>' + t('admin.referrals') + '</h3>' + referrals +
  '</section>';
}
