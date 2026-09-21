/* ============================================================
   ELA - teacher/pages/teacher-students.page.js
   Page « Mes étudiants » (/teacher/students).
   Suivi des étudiants inscrits aux contenus de l'enseignant.
   Source de données : getTeacherStats (côté serveur). Si aucun
   suivi n'est disponible, empty state (pas de placeholder).
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { callFunction } from '../../core/api-client.js';
import { formatDate } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { TI } from '../components/teacher-icons.js';

export function renderTeacherStudents() {
  renderTeacherShell({
    active: '#/teacher/students',
    title: t('teacher.students.title'),
    subtitle: t('teacher.students.subtitle'),
    renderContent: function () {
      return '<div class="card" data-students-list>' +
        '<div class="empty-state"><div class="empty-icon">' + TI.clock + '</div><p>' + t('teacher.students.loading') + '</p></div>' +
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
    box.innerHTML = '<div class="empty-state"><div class="empty-icon">' + TI.users + '</div>' +
      '<p>' + t('teacher.students.empty') + '</p>' +
      '<p class="empty-sub">' + t('teacher.students.emptySub') + '</p></div>';
    return;
  }
  var rows = students.map(function (st) {
    return '<tr><td><span class="user-name">' + esc(st.displayName || st.name || '—') + '</span></td>' +
      '<td><span class="user-email">' + esc(st.email || '—') + '</span></td>' +
      '<td>' + (typeof st.progress === 'number' ? st.progress + ' %' : '—') + '</td>' +
      '<td>' + (st.lastActive ? formatDate(st.lastActive) : '—') + '</td></tr>';
  }).join('');
  box.innerHTML = '<div class="table-responsive"><table class="data-table">' +
    '<thead><tr><th>' + t('admin.name') + '</th><th>' + t('admin.email') + '</th><th>' + t('dashboard.progress') + '</th><th>' + t('teacher.students.col.lastActive') + '</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
  });
}
