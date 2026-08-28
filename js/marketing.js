/* ============================================================
   ELA - MARKETING & TRACKING (Phase 0)
   ------------------------------------------------------------
   SEULE ACTION REQUISE : colle ton ID Google Analytics 4
   ci-dessous (format G-XXXXXXXXXX), puis redeploie.
   Sans ID, tout continue de fonctionner (Firestore events).
   ------------------------------------------------------------
   Événements :
   - page_view / registration / trial_started / checkout_started
     → GA4 (si ID) + Firestore `marketingEvents` (create-only).
   - payment_success → UNIQUEMENT via le webhook Paystack
     (côté serveur, valeur NGN réelle) — jamais depuis le client.
   ============================================================ */
window.ELAMarketing = (function () {
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // ← ID Google Analytics 4 ELA

  /* ---------- GA4 (compatible SPA) ---------- */
  var gaOn = /^G-[A-Z0-9]{4,}$/.test(GA_MEASUREMENT_ID);
  if (gaOn) {
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

  /* ---------- Firestore marketingEvents (create-only) ---------- */
  function fsLog(event, data) {
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

  /* ---------- page_view (SPA) ---------- */
  function sendPageView() {
    var page = location.hash || '#/';
    track('page_view', { page: page, title: document.title });
  }
  window.addEventListener('hashchange', function () { setTimeout(sendPageView, 60); });
  window.addEventListener('load', function () { setTimeout(sendPageView, 300); });

  /* ---------- Clics CTA (GA4 uniquement) ---------- */
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var page = location.hash || '#/';
    if (href.indexOf('#/register') === 0) g('cta_signup_click', { page: page });
    else if (href.indexOf('#/pricing') === 0) g('cta_pricing_click', { page: page });
    else if (href.indexOf('#/live') === 0) g('cta_live_click', { page: page });
    else if (href.indexOf('wa.me') > -1) g('whatsapp_click', { page: page });
  }, true);

  return { track: track };
})();
