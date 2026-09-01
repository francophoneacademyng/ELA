/* ============================================================
   ELA — teacher/pages/teacher.page.js
   Page #/teacher-v2 : espace enseignant modulaire (forms
   lesson/quiz/live + mes soumissions). Écritures 100 % via le
   callable submitContent — plus aucune écriture Firestore directe.
   ============================================================ */

import { requireTeacher } from '../../core/auth.service.js';
import { afterRender, toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { getProfile } from '../../core/auth.service.js';
import { LessonDraft } from '../models/lesson-draft.model.js';
import { QuizDraft } from '../models/quiz-draft.model.js';
import { LiveDraft } from '../models/live-draft.model.js';
import { submitDraft, refreshSubmissions } from '../services/submission.service.js';
import { getState, setState, reset } from '../services/teacher-state.js';
import { quizQuestionCardHtml } from '../components/quiz-question-card.js';
import { statusBadgeHtml } from '../components/status-badge.js';

let quizDraft = new QuizDraft({ questions: [{}] });

/** Point d'entrée de la route. */
export function renderTeacherPage() {
  const app = document.getElementById('app');
  if (!app) return;

  requireTeacher().then(function (guard) {
    if (!guard.ok) {
      app.innerHTML = '<div class="container dashboard-section">' +
        '<h2>' + t('teacher.title') + '</h2>' +
        '<p class="muted">' + t('admin.forbidden') + '</p>' +
        '<a class="btn btn-solid" href="#/login">' + t('nav.login') + '</a></div>';
      afterRender('');
      return;
    }
    setState({ profile: guard.profile });
    paint();
    refreshSubmissions();
  });
}

function paint() {
  const app = document.getElementById('app');
  if (!app) return;
  const s = getState();
  const academy = s.profile ? s.profile.academy : null;

  app.innerHTML =
    '<div class="container dashboard-section teacher-page">' +
      '<h2>' + t('teacher.title') + '</h2>' +
      '<p class="muted">' + t('teacher.academy') + ' : <strong>' + (academy || '—') + '</strong></p>' +
      lessonFormHtml() +
      quizFormHtml() +
      liveFormHtml() +
      '<h3>' + t('teacher.myContent') + '</h3>' +
      (s.contentLoading
        ? '<div class="skeleton" style="height:100px"></div>'
        : myContentHtml(s.submissions)) +
    '</div>';

  bindTeacherEvents(app);
  afterRender('teacher');
}

function fieldError(name) {
  const s = getState();
  const err = s.formErrors && s.formErrors[name];
  return err ? '<p class="form-error">' + t(err, err) + '</p>' : '';
}

function lessonFormHtml() {
  return '<section class="dashboard-section"><h3>' + t('teacher.newLesson') + '</h3>' +
    '<input type="text" id="tl-title" class="input" placeholder="' + t('teacher.lessonTitle') + '">' +
    fieldError('title') +
    '<input type="text" id="tl-desc" class="input" placeholder="' + t('teacher.lessonDesc') + '">' +
    '<textarea id="tl-content" class="input" rows="6" placeholder="' + t('teacher.lessonContent') + '"></textarea>' +
    fieldError('content') +
    '<select id="tl-level" class="input">' +
      ['beginner', 'intermediate', 'advanced'].map(function (l) {
        return '<option value="' + l + '">' + t('teacher.level.' + l, l) + '</option>';
      }).join('') +
    '</select>' +
    fieldError('level') +
    '<button class="btn btn-solid" id="tl-submit">' + t('teacher.submit') + '</button>' +
  '</section>';
}

function quizFormHtml() {
  const cards = quizDraft.questions.map(function (q, i) {
    return quizQuestionCardHtml(q, i, quizDraft.questions.length > 1);
  }).join('');
  return '<section class="dashboard-section"><h3>' + t('teacher.newQuiz') + '</h3>' +
    '<input type="text" id="tq-title" class="input" placeholder="' + t('teacher.quizTitle') + '">' +
    '<div id="tq-questions">' + cards + '</div>' +
    '<button type="button" class="btn btn-ghost btn-sm" id="tq-add-question">+ ' + t('teacher.addQuestion') + '</button>' +
    '<button class="btn btn-solid" id="tq-submit">' + t('teacher.submit') + '</button>' +
  '</section>';
}

function liveFormHtml() {
  return '<section class="dashboard-section"><h3>' + t('teacher.newLive') + '</h3>' +
    '<input type="text" id="tv-title" class="input" placeholder="' + t('teacher.liveTitle') + '">' +
    fieldError('title') +
    '<input type="datetime-local" id="tv-date" class="input">' +
    fieldError('datetime') +
    '<input type="url" id="tv-link" class="input" placeholder="' + t('teacher.liveLink') + '">' +
    fieldError('meetingLink') +
    '<button class="btn btn-solid" id="tv-submit">' + t('teacher.submit') + '</button>' +
  '</section>';
}

function myContentHtml(submissions) {
  if (!submissions || !submissions.length) return '<p class="muted">' + t('teacher.noContent') + '</p>';
  return '<table class="dash-table"><thead><tr>' +
    '<th>' + t('admin.title') + '</th><th>' + t('teacher.type.' + 'lesson') + '</th>' +
    '<th>' + t('admin.date') + '</th><th>' + t('admin.status') + '</th>' +
    '</tr></thead><tbody>' +
    submissions.map(function (sub) {
      return '<tr><td>' + sub.title + '</td>' +
        '<td>' + t('teacher.type.' + sub.type, sub.type) + '</td>' +
        '<td>' + new Date(sub.createdAt || 0).toLocaleDateString() + '</td>' +
        '<td>' + statusBadgeHtml(sub) + '</td></tr>';
    }).join('') + '</tbody></table>';
}

/* ---------- Bindings ---------- */

function bindTeacherEvents(app) {
  // Leçon
  const tl = document.getElementById('tl-submit');
  if (tl) tl.addEventListener('click', function () {
    const draft = LessonDraft.fromForm({
      title: val('tl-title'), description: val('tl-desc'),
      content: val('tl-content'), level: val('tl-level')
    });
    submitWithFeedback(draft, 'lesson');
  });

  // Quizz (collecte dynamique des questions depuis le DOM)
  const addQ = document.getElementById('tq-add-question');
  if (addQ) addQ.addEventListener('click', function () {
    collectQuizFromDom();
    quizDraft.addQuestion({});
    repaintQuizQuestions();
  });

  const tq = document.getElementById('tq-submit');
  if (tq) tq.addEventListener('click', function () {
    collectQuizFromDom();
    quizDraft.title = val('tq-title');
    submitWithFeedback(quizDraft, 'quiz');
  });

  // Live
  const tv = document.getElementById('tv-submit');
  if (tv) tv.addEventListener('click', function () {
    const draft = LiveDraft.fromForm({
      title: val('tv-title'), datetime: val('tv-date'), meetingLink: val('tv-link')
    });
    submitWithFeedback(draft, 'live');
  });
}

function repaintQuizQuestions() {
  const host = document.getElementById('tq-questions');
  if (host) host.innerHTML = quizDraft.questions.map(function (q, i) {
    return quizQuestionCardHtml(q, i, quizDraft.questions.length > 1);
  }).join('');
}

/** Lit les champs data-quiz-* du DOM dans quizDraft. */
function collectQuizFromDom() {
  const titleEl = document.getElementById('tq-title');
  if (titleEl) quizDraft.title = titleEl.value;
  quizDraft.questions.forEach(function (q, i) {
    const textEl = document.querySelector('[data-quiz-text="' + i + '"]');
    if (textEl) q.text = textEl.value;
    for (let oi = 0; oi < 4; oi++) {
      const optEl = document.querySelector('[data-quiz-option="' + i + '"][data-oi="' + oi + '"]');
      if (optEl) q.options[oi] = optEl.value;
    }
    const correctEl = document.querySelector('[data-quiz-correct="' + i + '"]:checked');
    if (correctEl) q.correctIndex = Number(correctEl.value);
  });
}

/** Soumet puis affiche le résultat (toast + refresh liste). */
function submitWithFeedback(draft, type) {
  submitDraft(draft, type).then(function (result) {
    if (!result.ok) {
      const firstError = result.errors
        ? (Array.isArray(result.errors) ? result.errors[0] : Object.keys(result.errors).map(function (k) { return result.errors[k]; })[0])
        : null;
      toast(firstError ? t(firstError, firstError) : t('teacher.error'), 'error');
      paint(); // réaffiche les erreurs de champ
      return;
    }
    toast(t('teacher.submitted'), 'success');
    quizDraft = new QuizDraft({ questions: [{}] });
    paint();
  });
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

