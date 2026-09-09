/* ============================================================
   ELA - teacher/pages/teacher-students.page.js
   Page « Mes étudiants » (/teacher/students).
   Suivi des étudiants inscrits aux contenus de l'enseignant.
   Source de données : getTeacherStats (côté serveur). Si aucun
   suivi n'est disponible, empty state (pas de placeholder).
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { callFunction } from '../../core/api-client.js';

export function renderTeacherStudents() {
  renderTeacherShell({
    active: '#/teacher/students',
    title: 'Mes étudiants 👥',
    subtitle: 'Progression et activité de vos apprenants.',
    renderContent: function () {
      return '<div class="card" data-students-list>' +
        '<div class="empty-state"><div class="empty-icon">⏳</div><p>Chargement…</p></div>' +
      '</div>';
    },
    onBind: function () {
      callFunction('getTeacherStats').then(function (r) {
        paint(r || {});
      }).catch(function () {
        paint({});
      });
    }
  });
}

function paint(r) {
  var box = document.querySelector('[data-students-list]');
  if (!box) return;
  var students = r.students || [];
  if (!students.length) {
    box.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div>' +
      '<p>Aucun étudiant inscrit à vos contenus pour le moment.</p>' +
      '<p class="empty-sub">Dès qu\'un étudiant suivra vos cours, sa progression apparaîtra ici.</p></div>';
    return;
  }
  var rows = students.map(function (st) {
    return '<tr><td><span class="user-name">' + esc(st.displayName || st.name || '—') + '</span></td>' +
      '<td><span class="user-email">' + esc(st.email || '—') + '</span></td>' +
      '<td>' + (typeof st.progress === 'number' ? st.progress + ' %' : '—') + '</td>' +
      '<td>' + (st.lastActive ? new Date(st.lastActive).toLocaleDateString('fr-FR') : '—') + '</td></tr>';
  }).join('');
  box.innerHTML = '<div class="table-responsive"><table class="data-table">' +
    '<thead><tr><th>Nom</th><th>Email</th><th>Progression</th><th>Dernière activité</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
  });
}