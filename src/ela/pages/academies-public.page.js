/* ============================================================
   ELA - ela/pages/academies-public.page.js
   Page marketing publique : les 6 academies en grille 3 x 2.
   Francophone Academy en position 01 (academie phare).
   Hierarchie par carte : numero -> code -> nom -> langue ->
   description -> certification -> CTA.
   ============================================================ */

import { ACADEMIES, ACADEMY_ORDER } from '../../shared/config/academies.config.js';
import { afterRender, escapeHtml } from '../../../js/core/dom.js';
import { t } from '../../js/core/i18n-helpers.js';

const OPT_KEY = { FR: 'francophone', DE: 'germanophone', ZH: 'sinophone', EN: 'anglophone', AR: 'arabophone', RU: 'russophone' };

function academyLabel(code, fallback) {
  const opt = OPT_KEY[String(code || '').toUpperCase()];
  return opt ? t('academies.option.' + opt) : (fallback || code || '');
}

/* Description propre a chaque academie (cles academies.<key>.desc deja
   traduites). Repli sur la description marketing commune si absente. */
function cardDescription(a) {
  const key = 'academies.' + a.key + '.desc';
  const desc = t(key);
  if (desc && desc !== key) return desc;
  return t('academies.marketing.cardDesc').replace('{cert}', a.certification);
}

/* Reference d'examen reelle (config) : CECRL, Goethe-Zertifikat, HSK,
   IELTS, ALPT, TORFL. Libelle i18n existant academies.dashboard.referenceCert. */
function certLine(a) {
  const cert = '<strong>' + escapeHtml(a.certification) + '</strong>';
  const template = t('academies.dashboard.referenceCert');
  if (template && template !== 'academies.dashboard.referenceCert') {
    return template.replace('{cert}', cert);
  }
  return cert;
}

export function renderAcademiesPublic() {
  const app = document.getElementById('app');
  if (!app) return;

  let cards = '';
  ACADEMY_ORDER.forEach(function (code, i) {
    const a = ACADEMIES[code];
    const isFlagship = (i === 0);
    const flagshipClass = isFlagship ? ' academy-flagship' : '';
    const flagshipBadge = isFlagship
      ? '<span class="badge-flagship">' + escapeHtml(t('academies.marketing.flagship')) + '</span>'
      : '';
    const label = escapeHtml(academyLabel(code, a.label));
    const subscribe = escapeHtml(t('academies.marketing.subscribe'));

    cards += '' +
      '<article class="academy-card' + flagshipClass + ' reveal" style="--accent:' + a.color + ';transition-delay:' + (i * 80) + 'ms">' +
        '<div class="academy-card-head">' +
          '<span class="academy-card-number">0' + (i + 1) + '</span>' +
          '<span class="academy-card-code" dir="ltr">' + escapeHtml(a.code) + '</span>' +
          flagshipBadge +
        '</div>' +
        '<h2 class="academy-card-title">' + label + '</h2>' +
        '<span class="academy-card-lang" dir="auto">' + escapeHtml(a.native) + '</span>' +
        '<p class="academy-card-desc">' + escapeHtml(cardDescription(a)) + '</p>' +
        '<p class="academy-card-cert">' + certLine(a) + '</p>' +
        '<a class="btn-subscribe" href="#/pricing" aria-label="' + subscribe + ' \u2013 ' + label + '">' + subscribe + '</a>' +
      '</article>';
  });

  app.innerHTML = '' +
    '<div class="section academies academies-grid-section">' +
      '<header class="academies-head">' +
        '<p class="section-label">' + escapeHtml(t('academies.label')) + '</p>' +
        '<h1 class="academies-title">' + escapeHtml(t('academies.marketing.title')) + '</h1>' +
        '<p class="academies-sub">' + escapeHtml(t('academies.marketing.sub')) + '</p>' +
      '</header>' +
      '<div class="academies-grid">' +
        cards +
      '</div>' +
      '<div class="academies-actions">' +
        '<a class="btn btn-solid" href="#/pricing">' + escapeHtml(t('academies.dashboard.seePricing')) + '</a>' +
        '<a class="btn btn-start-free" href="#/register">' + escapeHtml(t('nav.cta')) + '</a>' +
      '</div>' +
    '</div>';
  afterRender('academies');
}
