/* ============================================================
   ELA - teacher/pages/teacher-lesson.page.js
   Page dédiée « Créer une leçon » (formulaire séparé du dashboard).
   Formulaire simple, soumission via submitDraft (serveur).
   ============================================================ */

import { requireTeacher } from '../../core/auth.service.js';
import { afterRender, toast } from '../../core/dom.js';
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

function shell() {
  var levelOpts = LESSON_LEVELS.map(function (l) {
    return '<option value="' + l + '">' + l.charAt(0).toUpperCase() + l.slice(1) + '</option>';
  }).join('');
  return '' +
    '<div class="dashboard-layout"><main class="main-content">' +
      '<header class="dashboard-header"><h1>Créer une leçon ✏️</h1>' +
      '<p><a class="btn-secondary" href="#/teacher">← Retour au tableau de bord</a></p></header>' +
      '<div class="card ela-teacher-form">' +
        '<div class="form-field"><label>Titre</label>' +
          '<input type="text" id="tl-title" class="input" placeholder="Ex : Les salutations (A1)"></div>' +
        '<div class="form-field"><label>Description</label>' +
          '<textarea id="tl-desc" class="input" placeholder="Résumé court"></textarea></div>' +
        '<div class="form-field"><label>Contenu</label>' +
          '<textarea id="tl-content" class="input" style="min-height:180px" placeholder="Contenu de la leçon…"></textarea></div>' +
        '<div class="form-field"><label>Niveau</label>' +
          '<select id="tl-level" class="input">' + levelOpts + '</select></div>' +
        '<button class="btn-primary" id="tl-submit">Soumettre pour validation</button>' +
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
      toast(first || 'Vérifiez les champs du formulaire.', 'error');
      return;
    }
    toast('Contenu soumis pour validation ✅', 'success');
    window.location.hash = '#/teacher';
  }).catch(function () {
    toast('Erreur lors de la soumission.', 'error');
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