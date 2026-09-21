/* ============================================================
   ELA — ela/pages/student-hub.page.js
   Hub étudiant « Mes académies » (refonte production) :
   - Header + KPI (leçons, streak, XP)
   - Grille des académies (branding : Francophone, Germanophone…)
   Source de vérité : Cloud Functions getMyAcademies + getDashboardData.
   Bug corrigé : plus aucun « Unable to load » brut — message clair
   + retry automatique.
   ============================================================ */

import { ACADEMIES, ACADEMY_ORDER } from '../../shared/config/academies.config.js';
import { getMyAcademies } from '../../shared/components/academy/academy-access.js';
import { callFunction } from '../../js/core/api-client.js';
import { t } from '../../js/core/i18n-helpers.js';

const XP_PER_LESSON = 10;
const OPT_KEY = { FR: 'francophone', DE: 'germanophone', ZH: 'sinophone', EN: 'anglophone', AR: 'arabophone', RU: 'russophone' };

function academyLabel(code, fallback) {
  var opt = OPT_KEY[String(code || '').toUpperCase()];
  return opt ? t('academies.option.' + opt) : (fallback || code || '');
}

/* Icônes SVG inline pour les KPI (trait currentColor, harmonisées ELA). */
var KPI_ICONS = {
  lessons: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  streak: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2c1 4-4 6-4 11a4 4 0 0 0 8 0c0-2-.8-3.4-1.6-4.6C13.5 10 15 9 12 2z"/></svg>',
  xp: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 17 5.5 21 7.5 13.8 2 9.3 9 9"/></svg>'
};
/* Icônes SVG des états vides / chargement. */
var ICON_CLOCK = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
var ICON_SPARK = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>';
var PROFILE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

function kpiCard(icon, labelKey, valueId) {
  return '<div class="kpi-card student-kpi">' +
    '<span class="kpi-label student-kpi-label"><span class="student-kpi-icon" aria-hidden="true">' + KPI_ICONS[icon] + '</span>' + t(labelKey) + '</span>' +
    '<div class="kpi-value" id="' + valueId + '">—</div></div>';
}

export function renderStudentHub() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth || !firebase.functions) {
    app.innerHTML = '' +
      '<div class="dashboard-layout">' +
        '<main class="main-content" style="margin-left:0;max-width:100%">' +
          '<div class="empty-state student-empty"><div class="empty-icon">' + ICON_CLOCK + '</div>' +
          '<p>' + t('common.loading') + '</p></div>' +
        '</main>' +
      '</div>';
    return;
  }

  app.innerHTML = '' +
    '<div class="dashboard-layout">' +
      '<main class="main-content" style="margin-left:0;max-width:100%">' +
        '<header class="dashboard-header">' +
          '<h1>' + t('dashboard.hello') + ', <span id="student-name">' + t('dashboard.learner') + '</span></h1>' +
          '<p>' + t('dashboard.hubSubtitle') + '</p>' +
          '<a class="student-header-link" href="#/profile" aria-label="' + t('profile.title') + '">' +
            '<span class="student-kpi-icon" aria-hidden="true">' + PROFILE_ICON + '</span>' + t('profile.title') +
          '</a>' +
        '</header>' +
        '<div id="student-kpis" class="kpi-grid">' +
          kpiCard('lessons', 'dashboard.kpi.lessons', 'student-kpi-lessons') +
          kpiCard('streak', 'dashboard.kpi.streak', 'student-kpi-streak') +
          kpiCard('xp', 'dashboard.kpi.xp', 'student-kpi-xp') +
        '</div>' +
        '<section class="section-title">' + t('dashboard.myAcademies') + '</section>' +
        '<div id="student-academies" class="academy-grid">' +
          '<div class="empty-state student-empty"><div class="empty-icon">' + ICON_CLOCK + '</div>' +
          '<p id="student-academies-status" role="status" aria-live="polite">' + t('dashboard.academiesLoading') + '</p></div>' +
        '</div>' +
      '</main>' +
    '</div>';

  const grid = document.getElementById('student-academies');
  const statusEl = document.getElementById('student-academies-status');
  const nameEl = document.getElementById('student-name');

  function load() {
    Promise.all([
      getMyAcademies(),
      callFunction('getDashboardData').catch(function () { return null; })
    ]).then(function (results) {
      const active = results[0] || [];
      const dash = results[1] || {};
      const userInfo = dash.user || {};
      const progress = dash.progress || { completed: 0, total: 0 };
      const quizStats = dash.quizStats || { streak: 0 };

      if (nameEl) {
        nameEl.textContent = (userInfo && (userInfo.displayName || userInfo.name))
          || (userInfo && userInfo.email ? userInfo.email.split('@')[0] : t('dashboard.learner'));
      }

      const lessonsEl = document.getElementById('student-kpi-lessons');
      const streakEl = document.getElementById('student-kpi-streak');
      const xpEl = document.getElementById('student-kpi-xp');
      if (lessonsEl) lessonsEl.textContent = String(progress.completed || 0);
      if (streakEl) streakEl.textContent = String(quizStats.streak || 0) + t('dashboard.streakUnit');
      if (xpEl) xpEl.textContent = String((progress.completed || 0) * XP_PER_LESSON);

      const html = ACADEMY_ORDER.map(function (code) {
        const a = ACADEMIES[code];
        const isActive = active.indexOf(code) >= 0;
        const href = isActive ? '#/academy/' + code + '/dashboard' : '#/pricing';
        const cta = isActive ? t('dashboard.continue') + ' →' : t('dashboard.unlockSubscription');
        return '' +
          '<a class="academy-card" href="' + href + '" style="border-left-color:' + a.color + '">' +
            '<span class="ac-flag">' + a.flag + '</span>' +
            '<h3>' + esc(academyLabel(code, a.label)) + '</h3>' +
            '<p>' + esc(a.native) + ' · ' + esc(a.certification) + '</p>' +
            '<span class="ac-cta">' + esc(cta) + '</span>' +
          '</a>';
      }).join('');

      grid.innerHTML = html || '<div class="empty-state student-empty"><div class="empty-icon">' + ICON_SPARK + '</div>' +
        '<p>' + t('dashboard.noAcademies') + '</p></div>';
    }).catch(function (err) {
      // Bug corrigé : message clair + retry (plus de « Unable to load » brut).
      console.error('[student-hub] getMyAcademies/getDashboardData a échoué :', err);
      if (statusEl) {
        statusEl.textContent = t('dashboard.academiesError');
        statusEl.classList.add('ac-status-error');
      }
      setTimeout(function () { if (document.body.contains(grid)) load(); }, 3000);
    });
  }

  load();
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
