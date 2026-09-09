/* ============================================================
   ELA - admin/pages/admin-referrals.page.js
   Page « Parrainages » (/admin/referrals) — tableau Parrain |
   Filleul | Réduction | Date | Statut, dérivé des données réelles
   (users.referralCodeUsed + transactions.discount). Empty state
   premium si aucun parrainage.
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, formatDate } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { getState } from '../services/admin-state.js';

export function renderAdminReferrals() {
  renderAdminShell({
    active: '#/admin/referrals',
    title: t('admin.referrals.title'),
    subtitle: t('admin.referrals.subtitle'),
    renderContent: function (s) { return layoutHtml(s); }
  });
}

/** Construit les lignes de parrainage : un paiement avec remise
    (transactions.discount > 0, écrit par le webhook parrainage)
    = un filleul ayant utilisé un code parrain. */
function referralRows(s) {
  const rows = [];
  (s.transactions || []).forEach(function (t) {
    if (!t.discount || t.discount <= 0) return;
    const filleul = (s.users || []).filter(function (u) { return u.id === t.uid; })[0];
    rows.push({
      parrain: (filleul && filleul.referralCodeUsed) || 'Code parrain',
      filleul: filleul ? filleul.displayName() : (t.uid || '—'),
      reduction: t.discount,
      createdAt: t.createdAt,
      status: t.status
    });
  });
  return rows;
}

function layoutHtml(s) {
  const rows = referralRows(s);
  if (!rows.length) {
    return '<div class="card"><div class="empty-state-premium">' +
      '<div style="font-size:48px;margin-bottom:16px;">🎁</div>' +
      '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">' + t('admin.referrals.empty.title') + '</h3>' +
      '<p style="margin:0;color:#6b7280;font-size:14px;">' + t('admin.referrals.empty.body') + '</p>' +
      '</div></div>';
  }
  const body = rows.map(function (r) {
    return '<tr>' +
      '<td style="font-family:monospace;font-size:13px;color:#6b7280;">' + escapeHtml(r.parrain) + '</td>' +
      '<td><span class="user-name">' + escapeHtml(r.filleul) + '</span></td>' +
      '<td>NGN ' + Number(r.reduction).toLocaleString('en-NG') + '</td>' +
      '<td style="color:#6b7280;font-size:13px;">' + formatDate(r.createdAt) + '</td>' +
      '<td><span class="badge-plan ' + (r.status === 'success' ? 'badge-general' : 'badge-pending') + '">' +
        (r.status === 'success' ? t('admin.referrals.validated') : t('admin.status.pending')) + '</span></td>' +
    '</tr>';
  }).join('');
  return '<div class="card"><div class="table-responsive"><table class="data-table fa-style">' +
    '<thead><tr><th>' + t('admin.referrals.col.sponsor') + '</th><th>' + t('admin.referrals.col.godchild') + '</th>' +
    '<th>' + t('admin.referrals.col.discount') + '</th><th>' + t('admin.referrals.col.date') + '</th>' +
    '<th>' + t('admin.referrals.col.status') + '</th></tr></thead>' +
    '<tbody>' + body + '</tbody></table></div></div>';
}
