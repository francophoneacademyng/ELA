/* ============================================================
   ELA â€” academies/base/pages/dashboard.factory.js
   Fabrique du dashboard immersif d'une acadÃ©mie.
   ============================================================ */

import { mountShell, academyDisplayName } from '../../../shared/components/academy/academy-shell.js';
import { checkAcademyAccess } from '../../../shared/components/academy/academy-access.js';
import { levelCards } from '../../../shared/components/academy/level-cards.js';
import { progressRing } from '../../../shared/components/academy/progress-ring.js';
import { callFunction } from '../../../js/core/api-client.js';
import { t } from '../../../js/core/i18n-helpers.js';

function fmt(key, map) {
  let v = t(key);
  for (const k in map) v = v.split('{' + k + '}').join(map[k]);
  return v;
}

export function createDashboardPage(code) {
  return function renderAcademyDashboard() {
    checkAcademyAccess(code).then(function (access) {
      if (!access.allowed) { renderLocked(access); return; }
      const a = access.academy;

      Promise.all([
        callFunction('getCatalog').catch(function () { return { courses: [] }; }),
        callFunction('getDashboardData').catch(function () { return null; })
      ]).then(function (results) {
        const courses = (results[0] && results[0].courses) || [];
        const dash = results[1];
        const mine = courses.filter(function (c) { return c.academy === a.key; });

        /* Progression par niveau : part des cours du niveau (base plate
           courses/lessons â€” sera affinÃ©e avec le curriculum arborescent). */
        const progressByLevel = {};
        a.levels.forEach(function (l) { progressByLevel[l] = 0; });
        const doneByLevel = (dash && dash.completedByLevel) || null;
        if (doneByLevel) {
          Object.keys(doneByLevel).forEach(function (l) {
            if (progressByLevel[l] != null) progressByLevel[l] = Math.min(100, Number(doneByLevel[l]) || 0);
          });
        }

        const content = '' +
          '<div class="hub-top">' +
            '<h3>' + t('academies.dashboard.continue') + '</h3>' +
            '<a class="btn btn-solid btn-sm" href="#/academy/' + code + '/courses">' + t('academies.shell.courses') + '</a>' +
          '</div>' +
          (mine.length
            ? '<a class="academy-row" href="#/course?id=' + encodeURIComponent(mine[0].id) + '">' +
                '<span class="academy-num">01</span>' +
                '<span class="academy-name">' + esc(mine[0].title) + '<span class="native">' + esc(mine[0].level) + '</span></span>' +
                '<span class="academy-desc">' + esc(mine[0].description || '') + '</span>' +
                '<span class="academy-status status-open">' + t('academies.dashboard.resumeChip') + '</span>' +
              '</a>'
            : '<p class="ac-courses-empty">' + t('academies.dashboard.noCourse') + '</p>') +
          '<h3>' + fmt('academies.dashboard.journey', { cert: a.certification }) + '</h3>' +
          levelCards({
            levels: a.levels, levelNames: a.levelNames,
            unlockedIndex: a.levels.length - 1,
            progressByLevel: progressByLevel, color: a.color,
            baseHref: '#/academy/' + code + '/courses',
            certificationLabel: a.certification
          }) +
          '<h3>' + t('dashboard.overallProgress') + '</h3>' +
          progressRing({ percent: globalPercent(progressByLevel), size: 96, color: a.color });

        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification,
          activePage: 'dashboard', contentHtml: content
        });
      });
    }).catch(function () {
      const app = document.getElementById('app');
      if (app) app.innerHTML = '<p class="ac-courses-empty">' + t('academies.loadError') + '</p>';
    });
  };
}

function globalPercent(progressByLevel) {
  const vals = Object.keys(progressByLevel || {}).map(function (k) { return Number(progressByLevel[k]) || 0; });
  if (!vals.length) return 0;
  return Math.round(vals.reduce(function (s, v) { return s + v; }, 0) / vals.length);
}

/** Vue "acadÃ©mie non incluse dans votre abonnement". */
export function renderLockedView(root, academy, opts) {
  const color = (academy && academy.color) || '#0B6B4F';
  root.innerHTML = '' +
    '<div class="section" style="max-width:640px;margin:0 auto;text-align:center">' +
      '<span style="font-size:2.4rem">' + ((academy && academy.flag) || 'ðŸ”’') + '</span>' +
      '<h2 style="font-family:var(--font-display);color:var(--forest)">' + esc(academyDisplayName(academy && academy.code, (academy && academy.label) || 'Academy')) + '</h2>' +
      '<p style="color:var(--muted)">' + ((opts && opts.message) || t('academies.dashboard.lockedMessage')) + '</p>' +
      '<a class="btn btn-solid" href="#/pricing" style="background:' + color + '">' + t('academies.dashboard.seePricing') + '</a> ' +
      '<a class="btn" href="#/dashboard">' + t('academies.dashboard.backToHub') + '</a>' +
    '</div>';
  window.scrollTo(0, 0);
}

function renderLocked(access) {
  const app = document.getElementById('app');
  renderLockedView(app, access.academy);
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
