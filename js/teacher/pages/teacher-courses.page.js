/* ============================================================
   ELA - teacher/pages/teacher-courses.page.js
   Page « Mes cours » (/teacher/courses).
   Leçons de l'enseignant (soumissions type lesson) avec statut
   de validation + bouton « + Nouveau cours ».
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { getState } from '../services/teacher-state.js';
import { refreshSubmissions } from '../services/submission.service.js';
import { TEACHER_BADGE_ICONS, TI } from '../components/teacher-icons.js';

var filter = 'all';

export function renderTeacherCourses() {
  renderTeacherShell({
    active: '#/teacher/courses',
    title: t('teacher.courses.title'),
    subtitle: t('teacher.courses.subtitle'),
    renderContent: function () { return layoutHtml(); },
    onBind: function (app) {
      app.querySelectorAll('[data-course-filter]').forEach(function (b) {
        b.addEventListener('click', function () {
          filter = b.getAttribute('data-course-filter') || 'all';
          repaint();
        });
      });
      refreshSubmissions().then(repaint).catch(function () {
        toast(t('teacher.error.submit'), 'error');
      });
    }
  });
}

function repaint() {
  var app = document.getElementById('app');
  if (!app) return;
  var card = app.querySelector('[data-course-list]');
  if (card) card.innerHTML = listInner();
}

function items() {
  var subs = (getState().submissions || []).filter(function (s) { return s.type === 'lesson'; });
  if (filter === 'all') return subs;
  return subs.filter(function (s) { return s.status === filter; });
}

function layoutHtml() {
  return '<div class="card" data-course-list>' + listInner() + '</div>';
}

function filterLabel(f) {
  return f[0] === 'all' ? t('admin.content.filter.all')
    : f[0] === 'approved' ? t('teacher.status.approved')
    : f[0] === 'pending' ? t('teacher.status.pending')
    : t('teacher.status.rejected');
}

function listInner() {
  var list = items();
  var counts = { all: 0, approved: 0, pending: 0, rejected: 0 };
  (getState().submissions || []).forEach(function (s) {
    if (s.type !== 'lesson') return;
    counts.all++; counts[s.status] = (counts[s.status] || 0) + 1;
  });

  var filters = [['all', filterLabel(['all'])], ['approved', filterLabel(['approved'])], ['pending', filterLabel(['pending'])], ['rejected', filterLabel(['rejected'])]]
    .map(function (f) {
      return '<button class="filter-btn' + (filter === f[0] ? ' active' : '') +
        '" data-course-filter="' + f[0] + '">' + f[1] + ' (' + (counts[f[0]] || 0) + ')</button>';
    }).join('');

  var body;
  if (!list.length) {
    body = '<div class="empty-state"><div class="empty-icon">' + TI.empty + '</div>' +
      '<p>' + t('teacher.courses.empty') + '</p>' +
      '<p class="empty-cta"><a class="btn-primary" href="#/teacher/lesson/new">' + t('teacher.courses.emptyCTA') + '</a></p></div>';
  } else {
    var rows = list.map(function (s) {
      return '<tr><td><span class="user-name">' + escapeHtml(s.title) + '</span></td>' +
        '<td>' + (s.createdAt ? formatDate(s.createdAt) : '—') + '</td>' +
        '<td>' + statusBadge(s.status) + '</td>' +
        '<td>' + (s.isApproved() ? '<span class="muted">' + t('teacher.courses.published') + '</span>'
          : '<span class="muted">' + t('teacher.courses.pending') + '</span>') + '</td></tr>';
    }).join('');
    body = '<div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>' + t('admin.col.title') + '</th><th>' + t('admin.col.date') + '</th><th>' + t('admin.col.status') + '</th><th>' + t('teacher.courses.col.action') + '</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  return '<div class="chart-filters">' + filters + '</div>' + body +
    '<div class="list-cta"><a class="btn-primary" href="#/teacher/lesson/new">' + t('teacher.courses.new') + '</a></div>';
}

function statusBadge(status) {
  var map = {
    pending: ['badge-wait', t('teacher.status.pending'), TEACHER_BADGE_ICONS.pending],
    approved: ['badge-ok', t('teacher.status.approved'), TEACHER_BADGE_ICONS.approved],
    rejected: ['badge-ko', t('teacher.status.rejected'), TEACHER_BADGE_ICONS.rejected]
  };
  var m = map[status] || ['badge-muted', String(status || '—'), ''];
  return '<span class="badge ' + m[0] + '">' + (m[2] ? m[2] + ' ' : '') + m[1] + '</span>';
}
