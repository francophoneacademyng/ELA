/* ============================================================
   ELA - teacher/pages/teacher-quizzes.page.js
   Page « Mes quiz » (/teacher/quizzes).
   Quiz de l'enseignant (soumissions type quiz) + bouton
   « + Nouveau quiz » → /teacher/quiz/new.
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { getState } from '../services/teacher-state.js';
import { refreshSubmissions } from '../services/submission.service.js';

export function renderTeacherQuizzes() {
  renderTeacherShell({
    active: '#/teacher/quizzes',
    title: 'Mes quiz 📝',
    subtitle: 'Vos quiz et leur statut de validation.',
    renderContent: function () { return layoutHtml(); },
    onBind: function (app) {
      refreshSubmissions().then(repaint).catch(function () {
        toast('Impossible de charger vos quiz.', 'error');
      });
    }
  });
}

function repaint() {
  var app = document.getElementById('app');
  if (!app) return;
  var card = app.querySelector('[data-quiz-list]');
  if (card) card.innerHTML = listInner();
}

function layoutHtml() {
  return '<div class="card" data-quiz-list>' + listInner() + '</div>';
}

function listInner() {
  var list = (getState().submissions || []).filter(function (s) { return s.type === 'quiz'; });
  if (!list.length) {
    return '<div class="empty-state"><div class="empty-icon">📝</div>' +
      '<p>Aucun quiz pour le moment.</p>' +
      '<p style="margin-top:12px"><a class="btn btn-solid" href="#/teacher/quiz/new">+ Créer mon premier quiz</a></p></div>';
  }
  var rows = list.map(function (s) {
    return '<tr><td>' + escapeHtml(s.title) + '</td>' +
      '<td>' + (s.createdAt ? formatDate(s.createdAt) : '—') + '</td>' +
      '<td>' + statusBadge(s.status) + '</td>' +
      '<td>' + (s.isApproved() ? '<span class="muted">Publié ✓</span>'
        : '<span class="muted">Validation en cours</span>') + '</td></tr>';
  }).join('');
  return '<div class="table-responsive"><table class="data-table">' +
    '<thead><tr><th>Titre</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<div style="margin-top:1rem"><a class="btn btn-solid" href="#/teacher/quiz/new">+ Nouveau quiz</a></div>';
}

function statusBadge(status) {
  var map = { pending: ['badge-wait', 'En attente'], approved: ['badge-ok', 'Approuvé'], rejected: ['badge-ko', 'Rejeté'] };
  var m = map[status] || ['badge-muted', status || '—'];
  return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
}