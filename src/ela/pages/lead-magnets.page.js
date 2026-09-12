/* ============================================================
   ELA — ela/pages/lead-magnets.page.js
   Pages d'acquisition : hub /lead-magnets + 6 landing pages.
   ------------------------------------------------------------
   Parcours : landing → formulaire → capture (Firestore) →
   accès immédiat au contenu → CTA Free Trial.
   - Aucun email réel n'est envoyé ici (les séquences sont
     préparées séparément, voir docs/).
   - ES reste MASQUÉ (aucune route, aucune donnée).
   - Réutilise l'architecture : hash routing, i18n, ELAMarketing,
     règles Firestore dédiées (leadMagnetLeads).
   ============================================================ */

import { ACADEMIES, ACADEMY_ORDER } from '../../shared/config/academies.config.js';
import { LEAD_MAGNET_SLUGS, getLeadMagnet, magnetContent } from '../data/lead-magnets.data.js';
import { t, getLang } from '../../js/core/i18n-helpers.js';
import { escapeHtml, afterRender, toast } from '../../../js/core/dom.js';

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const OPT_KEY = { FR: 'francophone', DE: 'germanophone', ZH: 'sinophone', EN: 'anglophone', AR: 'arabophone', RU: 'russophone' };

function track(event, data) {
  if (window.ELAMarketing && typeof window.ELAMarketing.track === 'function') {
    window.ELAMarketing.track(event, data || {});
  }
}

function academyLabel(code) {
  const opt = OPT_KEY[String(code || '').toUpperCase()];
  return opt ? t('academies.option.' + opt) : code;
}

function magnetHref(slug) { return '#/lead-magnets/' + slug; }

function magnetCard(slug, i) {
  const m = getLeadMagnet(slug);
  if (!m) return '';
  const a = ACADEMIES[m.code] || {};
  const c = magnetContent(m, getLang()) || magnetContent(m, 'en');
  return '' +
    '<article class="lm-card reveal" style="--accent:' + m.color + ';transition-delay:' + (i * 60) + 'ms">' +
      '<div class="lm-card-top">' +
        '<span class="lm-card-flag" aria-hidden="true">' + (a.flag || '') + '</span>' +
        '<span class="lm-card-code" dir="ltr">' + escapeHtml(m.code) + '</span>' +
        '<span class="lm-card-cert" dir="auto">' + escapeHtml(m.certification) + '</span>' +
      '</div>' +
      '<h2 class="lm-card-title">' + escapeHtml(c.title) + '</h2>' +
      '<p class="lm-card-desc">' + escapeHtml(c.subtitle) + '</p>' +
      '<div class="lm-card-actions">' +
        '<a class="lm-cta" href="' + magnetHref(slug) + '">' + escapeHtml(t('leadMagnets.cta.download', 'Get the free guide')) + '</a>' +
        '<a class="lm-cta-ghost" href="#/free-trial">' + escapeHtml(t('leadMagnets.cta.trial', 'Start free trial')) + '</a>' +
      '</div>' +
    '</article>';
}

export function renderLeadMagnetsIndex() {
  const app = document.getElementById('app');
  if (!app) return;

  const cards = LEAD_MAGNET_SLUGS.map(magnetCard).join('');

  app.innerHTML = '' +
    '<section class="lm-hero">' +
      '<div class="lm-hero-inner">' +
        '<p class="lm-kicker">' + escapeHtml(t('leadMagnets.index.kicker', 'Free study guides')) + '</p>' +
        '<h1 class="lm-title">' + escapeHtml(t('leadMagnets.index.title', 'Free language exam prep downloads')) + '</h1>' +
        '<p class="lm-lead">' + escapeHtml(t('leadMagnets.index.sub', 'Practical checklists and starter kits for six languages — built for learners preparing to study, work or travel abroad.')) + '</p>' +
        '<div class="lm-actions">' +
          '<a class="lm-cta" href="#/free-trial">' + escapeHtml(t('leadMagnets.cta.trial', 'Start free trial')) + '</a>' +
          '<a class="lm-cta-ghost" href="#/academies">' + escapeHtml(t('nav.academies', 'Academies')) + '</a>' +
        '</div>' +
        '<p class="lm-micro">' + escapeHtml(t('leadMagnets.trust', 'Real teachers · live classes · verifiable certificate')) + '</p>' +
      '</div>' +
    '</section>' +
    '<section class="lm-section">' +
      '<div class="lm-grid">' + cards + '</div>' +
    '</section>' +
    '<section class="lm-final">' +
      '<h2 class="lm-display">' + escapeHtml(t('leadMagnets.index.finalTitle', 'Not sure where to start?')) + '</h2>' +
      '<p>' + escapeHtml(t('leadMagnets.index.finalBody', 'Try the first lessons for free — no account needed for the first ones.')) + '</p>' +
      '<a class="lm-cta" href="#/free-trial">' + escapeHtml(t('leadMagnets.cta.trial', 'Start free trial')) + '</a>' +
    '</section>';

  afterRender('lead-magnets');
  track('lead_magnet_view', { lead_magnet_id: 'index', academy: 'all', locale: getLang() });
}

function phraseTable(m) {
  const p = m.phrases;
  if (!p || !p.rows || !p.rows.length) return '';
  const head = p.headers.map(function (h) { return '<th>' + escapeHtml(h) + '</th>'; }).join('');
  const rows = p.rows.map(function (r) {
    return '<tr>' + r.map(function (cell) { return '<td>' + escapeHtml(cell) + '</td>'; }).join('') + '</tr>';
  }).join('');
  return '<div class="lm-table-wrap"><table class="lm-table"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function faqHtml(m) {
  return (m.faq || []).map(function (qa) {
    return '<details class="lm-faq"><summary>' + escapeHtml(qa[0]) + '</summary><p>' + escapeHtml(qa[1]) + '</p></details>';
  }).join('');
}

function deliverContent(m) {
  const inside = m.inside.map(function (x) { return '<li>' + escapeHtml(x) + '</li>'; }).join('');
  const checklist = m.checklist.map(function (x) { return '<li>' + escapeHtml(x) + '</li>'; }).join('');
  return '' +
    '<div class="lm-delivered" id="lm-delivered">' +
      '<h3 class="lm-h3">' + escapeHtml(t('leadMagnets.insideTitle', "What's inside")) + '</h3>' +
      '<ul class="lm-list">' + inside + '</ul>' +
      '<h3 class="lm-h3">' + escapeHtml(t('leadMagnets.checklistTitle', 'Your checklist')) + '</h3>' +
      '<ol class="lm-checklist">' + checklist + '</ol>' +
      '<h3 class="lm-h3">' + escapeHtml(t('leadMagnets.phrasesTitle', 'Essential phrases')) + '</h3>' +
      phraseTable(m) +
      '<div class="lm-actions">' +
        '<a class="lm-cta" id="lm-trial-cta" href="/free-trial">' + escapeHtml(t('leadMagnets.cta.trial', 'Start free trial')) + '</a>' +
        '<button type="button" class="lm-cta-ghost" id="lm-download">' + escapeHtml(t('leadMagnets.download', 'Download the checklist (.txt)')) + '</button>' +
      '</div>' +
    '</div>';
}

function buildDownloadText(m, c) {
  const lines = [];
  lines.push('E-Learn Language Academy (ELA)');
  lines.push(c.title);
  lines.push('Academy: ' + academyLabel(m.code) + ' — ' + m.certification);
  lines.push('');
  lines.push(c.subtitle);
  lines.push('');
  lines.push("WHAT'S INSIDE");
  m.inside.forEach(function (x) { lines.push('- ' + x); });
  lines.push('');
  lines.push('CHECKLIST');
  m.checklist.forEach(function (x, i) { lines.push((i + 1) + '. ' + x); });
  lines.push('');
  lines.push('ESSENTIAL PHRASES');
  if (m.phrases && m.phrases.rows) {
    lines.push(m.phrases.headers.join(' | '));
    m.phrases.rows.forEach(function (r) { lines.push(r.join(' | ')); });
  }
  lines.push('');
  lines.push('Start your free trial: https://elaacademy.ng/#/free-trial');
  lines.push('Academies: https://elaacademy.ng/#/academies');
  return lines.join('\r\n');
}

function downloadText(filename, text) {
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    return true;
  } catch (e) {
    return false;
  }
}

function formHtml(m) {
  const options = ACADEMY_ORDER.map(function (code) {
    const a = ACADEMIES[code];
    return '<option value="' + code + '"' + (code === m.code ? ' selected' : '') + '>' + escapeHtml(academyLabel(code) + ' — ' + a.native) + '</option>';
  }).join('');
  return '' +
    '<form class="lm-form" id="lm-form" novalidate>' +
      '<h3 class="lm-h3">' + escapeHtml(t('leadMagnets.form.title', 'Get your free guide')) + '</h3>' +
      '<div class="lm-field">' +
        '<label for="lm-name">' + escapeHtml(t('leadMagnets.form.name', 'Full name')) + '</label>' +
        '<input id="lm-name" type="text" autocomplete="name" required>' +
      '</div>' +
      '<div class="lm-field">' +
        '<label for="lm-email">' + escapeHtml(t('leadMagnets.form.email', 'Email address')) + '</label>' +
        '<input id="lm-email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" required>' +
      '</div>' +
      '<div class="lm-field">' +
        '<label for="lm-academy">' + escapeHtml(t('leadMagnets.form.academy', 'Your academy')) + '</label>' +
        '<select id="lm-academy">' + options + '</select>' +
      '</div>' +
      '<div class="lm-field">' +
        '<label for="lm-goal">' + escapeHtml(t('leadMagnets.form.goal', 'Your goal or current level (optional)')) + '</label>' +
        '<input id="lm-goal" type="text" autocomplete="off">' +
      '</div>' +
      '<label class="lm-consent">' +
        '<input type="checkbox" id="lm-consent">' +
        '<span>' + escapeHtml(t('leadMagnets.form.consent', 'I agree to receive my free guide and occasional learning tips from ELA Academy. I can unsubscribe at any time.')) + '</span>' +
      '</label>' +
      '<p class="lm-error" id="lm-error" role="alert" aria-live="polite"></p>' +
      '<button type="submit" class="lm-cta lm-submit" id="lm-submit">' + escapeHtml(t('leadMagnets.form.submit', 'Send me the guide')) + '</button>' +
      '<p class="lm-micro">' + escapeHtml(t('leadMagnets.form.micro', 'We only ask for what we need to send your guide.')) + '</p>' +
    '</form>';
}

function bindForm(m, c) {
  const form = document.getElementById('lm-form');
  if (!form) return;
  const err = document.getElementById('lm-error');
  const submit = document.getElementById('lm-submit');
  let started = false;

  function showError(msg) {
    if (err) { err.textContent = msg; err.classList.add('show'); }
  }
  function clearError() { if (err) { err.textContent = ''; err.classList.remove('show'); } }

  const nameInput = document.getElementById('lm-name');
  if (nameInput) {
    nameInput.addEventListener('focus', function () {
      if (!started) { started = true; track('lead_magnet_start', { lead_magnet_id: m.slug, academy: m.code, locale: getLang() }); }
    }, { once: true });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();
    const name = (document.getElementById('lm-name').value || '').trim();
    const email = (document.getElementById('lm-email').value || '').trim().toLowerCase();
    const academy = document.getElementById('lm-academy').value || m.code;
    const goal = (document.getElementById('lm-goal').value || '').trim();
    const consent = document.getElementById('lm-consent').checked;

    if (name.length < 2) { showError(t('leadMagnets.form.invalidName', 'Please enter your name.')); return; }
    if (!EMAIL_RE.test(email)) { showError(t('leadMagnets.form.invalidEmail', 'Please enter a valid email address.')); return; }
    if (!consent) { showError(t('leadMagnets.form.consentRequired', 'Please accept to receive the guide.')); return; }
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.firestore) {
      showError(t('leadMagnets.form.unavailable', 'Sign-up is temporarily unavailable. Please try again later.'));
      return;
    }

    if (submit) { submit.disabled = true; submit.textContent = t('leadMagnets.form.sending', 'Sending…'); }

    const doc = {
      name: name,
      email: email,
      academy: academy,
      goal: goal,
      leadMagnetId: m.slug,
      source: 'lead-magnet-' + m.slug,
      consent: true,
      locale: getLang(),
      ts: Date.now()
    };

    firebase.firestore().collection('leadMagnetLeads').add(doc)
      .then(function () {
        track('lead_captured', { lead_magnet_id: m.slug, academy: academy, contact_type: 'email', consent_flag: true });
        // Accès immédiat au contenu (pas d'envoi email réel).
        const host = document.getElementById('lm-gate');
        if (host) {
          host.innerHTML = '' +
            '<div class="lm-success">' +
              '<h3 class="lm-h3">' + escapeHtml(t('leadMagnets.thankyou.title', "You're in!")) + '</h3>' +
              '<p>' + escapeHtml(t('leadMagnets.thankyou.body', 'Your guide is ready below. Next step: start your free trial.')) + '</p>' +
            '</div>' + deliverContent(m);
        }
        const dl = document.getElementById('lm-download');
        if (dl) {
          dl.addEventListener('click', function () {
            const ok = downloadText('ELA-' + m.code + '-guide.txt', buildDownloadText(m, c));
            if (ok) track('lead_magnet_download', { lead_magnet_id: m.slug, academy: academy, delivery_channel: 'onpage' });
            else toast(t('leadMagnets.downloadError', 'Download unavailable on this device.'), 'info');
          });
        }
        track('thankyou_view', { lead_magnet_id: m.slug, academy: academy });
        const trialCta = document.getElementById('lm-trial-cta');
        if (trialCta) {
          trialCta.addEventListener('click', function () {
            track('trial_cta_click', { lead_magnet_id: m.slug, academy: academy, position: 'thankyou' });
          });
        }
        toast(t('leadMagnets.thankyou.toast', 'Guide unlocked. Enjoy!'), 'success');
      })
      .catch(function () {
        if (submit) { submit.disabled = false; submit.textContent = t('leadMagnets.form.submit', 'Send me the guide'); }
        showError(t('leadMagnets.form.error', 'Something went wrong. Please try again.'));
      });
  });
}

export function renderLeadMagnetPage(slug) {
  const app = document.getElementById('app');
  if (!app) return;
  const m = getLeadMagnet(slug);
  if (!m) { renderLeadMagnetsIndex(); return; }
  const a = ACADEMIES[m.code] || {};
  const c = magnetContent(m, getLang()) || magnetContent(m, 'en');

  const bullets = c.bullets.map(function (b) {
    return '<li><span class="lm-check" aria-hidden="true">✓</span>' + escapeHtml(b) + '</li>';
  }).join('');

  app.innerHTML = '' +
    '<section class="lm-detail">' +
      '<p class="lm-breadcrumb"><a href="#/lead-magnets">' + escapeHtml(t('leadMagnets.backToAll', 'All free guides')) + '</a></p>' +
      '<div class="lm-detail-grid">' +
        '<div class="lm-detail-main">' +
          '<div class="lm-detail-top">' +
            '<span class="lm-card-flag" aria-hidden="true">' + (a.flag || '') + '</span>' +
            '<span class="lm-badge" style="--accent:' + m.color + '">' + escapeHtml(academyLabel(m.code)) + ' · ' + escapeHtml(m.certification) + '</span>' +
          '</div>' +
          '<h1 class="lm-title">' + escapeHtml(c.title) + '</h1>' +
          '<p class="lm-lead">' + escapeHtml(c.subtitle) + '</p>' +
          '<ul class="lm-bullets">' + bullets + '</ul>' +
          '<p class="lm-trust">' + escapeHtml(t('leadMagnets.trust', 'Real teachers · live classes · verifiable certificate')) + '</p>' +
          '<div class="lm-faq-wrap"><h2 class="lm-h3">' + escapeHtml(t('leadMagnets.faqTitle', 'FAQ')) + '</h2>' + faqHtml(m) + '</div>' +
        '</div>' +
        '<aside class="lm-detail-side">' +
          '<div id="lm-gate">' + formHtml(m) + '</div>' +
        '</aside>' +
      '</div>' +
    '</section>';

  bindForm(m, c);
  afterRender('lead-magnets');
  track('lead_magnet_view', { lead_magnet_id: m.slug, academy: m.code, locale: getLang() });
}
