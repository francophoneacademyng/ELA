/* ============================================================
   ELA - admin/pages/admin-tools.page.js
   Page « Outils système » (/admin/tools).
   Outils de seed administrateur (callables seedAcademyA1,
   seedAcademyTree, seedLiveClasses) avec confirmation et toasts.
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';

var TOOLS = [
  { id: 'seed-a1', fn: 'seedAcademyA1', label: 'Injecter le programme A1',
    desc: 'Crée le curriculum A1 pour les 6 académies (idempotent).' },
  { id: 'seed-tree', fn: 'seedAcademyTree', label: "Injecter l'arbre académique",
    desc: "Reconstruit l'arbre levels/units/modules côté serveur (idempotent)." },
  { id: 'seed-live', fn: 'seedLiveClasses', label: 'Seed Live Classes',
    desc: 'Crée un jeu de classes live de démonstration (idempotent).' }
];

export function renderAdminTools() {
  renderAdminShell({
    active: '#/admin/tools',
    title: 'Outils système 🛠',
    subtitle: 'Actions d\'administration réservées — exécution côté serveur.',
    needsData: false,
    renderContent: function () { return layoutHtml(); },
    onBind: function (app) { bindTools(app); }
  });
}

function layoutHtml() {
  var cards = TOOLS.map(function (t) {
    return '<div class="content-card">' +
      '<div class="content-card-head"><h4>' + t.label + '</h4></div>' +
      '<p class="muted">' + t.desc + '</p>' +
      '<div class="content-actions">' +
        '<button class="btn btn-solid btn-sm" id="' + t.id + '" data-tool="' + t.fn + '">Exécuter</button>' +
      '</div>' +
    '</div>';
  }).join('');

  return '<div class="card">' +
    '<div class="content-grid">' + cards + '</div>' +
    '<p class="muted" style="margin:0.8rem 0 0">Chaque outil est idempotent : le relancer n\'écrase pas les données existantes.</p>' +
  '</div>';
}

function bindTools(app) {
  app.querySelectorAll('[data-tool]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var fn = btn.getAttribute('data-tool');
      if (!window.confirm('Exécuter « ' + fn + ' » maintenant ?')) return;
      btn.disabled = true;
      callFunction(fn).then(function () {
        toast('Outil « ' + fn + ' » exécuté ✅', 'success');
      }).catch(function (e) {
        toast('Échec : ' + ((e && (e.code || e.message)) || fn), 'error');
      }).then(function () { btn.disabled = false; });
    });
  });
}