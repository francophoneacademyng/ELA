/* ============================================================
   ELA - admin/pages/admin-live.page.js
   Page « Classes Live » (/admin/live) — tableau des classes
   programmées (30 jours glissants, données getAdminPanelData).
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, formatDateTime } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { getState } from '../services/admin-state.js';

var ACADEMY_FLAG = {
  french: '🇫🇷', german: '🇩🇪', mandarin: '🇨🇳',
  english: '🇬🇧', arabic: '🇸🇦', russian: '🇷🇺'
};
var ACADEMY_OPT = {
  french: 'francophone', german: 'germanophone', mandarin: 'sinophone',
  english: 'anglophone', arabic: 'arabophone', russian: 'russophone'
};

function academyShort(value) {
  var opt = ACADEMY_OPT[value];
  if (!opt) return escapeHtml(value || '—');
  return (ACADEMY_FLAG[value] || '') + ' ' + t('academies.option.' + opt);
}

function liveStatusLabel(status) {
  if (status === 'scheduled') return t('admin.live.status.scheduled');
  if (status === 'live') return t('admin.status.active');
  if (status === 'ended') return t('admin.completed');
  if (status === 'cancelled') return t('admin.status.cancelled');
  return String(status || '—');
}

function liveStatusClass(status) {
  return status === 'scheduled' ? 'badge-general' : 'badge-free';
}

export function renderAdminLive() {
  renderAdminShell({
    active: '#/admin/live',
    title: t('admin.live.title'),
    subtitle: t('admin.live.subtitle'),
    renderContent: function (s) { return layoutHtml(s.liveClasses || []); }
  });
}

function layoutHtml(liveClasses) {
  if (!liveClasses.length) {
    return '<div class="card"><div class="empty-state-premium">' +
      '<div style="font-size:48px;margin-bottom:16px;">🔴</div>' +
      '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">' + t('admin.live.empty.title') + '</h3>' +
      '<p style="margin:0;color:#6b7280;font-size:14px;">' + t('admin.live.empty.body') + '</p>' +
      '</div></div>';
  }
  const rows = liveClasses.map(function (l) {
    return '<tr>' +
      '<td><div class="user-cell"><span class="user-name">' + escapeHtml(l.title || '—') + '</span>' +
        '<span class="user-email">' + academyShort(l.academy) + '</span></div></td>' +
      '<td style="color:#6b7280;font-size:13px;">' + formatDateTime(l.scheduledAt) + '</td>' +
      '<td><span class="badge-plan ' + liveStatusClass(l.status) + '">' + liveStatusLabel(l.status) + '</span></td>' +
    '</tr>';
  }).join('');
  return '<div class="card"><div class="table-responsive"><table class="data-table fa-style">' +
    '<thead><tr><th>' + t('admin.live.col.session') + '</th><th>' + t('admin.live.col.datetime') + '</th><th>' + t('admin.live.col.status') + '</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div></div>';
}
