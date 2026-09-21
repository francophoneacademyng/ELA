/* ============================================================
   ELA - teacher/pages/teacher-live-list.page.js
   Page « Mes classes Live » (/teacher/live).
   Classes live de l'enseignant (soumissions type live) + bouton
   « + Nouvelle classe » → /teacher/live/new. Le lien de
   réunion est communiqué aux étudiants après validation.
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { getState } from '../services/teacher-state.js';
import { refreshSubmissions } from '../services/submission.service.js';
import { TI, TEACHER_BADGE_ICONS } from '../components/teacher-icons.js';

export function renderTeacherLiveList() {
  renderTeacherShell({
    active: '#/teacher/live',
    title: t('teacher.live.listTitle'),
    subtitle: t('teacher.live.listSubtitle'),
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
  var card = app.querySelector('[data-live-list]');
  if (card) card.innerHTML = listInner();
}

function layoutHtml() {
  return '<div class="card" data-live-list>' + listInner() + '</div>';
}

function listInner() {
  var list = (getState().submissions || []).filter(function (s) { return s.type === 'live'; });
  if (!list.length) {
    return '<div class="empty-state"><div class="empty-icon">' + TI.live + '</div>' +
      '<p>' + t('teacher.live.empty') + '</p>' +
      '<p class="empty-cta"><a class="btn-primary" href="#/teacher/live/new">' + t('teacher.live.emptyCTA') + '</a></p></div>';
  }
  var rows = list.map(function (s) {
    return '<tr><td><span class="user-name">' + escapeHtml(s.title) + '</span></td>' +
      '<td>' + (s.createdAt ? formatDate(s.createdAt) : '—') + '</td>' +
      '<td>' + (s.isApproved() ? '<span class="muted">' + t('teacher.live.published') + '</span>'
        : '<span class="muted">' + t('teacher.live.pending') + '</span>') + '</td>' +
      '<td>' + statusBadge(s.status) + '</td></tr>';
  }).join('');
  return '<div class="table-responsive"><table class="data-table">' +
    '<thead><tr><th>' + t('admin.col.title') + '</th><th>' + t('admin.col.date') + '</th><th>' + t('teacher.live.col.link') + '</th><th>' + t('admin.col.status') + '</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<div class="list-cta"><a class="btn-primary" href="#/teacher/live/new">' + t('teacher.live.new') + '</a></div>';
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
