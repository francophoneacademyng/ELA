/* ============================================================
   ELA — ela/pages/student-hub.page.js
   Hub "Mes académies" : cartes des académies actives
   (progression + CTA Continuer) + académies verrouillées (CTA
   Tarifs). Source de vérité : Cloud Function getMyAcademies.
   ============================================================ */

import { ACADEMIES, ACADEMY_ORDER } from '../../shared/config/academies.config.js';
import { getMyAcademies } from '../../shared/components/academy/academy-access.js';
import { progressRing } from '../../shared/components/academy/progress-ring.js';
import { callFunction } from '../../js/core/api-client.js';

export function renderStudentHub() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth || !firebase.functions) {
    app.innerHTML = '<div class="section"><p class="ac-courses-empty">Loading…</p></div>';
    return;
  }

  app.innerHTML = '' +
    '<div class="section">' +
      '<h2 style="font-family:var(--font-display);font-weight:800;color:var(--forest)">My Academies</h2>' +
      '<p style="color:var(--muted)">Your active academies. Continue your journey or discover a new language.</p>' +
      '<div id="hub-grid" class="hub-grid" style="margin-top:1.2rem"></div>' +
    '</div>';

  const grid = document.getElementById('hub-grid');

  Promise.all([
    getMyAcademies(),
    callFunction('getDashboardData').catch(function () { return null; })
  ]).then(function (results) {
    const active = results[0] || [];
    const dash = results[1];
    const progress = (dash && dash.completedByLevel) || {};

    let html = '';
    ACADEMY_ORDER.forEach(function (code) {
      const a = ACADEMIES[code];
      const isActive = active.indexOf(code) >= 0;
      const pct = globalPct(progress, a);
      if (isActive) {
        html += '' +
          '<a class="hub-card" href="#/academy/' + code + '/dashboard" style="--ac:' + a.color + '">' +
            '<div class="hub-top"><span class="hub-flag">' + a.flag + '</span>' + progressRing({ percent: pct, size: 56, color: a.color }) + '</div>' +
            '<span class="hub-name">' + a.label + '</span>' +
            '<span class="hub-native">' + a.native + ' · ' + a.certification + '</span>' +
            '<span class="hub-cta">Continue →</span>' +
          '</a>';
      } else {
        html += '' +
          '<a class="hub-card hub-locked" href="#/pricing" style="--ac:' + a.color + '">' +
            '<div class="hub-top"><span class="hub-flag">' + a.flag + '</span><span class="academy-status status-soon">Locked</span></div>' +
            '<span class="hub-name">' + a.label + '</span>' +
            '<span class="hub-native">' + a.native + ' · ' + a.certification + '</span>' +
            '<span class="hub-cta">Subscribe to unlock →</span>' +
          '</a>';
      }
    });
    grid.innerHTML = html;
  }).catch(function () {
    grid.innerHTML = '<p class="ac-courses-empty">Unable to load your academies.</p>';
  });
}

function globalPct(byLevel, a) {
  const vals = a.levels.map(function (l) { return Math.min(100, Number(byLevel[l]) || 0); });
  if (!vals.length) return 0;
  return Math.round(vals.reduce(function (s, v) { return s + v; }, 0) / vals.length);
}
