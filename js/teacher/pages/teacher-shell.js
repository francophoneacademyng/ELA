/* ============================================================
   ELA - teacher/pages/teacher-shell.js
   Coquille partagée des pages enseignant (sidebar + header + garde).
   Réutilisée par le dashboard et les pages /teacher/*.
   ============================================================ */

import { requireTeacher, getProfile } from '../../core/auth.service.js';
import { afterRender, escapeHtml } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { setState } from '../services/teacher-state.js';

/* --- Sidebar partagée, avec l'item actif mis en surbrillance. --- */
export function teacherSidebarHtml(active) {
  function a(href, label) {
    return '<a href="' + href + '" class="nav-item' + (active === href ? ' active' : '') + '">' + label + '</a>';
  }
  return '' +
    '<div class="sidebar-brand">' + t('teacher.sidebar.brand') + '</div>' +
    '<nav class="sidebar-nav">' +
      a('#/teacher', '🏠 ' + t('teacher.sidebar.dashboard')) +
      '<div class="nav-section">' + t('teacher.navGroup.content') + '</div>' +
      a('#/teacher/courses', '📚 ' + t('teacher.sidebar.courses')) +
      a('#/teacher/quizzes', '📝 ' + t('teacher.sidebar.quizzes')) +
      a('#/teacher/live', '🔴 ' + t('teacher.sidebar.live')) +
      '<div class="nav-section">' + t('teacher.navGroup.management') + '</div>' +
      a('#/teacher/students', '👥 ' + t('teacher.sidebar.students')) +
      a('#/teacher/stats', '📊 ' + t('teacher.sidebar.stats')) +
      '<div class="nav-section">' + t('teacher.navGroup.account') + '</div>' +
      a('#/teacher/profile', '⚙️ ' + t('teacher.sidebar.profile')) +
    '</nav>';
}

/** Bloc « accès refusé » (partagé par toutes les pages enseignant). */
export function forbiddenTeacher(app) {
  app.innerHTML = '<div class="dashboard-layout"><main class="main-content">' +
    '<div class="empty-state"><div class="empty-icon">🔒</div>' +
    '<p>' + t('teacher.gate.body') + '</p>' +
    '<p style="margin-top:12px"><a class="btn btn-solid" href="#/login">' + t('nav.login') + '</a></p>' +
    '</div></main></div>';
  afterRender('');
}

/**
 * Rendu d'une page enseignant complète.
 * @param {object} config
 *   active     : href du nav-item actif (ex "#/teacher/courses")
 *   title      : titre du header
 *   subtitle   : sous-titre du header
 *   renderContent : (profile) => html final
 *   onBind     : (app) => attache les evenements apres rendu final
 */
export function renderTeacherShell(config) {
  const app = document.getElementById('app');
  if (!app) return Promise.resolve(false);
  return requireTeacher().then(function (guard) {
    if (!guard.ok) { forbiddenTeacher(app); return false; }
    setState({ profile: guard.profile });
    const html = config.renderContent ? config.renderContent(guard.profile) : '';
    write(app, config, html);
    if (config.onBind) config.onBind(app);
    return true;
  });
}

function write(app, config, content) {
  const name = (config.profileName && config.profileName()) || '';
  app.innerHTML =
    '<div class="dashboard-layout">' +
      '<aside class="sidebar">' + teacherSidebarHtml(config.active) + '</aside>' +
      '<main class="main-content">' +
        '<header class="dashboard-header"><h1>' + config.title + '</h1>' +
          (config.subtitle ? '<p>' + config.subtitle + '</p>' : '') +
        '</header>' +
        content +
      '</main>' +
    '</div>';
  afterRender('');
}
