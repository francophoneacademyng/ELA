/* ============================================================
   ELA - teacher/pages/teacher-progress.page.js
   Page « Progression » (/teacher/progress).
   Réutilise le backend existant : getTeacherStats (roster des
   élèves, isolé par académie) + getAcademicRecord (dossier
   académique serveur). Aucune nouvelle logique de calcul ; aucune
   donnée inventée. Affiche un état vide honnête si aucun élève.
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { t } from '../../core/i18n-helpers.js';
import { TI } from '../components/teacher-icons.js';

export function renderTeacherProgress() {
  renderTeacherShell({
    active: '#/teacher/progress',
    title: t('teacher.progress.title', 'Progress'),
    subtitle: t('teacher.progress.subtitle', 'Learner progress and academic records.'),
    renderContent: function () {
      return '<div class="card" data-progress-list>' + loadingHtml() + '</div>' +
        '<div id="progress-record"></div>';
    },
    onBind: function () {
      load();
    }
  });
}

function loadingHtml() {
  return '<div class="empty-state"><div class="empty-icon">' + TI.clock + '</div><p>' + t('teacher.progress.loading', 'Loading…') + '</p></div>';
}

function load() {
  var box = document.querySelector('[data-progress-list]');
  if (!box) return;
  box.innerHTML = loadingHtml();
  callFunction('getTeacherStats').then(function (r) {
    paint(r && r.students ? r.students : []);
  }).catch(function () {
    paintError();
  });
}

function paintError() {
  var box = document.querySelector('[data-progress-list]');
  if (box) box.innerHTML = '<div class="empty-state"><div class="empty-icon">' + TI.empty + '</div><p>' + t('teacher.progress.error', 'Could not load progress.') + '</p></div>';
}

function paint(students) {
  var box = document.querySelector('[data-progress-list]');
  if (!box) return;
  if (!students.length) {
    box.innerHTML = '<div class="empty-state"><div class="empty-icon">' + TI.users + '</div>' +
      '<p>' + t('teacher.progress.empty', 'No students yet.') + '</p>' +
      '<p class="empty-sub">' + t('teacher.progress.emptySub', 'Once students enroll, their progress will appear here.') + '</p></div>';
    return;
  }
  var rows = students.map(function (st) {
    return '<tr><td><span class="user-name">' + escapeHtml(st.displayName || st.name || '—') + '</span></td>' +
      '<td><span class="user-email">' + escapeHtml(st.email || '—') + '</span></td>' +
      '<td>' + (typeof st.progress === 'number' ? (st.progress + ' ' + t('teacher.students.col.lessonsShort', 'lessons')) : '—') + '</td>' +
      '<td>' + (st.lastActive ? formatDate(st.lastActive) : '—') + '</td>' +
      '<td><button class="btn btn-outline btn-sm" data-record="' + escapeHtml(st.uid) + '">' + t('teacher.progress.viewRecord', 'View record') + '</button></td></tr>';
  }).join('');
  box.innerHTML = '<div class="table-responsive"><table class="data-table">' +
    '<thead><tr><th>' + t('admin.name', 'Name') + '</th><th>' + t('admin.email', 'Email') + '</th><th>' + t('dashboard.progress', 'Progress') + '</th><th>' + t('teacher.students.col.lastActive', 'Last active') + '</th><th></th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';

  box.querySelectorAll('[data-record]').forEach(function (btn) {
    btn.addEventListener('click', function () { loadRecord(btn.getAttribute('data-record')); });
  });
}

function loadRecord(studentId) {
  var host = document.getElementById('progress-record');
  if (!host) return;
  host.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-icon">' + TI.clock + '</div><p>' + t('teacher.progress.loading', 'Loading…') + '</p></div></div>';
  callFunction('getAcademicRecord', { studentId: studentId }).then(function (r) {
    var record = (r && r.record) || {};
    var certs = (r && r.certificates) || [];
    host.innerHTML = recordHtml(record, certs);
  }).catch(function () {
    host.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-icon">' + TI.empty + '</div><p>' + t('teacher.progress.error', 'Could not load record.') + '</p></div></div>';
  });
}

function recordHtml(record, certs) {
  var sections = '';
  var enr = (record.enrollments || []);
  var lessons = (record.lessonCompletions || []);
  var assessments = (record.assessments || []);
  var examinations = (record.examinations || []);
  var attendance = (record.attendance || []);

  if (!enr.length && !lessons.length && !assessments.length && !examinations.length && !attendance.length && !certs.length) {
    return '<div class="card"><div class="empty-state"><div class="empty-icon">' + TI.chart + '</div>' +
      '<p>' + t('teacher.progress.noRecord', 'No academic record for this student yet.') + '</p></div></div>';
  }

  function countRow(label, n) {
    return '<div class="kpi-card"><span class="kpi-label">' + label + '</span><div class="kpi-value">' + n + '</div></div>';
  }
  sections += '<div class="kpi-grid">' +
    countRow(t('teacher.progress.enrollments', 'Enrollments'), enr.length) +
    countRow(t('teacher.progress.lessons', 'Lessons completed'), lessons.length) +
    countRow(t('teacher.progress.assessments', 'Assessments'), assessments.length) +
    countRow(t('teacher.progress.examinations', 'Examinations'), examinations.length) +
    countRow(t('teacher.progress.attendance', 'Attendance'), attendance.length) +
    countRow(t('teacher.progress.certificates', 'Certificates'), certs.length) +
  '</div>';

  if (enr.length) {
    sections += '<div class="card"><h3>' + t('teacher.progress.enrollments', 'Enrollments') + '</h3><div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>' + t('admin.users.col.id', 'Programme') + '</th><th>' + t('admin.exam.col.academy', 'Academy') + '</th><th>' + t('admin.exam.col.level', 'Level') + '</th><th>' + t('admin.col.status', 'Status') + '</th></tr></thead><tbody>' +
      enr.map(function (e) {
        return '<tr><td>' + escapeHtml(e.programmeId || '—') + '</td><td>' + escapeHtml(e.academyCode || '—') + '</td><td>' + escapeHtml(e.level || '—') + '</td><td>' + escapeHtml(e.status || '—') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  if (assessments.length) {
    sections += '<div class="card"><h3>' + t('teacher.progress.assessments', 'Assessments') + '</h3><div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>' + t('admin.users.col.id', 'Assessment') + '</th><th>' + t('admin.exam.col.level', 'Score') + '</th><th>' + t('admin.col.status', 'Passed') + '</th></tr></thead><tbody>' +
      assessments.map(function (a) {
        return '<tr><td>' + escapeHtml(a.assessmentId || '—') + '</td><td>' + escapeHtml(String(a.score == null ? '—' : a.score)) + '</td><td>' + (a.passed ? t('teacher.status.approved', 'Yes') : t('teacher.status.rejected', 'No')) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  if (examinations.length) {
    sections += '<div class="card"><h3>' + t('teacher.progress.examinations', 'Examinations') + '</h3><div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>' + t('admin.users.col.id', 'Examination') + '</th><th>' + t('admin.exam.col.level', 'Score') + '</th><th>' + t('admin.col.status', 'Passed') + '</th></tr></thead><tbody>' +
      examinations.map(function (x) {
        return '<tr><td>' + escapeHtml(x.examinationId || '—') + '</td><td>' + escapeHtml(String(x.score == null ? '—' : x.score)) + '</td><td>' + (x.passed ? t('teacher.status.approved', 'Yes') : t('teacher.status.rejected', 'No')) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  if (certs.length) {
    sections += '<div class="card"><h3>' + t('teacher.progress.certificates', 'Certificates') + '</h3><div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>' + t('admin.users.col.id', 'ID') + '</th><th>' + t('admin.exam.col.level', 'Level') + '</th><th>' + t('admin.col.status', 'Status') + '</th></tr></thead><tbody>' +
      certs.map(function (c) {
        return '<tr><td>' + escapeHtml(c.id || '—') + '</td><td>' + escapeHtml(c.cecrLevel || '—') + '</td><td>' + escapeHtml(c.status || '—') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  return '<div class="card"><h3>' + t('teacher.progress.recordTitle', 'Academic record') + '</h3>' + sections + '</div>';
}
