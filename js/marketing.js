/* ============================================================
   ELA - MARKETING & TRACKING (Phase 0) + CONSENTEMENT
   ------------------------------------------------------------
   Concepteur/SEO : l'ID GA4 est déjà renseigné (G-K9ZWWPHQDF,
   ligne GA_MEASUREMENT_ID ci-dessous) et saisi au déploiement.
   ------------------------------------------------------------
   - GA4 ne charge QUE si l'utilisateur a accepté les cookies
     (localStorage `ela_consent`). Tant que ce n'est pas décidé,
     le bandeau de consentement est affiché et GA4 reste différé.
   - Les événements Firestore `marketingEvents` (page_view,
     registration, trial_started, checkout_started) fonctionnent
     sans consentement (pas de cookies).
   - payment_success : UNIQUEMENT via le webhook Paystack (serveur).
   ============================================================ */
window.ELAMarketing = (function () {
  var GA_MEASUREMENT_ID = 'G-K9ZWWPHQDF'; // ← ID Google Analytics 4 ELA
  var CONSENT_KEY = 'ela_consent';
  var gaOn = false;

  function consent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return 'accepted'; } }
  function setConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }

  /* ---------- GA4 : chargement différé (après consentement) ---------- */
  function loadGtag() {
    if (gaOn || !/^G-[A-Z0-9]{4,}$/.test(GA_MEASUREMENT_ID)) return;
    gaOn = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  }
  function g(event, params) { if (gaOn && window.gtag) window.gtag('event', event, params || {}); }

  /* ---------- Firestore marketingEvents (create-only) ----------
     Seuls les événements autorisés par firestore.rules sont écrits en base ;
     les autres restent GA4-only (évite des écritures refusées inutiles). */
  var FS_EVENTS = ['page_view', 'registration', 'trial_started', 'checkout_started',
    'lead_magnet_view', 'lead_magnet_start', 'lead_captured', 'lead_magnet_download',
    'registration_started', 'registration_completed', 'plan_selected',
    'thankyou_view', 'trial_cta_click'];
  function fsLog(event, data) {
    if (FS_EVENTS.indexOf(event) < 0) return;
    try {
      if (window.firebase && window.firebase.firestore) {
        var doc = { event: event, ts: Date.now() };
        for (var k in (data || {})) { if (k !== 'event' && k !== 'ts') doc[k] = data[k]; }
        window.firebase.firestore().collection('marketingEvents').add(doc).catch(function () {});
      }
    } catch (e) { /* silencieux */ }
  }

  function track(event, data) {
    g(event, data);
    fsLog(event, data);
  }

  /* ---------- Bandeau de consentement ---------- */
  function i18n(key, fallback) {
    try { if (window.ELA_I18N && window.ELA_I18N.t) { var v = window.ELA_I18N.t(key); if (v && v !== key) return v; } } catch (e) {}
    return fallback;
  }
  function renderBannerText() {
    var txt = document.getElementById('consent-text');
    var priv = document.getElementById('consent-privacy');
    var acc = document.getElementById('consent-accept');
    var dec = document.getElementById('consent-decline');
    if (txt) txt.innerHTML = i18n('consent.text', 'We use cookies for analytics to improve your experience.');
    if (priv) priv.textContent = i18n('footer.privacy', 'Privacy Policy');
    if (acc) acc.textContent = i18n('consent.accept', 'Accept');
    if (dec) dec.textContent = i18n('consent.decline', 'Decline');
  }
  function showBanner() {
    if (document.getElementById('consent-banner')) return;
    var b = document.createElement('div');
    b.id = 'consent-banner';
    b.className = 'consent-banner';
    b.innerHTML =
      '<p><span id="consent-text"></span> <a href="#/privacy" class="consent-link" id="consent-privacy"></a></p>' +
      '<div class="consent-actions">' +
        '<button type="button" class="btn btn-gold-vivid btn-sm" id="consent-accept"></button>' +
        '<button type="button" class="btn btn-outline btn-sm" id="consent-decline"></button>' +
      '</div>';
    document.body.appendChild(b);
    renderBannerText();
    document.getElementById('consent-accept').addEventListener('click', function () {
      setConsent('accepted'); loadGtag(); b.remove(); sendPageView();
    });
    document.getElementById('consent-decline').addEventListener('click', function () {
      setConsent('declined'); b.remove();
    });
    try { if (window.ELA_I18N && window.ELA_I18N.onChange) window.ELA_I18N.onChange(renderBannerText); } catch (e) {}
  }
  function initConsent() {
    var c = consent();
    if (c === 'accepted') { loadGtag(); return; }
    if (c === null) showBanner();
  }

  /* ---------- page_view (SPA, URLs propres Mission 6) ---------- */
  function sendPageView() {
    track('page_view', { page: location.pathname + location.search || '/', title: document.title });
  }

  /* ---------- Clics CTA (GA4 uniquement) ---------- */
  /* Normalise un href (URL propre /x ou hash hérité #/x) en chemin. */
  function linkPath(href) {
    if (!href) return '';
    if (href.indexOf('#/') === 0) return href.slice(1);
    try { var u = new URL(href, location.origin); return u.pathname + u.search; } catch (e) { return href; }
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a') : null;
    if (!a) return;
    var p = linkPath(a.getAttribute('href') || '');
    var page = location.pathname || '/';
    if (p.indexOf('/register') === 0) g('cta_signup_click', { page: page });
    else if (p.indexOf('/pricing') === 0) g('cta_pricing_click', { page: page });
    else if (p.indexOf('/live') === 0) g('cta_live_click', { page: page });
    else if (p.indexOf('/lead-magnets') === 0) g('cta_lead_magnet_click', { page: page });
    else if (p.indexOf('/free-trial') === 0) g('cta_free_trial_click', { page: page });
    else if ((a.getAttribute('href') || '').indexOf('wa.me') > -1) g('whatsapp_click', { page: page });
  }, true);

  window.addEventListener('load', function () {
    initConsent();
    setTimeout(sendPageView, 300);
  });
  window.addEventListener('hashchange', function () { setTimeout(sendPageView, 60); });

  return { track: track, initGA: loadGtag };
})();
