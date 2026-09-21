/* ============================================================
   ELA - teacher/pages/teacher-live.page.js
   Page dédiée « Créer une classe Live ».
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { submitDraft } from '../services/submission.service.js';
import { LiveDraft } from '../models/live-draft.model.js';

export function renderTeacherLiveNew() {
  renderTeacherShell({
    active: '#/teacher/live',
    title: t('teacher.live.newTitle'),
    backButton: '#/teacher',
    renderContent: function () { return formHtml(); },
    onBind: function () { bindLive(); }
  });
}

function formHtml() {
  return '<div class="card ela-teacher-form">' +
        '<h2>' + t('teacher.live.section.info') + '</h2>' +
        '<div class="form-field"><label for="tv-title">' + t('teacher.live.field.title') + '</label>' +
          '<input type="text" id="tv-title" class="input" placeholder="' + t('teacher.lesson.titlePlaceholder') + '"></div>' +
        '<h2>' + t('teacher.live.section.schedule') + '</h2>' +
        '<div class="form-field"><label for="tv-date">' + t('teacher.live.field.datetime') + '</label>' +
          '<input type="datetime-local" id="tv-date" class="input"></div>' +
        '<h2>' + t('teacher.live.section.classroom') + '</h2>' +
        '<div class="form-field"><label for="tv-link">' + t('teacher.live.field.link') + '</label>' +
          '<input type="url" id="tv-link" class="input" placeholder="https://meet.google.com/…"></div>' +
        '<button class="btn-primary" id="tv-submit" type="button">' + t('teacher.submit') + '</button>' +
  '</div>';
}

function bindLive() {
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

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}
