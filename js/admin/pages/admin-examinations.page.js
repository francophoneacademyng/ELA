/* ============================================================
   ELA - admin/pages/admin-examinations.page.js
   Page « Examens » (/admin/examinations).
   Expose le moteur d'examen existant (functions/examination.js) :
   - liste des examens
   - création d'un examen (admin)
   - publication d'une version (structure 4 aptitudes, blueprint)
   - inscription d'un candidat
   - affectation d'un examinateur
   - file de notation + notation (writing/speaking) + finalisation
   Toutes les opérations sont côté serveur (callables) ; les corrigés
   objectifs ne sont jamais exposés au client. Aucun élève ordinaire
   n'accède à cette page (garde requireAdmin).
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { t } from '../../core/i18n-helpers.js';

const ACADEMY_OPTIONS = [
  ['FR', 'Francophone'], ['DE', 'Germanophone'], ['ZH', 'Sinophone'],
  ['EN', 'Anglophone'], ['AR', 'Arabophone'], ['RU', 'Russophone']
];

export function renderAdminExaminations() {
  renderAdminShell({
    active: '#/admin/examinations',
    needsData: false,
    title: t('admin.exam.title', 'Examinations'),
    subtitle: t('admin.exam.subtitle', 'Certification examinations management.'),
    renderContent: function () {
      return layoutHtml();
    },
    onBind: function () {
      bind();
      loadList();
    }
  });
}

function layoutHtml() {
  return '' +
    '<div class="card" data-exam-list>' + loadingHtml() + '</div>' +
    '<section class="card">' +
      '<h3>' + t('admin.exam.create', 'Create examination') + '</h3>' +
      '<form id="exam-create-form">' +
        '<input class="input" type="text" id="exam-create-title" placeholder="' + t('admin.exam.create.title', 'Title') + '" autocomplete="off">' +
        '<select class="input" id="exam-create-academy">' + ACADEMY_OPTIONS.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select>' +
        '<input class="input" type="text" id="exam-create-level" placeholder="' + t('admin.exam.create.level', 'Level (A1, B1, HSK1…)') + '" autocomplete="off">' +
        '<button class="btn btn-solid" type="submit">' + t('admin.exam.create.submit', 'Create') + '</button>' +
      '</form>' +
    '</section>' +
    '<section class="card">' +
      '<h3>' + t('admin.exam.publish', 'Publish version') + '</h3>' +
      '<form id="exam-publish-form">' +
        '<input class="input" type="text" id="exam-publish-id" placeholder="' + t('admin.exam.publish.id', 'Examination ID') + '" autocomplete="off">' +
        '<input class="input" type="number" id="exam-publish-duration" value="150" min="30">' +
        '<input class="input" type="number" id="exam-publish-pass" value="60" min="1" max="100">' +
        '<button class="btn btn-solid" type="submit">' + t('admin.exam.publish.submit', 'Publish 4-skill version') + '</button>' +
      '</form>' +
    '</section>' +
    '<section class="card">' +
      '<h3>' + t('admin.exam.register', 'Register candidate') + '</h3>' +
      '<form id="exam-register-form">' +
        '<input class="input" type="text" id="exam-register-id" placeholder="' + t('admin.exam.publish.id', 'Examination ID') + '" autocomplete="off">' +
        '<input class="input" type="text" id="exam-register-uid" placeholder="' + t('admin.exam.register.uid', 'Student UID') + '" autocomplete="off">' +
        '<button class="btn btn-solid" type="submit">' + t('admin.exam.register.submit', 'Register') + '</button>' +
      '</form>' +
    '</section>' +
    '<section class="card">' +
      '<h3>' + t('admin.exam.assign', 'Assign examiner') + '</h3>' +
      '<form id="exam-assign-form">' +
        '<input class="input" type="text" id="exam-assign-id" placeholder="' + t('admin.exam.publish.id', 'Examination ID') + '" autocomplete="off">' +
        '<input class="input" type="text" id="exam-assign-uid" placeholder="' + t('admin.exam.assign.uid', 'Examiner UID') + '" autocomplete="off">' +
        '<input class="input" type="text" id="exam-assign-skills" placeholder="' + t('admin.exam.assign.skills', 'Skills (writing,speaking)') + '" autocomplete="off">' +
        '<button class="btn btn-solid" type="submit">' + t('admin.exam.assign.submit', 'Assign') + '</button>' +
      '</form>' +
    '</section>' +
    '<div data-exam-grade></div>';
}

function loadingHtml() {
  return '<div class="empty-state"><p>' + t('admin.exam.loading', 'Loading…') + '</p></div>';
}

function bind() {
  bindCreate();
  bindPublish();
  bindRegister();
  bindAssign();
  var gradeBtn = document.getElementById('exam-grade-refresh');
  if (gradeBtn) gradeBtn.addEventListener('click', loadGradeQueue);
}

function loadList() {
  var box = document.querySelector('[data-exam-list]');
  if (!box) return;
  box.innerHTML = loadingHtml();
  callFunction('listExaminations').then(function (r) {
    var exams = (r && r.examinations) || [];
    if (!exams.length) {
      box.innerHTML = '<div class="empty-state"><p>' + t('admin.exam.empty', 'No examinations yet.') + '</p></div>';
    } else {
      var rows = exams.map(function (e) {
        return '<tr><td>' + escapeHtml(e.title) + '</td>' +
          '<td>' + escapeHtml(e.academyCode) + '</td>' +
          '<td>' + escapeHtml(e.level || '—') + '</td>' +
          '<td>' + escapeHtml(e.id) + '</td>' +
          '<td>' + (e.status === 'published' ? t('teacher.status.approved', 'Published') : t('admin.status.pending', 'Draft')) + '</td>' +
          '<td>' + (e.currentVersion || '—') + '</td></tr>';
      }).join('');
      box.innerHTML = '<div class="table-responsive"><table class="data-table">' +
        '<thead><tr><th>' + t('admin.col.title', 'Title') + '</th><th>' + t('admin.exam.col.academy', 'Academy') + '</th><th>' + t('admin.exam.col.level', 'Level') + '</th><th>' + t('admin.users.col.id', 'ID') + '</th><th>' + t('admin.col.status', 'Status') + '</th><th>' + t('teacher.exam.col.version', 'Version') + '</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';
    }
  }).catch(function () {
    box.innerHTML = '<div class="empty-state"><p>' + t('admin.exam.error', 'Could not load examinations.') + '</p></div>';
  });
  loadGradeQueue();
}

function bindCreate() {
  var form = document.getElementById('exam-create-form');
  if (!form) return;
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var title = document.getElementById('exam-create-title').value;
    var academyCode = document.getElementById('exam-create-academy').value;
    var level = document.getElementById('exam-create-level').value;
    if (!title || !level) { toast(t('admin.exam.create.error', 'Title and level are required.'), 'error'); return; }
    callFunction('createExamination', { title: String(title).trim(), academyCode: academyCode, level: String(level).trim().toUpperCase() }).then(function (r) {
      toast(t('admin.exam.create.success', 'Examination created.') + ' ' + (r && r.examinationId ? r.examinationId : ''), 'success');
      form.reset();
      loadList();
    }).catch(function () {
      toast(t('admin.exam.create.error', 'Could not create examination.'), 'error');
    });
  });
}

function bindPublish() {
  var form = document.getElementById('exam-publish-form');
  if (!form) return;
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var examId = document.getElementById('exam-publish-id').value;
    var duration = Number(document.getElementById('exam-publish-duration').value) || 150;
    var passMark = Number(document.getElementById('exam-publish-pass').value) || 60;
    if (!examId) { toast(t('admin.exam.publish.error', 'Examination ID is required.'), 'error'); return; }
    // Structure 4 aptitudes alignée sur le blueprint institutionnel
    // (listening/reading objectifs, writing/speaking subjectifs + rubrique).
    var rubric = function (criteria) { return criteria.map(function (c) { return { criterion: c, max: 5 }; }); };
    var sections = [
      { id: 'listening', skill: 'listening', type: 'objective', weight: 25, passMark: 50, questions: [] },
      { id: 'reading', skill: 'reading', type: 'objective', weight: 25, passMark: 50, questions: [] },
      { id: 'writing', skill: 'writing', type: 'subjective', weight: 25, passMark: 50, rubric: rubric(['Task achievement', 'Coherence and cohesion', 'Lexical range', 'Grammatical range and accuracy']) },
      { id: 'speaking', skill: 'speaking', type: 'subjective', weight: 25, passMark: 50, rubric: rubric(['Fluency', 'Interaction', 'Lexical resource', 'Grammatical range and pronunciation']) }
    ];
    callFunction('publishExaminationVersion', {
      examinationId: String(examId).trim(),
      durationMinutes: duration,
      passMark: passMark,
      moderationRequired: true,
      retakePolicy: { allowed: true, maxAttempts: 2, cooldownDays: 30 },
      sections: sections
    }).then(function () {
      toast(t('admin.exam.publish.success', 'Version published.'), 'success');
      loadList();
    }).catch(function () {
      toast(t('admin.exam.publish.error', 'Could not publish version.'), 'error');
    });
  });
}

function bindRegister() {
  var form = document.getElementById('exam-register-form');
  if (!form) return;
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var examId = document.getElementById('exam-register-id').value;
    var uid = document.getElementById('exam-register-uid').value;
    if (!examId || !uid) { toast(t('admin.exam.register.error', 'Examination ID and student UID are required.'), 'error'); return; }
    callFunction('registerExaminationCandidate', { examinationId: String(examId).trim(), candidateUid: String(uid).trim() }).then(function () {
      toast(t('admin.exam.register.success', 'Candidate registered.'), 'success');
      form.reset();
    }).catch(function () {
      toast(t('admin.exam.register.error', 'Could not register candidate.'), 'error');
    });
  });
}

function bindAssign() {
  var form = document.getElementById('exam-assign-form');
  if (!form) return;
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var examId = document.getElementById('exam-assign-id').value;
    var examinerUid = document.getElementById('exam-assign-uid').value;
    var skills = String(document.getElementById('exam-assign-skills').value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!examId || !examinerUid || !skills.length) { toast(t('admin.exam.assign.error', 'Examination, examiner UID and skills are required.'), 'error'); return; }
    callFunction('assignExaminer', { examinationId: String(examId).trim(), examinerUid: String(examinerUid).trim(), skills: skills }).then(function () {
      toast(t('admin.exam.assign.success', 'Examiner assigned.'), 'success');
      form.reset();
    }).catch(function () {
      toast(t('admin.exam.assign.error', 'Could not assign examiner.'), 'error');
    });
  });
}

function loadGradeQueue() {
  var host = document.querySelector('[data-exam-grade]');
  if (!host) return;
  host.innerHTML = '<div class="card"><h3>' + t('admin.exam.grade.title', 'Grading queue') + '</h3>' +
    '<button class="btn btn-outline btn-sm" id="exam-grade-refresh">' + t('admin.refresh', 'Refresh') + '</button>' +
    '<div data-grade-list>' + loadingHtml() + '</div></div>';
  var refresh = document.getElementById('exam-grade-refresh');
  if (refresh) refresh.addEventListener('click', loadGradeQueue);
  callFunction('getExaminationQueue').then(function (r) {
    var queue = (r && r.queue) || [];
    var list = document.querySelector('[data-grade-list]');
    if (!list) return;
    if (!queue.length) {
      list.innerHTML = '<div class="empty-state"><p>' + t('admin.exam.grade.empty', 'No submissions awaiting grading.') + '</p></div>';
      return;
    }
    list.innerHTML = queue.map(function (s) { return gradeItemHtml(s); }).join('');
    queue.forEach(function (s) { bindGradeItem(s); });
  }).catch(function () {
    var list = document.querySelector('[data-grade-list]');
    if (list) list.innerHTML = '<div class="empty-state"><p>' + t('admin.exam.error', 'Could not load grading queue.') + '</p></div>';
  });
}

function gradeItemHtml(s) {
  var rubricHint = (s.rubric && s.rubric.length)
    ? s.rubric.map(function (c, i) { return escapeHtml(c.criterion || ('C' + (i + 1))) + ' (0-' + (c.max || 5) + ')'; }).join(', ')
    : '—';
  return '<div class="card grade-item" data-grade="' + escapeHtml(s.attemptId + '|' + s.sectionId) + '">' +
    '<p><strong>' + escapeHtml(s.skill) + '</strong> · ' + t('admin.users.col.id', 'Candidate') + ': ' + escapeHtml(s.candidateUid) + '</p>' +
    '<p class="muted">' + t('admin.exam.grade.rubric', 'Rubric') + ': ' + rubricHint + '</p>' +
    '<p class="muted">' + t('admin.exam.grade.response', 'Response') + ': ' + escapeHtml(String(s.response || '').slice(0, 500)) + '</p>' +
    '<input class="input" type="text" data-scores placeholder="' + t('admin.exam.grade.scores', 'Scores (comma-separated, e.g. 4,4,3,4)') + '" autocomplete="off">' +
    '<input class="input" type="text" data-comments placeholder="' + t('admin.exam.grade.comments', 'Comments') + '" autocomplete="off">' +
    '<button class="btn btn-solid btn-sm" data-action="grade">' + t('admin.exam.grade.submit', 'Grade') + '</button> ' +
    '<button class="btn btn-outline btn-sm" data-action="finalize">' + t('admin.exam.finalize', 'Finalize result') + '</button>' +
    '</div>';
}

function bindGradeItem(s) {
  var el = document.querySelector('[data-grade="' + CSS.escape(s.attemptId + '|' + s.sectionId) + '"]');
  if (!el) return;
  var gradeBtn = el.querySelector('[data-action="grade"]');
  var finalBtn = el.querySelector('[data-action="finalize"]');
  if (gradeBtn) gradeBtn.addEventListener('click', function () {
    var scoresRaw = el.querySelector('[data-scores]').value;
    var comments = el.querySelector('[data-comments]').value;
    var rubricScores = String(scoresRaw).split(',').map(function (x) { return Number(String(x).trim()); }).filter(function (n) { return !isNaN(n); });
    if (!rubricScores.length) { toast(t('admin.exam.grade.error', 'Enter at least one rubric score.'), 'error'); return; }
    var payload = rubricScores.map(function (n, i) { return { criterion: 'score-' + (i + 1), score: n }; });
    callFunction('gradeExaminationSection', { attemptId: s.attemptId, sectionId: s.sectionId, rubricScores: payload, comments: String(comments || '') }).then(function () {
      toast(t('admin.exam.grade.success', 'Section graded.'), 'success');
      loadGradeQueue();
    }).catch(function () {
      toast(t('admin.exam.grade.error', 'Could not grade section.'), 'error');
    });
  });
  if (finalBtn) finalBtn.addEventListener('click', function () {
    callFunction('finalizeExaminationResult', { attemptId: s.attemptId, moderationConfirmed: true }).then(function () {
      toast(t('admin.exam.finalize.success', 'Result finalized.'), 'success');
      loadGradeQueue();
    }).catch(function () {
      toast(t('admin.exam.finalize.error', 'Could not finalize result.'), 'error');
    });
  });
}
