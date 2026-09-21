/* ============================================================
   ELA - teacher/pages/teacher-quiz.page.js
   Page dédiée « Créer un quiz » (questions dynamiques).
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { submitDraft } from '../services/submission.service.js';
import { QuizDraft } from '../models/quiz-draft.model.js';

var qCount = 1;

export function renderTeacherQuizNew() {
  renderTeacherShell({
    active: '#/teacher/quizzes',
    title: t('teacher.quiz.newTitle'),
    backButton: '#/teacher',
    renderContent: function () { return formHtml(); },
    onBind: function () { bindQuiz(); }
  });
}

function fmt(n, key) {
  return t(key).replace('{n}', n);
}

function formHtml() {
  return '<div class="card ela-teacher-form">' +
    '<div class="form-field"><label for="tq-title">' + t('teacher.quiz.field.title') + '</label>' +
      '<input type="text" id="tq-title" class="input" placeholder="' + t('teacher.quiz.titlePlaceholder') + '"></div>' +
    '<div id="tq-questions">' + questionBlock(0) + '</div>' +
    '<div class="action-bar">' +
      '<button class="btn-secondary" id="tq-add" type="button">' + t('teacher.quiz.addQuestion') + '</button>' +
      '<button class="btn-primary" id="tq-submit" type="button">' + t('teacher.submit') + '</button>' +
    '</div>' +
  '</div>';
}

function questionBlock(i) {
  var opts = '';
  for (var o = 0; o < 4; o++) {
    opts += '<div class="form-field form-field-sm"><label>' + fmt(o + 1, 'teacher.quiz.optionLabel') +
      (o === 0 ? t('teacher.quiz.defaultCorrect') : '') + '</label>' +
      '<input type="text" class="input" data-quiz-option="' + i + '" data-oi="' + o + '" placeholder="' + t('teacher.quiz.answerPlaceholder') + '"></div>';
  }
  return '<div class="quiz-question-card">' +
    '<div class="quiz-question-head"><strong>' + t('teacher.question') + ' ' + (i + 1) + '</strong></div>' +
    '<div class="form-field"><label>' + fmt(i + 1, 'teacher.quiz.questionLabel') + '</label>' +
    '<textarea class="input" data-quiz-text="' + i + '" placeholder="' + t('teacher.questionText') + '…"></textarea></div>' +
    opts +
    '<div class="form-field"><label>' + t('teacher.quiz.correctAnswer') + '</label>' +
      '<select class="input" data-quiz-correct="' + i + '">' +
        '<option value="0">' + fmt(1, 'teacher.quiz.optionChoice') + '</option><option value="1">' + fmt(2, 'teacher.quiz.optionChoice') + '</option>' +
        '<option value="2">' + fmt(3, 'teacher.quiz.optionChoice') + '</option><option value="3">' + fmt(4, 'teacher.quiz.optionChoice') + '</option>' +
      '</select></div>' +
  '</div>';
}

function bindQuiz() {
  var add = document.getElementById('tq-add');
  if (add) add.addEventListener('click', function () {
    var host = document.getElementById('tq-questions');
    if (host) host.insertAdjacentHTML('beforeend', questionBlock(qCount));
    qCount++;
  });

  var submit = document.getElementById('tq-submit');
  if (submit) submit.addEventListener('click', function () {
    var draft = new QuizDraft({ title: val('tq-title'), questions: [] });
    for (var i = 0; i < qCount; i++) {
      var textEl = document.querySelector('[data-quiz-text="' + i + '"]');
      if (!textEl) continue;
      var q = { text: textEl.value, options: [], correctIndex: 0 };
      for (var o = 0; o < 4; o++) {
        var optEl = document.querySelector('[data-quiz-option="' + i + '"][data-oi="' + o + '"]');
        q.options.push(optEl ? optEl.value : '');
      }
      var correctEl = document.querySelector('[data-quiz-correct="' + i + '"]');
      if (correctEl) q.correctIndex = Number(correctEl.value);
      draft.addQuestion(q);
    }
    submitDraft(draft, 'quiz').then(function (result) {
      if (!result.ok) {
        var first = Array.isArray(result.errors) ? result.errors[0] : null;
        toast(first || t('teacher.quiz.incomplete'), 'error');
        return;
      }
      toast(t('teacher.quiz.submittedToast'), 'success');
      window.location.hash = '#/teacher';
    }).catch(function () { toast(t('teacher.error.submit'), 'error'); });
  });
}

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}
