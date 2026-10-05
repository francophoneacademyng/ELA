/* ============================================================
   ELA - teacher/pages/teacher-attendance.page.js
   Page « Présence » (/teacher/attendance).
   Connecte le moteur de présence existant (functions/attendance.js)
   à l'espace enseignant : liste des sessions, planification,
   démarrage, rapport de présence. Le serveur reste l'autorité
   (join/leave/validate/correct) ; aucune présence n'est fabriquée
   côté client. Affichage honnête si aucune donnée n'existe.
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, formatDateTime, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { t } from '../../core/i18n-helpers.js';
import { TI } from '../components/teacher-icons.js';

export function renderTeacherAttendance() {
  renderTeacherShell({
    active: '#/teacher/attendance',
    title: t('teacher.attendance.title', 'Attendance'),
    subtitle: t('teacher.attendance.subtitle', 'Live session presence for your classes.'),
    renderContent: function () {
      return '<div class="card" data-att-list>' + loadingHtml() + '</div>';
    },
    onBind: function () {
      load();
    }
  });
}

function loadingHtml() {
  return '<div class="empty-state"><div class="empty-icon">' + TI.clock + '</div><p>' + t('teacher.attendance.loading', 'Loading…') + '</p></div>';
}

function load() {
  var box = document.querySelector('[data-att-list]');
  if (!box) return;
  box.innerHTML = loadingHtml();
  callFunction('listClassSessions').then(function (r) {
    paint(r && r.sessions ? r.sessions : []);
  }).catch(function () {
    paintError();
  });
}

function paintError() {
  var box = document.querySelector('[data-att-list]');
  if (box) box.innerHTML = '<div class="empty-state"><div class="empty-icon">' + TI.empty + '</div><p>' + t('teacher.attendance.error', 'Could not load sessions.') + '</p></div>';
}

function paint(sessions) {
  var box = document.querySelector('[data-att-list]');
  if (!box) return;
  var body;
  if (!sessions.length) {
    body = '<div class="empty-state"><div class="empty-icon">' + TI.users + '</div>' +
      '<p>' + t('teacher.attendance.empty', 'No attendance sessions yet.') + '</p>' +
      '<p class="empty-sub">' + t('teacher.attendance.emptySub', 'Schedule a live session to start tracking presence.') + '</p></div>';
  } else {
    var rows = sessions.map(function (s) {
      return '<tr><td><span class="user-name">' + escapeHtml(s.title) + '</span></td>' +
        '<td>' + (s.scheduledAt ? formatDateTime(s.scheduledAt) : '—') + '</td>' +
        '<td>' + statusBadge(s.status) + '</td>' +
        '<td>' +
          '<button class="btn btn-outline btn-sm" data-report="' + escapeHtml(s.id) + '">' + t('teacher.attendance.viewReport', 'Report') + '</button> ' +
          (s.status === 'scheduled' ? '<button class="btn btn-outline btn-sm" data-start="' + escapeHtml(s.id) + '">' + t('teacher.attendance.start', 'Start') + '</button>' : '') +
        '</td></tr>';
    }).join('');
    body = '<div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>' + t('admin.col.title', 'Title') + '</th><th>' + t('teacher.attendance.col.scheduled', 'Scheduled') + '</th><th>' + t('admin.col.status', 'Status') + '</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  box.innerHTML = body +
    '<section class="card" style="margin-top:1rem">' +
      '<h3>' + t('teacher.attendance.schedule', 'Schedule a session') + '</h3>' +
      '<form id="att-schedule-form">' +
        '<input class="input" type="text" id="att-title" placeholder="' + t('teacher.attendance.schedule.title', 'Session title') + '" autocomplete="off">' +
        '<input class="input" type="datetime-local" id="att-when">' +
        '<button class="btn btn-solid" type="submit">' + t('teacher.attendance.schedule.submit', 'Schedule') + '</button>' +
      '</form>' +
    '</section>' +
    '<div id="att-report"></div>';

  box.querySelectorAll('[data-report]').forEach(function (btn) {
    btn.addEventListener('click', function () { loadReport(btn.getAttribute('data-report')); });
  });
  box.querySelectorAll('[data-start]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      callFunction('startClassSession', { sessionId: btn.getAttribute('data-start') }).then(function () {
        toast(t('teacher.attendance.start.success', 'Session started.'), 'success');
        load();
      }).catch(function () {
        toast(t('teacher.attendance.error', 'Could not start session.'), 'error');
      });
    });
  });

  var form = document.getElementById('att-schedule-form');
  if (form) form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var title = (document.getElementById('att-title') || {}).value;
    var when = (document.getElementById('att-when') || {}).value;
    if (!title || !when) { toast(t('teacher.attendance.schedule.error', 'Title and date are required.'), 'error'); return; }
    callFunction('scheduleClassSession', { title: String(title).trim(), scheduledAt: new Date(when).toISOString() }).then(function () {
      toast(t('teacher.attendance.schedule.success', 'Session scheduled.'), 'success');
      document.getElementById('att-title').value = '';
      document.getElementById('att-when').value = '';
      load();
    }).catch(function () {
      toast(t('teacher.attendance.schedule.error', 'Could not schedule session.'), 'error');
    });
  });
}

function loadReport(sessionId) {
  var host = document.getElementById('att-report');
  if (!host) return;
  host.innerHTML = '<div class="empty-state"><div class="empty-icon">' + TI.clock + '</div><p>' + t('teacher.attendance.loading', 'Loading…') + '</p></div>';
  callFunction('getAttendanceReport', { sessionId: sessionId }).then(function (r) {
    var records = (r && r.records) || [];
    var summary = (r && r.summary) || {};
    if (!records.length) {
      host.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-icon">' + TI.users + '</div>' +
        '<p>' + t('teacher.attendance.report.empty', 'No attendance recorded for this session yet.') + '</p></div></div>';
      return;
    }
    var rows = records.map(function (rec) {
      return '<tr><td>' + escapeHtml(rec.studentId) + '</td>' +
        '<td>' + statusBadge(rec.status) + '</td>' +
        '<td>' + (rec.joinedAt ? formatDateTime(rec.joinedAt) : '—') + '</td></tr>';
    }).join('');
    host.innerHTML = '<div class="card"><h3>' + t('teacher.attendance.report.title', 'Attendance report') + '</h3>' +
      '<p class="muted">' + t('teacher.attendance.report.summary', 'Present') + ': ' + (summary.present || 0) + ' / ' + (summary.total || 0) + '</p>' +
      '<div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>' + t('admin.users.col.id', 'Student') + '</th><th>' + t('admin.col.status', 'Status') + '</th><th>' + t('teacher.attendance.col.scheduled', 'Joined') + '</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>';
  }).catch(function () {
    host.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-icon">' + TI.empty + '</div>' +
      '<p>' + t('teacher.attendance.error', 'Could not load report.') + '</p></div></div>';
  });
}

function statusBadge(status) {
  var map = {
    scheduled: ['badge-wait', t('admin.live.status.scheduled', 'Scheduled')],
    live: ['badge-ok', t('admin.liveNow', 'Live')],
    ended: ['badge-muted', t('admin.completed', 'Ended')],
    present: ['badge-ok', t('teacher.status.approved', 'Present')],
    late: ['badge-wait', 'Late'],
    absent: ['badge-ko', 'Absent'],
    excused: ['badge-muted', 'Excused']
  };
  var m = map[status] || ['badge-muted', String(status || '—')];
  return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
}
