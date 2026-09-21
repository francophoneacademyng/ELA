/* ============================================================
   ELA - teacher/pages/teacher-stats.page.js
   Page « Mes statistiques » (/teacher/stats).
   KPIs issus du callable getTeacherStats (stats + recent) :
   contenus approuvés / en attente / répartis par type, et
   activité récente. Aucune donnée inventée.
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { t } from '../../core/i18n-helpers.js';
import { TI, TEACHER_BADGE_ICONS } from '../components/teacher-icons.js';

function typeLabel(type) {
  var key = type === 'lesson' ? 'teacher.type.lesson' : type === 'quiz' ? 'teacher.type.quiz' : type === 'live' ? 'teacher.type.live' : null;
  return key ? t(key) : (type || '—');
}

export function renderTeacherStats() {
  renderTeacherShell({
    active: '#/teacher/stats',
    title: t('teacher.stats.title'),
    subtitle: t('teacher.stats.subtitle'),
    renderContent: function () {
      return '<div class="card" data-stats-box>' +
        '<div class="empty-state"><div class="empty-icon">' + TI.clock + '</div><p>' + t('teacher.students.loading') + '</p></div></div>';
    },
    onBind: function () {
      callFunction('getTeacherStats').then(function (r) {
        paint(r || {});
      }).catch(function () {
        toast(t('teacher.error.submit'), 'error');
        paint({});
      });
    }
  });
}

function paint(r) {
  var box = document.querySelector('[data-stats-box]');
  if (!box) return;
  var s = r.stats || {};
  var recent = r.recent || [];
  var byType = s.byType || {};
  var total = (s.approved || 0) + (s.pending || 0) + (s.rejected || 0);

  var kpis =
    kpi(t('teacher.stats.kpi.approved'), s.approved || 0) +
    kpi(t('teacher.stats.kpi.pending'), s.pending || 0) +
    kpi(t('teacher.stats.kpi.total'), total) +
    kpi(t('teacher.stats.kpi.live'), byType.live || 0);

  var recentHtml;
  if (!recent.length) {
    recentHtml = '<div class="empty-state"><div class="empty-icon">' + TI.chart + '</div>' +
      '<p>' + t('teacher.stats.empty') + '</p>' +
      '<p class="empty-sub">' + t('teacher.stats.emptySub') + '</p></div>';
  } else {
    var rows = recent.map(function (x) {
      return '<tr><td><span class="user-name">' + escapeHtml(x.title) + '</span></td>' +
        '<td>' + typeLabel(x.type) + '</td>' +
        '<td>' + (x.createdAt ? formatDate(x.createdAt) : '—') + '</td>' +
        '<td>' + statusBadge(x.status) + '</td></tr>';
    }).join('');
    recentHtml = '<div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>' + t('admin.content.col.title') + '</th><th>' + t('admin.content.col.type') + '</th><th>' + t('admin.col.date') + '</th><th>' + t('admin.col.status') + '</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  box.innerHTML = '<section class="kpi-grid">' + kpis + '</section>' +
    '<section class="dashboard-section-title">' + t('teacher.stats.activity') + '</section>' + recentHtml;
}

function kpi(label, value) {
  return '<div class="kpi-card"><span class="kpi-label">' + label + '</span>' +
    '<div class="kpi-value">' + value + '</div><div class="kpi-delta">—</div></div>';
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
