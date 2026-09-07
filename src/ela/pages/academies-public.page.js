/* ============================================================
   ELA - ela/pages/academies-public.page.js
   Page marketing publique : les 6 academies en cards,
   Francophone Academy en position 01 (academie phare).
   ============================================================ */

import { ACADEMIES, ACADEMY_ORDER } from '../../shared/config/academies.config.js';
import { afterRender } from '../../../js/core/dom.js';

export function renderAcademiesPublic() {
  const app = document.getElementById('app');
  if (!app) return;

  let cards = '';
  ACADEMY_ORDER.forEach(function (code, i) {
    const a = ACADEMIES[code];
    var isFlagship = (i === 0);
    var flagshipClass = isFlagship ? ' academy-flagship' : '';
    var flagshipBadge = isFlagship ? '<span class="badge-flagship">★ Académie phare</span>' : '';
    cards += '' +
      '<div class="academy-card' + flagshipClass + ' reveal" style="--accent:' + a.color + ';transition-delay:' + (i * 80) + 'ms">' +
        '<div class="academy-number">0' + (i + 1) + '</div>' +
        '<div class="academy-card-header">' +
          '<span class="academy-card-code">' + a.code + '</span>' +
          '<h2 class="academy-card-title">' + a.label + '</h2>' +
          '<span class="academy-card-lang">' + a.native + '</span>' +
          flagshipBadge +
        '</div>' +
        '<p class="academy-card-desc">Immersive courses, live classes and an official ELA certificate. Reference framework: ' + a.certification + '.</p>' +
        '<a class="btn-subscribe" href="#/pricing">SUBSCRIBE</a>' +
      '</div>';
  });

  app.innerHTML = '' +
    '<div class="section academies academies-grid-section">' +
      '<h2 style="font-family:var(--font-display);font-weight:800;color:var(--forest)">Six academies. One account.</h2>' +
      '<p style="color:var(--muted);max-width:60ch">Learn French, German, Mandarin, English, Arabic or Russian with real teachers, live classes and ELA certificates. Choose the academy that matches your goal.</p>' +
      '<div class="academies-grid">' +
        cards +
      '</div>' +
      '<div style="text-align:center;margin-top:2rem">' +
        '<a class="btn btn-solid" href="#/pricing">See pricing</a> ' +
        '<a class="btn btn-start-free" href="#/register">Start free</a>' +
      '</div>' +
    '</div>';
  afterRender('academies');
}
