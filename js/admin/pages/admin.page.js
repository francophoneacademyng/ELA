/* ============================================================
   ELA - admin/pages/admin.page.js  (REFONTE PRODUCTION)
   Panel admin : sidebar + header + KPIs + académies (branding) +
   revenus (graphe) + certifications + validation + outils
   système (cachés). Réutilise les services/modèles existants.
   ============================================================ */

import { requireAdmin } from '../../core/auth.service.js';
import { afterRender, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { fetchAdminPanelData } from '../repositories/admin-data.repository.js';
import { getState, setState, reset } from '../services/admin-state.js';
import { refreshQueue, approveItem, rejectItem } from '../services/admin-review.service.js';
import { buildRevenueSeries } from '../services/admin-metrics.service.js';
import { adminSidebarHtml } from './admin-shell.js';
import { rejectModalHtml, openRejectModal, bindRejectModal } from '../components/reject-modal.js';
import { fmtNaira, formatDate, escapeHtml } from '../../core/dom.js';
import { certificationsHtml, bindCertificationsEvents } from './sections/certifications.js';
import { registerRenderer, rerender } from './refresh.js';

var ACADEMY_CARDS = [
  { code: 'FR', flag: 'FR', name: 'Francophone Academy', sub: 'Français · CECRL' },
  { code: 'DE', flag: 'DE', name: 'Germanophone Academy', sub: 'Deutsch · Goethe-Zertifikat' },
  { code: 'ZH', flag: 'ZH', name: 'Sinophone Academy', sub: '中文 · HSK' },
  { code: 'EN', flag: 'EN', name: 'Anglophone Pro Academy', sub: 'English · IELTS' },
  { code: 'AR', flag: 'AR', name: 'Arabophone Academy', sub: 'العربية · ALPT' },
  { code: 'RU', flag: 'RU', name: 'Russophone Academy', sub: 'Русский · TORFL' }
];

var COL_TYPE = { lessons: 'Leçon', quizzes: 'Quiz', liveClasses: 'Live' };
var revenueRange = 30;
export function renderAdminPage() {
  var app = document.getElementById('app');
  if (!app) return;
  requireAdmin().then(function (guard) {
    if (!guard.ok) {
      app.innerHTML = '<div class="dashboard-layout"><main class="main-content">' +
        '<div class="empty-state"><div class="empty-icon">🔒</div>' +
        '<p>Accès réservé aux administrateurs.</p>' +
        '<p style="margin-top:12px"><a class="btn btn-solid" href="#/login">Se connecter</a></p>' +
        '</div></main></div>';
      afterRender('');
      return;
    }
    var s = getState();
    if (!s.users.length && !s.loading) loadAndRender();
    else paint();
  });
}

function loadAndRender() {
  var app = document.getElementById('app');
  setState({ loading: true });
  app.innerHTML = '<div class="dashboard-layout"><main class="main-content">' +
    '<div class="empty-state"><div class="empty-icon">⏳</div><p>Chargement des données…</p></div>' +
    '</main></div>';

  Promise.all([
    fetchAdminPanelData(),
    refreshQueue().catch(function () { return []; })
  ]).then(function (results) {
    var d = results[0];
    setState({
      loading: false,
      users: d.users, transactions: d.transactions,
      subscriptions: d.subscriptions, liveClasses: d.liveClasses,
      metrics: d.metrics
    });
    paint();
  }).catch(function (e) {
    setState({ loading: false });
    console.error('[admin] chargement échoué :', e);
    toast('Les données du panel arrivent — réessayez dans un instant.', 'info');
    paint();
  });
}
function paint() {
  var app = document.getElementById('app');
  if (!app) return;
  var s = getState();

  /* --- KPIs calculés localement depuis l'état réel (users/transactions) --- */
  var users = s.users || [];
  var transactions = s.transactions || [];
  var now = new Date();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  var m = s.metrics || {};

  var revenueMonth = transactions.filter(function (t) {
    var d = new Date(t.createdAt || 0);
    return d >= monthStart && (t.status === 'success' || (t.isSuccessful && t.isSuccessful()));
  }).reduce(function (sum, t) { return sum + (t.amount || 0); }, 0);
  if (!revenueMonth && m.revenueThisMonth) revenueMonth = m.revenueThisMonth;

  var activeStudents = users.filter(function (u) { return u.role === 'student'; }).length;
  var newSignups7d = users.filter(function (u) {
    var d = new Date(u.createdAt || 0);
    return d.getTime() > 0 && (now - d) < 7 * 24 * 60 * 60 * 1000;
  }).length;
  if (!newSignups7d && m.newUsers7d) newSignups7d = m.newUsers7d;

  var academies = ACADEMY_CARDS.map(function (a) {
    return '<div class="academy-card"><span class="ac-flag">' + a.flag + '</span>' +
      '<h3>' + a.name + '</h3><p>' + a.sub + '</p></div>';
  }).join('');

  var loopback = s.queue || [];
  var valRows = loopback.map(function (it) {
    var key = it.key();
    return '<tr><td><span class="user-name">' + escapeHtml(it.title) + '</span></td>' +
      '<td>' + (COL_TYPE[it.collection] || it.collection) + '</td>' +
      '<td><span class="user-name">' + escapeHtml(it.teacherName || '—') + '</span></td>' +
      '<td>' + (it.submittedAt ? formatDate(it.submittedAt) : '—') + '</td>' +
      '<td><span class="badge badge-wait">En attente</span></td>' +
      '<td><button class="btn btn-solid btn-sm" data-approve="' + key + '" style="margin-right:6px">Approuver</button>' +
      '<button class="btn btn-ghost btn-sm" data-reject="' + key + '">Rejeter</button></td></tr>';
  }).join('');

  app.innerHTML =
    '<div class="dashboard-layout">' +
      '<aside class="sidebar">' + adminSidebarHtml('#/admin/overview') + '</aside>' +
      '<main class="main-content">' +
        '<header class="dashboard-header"><h1>Bonjour, Administrateur 👋</h1>' +
        '<p>Voici l\'activité d\'ELA aujourd\'hui.</p></header>' +
        '<section class="kpi-grid">' +
          kpiCard('👥 Utilisateurs', users.length, newSignups7d ? ('+' + newSignups7d + ' / 7 j') : '—') +
          kpiCard('👨‍🎓 Étudiants actifs', activeStudents) +
          kpiCard('💰 Revenus du mois', fmtNaira(revenueMonth)) +
          kpiCard('⚠️ À valider', loopback.length, null, true) +
        '</section>' +
        '<section class="section-title">Académies</section>' +
        '<div class="academy-grid">' + academies + '</div>' +
        revenueSectionHtml(s) +
        '<section class="section-title">Certifications</section>' +
        certificationsHtml() +
        validationSectionHtml(loopback, valRows) +
        toolsSectionHtml() +
        rejectModalHtml() +
      '</main>' +
    '</div>';

  bindEvents(app);
  afterRender('admin');
  bindCertificationsEvents(app);
}
function kpiCard(label, value, delta, alert) {
  return '<div class="kpi-card' + (alert ? ' kpi-alert' : '') + '">' +
    '<span class="kpi-label">' + label + '</span>' +
    '<div class="kpi-value">' + value + '</div>' +
    '<div class="kpi-delta">' + (delta || '—') + '</div>' +
    '</div>';
}

function revenueSectionHtml(s) {
  var series = buildRevenueSeries(s.transactions, revenueRange);
  var barMax = 1;
  series.forEach(function (p) { if (p.total > barMax) barMax = p.total; });
  var bars = series.map(function (p) {
    var h = Math.max(4, Math.round((p.total / barMax) * 120));
    return '<div class="bar' + (p.total ? '' : ' bar-empty') + '" style="height:' + h + 'px" ' +
      'title="' + p.label + ' · ' + fmtNaira(p.total) + '"></div>';
  }).join('');
  return '<section class="section-title">Revenus</section><div class="card">' +
    '<div class="chart-filters">' +
      '<button class="filter-btn' + (revenueRange === 7 ? ' active' : '') + '" data-range="7">7 jours</button>' +
      '<button class="filter-btn' + (revenueRange === 30 ? ' active' : '') + '" data-range="30">30 jours</button>' +
      '<button class="filter-btn' + (revenueRange === 90 ? ' active' : '') + '" data-range="90">90 jours</button>' +
    '</div>' +
    '<div class="bar-chart" id="admin-revenue-chart">' + bars + '</div>' +
  '</div>';
}

function validationSectionHtml(queue, rows) {
  var empty = '<div class="empty-state" id="admin-validation-empty">' +
    '<div class="empty-icon">🎉</div>' +
    '<p>Tout est à jour — Aucun contenu en attente de validation.</p></div>';
  var table = '<div class="table-responsive"><table class="data-table" id="admin-validation-table">' +
    '<thead><tr><th>Contenu</th><th>Type</th><th>Auteur</th><th>Date</th><th>Statut</th><th></th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
  return '<section class="section-title">Validation de contenu</section><div class="card">' +
    (queue.length ? table : empty) + '</div>';
}

function toolsSectionHtml() {
  return '<section class="section-title" id="tools-toggle" style="cursor:pointer">🛠 Outils système ▾</section>' +
    '<div class="card" id="tools-panel" style="display:none">' +
      '<button class="btn-tool" id="seed-a1">Injecter le programme A1</button>' +
      '<button class="btn-tool" id="seed-tree">Injecter l\'arbre académique</button>' +
      '<button class="btn-tool" id="seed-live">Seed Live Classes</button>' +
    '</div>';
}

function bindEvents(app) {
  var toolsToggle = document.getElementById('tools-toggle');
  var toolsPanel = document.getElementById('tools-panel');
  if (toolsToggle && toolsPanel) {
    toolsToggle.addEventListener('click', function () {
      toolsPanel.style.display = toolsPanel.style.display === 'none' ? '' : 'none';
    });
  }

  app.querySelectorAll('[data-range]').forEach(function (b) {
    b.addEventListener('click', function () {
      revenueRange = Number(b.getAttribute('data-range')) || 30;
      rerender();
    });
  });

  wireSeed(document.getElementById('seed-a1'), 'seedAcademyA1');
  wireSeed(document.getElementById('seed-tree'), 'seedAcademyTree');
  wireSeed(document.getElementById('seed-live'), 'seedLiveClasses');

  app.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-approve],[data-reject]') : null;
    if (!btn) return;
    var key = btn.getAttribute('data-approve') || btn.getAttribute('data-reject');
    var isApprove = btn.hasAttribute('data-approve');
    var item = getState().queue.filter(function (x) { return x.key() === key; })[0];
    if (!item) return;
    if (isApprove) {
      approveItem(item).then(function () { toast('Contenu approuvé ✅', 'success'); rerender(); })
        .catch(function () { toast('Erreur lors de l\'approbation.', 'error'); });
    } else {
      openRejectModal(key);
    }
  });

  bindRejectModal(function (key, reason) {
    var item = getState().queue.filter(function (x) { return x.key() === key; })[0];
    if (!item) return Promise.resolve();
    return rejectItem(item, reason).then(function () { toast('Contenu rejeté ❌', 'success'); rerender(); })
      .catch(function (e2) { toast(e2 && e2.code === 'reason-required' ? 'Un motif est requis.' : 'Erreur lors du rejet.', 'error'); });
  });
}

function wireSeed(btn, fnName) {
  if (!btn) return;
  btn.addEventListener('click', function () {
    btn.disabled = true;
    callFunction(fnName).then(function () { toast('Seed « ' + fnName + ' » exécuté ✅', 'success'); })
      .catch(function (e) { toast('Seed échoué : ' + ((e && (e.code || e.message)) || fnName), 'error'); })
      .then(function () { btn.disabled = false; });
  });
}

registerRenderer(renderAdminPage);