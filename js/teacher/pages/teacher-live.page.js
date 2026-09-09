/* ============================================================
   ELA - teacher/pages/teacher-live.page.js
   Page dédiée « Créer une classe Live ».
   ============================================================ */

import { requireTeacher } from '../../core/auth.service.js';
import { afterRender, toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { setState } from '../services/teacher-state.js';
import { submitDraft } from '../services/submission.service.js';
import { LiveDraft } from '../models/live-draft.model.js';

export function renderTeacherLiveNew() {
  var app = document.getElementById('app');
  if (!app) return;
  requireTeacher().then(function (guard) {
    if (!guard.ok) { forbidden(app); return; }
    setState({ profile: guard.profile });
    app.innerHTML = shell();
    afterRender('');
    bindLive(app);
  });
}

function shell() {
  return '' +
    '<div class="dashboard-layout"><main class="main-content">' +
      '<header class="dashboard-header"><h1>' + t('teacher.live.newTitle') + '</h1>' +
      '<p><a class="btn-secondary" href="#/teacher">' + t('teacher.backToDashboard') + '</a></p></header>' +
      '<div class="card ela-teacher-form">' +
        '<div class="form-field"><label>' + t('teacher.live.field.title') + '</label>' +
          '<input type="text" id="tv-title" class="input" placeholder="' + t('teacher.lesson.titlePlaceholder') + '"></div>' +
        '<div class="form-field"><label>' + t('teacher.live.field.datetime') + '</label>' +
          '<input type="datetime-local" id="tv-date" class="input"></div>' +
        '<div class="form-field"><label>' + t('teacher.live.field.link') + '</label>' +
          '<input type="url" id="tv-link" class="input" placeholder="https://meet.google.com/…"></div>' +
        '<button class="btn-primary" id="tv-submit" type="button">' + t('teacher.submit') + '</button>' +
      '</div>' +
    '</main></div>';
}

function bindLive(app) {
  var btn = document.getElementById('tv-submit');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var draft = LiveDraft.fromForm({
      title: val('tv-title'), datetime: val('tv-date'), meetingLink: val('tv-link')
    });
    submitDraft(draft, 'live').then(function (result) {
      if (!result.ok) {
        var first = result.errors
          ? Object.keys(result.errors).map(function (k) { return result.errors[k]; })[0]
          : null;
        toast(first || t('teacher.error.title'), 'error');
        return;
      }
      toast(t('teacher.live.submittedToast'), 'success');
      window.location.hash = '#/teacher';
    }).catch(function () { toast(t('teacher.error.submit'), 'error'); });
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
