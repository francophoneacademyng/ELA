/* ============================================================
   ELA - teacher/pages/teacher-quizzes.page.js
   Page « Mes quiz » (/teacher/quizzes).
   Quiz de l'enseignant (soumissions type quiz) + bouton
   « + Nouveau quiz » → /teacher/quiz/new.
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { getState } from '../services/teacher-state.js';
import { refreshSubmissions } from '../services/submission.service.js';
import { TEACHER_BADGE_ICONS, TI } from '../components/teacher-icons.js';

export function renderTeacherQuizzes() {
  renderTeacherShell({
    active: '#/teacher/quizzes',
    title: t('teacher.quizzes.title'),
    subtitle: t('teacher.quizzes.subtitle'),
    renderContent: function () { return layoutHtml(); },
    onBind: function (app) {
      refreshSubmissions().then(repaint).catch(function () {
        toast(t('teacher.error.submit'), 'error');
      });
    }
  });
}

function repaint() {
  var app = document.getElementById('app');
  if (!app) return;
  var card = app.querySelector('[data-quiz-list]');
  if (card) card.innerHTML = listInner();
}

function layoutHtml() {
  return '<div class="card" data-quiz-list>' + listInner() + '</div>';
}

function listInner() {
  var list = (getState().submissions || []).filter(function (s) { return s.type === 'quiz'; });
  if (!list.length) {
    return '<div class="empty-state"><div class="empty-icon">' + TI.empty + '</div>' +
      '<p>' + t('teacher.quizzes.empty') + '</p>' +
      '<p class="empty-cta"><a class="btn-primary" href="#/teacher/quiz/new">' + t('teacher.quizzes.emptyCTA') + '</a></p></div>';
  }
  var rows = list.map(function (s) {
    return '<tr><td><span class="user-name">' + escapeHtml(s.title) + '</span></td>' +
      '<td>' + (s.createdAt ? formatDate(s.createdAt) : '—') + '</td>' +
      '<td>' + statusBadge(s.status) + '</td>' +
      '<td>' + (s.isApproved() ? '<span class="muted">' + t('teacher.quizzes.published') + '</span>'
        : '<span class="muted">' + t('teacher.quizzes.pending') + '</span>') + '</td></tr>';
  }).join('');
  return '<div class="table-responsive"><table class="data-table">' +
    '<thead><tr><th>' + t('admin.col.title') + '</th><th>' + t('admin.col.date') + '</th><th>' + t('admin.col.status') + '</th><th>' + t('teacher.courses.col.action') + '</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<div class="list-cta"><a class="btn-primary" href="#/teacher/quiz/new">' + t('teacher.quizzes.new') + '</a></div>';
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
