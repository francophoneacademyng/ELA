/* ============================================================
   ELA - admin/pages/admin-tools.page.js
   Page « Outils système » (/admin/tools).
   Outils de seed administrateur (callables seedAcademyA1,
   seedAcademyTree, seedLiveClasses) avec confirmation et toasts.
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { t } from '../../core/i18n-helpers.js';

var TOOLS = [
  { id: 'seed-a1', fn: 'seedAcademyA1', labelKey: 'admin.tools.seedA1', descKey: 'admin.tools.seedA1.desc' },
  { id: 'seed-tree', fn: 'seedAcademyTree', labelKey: 'admin.tools.seedTree', descKey: 'admin.tools.seedTree.desc' },
  { id: 'seed-live', fn: 'seedLiveClasses', labelKey: 'admin.tools.seedLive', descKey: 'admin.tools.seedLive.desc' }
];

export function renderAdminTools() {
  renderAdminShell({
    active: '#/admin/tools',
    title: t('admin.tools.title'),
    subtitle: t('admin.tools.subtitle'),
    needsData: false,
    renderContent: function () { return layoutHtml(); },
    onBind: function (app) { bindTools(app); }
  });
}

function layoutHtml() {
  var cards = TOOLS.map(function (tool) {
    return '<div class="content-card">' +
      '<div class="content-card-head"><h4>' + t(tool.labelKey) + '</h4></div>' +
      '<p class="muted">' + t(tool.descKey) + '</p>' +
      '<div class="content-actions">' +
        '<button class="btn btn-solid btn-sm" id="' + tool.id + '" data-tool="' + tool.fn + '">' + t('admin.tools.run') + '</button>' +
      '</div>' +
    '</div>';
  }).join('');

  return '<div class="card">' +
    '<div class="content-grid">' + cards + '</div>' +
    '<p class="muted" style="margin:0.8rem 0 0">' + t('admin.tools.idempotentNote') + '</p>' +
  '</div>';
}

function bindTools(app) {
  app.querySelectorAll('[data-tool]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tool = TOOLS.filter(function (x) { return x.fn === btn.getAttribute('data-tool'); })[0];
      var name = tool ? t(tool.labelKey) : btn.getAttribute('data-tool');
      if (!window.confirm(t('admin.tools.confirm') + ' « ' + name + ' » ?')) return;
      btn.disabled = true;
      callFunction(btn.getAttribute('data-tool')).then(function () {
        toast(t('admin.tools.done') + ' : ' + name + ' ✅', 'success');
      }).catch(function (e) {
        toast(t('admin.tools.failed') + ' : ' + ((e && (e.code || e.message)) || name), 'error');
      }).then(function () { btn.disabled = false; });
    });
  });
}
