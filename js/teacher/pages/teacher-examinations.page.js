/* ============================================================
   ELA - teacher/pages/teacher-examinations.page.js
   Page « Examens » (/teacher/examinations).
   Expose le moteur d'examen existant (functions/examination.js)
   à l'enseignant : liste des examens de SON académie (isolation
   serveur via listExaminations) + inscription d'un candidat.
   Aucune opération non supportée par le backend ; aucune donnée
   privilégiée exposée au client (les corrigés restent serveur).
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { t } from '../../core/i18n-helpers.js';
import { TI } from '../components/teacher-icons.js';

export function renderTeacherExaminations() {
  renderTeacherShell({
    active: '#/teacher/examinations',
    title: t('teacher.exam.title', 'Examinations'),
    subtitle: t('teacher.exam.subtitle', 'Certification examinations for your academy.'),
    renderContent: function () {
      return '<div class="card" data-exam-list>' + loadingHtml() + '</div>';
    },
    onBind: function () {
      load();
    }
  });
}

function loadingHtml() {
  return '<div class="empty-state"><div class="empty-icon">' + TI.clock + '</div><p>' + t('teacher.exam.loading', 'Loading…') + '</p></div>';
}

function load() {
  var box = document.querySelector('[data-exam-list]');
  if (!box) return;
  box.innerHTML = loadingHtml();
  callFunction('listExaminations').then(function (r) {
    paint(r && r.examinations ? r.examinations : []);
  }).catch(function () {
    paintError();
  });
}

function paintError() {
  var box = document.querySelector('[data-exam-list]');
  if (box) box.innerHTML = '<div class="empty-state"><div class="empty-icon">' + TI.empty + '</div><p>' + t('teacher.exam.error', 'Could not load examinations.') + '</p></div>';
}

function paint(exams) {
  var box = document.querySelector('[data-exam-list]');
  if (!box) return;
  if (!exams.length) {
    box.innerHTML = '<div class="empty-state"><div class="empty-icon">' + TI.empty + '</div>' +
      '<p>' + t('teacher.exam.empty', 'No examinations for your academy yet.') + '</p>' +
      '<p class="empty-sub">' + t('teacher.exam.emptySub', 'Examinations are configured by an administrator.') + '</p></div>';
    return;
  }
  var rows = exams.map(function (e) {
    return '<tr><td><span class="user-name">' + escapeHtml(e.title) + '</span></td>' +
      '<td>' + escapeHtml(e.level || '—') + '</td>' +
      '<td>' + statusBadge(e.status) + '</td>' +
      '<td>' + (e.currentVersion || '—') + '</td>' +
      '<td><button class="btn btn-outline btn-sm" data-register="' + escapeHtml(e.id) + '">' + t('teacher.exam.register', 'Register candidate') + '</button></td></tr>';
  }).join('');
  box.innerHTML = '<div class="table-responsive"><table class="data-table">' +
    '<thead><tr><th>' + t('admin.col.title', 'Title') + '</th><th>' + t('admin.exam.col.level', 'Level') + '</th><th>' + t('admin.col.status', 'Status') + '</th><th>' + t('teacher.exam.col.version', 'Version') + '</th><th></th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    registerFormHtml();

  box.querySelectorAll('[data-register]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var form = document.getElementById('exam-register-form');
      if (form) form.setAttribute('data-exam-id', btn.getAttribute('data-register'));
      var title = document.getElementById('exam-register-title');
      var exam = exams.filter(function (e) { return e.id === btn.getAttribute('data-register'); })[0];
      if (title) title.textContent = exam ? exam.title : '';
    });
  });
  bindRegisterForm();
}

function registerFormHtml() {
  return '<section class="card" style="margin-top:1rem">' +
    '<h3>' + t('teacher.exam.register', 'Register candidate') + '</h3>' +
    '<p class="muted" id="exam-register-title"></p>' +
    '<form id="exam-register-form" data-exam-id="">' +
      '<input class="input" type="text" id="exam-register-uid" placeholder="' + t('teacher.exam.register.uid', 'Student UID') + '" autocomplete="off">' +
      '<button class="btn btn-solid" type="submit">' + t('teacher.exam.register.submit', 'Register') + '</button>' +
    '</form></section>';
}

function bindRegisterForm() {
  var form = document.getElementById('exam-register-form');
  if (!form) return;
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var examId = form.getAttribute('data-exam-id');
    var uid = (document.getElementById('exam-register-uid') || {}).value;
    uid = String(uid || '').trim();
    if (!examId || !uid) { toast(t('teacher.exam.register.error', 'Examination and student UID are required.'), 'error'); return; }
    callFunction('registerExaminationCandidate', { examinationId: examId, candidateUid: uid }).then(function () {
      toast(t('teacher.exam.register.success', 'Candidate registered.'), 'success');
      document.getElementById('exam-register-uid').value = '';
    }).catch(function () {
      toast(t('teacher.exam.register.error', 'Could not register candidate.'), 'error');
    });
  });
}

function statusBadge(status) {
  var map = {
    draft: ['badge-muted', t('admin.status.pending', 'Draft')],
    published: ['badge-ok', t('teacher.status.approved', 'Published')]
  };
  var m = map[status] || ['badge-muted', String(status || '—')];
  return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
}
