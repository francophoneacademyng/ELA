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

export function renderStudentHub() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth || !firebase.functions) {
    app.innerHTML = '' +
      '<div class="dashboard-layout">' +
        '<main class="main-content" style="margin-left:0;max-width:100%">' +
          '<div class="empty-state"><div class="empty-icon">⏳</div>' +
          '<p>' + t('common.loading') + '</p></div>' +
        '</main>' +
      '</div>';
    return;
  }

  app.innerHTML = '' +
    '<div class="dashboard-layout">' +
      '<main class="main-content" style="margin-left:0;max-width:100%">' +
        '<header class="dashboard-header">' +
          '<h1>' + t('dashboard.hello') + ', <span id="student-name">' + t('dashboard.learner') + '</span> 👋</h1>' +
          '<p>' + t('dashboard.hubSubtitle') + '</p>' +
        '</header>' +
        '<div id="student-kpis" class="kpi-grid">' +
          '<div class="kpi-card"><span class="kpi-label">📚 ' + t('dashboard.kpi.lessons') + '</span><div class="kpi-value" id="student-kpi-lessons">—</div></div>' +
          '<div class="kpi-card"><span class="kpi-label">🔥 ' + t('dashboard.kpi.streak') + '</span><div class="kpi-value" id="student-kpi-streak">—</div></div>' +
          '<div class="kpi-card"><span class="kpi-label">⭐ ' + t('dashboard.kpi.xp') + '</span><div class="kpi-value" id="student-kpi-xp">—</div></div>' +
        '</div>' +
        '<section class="section-title">' + t('dashboard.myAcademies') + '</section>' +
        '<div id="student-academies" class="academy-grid">' +
          '<div class="empty-state"><div class="empty-icon">⏳</div>' +
          '<p id="student-academies-status">' + t('dashboard.academiesLoading') + '</p></div>' +
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

      grid.innerHTML = html || '<div class="empty-state"><div class="empty-icon">🏗️</div>' +
        '<p>' + t('dashboard.noAcademies') + '</p></div>';
    }).catch(function (err) {
      // Bug corrigé : message clair + retry (plus de « Unable to load » brut).
      console.error('[student-hub] getMyAcademies/getDashboardData a échoué :', err);
      if (statusEl) statusEl.textContent = t('dashboard.academiesError');
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
