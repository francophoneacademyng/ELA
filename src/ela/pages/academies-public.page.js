/* ============================================================
   ELA - ela/pages/academies-public.page.js
   Page marketing publique : les 6 academies en cards,
   Francophone Academy en position 01 (academie phare).
   ============================================================ */

import { ACADEMIES, ACADEMY_ORDER } from '../../shared/config/academies.config.js';
import { afterRender } from '../../../js/core/dom.js';
import { t } from '../../js/core/i18n-helpers.js';

const OPT_KEY = { FR: 'francophone', DE: 'germanophone', ZH: 'sinophone', EN: 'anglophone', AR: 'arabophone', RU: 'russophone' };

function academyLabel(code, fallback) {
  const opt = OPT_KEY[String(code || '').toUpperCase()];
  return opt ? t('academies.option.' + opt) : (fallback || code || '');
}

export function renderAcademiesPublic() {
  const app = document.getElementById('app');
  if (!app) return;

  let cards = '';
  ACADEMY_ORDER.forEach(function (code, i) {
    const a = ACADEMIES[code];
    var isFlagship = (i === 0);
    var flagshipClass = isFlagship ? ' academy-flagship' : '';
    var flagshipBadge = isFlagship ? '<span class="badge-flagship">' + t('academies.marketing.flagship') + '</span>' : '';
    const desc = t('academies.marketing.cardDesc').replace('{cert}', a.certification);
    cards += '' +
      '<div class="academy-card' + flagshipClass + ' reveal" style="--accent:' + a.color + ';transition-delay:' + (i * 80) + 'ms">' +
        '<div class="academy-number">0' + (i + 1) + '</div>' +
        '<div class="academy-card-header">' +
          '<span class="academy-card-code">' + a.code + '</span>' +
          '<h2 class="academy-card-title">' + academyLabel(code, a.label) + '</h2>' +
          '<span class="academy-card-lang">' + a.native + '</span>' +
          flagshipBadge +
        '</div>' +
        '<p class="academy-card-desc">' + desc + '</p>' +
        '<a class="btn-subscribe" href="#/pricing">' + t('academies.marketing.subscribe') + '</a>' +
      '</div>';
  });

  app.innerHTML = '' +
    '<div class="section academies academies-grid-section">' +
      '<h2 style="font-family:var(--font-display);font-weight:800;color:var(--forest)">' + t('academies.marketing.title') + '</h2>' +
      '<p style="color:var(--muted);max-width:60ch">' + t('academies.marketing.sub') + '</p>' +
      '<div class="academies-grid">' +
        cards +
      '</div>' +
      '<div style="text-align:center;margin-top:2rem">' +
        '<a class="btn btn-solid" href="#/pricing">' + t('academies.dashboard.seePricing') + '</a> ' +
        '<a class="btn btn-start-free" href="#/register">' + t('nav.cta') + '</a>' +
      '</div>' +
    '</div>';
  afterRender('academies');
}
