/* ============================================================
   ELA - admin/pages/admin-content.page.js
   Page « Validation de contenu » (/admin/content).
   File d'attente (callable getAdminQueue via refreshQueue) avec
   filtres Tous / En attente / Approuvé / Rejeté + actions
   Approuver / Rejeter (motif obligatoire, callable reviewContent).
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { getState } from '../services/admin-state.js';
import { refreshQueue, approveItem, rejectItem } from '../services/admin-review.service.js';
import { rejectModalHtml, openRejectModal, bindRejectModal } from '../components/reject-modal.js';

var COL_TYPE = { lessons: 'Leçon', quizzes: 'Quiz', liveClasses: 'Live' };

/* Mémoire de session : éléments traités depuis cette page
   (la file serveur ne contient que les contenus en attente). */
var reviewed = [];
var filter = 'all';

export function renderAdminContent() {
  renderAdminShell({
    active: '#/admin/content',
    title: 'Contenu 📚',
    subtitle: 'Bibliothèque de cours et leçons.',
    renderContent: function (s) { return kpisHtml() + layoutHtml(s.queue || []); },
    onBind: function (app) { loadStats(); bindContentEvents(app); }
  });
}

/* KPIs contenus via getContentStats (callable management.js). */
function loadStats() {
  callFunction('getContentStats', {}).then(function (st) {
    setVal('content-courses', st && st.courses);
    setVal('content-published', st && st.published);
    setVal('content-drafts', st && st.drafts);
  }).catch(function () {
    setVal('content-courses', 0); setVal('content-published', 0); setVal('content-drafts', 0);
  });
}

function setVal(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(v === undefined ? 0 : v);
}

function kpisHtml() {
  return '<div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">' +
    '<div class="kpi-card"><div class="kpi-label" style="font-size:11px;">COURS</div>' +
      '<div class="kpi-value" id="content-courses">…</div></div>' +
    '<div class="kpi-card"><div class="kpi-label" style="font-size:11px;">PUBLIÉS</div>' +
      '<div class="kpi-value" id="content-published">…</div></div>' +
    '<div class="kpi-card"><div class="kpi-label" style="font-size:11px;">BROUILLONS</div>' +
      '<div class="kpi-value" id="content-drafts">…</div></div>' +
  '</div>' +
  '<div style="display:flex;gap:12px;margin-bottom:24px;">' +
    '<a class="btn btn-outline btn-sm" href="#/teacher/lesson/new">📹 Ouvrir le studio vidéo</a>' +
    '<a class="btn btn-outline btn-sm" href="#/teacher/courses">🎬 Bibliothèque vidéo</a>' +
  '</div>' + rejectModalHtml();
}

function layoutHtml(queue) {
  var pending = queue || [];
  var lists = {
    all: pending.concat(reviewed),
    pending: pending,
    approved: reviewed.filter(function (r) { return r.status === 'approved'; }),
    rejected: reviewed.filter(function (r) { return r.status === 'rejected'; })
  };
  var items = lists[filter] || lists.all;

  var filters = [['all', 'Tous'], ['pending', 'En attente'], ['approved', 'Approuvé'], ['rejected', 'Rejeté']]
    .map(function (f) {
      return '<button class="filter-btn' + (filter === f[0] ? ' active' : '') +
        '" data-content-filter="' + f[0] + '">' + f[1] + ' (' + lists[f[0]].length + ')</button>';
    }).join('');

  var body;
  if (!items.length) {
    body = '<div class="empty-state"><div class="empty-icon">🎉</div>' +
      '<p>' + (filter === 'pending' || filter === 'all'
        ? 'Tout est à jour — Aucun contenu en attente de validation.'
        : 'Aucun élément dans cette catégorie pour le moment.') + '</p></div>';
  } else {
    var rows = items.map(function (it) {
      var isPending = !!(it.key && typeof it.key === 'function'); // ContentItem de la file
      var statut = isPending
        ? '<span class="badge badge-wait">En attente</span>'
        : (it.status === 'approved'
          ? '<span class="badge badge-ok">Approuvé</span>'
          : '<span class="badge badge-ko">Rejeté</span>');
      var actions = isPending
        ? '<button class="btn btn-solid btn-sm" data-approve="' + it.key() + '" style="margin-right:6px">Approuver</button>' +
          '<button class="btn btn-ghost btn-sm" data-reject="' + it.key() + '">Rejeter</button>'
        : '<span class="muted">—</span>';
      return '<tr><td><span class="user-name">' + escapeHtml(it.title) + '</span></td>' +
        '<td>' + (COL_TYPE[it.collection] || it.collection || '—') + '</td>' +
        '<td><span class="user-name">' + escapeHtml(it.teacherName || '—') + '</span></td>' +
        '<td>' + (it.submittedAt ? formatDate(it.submittedAt) : '—') + '</td>' +
        '<td>' + statut + '</td>' +
        '<td>' + actions + '</td></tr>';
    }).join('');
    body = '<div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>Contenu</th><th>Type</th><th>Auteur</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  return '<div class="card">' +
    '<div class="chart-filters" style="margin-bottom:1rem">' + filters + '</div>' +
    body +
  '</div>';
}

function bindContentEvents(app) {
  app.querySelectorAll('[data-content-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      filter = b.getAttribute('data-content-filter') || 'all';
      renderAdminContent();
    });
  });

  app.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-approve],[data-reject]') : null;
    if (!btn) return;
    var key = btn.getAttribute('data-approve') || btn.getAttribute('data-reject');
    var isApprove = btn.hasAttribute('data-approve');
    var item = (getState().queue || []).filter(function (x) {
      return x.key && typeof x.key === 'function' && x.key() === key;
    })[0];
    if (!item) return;
    if (isApprove) {
      approveItem(item).then(function () {
        remember(item, 'approved');
        toast('Contenu approuvé ✅', 'success');
        renderAdminContent();
      }).catch(function () { toast("Erreur lors de l'approbation.", 'error'); });
    } else {
      openRejectModal(key);
    }
  });

  bindRejectModal(function (key, reason) {
    var item = (getState().queue || []).filter(function (x) {
      return x.key && typeof x.key === 'function' && x.key() === key;
    })[0];
    if (!item) return Promise.resolve();
    return rejectItem(item, reason).then(function () {
      remember(item, 'rejected');
      toast('Contenu rejeté ❌', 'success');
      renderAdminContent();
    }).catch(function (e2) {
      toast(e2 && e2.code === 'reason-required' ? 'Un motif est requis.' : 'Erreur lors du rejet.', 'error');
    });
  });
}

function remember(item, status) {
  reviewed.unshift({
    title: item.title, collection: item.collection, teacherName: item.teacherName,
    submittedAt: item.submittedAt, status: status
  });
}