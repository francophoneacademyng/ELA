/* ============================================================
   ELA - admin/pages/admin-payments.page.js
   Page « Paiements » (/admin/payments) — style Francophone
   Academy : bloc « Month to date · NGN … » + tableau Référence |
   Montant | Étudiant | Statut | Date, filtres par statut.
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { fmtNgn, formatDate, escapeHtml } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { getState } from '../services/admin-state.js';

var filter = 'all';

export function renderAdminPayments() {
  renderAdminShell({
    active: '#/admin/payments',
    title: t('admin.payments'),
    subtitle: t('admin.payments.subtitle'),
    renderContent: function (s) { return layoutHtml(s); },
    onBind: function (app) {
      app.querySelectorAll('[data-pay-filter]').forEach(function (b) {
        b.addEventListener('click', function () {
          filter = b.getAttribute('data-pay-filter') || 'all';
          renderAdminPayments();
        });
      });
    }
  });
}

function layoutHtml(s) {
  var all = s.transactions || [];
  var lists = {
    all: all,
    success: all.filter(function (t) { return t.status === 'success'; }),
    pending: all.filter(function (t) { return t.status === 'pending'; }),
    failed: all.filter(function (t) { return t.status === 'failed'; })
  };
  var items = lists[filter] || lists.all;

  /* Month to date : somme des paiements réussis du mois courant. */
  var monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  var mtd = lists.success.reduce(function (sum, t) {
    return sum + ((t.createdAt || 0) >= monthStart.getTime() ? (t.amount || 0) : 0);
  }, 0);

  var filters = [['all', t('admin.payments.filter.all')], ['success', t('admin.payments.filter.paid')], ['pending', t('admin.payments.filter.pending')], ['failed', t('admin.payments.filter.failed')]]
    .map(function (f) {
      return '<button class="filter-btn' + (filter === f[0] ? ' active' : '') +
        '" data-pay-filter="' + f[0] + '">' + f[1] + ' (' + lists[f[0]].length + ')</button>';
    }).join('');

  var body;
  if (!items.length) {
    body = '<div class="empty-state-premium">' +
      '<div style="font-size:48px;margin-bottom:16px;">💳</div>' +
      '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">' + t('admin.payments.empty.title') + '</h3>' +
      '<p style="margin:0;color:#6b7280;font-size:14px;">' + t('admin.payments.empty.body') + '</p></div>';
  } else {
    var rows = items.map(function (tx) {
      var u = (s.users || []).filter(function (x) { return x.id === tx.uid; })[0];
      var statusCls = tx.status === 'success' ? 'badge-general'
        : tx.status === 'pending' ? 'badge-pending' : 'badge-cancelled';
      var statusLabel = tx.status === 'success' ? t('dashboard.tx.success')
        : tx.status === 'pending' ? t('dashboard.tx.pending') : t('admin.status.cancelled');
      return '<tr>' +
        '<td style="font-family:monospace;font-size:13px;color:#6b7280;">' + escapeHtml(tx.id || '—') + '</td>' +
        '<td style="font-weight:600;">' + fmtNgn(tx.amount) + '</td>' +
        '<td><span class="user-name">' + escapeHtml(u ? u.displayName() : (tx.uid || '—')) + '</span></td>' +
        '<td><span class="badge-plan ' + statusCls + '">' + statusLabel + '</span></td>' +
        '<td style="color:#6b7280;font-size:13px;">' + formatDate(tx.createdAt) + '</td>' +
      '</tr>';
    }).join('');
    body = '<div class="table-responsive"><table class="data-table fa-style">' +
      '<thead><tr><th>' + t('admin.payments.col.reference') + '</th><th>' + t('admin.payments.col.amount') + '</th><th>' + t('admin.payments.col.student') + '</th><th>' + t('admin.col.status') + '</th><th>' + t('admin.col.date') + '</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  return '<div class="card">' +
      '<div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">' +
        t('admin.payments.monthToDate') + ' · <strong style="color:#111827;font-size:16px;">' + fmtNgn(mtd) + '</strong>' +
      '</div>' +
      '<div class="chart-filters" style="margin-bottom:1rem">' + filters + '</div>' +
      body +
    '</div>';
}
