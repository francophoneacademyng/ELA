/* ============================================================
   ELA — academies/registry.js
   Enregistrement des routes immersives des 6 académies dans
   window.ELA_ROUTE_HANDLERS (lu par route() de js/app.js).
   ============================================================ */

import { ACADEMY_ORDER } from '../shared/config/academies.config.js';

export function registerAcademyRoutes() {
  if (typeof window === 'undefined' || !window.ELA_ROUTE_HANDLERS) return;
  const H = window.ELA_ROUTE_HANDLERS;

  const modules = {
    dashboard: import('./FR/pages/dashboard.page.js'),
    courses: import('./FR/pages/courses.page.js'),
    quiz: import('./FR/pages/quiz.page.js'),
    live: import('./FR/pages/live.page.js'),
    certificates: import('./FR/pages/certificates.page.js')
  };

  // Lazy : on enregistre des handlers dynamiques par code.
  ACADEMY_ORDER.forEach(function (code) {
    H['/academy/' + code + '/dashboard'] = makeLazy('dashboard', code);
    H['/academy/' + code + '/courses'] = makeLazy('courses', code);
    H['/academy/' + code + '/quiz'] = makeLazy('quiz', code);
    H['/academy/' + code + '/live'] = makeLazy('live', code);
    H['/academy/' + code + '/certificates'] = makeLazy('certificates', code);
  });

  function makeLazy(page, code) {
    return function () {
      import('./' + code + '/pages/' + page + '.page.js').then(function (m) {
        const fn = m.render || m['render' + cap(page)];
        if (typeof fn === 'function') fn();
      }).catch(function (e) {
        const app = document.getElementById('app');
        if (app) app.innerHTML = '<p class="ac-courses-empty">Page load error.</p>';
      });
    };
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
}
