/* ============================================================
   ELA - teacher/pages/teacher-quiz.page.js
   Page dédiée « Créer un quiz » (questions dynamiques).
   ============================================================ */

import { requireTeacher } from '../../core/auth.service.js';
import { afterRender, toast } from '../../core/dom.js';
import { setState } from '../services/teacher-state.js';
import { submitDraft } from '../services/submission.service.js';
import { QuizDraft } from '../models/quiz-draft.model.js';

var qCount = 1;

export function renderTeacherQuizNew() {
  var app = document.getElementById('app');
  if (!app) return;
  requireTeacher().then(function (guard) {
    if (!guard.ok) { forbidden(app); return; }
    setState({ profile: guard.profile });
    app.innerHTML = shell();
    afterRender('');
    bindQuiz(app);
  });
}

function shell() {
  return '' +
    '<div class="dashboard-layout"><main class="main-content">' +
      '<header class="dashboard-header"><h1>Créer un quiz 📝</h1>' +
      '<p><a class="btn-secondary" href="#/teacher">← Retour au tableau de bord</a></p></header>' +
      '<div class="card ela-teacher-form">' +
        '<div class="form-field"><label>Titre du quiz</label>' +
          '<input type="text" id="tq-title" class="input" placeholder="Ex : Quiz A1 — Vocabulaire de base"></div>' +
        '<div id="tq-questions">' + questionBlock(0) + '</div>' +
        '<button class="btn-secondary" id="tq-add" type="button">+ Ajouter une question</button> ' +
        '<button class="btn-primary" id="tq-submit" type="button">Soumettre pour validation</button>' +
      '</div>' +
    '</main></div>';
}

function questionBlock(i) {
  var opts = '';
  for (var o = 0; o < 4; o++) {
    opts += '<div class="form-field" style="margin-bottom:8px"><label>Option ' + (o + 1) +
      (o === 0 ? ' (correcte par défaut)' : '') + '</label>' +
      '<input type="text" class="input" data-quiz-option="' + i + '" data-oi="' + o + '" placeholder="Réponse"></div>';
  }
  return '<div class="form-field" style="border-top:1px solid #eee;padding-top:12px;margin-top:12px">' +
    '<label>Question ' + (i + 1) + '</label>' +
    '<textarea class="input" data-quiz-text="' + i + '" placeholder="Énoncé de la question…"></textarea>' +
    opts +
    '<div class="form-field"><label>Réponse correcte</label>' +
      '<select class="input" data-quiz-correct="' + i + '">' +
        '<option value="0">Option 1</option><option value="1">Option 2</option>' +
        '<option value="2">Option 3</option><option value="3">Option 4</option>' +
      '</select></div>' +
  '</div>';
}

function bindQuiz(app) {
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
        toast(first || 'Quiz incomplet : titre + au moins une question avec 4 options.', 'error');
        return;
      }
      toast('Quiz soumis pour validation ✅', 'success');
      window.location.hash = '#/teacher';
    }).catch(function () { toast('Erreur lors de la soumission.', 'error'); });
  });
}

function forbidden(app) {
  app.innerHTML = '<div class="dashboard-layout"><main class="main-content">' +
    '<div class="empty-state"><div class="empty-icon">🔒</div>' +
    '<p>Accès réservé aux enseignants.</p>' +
    '<p style="margin-top:12px"><a class="btn btn-solid" href="#/login">Se connecter</a></p>' +
    '</div></main></div>';
  afterRender('');
}

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}