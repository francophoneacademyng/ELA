/* ============================================================
   ELA - teacher/pages/teacher-live-list.page.js
   Page « Mes classes Live » (/teacher/live).
   Classes live de l'enseignant (soumissions type live) + bouton
   « + Nouvelle classe » → /teacher/live/new. Le lien de
   réunion est communiqué aux étudiants après validation.
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { getState } from '../services/teacher-state.js';
import { refreshSubmissions } from '../services/submission.service.js';

export function renderTeacherLiveList() {
  renderTeacherShell({
    active: '#/teacher/live',
    title: 'Mes classes Live 🔴',
    subtitle: 'Vos classes en direct et leur statut de validation.',
    renderContent: function () { return layoutHtml(); },
    onBind: function (app) {
      refreshSubmissions().then(repaint).catch(function () {
        toast('Impossible de charger vos classes Live.', 'error');
      });
    }
  });
}

function repaint() {
  var app = document.getElementById('app');
  if (!app) return;
  var card = app.querySelector('[data-live-list]');
  if (card) card.innerHTML = listInner();
}

function layoutHtml() {
  return '<div class="card" data-live-list>' + listInner() + '</div>';
}

function listInner() {
  var list = (getState().submissions || []).filter(function (s) { return s.type === 'live'; });
  if (!list.length) {
    return '<div class="empty-state"><div class="empty-icon">🔴</div>' +
      '<p>Aucune classe Live pour le moment.</p>' +
      '<p style="margin-top:12px"><a class="btn btn-solid" href="#/teacher/live/new">+ Programmer ma première classe</a></p></div>';
  }
  var rows = list.map(function (s) {
    return '<tr><td><span class="user-name">' + escapeHtml(s.title) + '</span></td>' +
      '<td>' + (s.createdAt ? formatDate(s.createdAt) : '—') + '</td>' +
      '<td>' + (s.isApproved() ? '<span class="muted">Communiqué aux étudiants</span>'
        : '<span class="muted">Après validation</span>') + '</td>' +
      '<td>' + statusBadge(s.status) + '</td></tr>';
  }).join('');
  return '<div class="table-responsive"><table class="data-table">' +
    '<thead><tr><th>Titre</th><th>Date</th><th>Lien</th><th>Statut</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<div style="margin-top:1rem"><a class="btn btn-solid" href="#/teacher/live/new">+ Nouvelle classe</a></div>';
}

function statusBadge(status) {
  var map = { pending: ['badge-wait', 'En attente'], approved: ['badge-ok', 'Approuvé'], rejected: ['badge-ko', 'Rejeté'] };
  var m = map[status] || ['badge-muted', status || '—'];
  return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
}