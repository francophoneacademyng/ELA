/* ============================================================
   ELA - admin/pages/admin-live.page.js
   Page « Classes Live » (/admin/live) — tableau des classes
   programmées (30 jours glissants, données getAdminPanelData).
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, formatDateTime } from '../../core/dom.js';
import { getState } from '../services/admin-state.js';

var ACADEMY_LABEL = {
  french: '🇫🇷 Francophone', german: '🇩🇪 Germanophone', mandarin: '🇨🇳 Sinophone',
  english: '🇬🇧 Anglophone Pro', arabic: '🇸🇦 Arabophone', russian: '🇷🇺 Russophone'
};

export function renderAdminLive() {
  renderAdminShell({
    active: '#/admin/live',
    title: 'Classes Live 🔴',
    subtitle: 'Sessions programmées sur les 30 prochains jours.',
    renderContent: function (s) { return layoutHtml(s.liveClasses || []); }
  });
}

function layoutHtml(liveClasses) {
  if (!liveClasses.length) {
    return '<div class="card"><div class="empty-state-premium">' +
      '<div style="font-size:48px;margin-bottom:16px;">🔴</div>' +
      '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucune classe live programmée</h3>' +
      '<p style="margin:0;color:#6b7280;font-size:14px;">Les sessions apparaîtront ici dès leur programmation par les enseignants.</p>' +
      '</div></div>';
  }
  const rows = liveClasses.map(function (l) {
    return '<tr>' +
      '<td><div class="user-cell"><span class="user-name">' + escapeHtml(l.title || '—') + '</span>' +
        '<span class="user-email">' + (ACADEMY_LABEL[l.academy] || escapeHtml(l.academy || '—')) + '</span></div></td>' +
      '<td style="color:#6b7280;font-size:13px;">' + formatDateTime(l.scheduledAt) + '</td>' +
      '<td><span class="badge-plan ' + (l.status === 'scheduled' ? 'badge-general' : 'badge-free') + '">' +
        escapeHtml(l.status || '—') + '</span></td>' +
    '</tr>';
  }).join('');
  return '<div class="card"><div class="table-responsive"><table class="data-table fa-style">' +
    '<thead><tr><th>SESSION</th><th>DATE & HEURE</th><th>STATUT</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div></div>';
}
