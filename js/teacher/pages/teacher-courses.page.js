/* ============================================================
   ELA - teacher/pages/teacher-courses.page.js
   Page « Mes cours » (/teacher/courses).
   Leçons de l'enseignant (soumissions type lesson) avec statut
   de validation + bouton « + Nouveau cours ».
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { getState } from '../services/teacher-state.js';
import { refreshSubmissions } from '../services/submission.service.js';

var filter = 'all';

export function renderTeacherCourses() {
  renderTeacherShell({
    active: '#/teacher/courses',
    title: 'Mes cours 📚',
    subtitle: 'Vos leçons et leur statut de validation.',
    renderContent: function () { return layoutHtml(); },
    onBind: function (app) {
      app.querySelectorAll('[data-course-filter]').forEach(function (b) {
        b.addEventListener('click', function () {
          filter = b.getAttribute('data-course-filter') || 'all';
          repaint();
        });
      });
      refreshSubmissions().then(repaint).catch(function () {
        toast('Impossible de charger vos cours.', 'error');
      });
    }
  });
}

function repaint() {
  var app = document.getElementById('app');
  if (!app) return;
  var card = app.querySelector('[data-course-list]');
  if (card) card.innerHTML = listInner();
}

function items() {
  var subs = (getState().submissions || []).filter(function (s) { return s.type === 'lesson'; });
  if (filter === 'all') return subs;
  return subs.filter(function (s) { return s.status === filter; });
}

function layoutHtml() {
  return '<div class="card" data-course-list>' + listInner() + '</div>';
}

function listInner() {
  var list = items();
  var counts = { all: 0, approved: 0, pending: 0, rejected: 0 };
  (getState().submissions || []).forEach(function (s) {
    if (s.type !== 'lesson') return;
    counts.all++; counts[s.status] = (counts[s.status] || 0) + 1;
  });

  var filters = [['all', 'Tous'], ['approved', 'Approuvés'], ['pending', 'En attente'], ['rejected', 'Rejetés']]
    .map(function (f) {
      return '<button class="filter-btn' + (filter === f[0] ? ' active' : '') +
        '" data-course-filter="' + f[0] + '">' + f[1] + ' (' + (counts[f[0]] || 0) + ')</button>';
    }).join('');

  var body;
  if (!list.length) {
    body = '<div class="empty-state"><div class="empty-icon">📭</div>' +
      '<p>Aucun cours dans cette catégorie pour le moment.</p>' +
      '<p style="margin-top:12px"><a class="btn btn-solid" href="#/teacher/lesson/new">+ Créer mon premier cours</a></p></div>';
  } else {
    var rows = list.map(function (s) {
      return '<tr><td>' + escapeHtml(s.title) + '</td>' +
        '<td>' + (s.createdAt ? formatDate(s.createdAt) : '—') + '</td>' +
        '<td>' + statusBadge(s.status) + '</td>' +
        '<td>' + (s.isApproved() ? '<span class="muted">Publiée ✓</span>'
          : '<span class="muted">Validation en cours</span>') + '</td></tr>';
    }).join('');
    body = '<div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>Titre</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  return '<div class="chart-filters" style="margin-bottom:1rem">' + filters + '</div>' + body +
    '<div style="margin-top:1rem"><a class="btn btn-solid" href="#/teacher/lesson/new">+ Nouveau cours</a></div>';
}

function statusBadge(status) {
  var map = { pending: ['badge-wait', 'En attente'], approved: ['badge-ok', 'Approuvé'], rejected: ['badge-ko', 'Rejeté'] };
  var m = map[status] || ['badge-muted', status || '—'];
  return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
}