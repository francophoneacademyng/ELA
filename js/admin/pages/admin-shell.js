/* ============================================================
   ELA - admin/pages/admin-shell.js
   Coquille partagée des pages admin (sidebar + header + garde).
   Évite la duplication du markup sidebar entre le dashboard et
   les pages /admin/* (utilisateurs, enseignants, revenus, etc.).
   ============================================================ */

import { requireAdmin } from '../../core/auth.service.js';
import { afterRender } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { fetchAdminPanelData } from '../repositories/admin-data.repository.js';
import { refreshQueue } from '../services/admin-review.service.js';
import { getState, setState } from '../services/admin-state.js';

/* --- Sidebar partagée, avec l'item actif mis en surbrillance. --- */
export function adminSidebarHtml(active) {
  function a(href, label) {
    return '<a href="' + href + '" class="nav-item' + (active === href ? ' active' : '') + '">' + label + '</a>';
  }
  return '' +
    '<div class="sidebar-brand">' + t('admin.shell.title.brand') + '</div>' +
    '<nav class="sidebar-nav">' +
      a('#/admin/overview', '🏠 ' + t('admin.overview')) +
      '<div class="nav-section">' + t('admin.navGroup.gestion') + '</div>' +
      a('#/admin/live', '🔴 ' + t('admin.live')) +
      a('#/admin/users', '👥 ' + t('admin.users')) +
      a('#/admin/teachers', '👨‍🏫 ' + t('admin.teachers')) +
      a('#/admin/academies', '🎓 ' + t('admin.academies')) +
      '<div class="nav-section">' + t('admin.navGroup.content') + '</div>' +
      a('#/admin/content', '📚 ' + t('admin.content')) +
      a('#/admin/examinations', '📝 ' + t('admin.exam.title', 'Examinations')) +
      a('#/admin/whatsapp', '💬 ' + t('admin.whatsapp')) +
      '<div class="nav-section">' + t('admin.navGroup.finance') + '</div>' +
      a('#/admin/payments', '💳 ' + t('admin.payments')) +
      a('#/admin/referrals', '🎁 ' + t('admin.referrals')) +
      a('#/admin/invoices', '📄 ' + t('admin.invoices')) +
      '<div class="nav-section">' + t('admin.navGroup.certifications') + '</div>' +
      a('#/admin/certificates', '🏆 ' + t('admin.certificates')) +
      '<div class="nav-section">' + t('admin.navGroup.system') + '</div>' +
      a('#/admin/tools', '🛠 ' + t('admin.tools')) +
    '</nav>';
}

/** Bloc « accès refusé » (partagé par toutes les pages admin). */
export function forbiddenAdmin(app) {
  app.innerHTML = '<div class="dashboard-layout"><main class="main-content">' +
    '<div class="empty-state"><div class="empty-icon">🔒</div>' +
    '<p>' + t('admin.gate.body') + '</p>' +
    '<p style="margin-top:12px"><a class="btn btn-solid" href="#/login">' + t('nav.login') + '</a></p>' +
    '</div></main></div>';
  afterRender('');
}

/* --- Chargement paresseux des données admin (partagé avec le dashboard). --- */
export function ensureAdminData() {
  const s = getState();
  if (s.loading) return Promise.resolve(s);
  if (s.users.length) return Promise.resolve(s);
  setState({ loading: true });
  return Promise.all([
    fetchAdminPanelData(),
    refreshQueue().catch(function () { return []; })
  ]).then(function (results) {
    const d = results[0] || {};
    setState({
      loading: false, error: null,
      users: d.users || [], transactions: d.transactions || [],
      subscriptions: d.subscriptions || [], liveClasses: d.liveClasses || [],
      metrics: d.metrics || {}
    });
    return getState();
  }).catch(function (e) {
    console.warn('[admin-shell] getAdminPanelData a échoué :', e && (e.code || e.message));
    setState({ loading: false, error: e });
    return getState();
  });
}

/**
 * État vide premium, différencié selon la cause réelle :
 *  - résultat vide        → invitation sereine (aucune donnée encore)
 *  - permission-denied    → rôle admin manquant sur le compte
 *  - unauthenticated      → session expirée
 *  - autre / indisponible → service momentanément indisponible + réessai
 * Aucun ⚠️ alarmiste : ton neutre, icône douce, action claire.
 */
function adminStateHtml(s) {
  const e = s.error;
  const code = e && e.code ? String(e.code) : '';

  if (!e) {
    // Résultat vide : la plateforme n'a pas encore de données.
    return '<div class="empty-state"><div class="empty-icon">🌱</div>' +
      '<h3>' + t('admin.empty.startup.title') + '</h3>' +
      '<p>' + t('admin.empty.startup.body') + '</p>' +
      '<button class="btn btn-outline btn-sm" id="admin-retry-load">🔄 ' + t('admin.refresh') + '</button></div>';
  }

  if (code === 'permission-denied') {
    return '<div class="empty-state"><div class="empty-icon">🔑</div>' +
      '<h3>' + t('admin.forbidden.title') + '</h3>' +
      '<p>' + t('admin.forbidden.body') + '</p></div>';
  }

  if (code === 'unauthenticated') {
    return '<div class="empty-state"><div class="empty-icon">⏳</div>' +
      '<h3>' + t('admin.session.expired') + '</h3>' +
      '<p>' + t('admin.session.expired.body') + '</p>' +
      '<p style="margin-top:12px"><a class="btn btn-solid" href="#/login">' + t('nav.login') + '</a></p></div>';
  }

  // Indisponibilité passagère (fonction non déployée, réseau, quota…)
  return '<div class="empty-state"><div class="empty-icon">📡</div>' +
    '<h3>' + t('admin.unavailable.title') + '</h3>' +
    '<p>' + t('admin.unavailable.body') + '</p>' +
    '<button class="btn btn-outline btn-sm" id="admin-retry-load">🔄 ' + t('admin.unavailable.retry') + '</button></div>';
}

/** (Ré)essaie le chargement puis réaffiche la page. */
function retryLoad(config) {
  return function () {
    const btn = document.getElementById('admin-retry-load');
    if (btn) { btn.disabled = true; btn.textContent = t('common.loading'); }
    ensureAdminData().then(function () { renderAdminShell(config); });
  };
}

/**
 * Rendu d'une page admin complète.
 * @param {object} config
 *   active       : href du nav-item actif (ex "#/admin/users")
 *   title        : titre du header
 *   subtitle     : sous-titre du header
 *   renderStatic : () => html affiché immédiatement (optionnel)
 *   renderContent: (state) => html final après chargement des données
 *   onBind       : (app) => attache les événements après rendu final
 *   needsData    : true si la page dépend des données admin (défaut true)
 */
export function renderAdminShell(config) {
  const app = document.getElementById('app');
  if (!app) return Promise.resolve(false);
  return requireAdmin().then(function (guard) {
    if (!guard.ok) { forbiddenAdmin(app); return false; }
    const staticHtml = config.renderStatic ? config.renderStatic() : '';
    write(app, config, staticHtml);

    if (config.needsData === false) {
      if (config.renderContent) write(app, config, config.renderContent(getState()));
      if (config.onBind) config.onBind(app);
      return true;
    }
    return ensureAdminData().then(function (s) {
      if (s.error && !s.users.length) {
        // Vraie erreur serveur/permissions : état premium différencié
        // (jamais le bloc alarmiste « Impossible de charger »).
        // Sans erreur, chaque page rend son propre empty state.
        write(app, config, adminStateHtml(s));
        const retry = document.getElementById('admin-retry-load');
        if (retry) retry.addEventListener('click', retryLoad(config));
        return false;
      }
      if (config.renderContent) write(app, config, config.renderContent(s));
      if (config.onBind) config.onBind(app);
      return true;
    });
  });
}

function write(app, config, content) {
  app.innerHTML =
    '<div class="dashboard-layout">' +
      '<aside class="sidebar">' + adminSidebarHtml(config.active) + '</aside>' +
      '<main class="main-content">' +
        '<header class="dashboard-header"><h1>' + config.title + '</h1>' +
          (config.subtitle ? '<p>' + config.subtitle + '</p>' : '') +
        '</header>' +
        content +
      '</main>' +
    '</div>';
  afterRender('');
}