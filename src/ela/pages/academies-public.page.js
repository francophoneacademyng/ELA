/* ============================================================
   ELA — ela/pages/academies-public.page.js
   Page marketing publique : les 6 académies avec aperçu,
   référentiel de certification et CTA "S'abonner".
   ============================================================ */

import { ACADEMIES, ACADEMY_ORDER } from '../../shared/config/academies.config.js';
import { afterRender } from '../../../js/core/dom.js';

export function renderAcademiesPublic() {
  const app = document.getElementById('app');
  if (!app) return;

  let rows = '';
  ACADEMY_ORDER.forEach(function (code, i) {
    const a = ACADEMIES[code];
    rows += '' +
      '<a class="academy-row reveal" href="#/pricing" style="--accent:' + a.color + ';transition-delay:' + (i * 60) + 'ms">' +
        '<span class="academy-num">0' + (i + 1) + '</span>' +
        '<span class="academy-name">' + a.flag + ' ' + a.label + '<span class="native">' + a.native + '</span></span>' +
        '<span class="academy-desc">Immersive courses, live classes and an official ELA certificate. Reference framework: ' + a.certification + '.</span>' +
        '<span class="academy-status status-open">Subscribe</span>' +
      '</a>';
  });

  app.innerHTML = '' +
    '<div class="section academies">' +
      '<h2 style="font-family:var(--font-display);font-weight:800;color:var(--forest)">Six academies. One account.</h2>' +
      '<p style="color:var(--muted);max-width:60ch">Learn French, German, Mandarin, English, Arabic or Russian with real teachers, live classes and ELA certificates. Choose the academy that matches your goal.</p>' +
      rows +
      '<div style="text-align:center;margin-top:2rem">' +
        '<a class="btn btn-solid" href="#/pricing">See pricing</a> ' +
        '<a class="btn" href="#/register">Start free</a>' +
      '</div>' +
    '</div>';
  /* Correctif page blanche : les .academy-row.reveal restaient à
     opacity:0 car afterRender() (observateur IntersectionObserver)
     n'était jamais appelé par ce handler v2. */
  afterRender('academies');
}
