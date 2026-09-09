/* ============================================================
   ELA - admin/pages/admin-teachers.page.js
   Page « Gestion des enseignants » (/admin/teachers).
   Table : Nom | Académie | Statut. Données via getAdminPanelData.
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, formatDate } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { getState } from '../services/admin-state.js';
import { roleBadgeHtml } from '../components/badge.js';

var academyOptionKey = {
  fr: 'francophone', de: 'germanophone', zh: 'sinophone', en: 'anglophone', ar: 'arabophone', ru: 'russophone',
  french: 'francophone', german: 'germanophone', mandarin: 'sinophone', english: 'anglophone', arabic: 'arabophone', russian: 'russophone'
};

function academyLabel(value) {
  var k = academyOptionKey[value];
  if (k) return t('academies.option.' + k);
  return value ? String(value) : '—';
}

export function renderAdminTeachers() {
  renderAdminShell({
    active: '#/admin/teachers',
    title: t('admin.teachers.title'),
    subtitle: t('admin.teachers.subtitle'),
    renderContent: function (s) {
      const teachers = (s.users || []).filter(function (u) { return u.role === 'teacher'; });
      const rows = teachers.map(function (u) {
        return '<tr><td><span class="user-name">' + escapeHtml(u.displayName()) + '</span></td>' +
          '<td><span class="user-email">' + escapeHtml(u.email) + '</span></td>' +
          '<td>' + academyLabel(u.academy) + '</td>' +
          '<td>' + roleBadgeHtml(u.role) + '</td>' +
          '<td>' + formatDate(u.createdAt) + '</td></tr>';
      }).join('');
      return '<div class="card">' +
        '<div class="table-responsive"><table class="data-table fa-style">' +
          '<thead><tr><th>' + t('admin.name') + '</th><th>' + t('admin.email') + '</th><th>' + t('admin.academy') + '</th><th>' + t('admin.role') + '</th><th>' + t('admin.teachers.col.since') + '</th></tr></thead>' +
          '<tbody>' + (rows || '<tr><td colspan="5" class="muted">—</td></tr>') + '</tbody>' +
        '</table></div>' +
        (teachers.length ? '' :
          '<div class="empty-state"><div class="empty-icon">🧑‍🏫</div>' +
          '<p>' + t('admin.teachers.empty') + '</p></div>') +
      '</div>';
    }
  });
}