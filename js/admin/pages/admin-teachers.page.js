/* ============================================================
   ELA - admin/pages/admin-teachers.page.js
   Page « Gestion des enseignants » (/admin/teachers).
   Table : Nom | Académie | Statut. Données via getAdminPanelData.
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, formatDate } from '../../core/dom.js';
import { getState } from '../services/admin-state.js';
import { roleBadgeHtml } from '../components/badge.js';

var academyMap = {
  fr: 'Francophone Academy',
  de: 'Germanophone Academy',
  zh: 'Sinophone Academy',
  en: 'Anglophone Pro Academy',
  ar: 'Arabophone Academy',
  ru: 'Russophone Academy',
  french: 'Francophone Academy',
  german: 'Germanophone Academy',
  mandarin: 'Sinophone Academy',
  english: 'Anglophone Pro Academy',
  arabic: 'Arabophone Academy',
  russian: 'Russophone Academy'
};

export function renderAdminTeachers() {
  renderAdminShell({
    active: '#/admin/teachers',
    title: 'Gestion des enseignants 👨‍🏫',
    subtitle: 'Tous les comptes enseignant de la plateforme.',
    renderContent: function (s) {
      const teachers = (s.users || []).filter(function (u) { return u.role === 'teacher'; });
      const rows = teachers.map(function (u) {
        return '<tr><td>' + escapeHtml(u.displayName()) + '</td>' +
          '<td>' + escapeHtml(u.email) + '</td>' +
          '<td>' + (academyMap[u.academy] || escapeHtml(u.academy) || '—') + '</td>' +
          '<td>' + roleBadgeHtml(u.role) + '</td>' +
          '<td>' + formatDate(u.createdAt) + '</td></tr>';
      }).join('');
      return '<div class="card">' +
        '<div class="table-responsive"><table class="data-table fa-style">' +
          '<thead><tr><th>Nom</th><th>Email</th><th>Académie</th><th>Rôle</th><th>Membre depuis</th></tr></thead>' +
          '<tbody>' + (rows || '<tr><td colspan="5" class="muted">—</td></tr>') + '</tbody>' +
        '</table></div>' +
        (teachers.length ? '' :
          '<div class="empty-state"><div class="empty-icon">🧑‍🏫</div>' +
          '<p>Aucun enseignant enregistré pour le moment.</p></div>') +
      '</div>';
    }
  });
}