/* ============================================================
   ELA - admin/pages/admin-whatsapp.page.js
   Page « WhatsApp » (/admin/whatsapp) — log LIVE des envois
   (Date | Type | Numéro | Statut | Modèle | Détail) via le
   callable getWhatsAppLogs. Empty state premium si vide.
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, formatDateTime } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';

export function renderAdminWhatsApp() {
  renderAdminShell({
    active: '#/admin/whatsapp',
    title: 'WhatsApp 💬',
    subtitle: 'Notifications et messages automatisés.',
    renderContent: function () { return layoutHtml(null); },
    onBind: function () { loadLogs(); }
  });
}

function loadLogs() {
  callFunction('getWhatsAppLogs', {}).then(function (d) {
    paintBody((d && d.logs) || []);
  }).catch(function () {
    paintBody(null);
  });
}

function layoutHtml(loading) {
  return '<div class="card">' +
    '<div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">' +
      'Mode : <strong style="color:#10b981;">LIVE</strong>' +
    '</div>' +
    '<div class="table-responsive"><table class="data-table fa-style">' +
      '<thead><tr><th>DATE</th><th>TYPE</th><th>NUMÉRO</th><th>STATUT</th><th>MODÈLE</th><th>DÉTAIL</th></tr></thead>' +
      '<tbody id="whatsapp-tbody"><tr><td colspan="6" style="text-align:center;padding:48px;color:#6b7280;">' +
        (loading === null ? 'Chargement…' : '') + '</td></tr></tbody>' +
    '</table></div>' +
    '<div class="empty-state-premium" id="whatsapp-empty" style="display:none;">' +
      '<div style="font-size:48px;margin-bottom:16px;">💬</div>' +
      '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucune activité WhatsApp</h3>' +
      '<p style="margin:0;color:#6b7280;font-size:14px;">Les logs d\'envoi apparaîtront ici.</p>' +
    '</div>' +
  '</div>';
}

function paintBody(logs) {
  const tbody = document.getElementById('whatsapp-tbody');
  const empty = document.getElementById('whatsapp-empty');
  if (!tbody) return;
  if (!logs || !logs.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  tbody.innerHTML = logs.map(function (l) {
    const cls = l.status === 'sent' ? 'badge-general' : l.status === 'failed' ? 'badge-cancelled' : 'badge-pending';
    return '<tr>' +
      '<td style="color:#6b7280;font-size:13px;">' + formatDateTime(l.createdAt) + '</td>' +
      '<td>' + escapeHtml(l.type || '—') + '</td>' +
      '<td style="font-family:monospace;font-size:13px;">' + escapeHtml(l.to || '—') + '</td>' +
      '<td><span class="badge-plan ' + cls + '">' + escapeHtml(l.status || '—') + '</span></td>' +
      '<td style="color:#6b7280;font-size:13px;">' + escapeHtml(l.template || '—') + '</td>' +
      '<td style="color:#6b7280;font-size:13px;">' + escapeHtml(l.detail || '—') + '</td>' +
    '</tr>';
  }).join('');
}
