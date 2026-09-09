/* ============================================================
   ELA - teacher/pages/teacher-lesson.page.js
   Page dédiée « Créer une leçon » (formulaire séparé du dashboard).
   Formulaire simple, soumission via submitDraft (serveur).
   ============================================================ */

import { requireTeacher } from '../../core/auth.service.js';
import { afterRender, toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { setState } from '../services/teacher-state.js';
import { submitDraft } from '../services/submission.service.js';
import { LessonDraft, LESSON_LEVELS } from '../models/lesson-draft.model.js';

export function renderTeacherLessonNew() {
  var app = document.getElementById('app');
  if (!app) return;
  requireTeacher().then(function (guard) {
    if (!guard.ok) { forbidden(app); return; }
    setState({ profile: guard.profile });
    app.innerHTML = shell();
    afterRender('');
    bindLesson(app);
  });
}

function levelLabel(l) {
  var key = l === 'beginner' ? 'teacher.level.beginner' : l === 'intermediate' ? 'teacher.level.intermediate' : l === 'advanced' ? 'teacher.level.advanced' : null;
  return key ? t(key) : (String(l).charAt(0).toUpperCase() + String(l).slice(1));
}

function shell() {
  var levelOpts = LESSON_LEVELS.map(function (l) {
    return '<option value="' + l + '">' + levelLabel(l) + '</option>';
  }).join('');
  return '' +
    '<div class="dashboard-layout"><main class="main-content">' +
      '<header class="dashboard-header"><h1>' + t('teacher.lesson.newTitle') + '</h1>' +
      '<p><a class="btn-secondary" href="#/teacher">' + t('teacher.backToDashboard') + '</a></p></header>' +
      '<div class="card ela-teacher-form">' +
        '<div class="form-field"><label>' + t('teacher.lesson.field.title') + '</label>' +
          '<input type="text" id="tl-title" class="input" placeholder="' + t('teacher.lesson.titlePlaceholder') + '"></div>' +
        '<div class="form-field"><label>' + t('teacher.lesson.field.description') + '</label>' +
          '<textarea id="tl-desc" class="input" placeholder="' + t('teacher.lessonDesc') + '"></textarea></div>' +
        '<div class="form-field"><label>' + t('teacher.lesson.field.content') + '</label>' +
          '<textarea id="tl-content" class="input" style="min-height:180px" placeholder="' + t('teacher.lessonContent') + '…"></textarea></div>' +
        '<div class="form-field"><label>' + t('teacher.lesson.field.level') + '</label>' +
          '<select id="tl-level" class="input">' + levelOpts + '</select></div>' +
        '<button class="btn-primary" id="tl-submit">' + t('teacher.submit') + '</button>' +
      '</div>' +
    '</main></div>';
}

function bindLesson(app) {
  var btn = document.getElementById('tl-submit');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var draft = LessonDraft.fromForm({
      title: val('tl-title'), description: val('tl-desc'),
      content: val('tl-content'), level: val('tl-level')
    });
    submitWithFeedback(draft, 'lesson');
  });
}

function submitWithFeedback(draft, type) {
  submitDraft(draft, type).then(function (result) {
    if (!result.ok) {
      var first = result.errors
        ? (Array.isArray(result.errors) ? result.errors[0] : Object.keys(result.errors).map(function (k) { return result.errors[k]; })[0])
        : null;
      toast(first || t('teacher.error.title'), 'error');
      return;
    }
    toast(t('teacher.lesson.submittedToast'), 'success');
    window.location.hash = '#/teacher';
  }).catch(function () {
    toast(t('teacher.error.submit'), 'error');
  });
}

function forbidden(app) {
  app.innerHTML = '<div class="dashboard-layout"><main class="main-content">' +
    '<div class="empty-state"><div class="empty-icon">🔒</div>' +
    '<p>' + t('teacher.gate.teacherOnly') + '</p>' +
    '<p style="margin-top:12px"><a class="btn btn-solid" href="#/login">' + t('nav.login') + '</a></p>' +
    '</div></main></div>';
  afterRender('');
}

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}
