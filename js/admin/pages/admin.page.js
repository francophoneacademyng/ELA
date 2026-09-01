/* ============================================================
   ELA — admin/pages/admin.page.js
   Page #/admin-v2 : composition du panel admin à partir des
   sections (réplique exacte du rendu admin existant, code
   modulaire en plus). Ancien code (renderAdmin dans app.js)
   reste actif sur #/admin jusqu'au switch Phase 4.
   ============================================================ */

import { requireAdmin } from '../../core/auth.service.js';
import { afterRender, toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { fetchAdminPanelData } from '../repositories/admin-data.repository.js';
import { getState, setState, reset } from '../services/admin-state.js';
import { refreshQueue } from '../services/admin-review.service.js';
import { overviewHtml } from './sections/overview.js';
import { revenueHtml } from './sections/revenue.js';
import { usersHtml } from './sections/users.js';
import { validationHtml, bindValidationEvents } from './sections/validation.js';
import { registerRenderer } from './refresh.js';

let currentRange = 30;
let currentSearch = '';

/** Point d'entrée de la route. */
export function renderAdminPage() {
  const app = document.getElementById('app');
  if (!app) return;

  requireAdmin().then(function (guard) {
    if (!guard.ok) {
      app.innerHTML = '<div class="container dashboard-section">' +
        '<h2>' + t('admin.title') + '</h2>' +
        '<p class="muted">' + t('admin.forbidden') + '</p>' +
        '<a class="btn btn-solid" href="#/login">' + t('nav.login') + '</a></div>';
      afterRender('');
      return;
    }
    if (!getState().users.length && !getState().loading) {
      loadAndRender();
    } else {
      paint();
    }
  });
}

function loadAndRender() {
  const app = document.getElementById('app');
  setState({ loading: true });
  app.innerHTML = '<div class="container">' +
    '<div class="skeleton" style="height:80px;margin-bottom:1rem"></div>' +
    '<div class="skeleton" style="height:220px"></div></div>';

  Promise.all([
    fetchAdminPanelData(),
    refreshQueue().catch(function () { return []; })
  ]).then(function (results) {
    const d = results[0];
    setState({
      loading: false,
      users: d.users, transactions: d.transactions,
      subscriptions: d.subscriptions, liveClasses: d.liveClasses,
      metrics: d.metrics
    });
    paint();
  }).catch(function () {
    setState({ loading: false });
    toast(t('teacher.error'), 'error');
    paint();
  });
}

function paint() {
  const app = document.getElementById('app');
  if (!app) return;
  const s = getState();

  app.innerHTML =
    '<div class="admin-layout">' +
      '<aside class="admin-sidebar">' +
        '<h3>' + t('admin.title') + '</h3>' +
        '<nav>' +
          '<a data-scroll="admin-v2-overview">' + t('admin.overview') + '</a>' +
          '<a data-scroll="admin-v2-revenue">' + t('admin.revenueThisMonth') + '</a>' +
          '<a data-scroll="admin-v2-users">' + t('admin.users') + '</a>' +
          '<a data-scroll="admin-v2-validation">' + t('admin.pendingReview') +
            (s.queue.length ? ' (' + s.queue.length + ')' : '') + '</a>' +
        '</nav>' +
      '</aside>' +
      '<div class="admin-main">' +
        '<div class="admin-hero"><h1>' + t('admin.title') + '</h1>' +
          '<button class="btn btn-ghost btn-sm" id="admin-v2-refresh">' + t('admin.refresh') + '</button></div>' +
        '<div id="admin-v2-overview">' + overviewHtml() + '</div>' +
        '<div id="admin-v2-revenue">' + revenueHtml(currentRange) + '</div>' +
        '<div id="admin-v2-users">' + usersHtml(currentSearch) + '</div>' +
        validationHtml() +
      '</div>' +
    '</div>';

  bindAdminEvents(app);
  afterRender('admin');
}

/** Bind unique par paint (délégation d'événements). */
function bindAdminEvents(app) {
  const refresh = document.getElementById('admin-v2-refresh');
  if (refresh) refresh.addEventListener('click', function () { reset(); loadAndRender(); });

  app.querySelectorAll('[data-scroll]').forEach(function (a) {
    a.addEventListener('click', function () {
      const el = document.getElementById(a.getAttribute('data-scroll'));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  app.querySelectorAll('[data-rev-range]').forEach(function (b) {
    b.addEventListener('click', function () {
      currentRange = Number(b.getAttribute('data-rev-range')) || 30;
      rerenderLocal(false);
    });
  });

  const search = document.getElementById('admin-users-search');
  if (search) {
    search.addEventListener('input', debounce(function () {
      currentSearch = search.value;
      rerenderLocal(true);
    }, 300));
  }

  bindValidationEvents(app);
}

/** Re-rendu local sans recharger les données (option : conserver le focus). */
function rerenderLocal(keepFocus) {
  const active = document.activeElement && document.activeElement.id;
  paint();
  if (keepFocus && active) {
    const el = document.getElementById(active);
    if (el) { el.focus(); const v = el.value; if (typeof v === 'string') { el.value = ''; el.value = v; } }
  }
}

function debounce(fn, ms) {
  let id = null;
  return function () {
    clearTimeout(id);
    id = setTimeout(fn, ms);
  };
}

registerRenderer(renderAdminPage);

