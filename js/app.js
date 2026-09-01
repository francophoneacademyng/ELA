/* ============================================================
   ELA — App router + pages (hash routing, vanilla JS)
   Routes: #/  #/academies  #/pricing  #/register  #/login
   ============================================================ */

(function () {
  var app = document.getElementById('app');
  var t = function (k) { return ELA_I18N.t(k); };

  /* Callables : forcés sur africa-south1 (les fonctions y sont déployées).
     Sans région, le SDK compat cible us-central1 → erreur CORS. */
  function callable(name) {
    return firebase.app().functions('africa-south1').httpsCallable(name);
  }

  /* ---------- Brand logo (inline SVG, emerald emblem) ---------- */
  var LOGO_SVG =
    '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ELA logo">' +
    '<rect x="6" y="6" width="188" height="188" rx="38" fill="#0B6B4F"/>' +
    '<text x="100" y="118" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="72" fill="#FAF6EC" letter-spacing="2">ELA</text>' +
    '<rect x="66" y="142" width="68" height="7" fill="#C9A227"/></svg>';

  var ARROW_SVG =
    '<svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var CHECK_SVG =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B6B4F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke="#C9A227"/><path d="M8 12.5l2.6 2.6L16 9.5"/></svg>';

  var ICON_CHECK =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>';

  var ICON_CROSS =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var ARROW_LEFT_SVG =
    '<svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

  /* ---- Icônes dashboard (stroke currentColor, style FA) ---- */
  var ICON_FLAME =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
  var ICON_GLOBE =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  var ICON_TROPHY =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
  var ICON_BOOK =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>';
  var ICON_CLOCK =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  var ICON_AWARD =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/></svg>';
  var ICON_PLAY =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
  var ICON_VIDEO =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>';
  var ICON_STAR =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  var ICON_CHAT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var ICON_QUIZ =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  var ICON_CALENDAR =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

  /* ---------- Academies data ---------- */
  var ACADEMIES = [
    { key: 'german',   native: 'Deutsch',  accent: 'var(--accent-german)',   open: true },
    { key: 'mandarin', native: '中文',      accent: 'var(--accent-mandarin)', open: true },
    { key: 'english',  native: 'English',  accent: 'var(--accent-english)',  open: true },
    { key: 'arabic',   native: 'العربية',   accent: 'var(--accent-arabic)',   open: true },
    { key: 'russian',  native: 'Русский',  accent: 'var(--accent-russian)',  open: true }
  ];

  /* Grille tarifaire (affichage + checkout). La source de vérité des montants
     reste le serveur (functions/index.js), qui recalcule toujours le montant. */
  var PRICING = {
    general:  { 1: 75000,  3: 200000, 6: 405000 },
    premium:  { 1: 120000, 3: 320000, 6: 648000 },
    business: { 1: 150000, 3: 420000, 6: 840000 }
  };

  function academyRow(a, i) {
    var status = a.open
      ? '<span class="badge badge-emerald">' + t('academies.open') + '</span>'
      : '<span class="badge badge-muted">' + t('academies.soon') + '</span>';
    return '' +
      '<a class="academy-card reveal" href="#/register" style="--accent:' + a.accent + ';transition-delay:' + (i * 60) + 'ms">' +
        '<span class="num">0' + (i + 1) + '</span>' +
        '<span class="name">' + t('academies.' + a.key + '.name') +
          '<span class="native">' + a.native + '</span></span>' +
        '<span class="desc">' + t('academies.' + a.key + '.desc') + '</span>' +
        '<span class="status">' + status + '</span>' +
      '</a>';
  }

  /* ---------- Pages ---------- */

  function renderHome() {
    var cards = ACADEMIES.map(academyRow).join('');
    var testimonials = [1, 2, 3].map(function (n) {
      return '<div class="testimonial reveal"><p class="quote">' + t('testimonials.' + n + '.quote') + '</p>' +
        '<p class="who">' + t('testimonials.' + n + '.name') + '</p></div>';
    }).join('');

    app.innerHTML = '' +
      // — HERO sombre —
      '<section class="hero">' +
        '<div class="hero-inner">' +
          '<div class="hero-main reveal">' +
            '<p class="hero-kicker">' + t('hero.kicker') + '</p>' +
            '<h1>' + t('hero.title.1') + '<br><em>' + t('hero.title.2') + '</em></h1>' +
            '<div class="hero-langs">' +
              '<span>Deutsch</span><span class="sep">·</span>' +
              '<span>中文</span><span class="sep">·</span>' +
              '<span>English</span><span class="sep">·</span>' +
              '<span>العربية</span><span class="sep">·</span>' +
              '<span>Русский</span>' +
            '</div>' +
          '</div>' +
          '<div class="hero-side reveal" style="transition-delay:120ms">' +
            '<p>' + t('hero.lead') + '</p>' +
            '<div class="hero-actions">' +
              '<a class="btn btn-gold-vivid" href="#/register">' + t('hero.cta.primary') + ARROW_SVG + '</a>' +
              '<a class="btn btn-outline" href="#/academies">' + t('hero.cta.secondary') + '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      // — Bande or (transition) —
      '<section class="band-gold"><div class="inner">' +
        '<p>' + t('footer.tag') + '</p>' +
        '<a class="btn btn-solid" href="#/academies">' + t('hero.cta.secondary') + ARROW_SVG + '</a>' +
      '</div></section>' +

      // — Académies (cartes) —
      '<section class="section academies" id="academies">' +
        '<p class="section-label reveal">' + t('academies.label') + '</p>' +
        '<h2 class="section-title reveal">' + t('academies.title.1') + '<br><em>' + t('academies.title.2') + '</em></h2>' +
        '<div class="academy-grid">' + cards + '</div>' +
      '</section>' +

      // — Expérience (sombre, image humaine) —
      '<section class="section-dark">' +
        '<div class="inner experience-grid">' +
          '<div class="reveal">' +
            '<p class="section-label">' + t('experience.label') + '</p>' +
            '<h2 class="section-title">' + t('experience.title.1') + '<br><em>' + t('experience.title.2') + '</em></h2>' +
            '<p style="font-size:1.05rem;margin-top:1.4rem">' + t('experience.p') + '</p>' +
            '<div class="hero-actions" style="margin-top:1.6rem"><a class="btn btn-gold-vivid" href="#/live">' + t('nav.live') + ARROW_SVG + '</a></div>' +
          '</div>' +
          '<div class="human-img reveal" style="transition-delay:120ms">' +
            '<img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80&auto=format&fit=crop" alt="' + t('experience.imgAlt') + '" loading="lazy" decoding="async" width="1200" height="900">' +
          '</div>' +
        '</div>' +
      '</section>' +

      // — Témoignages —
      '<section class="section">' +
        '<p class="section-label reveal">' + t('testimonials.label') + '</p>' +
        '<h2 class="section-title reveal">' + t('testimonials.title.1') + '<br><em>' + t('testimonials.title.2') + '</em></h2>' +
        '<div class="human-img wide reveal" style="margin-top:2rem">' +
          '<img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80&auto=format&fit=crop" alt="' + t('experience.imgAlt') + '" loading="lazy" decoding="async" width="1600" height="610">' +
        '</div>' +
        '<div class="testimonial-grid">' + testimonials + '</div>' +
      '</section>' +

      // — Mission —
      '<section class="section mission">' +
        '<div class="reveal">' +
          '<p class="section-label">' + t('mission.label') + '</p>' +
          '<h2 class="section-title">' + t('mission.title.1') + '<br><em>' + t('mission.title.2') + '</em></h2>' +
        '</div>' +
        '<div class="mission-body reveal" style="transition-delay:120ms">' +
          '<p>' + t('mission.p1') + '</p>' +
          '<p>' + t('mission.p2') + '</p>' +
          '<ul class="mission-list">' +
            '<li>' + CHECK_SVG + t('mission.li.1') + '</li>' +
            '<li>' + CHECK_SVG + t('mission.li.2') + '</li>' +
            '<li>' + CHECK_SVG + t('mission.li.3') + '</li>' +
            '<li>' + CHECK_SVG + t('mission.li.4') + '</li>' +
          '</ul>' +
        '</div>' +
      '</section>' +

      // — Étapes —
      '<section class="section">' +
        '<p class="section-label reveal">' + t('steps.label') + '</p>' +
        '<h2 class="section-title reveal">' + t('steps.title') + '</h2>' +
        '<div class="steps">' +
          '<div class="step reveal"><span class="step-num">01</span><h3>' + t('steps.1.title') + '</h3><p>' + t('steps.1.desc') + '</p></div>' +
          '<div class="step reveal" style="transition-delay:100ms"><span class="step-num">02</span><h3>' + t('steps.2.title') + '</h3><p>' + t('steps.2.desc') + '</p></div>' +
          '<div class="step reveal" style="transition-delay:200ms"><span class="step-num">03</span><h3>' + t('steps.3.title') + '</h3><p>' + t('steps.3.desc') + '</p></div>' +
        '</div>' +
      '</section>' +

      // — Parrainage (sombre) —
      '<section class="referral"><div class="section">' +
        '<div class="reveal">' +
          '<h2 class="section-title">' + t('referral.title.1') + '<br><em>' + t('referral.title.2') + '</em></h2>' +
          '<p>' + t('referral.p') + '</p>' +
        '</div>' +
        '<div class="referral-figure reveal" style="transition-delay:120ms">' +
          t('referral.figure') + '<small>' + t('referral.figure.sub') + '</small>' +
        '</div>' +
      '</div></section>' +

      // — CTA final sombre —
      '<section class="final-cta">' +
        '<div class="inner">' +
          '<h2 class="section-title">' + t('finalCta.title.1') + '<br><em>' + t('finalCta.title.2') + '</em></h2>' +
          '<p>' + t('finalCta.sub') + '</p>' +
          '<div class="hero-actions"><a class="btn btn-gold-vivid" href="#/register">' + t('finalCta.button') + ARROW_SVG + '</a></div>' +
        '</div>' +
      '</section>';

    afterRender('home');
  }

  function renderAcademies() {
    var cards = ACADEMIES.map(academyRow).join('');
    app.innerHTML = '' +
      '<section class="section academies">' +
        '<p class="section-label reveal">' + t('academies.label') + '</p>' +
        '<h2 class="section-title reveal">' +
          t('academies.title.1') + '<br><em>' + t('academies.title.2') + '</em></h2>' +
        '<div class="academy-grid">' + cards + '</div>' +
      '</section>';
    afterRender('academies');
  }

  function priceCell(amount, save) {
    var saveHtml = save ? '<span class="price-save">' + t('pricing.youSave') + ' ₦' + save.toLocaleString('en-NG') + '</span>' : '';
    return '<span class="price-amount">₦' + amount.toLocaleString('en-NG') + (save ? '' : '<small>' + t('pricing.perMonth') + '</small>') + '</span><br>' + saveHtml;
  }

  function priceRow(tierKey, m1, m3, s3, m6, s6, popular) {
    return '' +
      '<tr class="' + (popular ? 'price-row-popular' : '') + '">' +
        '<td><span class="price-tier">' + t('pricing.' + tierKey) +
          (popular ? '<span class="price-popular-tag">' + t('pricing.popular') + '</span>' : '') +
          '<small>' + t('pricing.' + tierKey + '.sub') + '</small></span></td>' +
        '<td>' + priceCell(m1, 0) + '</td>' +
        '<td>' + priceCell(m3, s3) + '</td>' +
        '<td>' + priceCell(m6, s6) + '</td>' +
      '</tr>';
  }

  function renderPricing() {
    app.innerHTML = '' +
      '<section class="section">' +
        '<div class="pricing-head">' +
          '<div class="reveal">' +
            '<p class="section-label">' + t('pricing.label') + '</p>' +
            '<h2 class="section-title">' + t('pricing.title.1') + '<br><em>' + t('pricing.title.2') + '</em></h2>' +
          '</div>' +
          '<p class="reveal" style="color:var(--muted);max-width:36ch">' + t('pricing.lead') + '</p>' +
        '</div>' +
        '<div class="reveal" style="margin:-1.5rem 0 2.5rem">' +
          '<div class="setup-banner" style="margin:0">' + t('pricing.perLanguage') + '</div>' +
        '</div>' +
        '<div class="price-scroll reveal">' +
          '<table class="price-table">' +
            '<thead><tr>' +
              '<th>' + t('pricing.table.tier') + '</th>' +
              '<th>' + t('pricing.table.month1') + '</th>' +
              '<th>' + t('pricing.table.month3') + '</th>' +
              '<th>' + t('pricing.table.month6') + '</th>' +
            '</tr></thead>' +
            '<tbody>' +
              priceRow('general', 75000, 200000, 25000, 405000, 45000, false) +
              priceRow('premium', 120000, 320000, 40000, 648000, 72000, true) +
              priceRow('business', 150000, 420000, 30000, 840000, 60000, false) +
            '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="pricing-note reveal">' +
          '<p>' + t('pricing.note') + '</p>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-gold" href="#/register">' + t('pricing.cta') + ARROW_SVG + '</a>' +
            '<a class="btn btn-solid" href="#/checkout">' + t('pricing.subscribe') + '</a>' +
          '</div>' +
        '</div>' +

        '<div style="margin-top:4rem" class="reveal">' +
          '<p class="section-label">' + t('faq.label') + '</p>' +
          '<h2 class="section-title" style="font-size:clamp(2rem,4.5vw,3rem);margin-bottom:2rem">' + t('faq.title') + '</h2>' +
          '<div class="faq-item"><button type="button" class="faq-q">' + t('faq.q1') + '<span class="chev">▼</span></button><div class="faq-a">' + t('faq.a1') + '</div></div>' +
          '<div class="faq-item"><button type="button" class="faq-q">' + t('faq.q2') + '<span class="chev">▼</span></button><div class="faq-a">' + t('faq.a2') + '</div></div>' +
          '<div class="faq-item"><button type="button" class="faq-q">' + t('faq.q3') + '<span class="chev">▼</span></button><div class="faq-a">' + t('faq.a3') + '</div></div>' +
          '<div class="faq-item"><button type="button" class="faq-q">' + t('faq.q4') + '<span class="chev">▼</span></button><div class="faq-a">' + t('faq.a4') + '</div></div>' +
        '</div>' +
      '</section>';
    afterRender('pricing');
    bindFaq();
  }

  function bindFaq() {
    document.querySelectorAll('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.parentElement;
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  /* ---------- Checkout (Paystack) ---------- */
  var checkoutState = { plan: null, duration: null, referralCode: '', preview: null, loading: false };
  var checkoutDebounce = null;

  function renderCheckoutSummary() {
    var line = document.getElementById('checkout-price-line');
    var pay = document.getElementById('checkout-pay');
    var p = checkoutState.preview;
    if (!line) return;
    if (checkoutState.loading) {
      line.innerHTML = t('checkout.calculating');
      if (pay) pay.disabled = true;
      return;
    }
    if (!p) { line.innerHTML = ''; if (pay) pay.disabled = true; return; }

    var parts = '<span>' + t('checkout.base') + ' <strong>₦' + p.base.toLocaleString('en-NG') + '</strong></span>';
    if (p.discount > 0) parts += '<br><span style="color:var(--emerald)">' + t('checkout.referralDiscount') + ' −₦' + p.discount.toLocaleString('en-NG') + '</span>';
    if (p.creditUsed > 0) parts += '<br><span style="color:var(--emerald)">' + t('checkout.creditUsed') + ' −₦' + p.creditUsed.toLocaleString('en-NG') + '</span>';
    parts += '<br><span style="font-size:1.1rem">' + t('checkout.total') + ' <strong>₦' + p.total.toLocaleString('en-NG') + '</strong></span>';
    if (p.error === 'invalid-referral-code') parts += '<br><span style="color:#B3261E">' + t('checkout.invalidCode') + '</span>';
    if (p.error === 'self-referral-not-allowed') parts += '<br><span style="color:#B3261E">' + t('checkout.selfReferral') + '</span>';
    line.innerHTML = parts;
    if (pay) pay.disabled = false;
  }

  function refreshCheckoutPreview() {
    if (!checkoutState.plan || !checkoutState.duration) {
      checkoutState.preview = null;
      renderCheckoutSummary();
      return;
    }
    checkoutState.loading = true;
    renderCheckoutSummary();
    var prev = callable('previewPayment');
    prev({ plan: checkoutState.plan, duration: checkoutState.duration, referralCode: checkoutState.referralCode })
      .then(function (r) {
        checkoutState.preview = r.data;
        checkoutState.loading = false;
        renderCheckoutSummary();
      })
      .catch(function () {
        checkoutState.preview = null;
        checkoutState.loading = false;
        renderCheckoutSummary();
      });
  }

  function renderCheckout() {
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth) {
      app.innerHTML = '' +
        '<section class="auth-wrap">' +
          '<h1 class="auth-title">' + t('checkout.title') + '</h1>' +
          '<div class="setup-banner">' + t('register.setup') + '</div>' +
        '</section>';
      afterRender('pricing');
      return;
    }

    var user = firebase.auth().currentUser;
    if (!user) {
      app.innerHTML = '' +
        '<section class="auth-wrap">' +
          '<h1 class="auth-title">' + t('checkout.title') + '</h1>' +
          '<p class="auth-sub">' + t('checkout.signInRequired') + '</p>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-solid" href="#/login">' + t('checkout.signInLink') + '</a>' +
            '<a class="btn btn-outline" href="#/register">' + t('login.registerLink') + '</a>' +
          '</div>' +
        '</section>';
      afterRender('pricing');
      return;
    }

    var plans = ['general', 'premium', 'business'];
    var durations = [1, 3, 6];

    var planBtns = plans.map(function (p) {
      return '<button type="button" class="choice' + (checkoutState.plan === p ? ' selected' : '') + '" data-plan="' + p + '">' +
        '<span class="choice-name">' + t('pricing.' + p) +
          '<span style="color:var(--muted);font-size:0.7em"> — ' + t('pricing.' + p + '.sub') + '</span></span>' +
        '<span class="choice-tag">' + t('checkout.month.' + 1) + ' ₦' + PRICING[p][1].toLocaleString('en-NG') + '</span>' +
      '</button>';
    }).join('');

    var selPlan = checkoutState.plan || 'general';
    var durBtns = durations.map(function (d) {
      return '<button type="button" class="choice' + (checkoutState.duration === d ? ' selected' : '') + '" data-duration="' + d + '">' +
        '<span class="choice-name">' + t('checkout.month.' + d) + '</span>' +
        '<span class="choice-tag">₦' + PRICING[selPlan][d].toLocaleString('en-NG') + '</span>' +
      '</button>';
    }).join('');

    app.innerHTML = '' +
      '<section class="auth-wrap">' +
        '<h1 class="auth-title">' + t('checkout.title') + '</h1>' +
        '<p class="auth-sub">' + t('checkout.sub') + '</p>' +
        '<div class="field"><label>' + t('checkout.planLabel') + '</label></div>' +
        '<div class="choice-grid">' + planBtns + '</div>' +
        '<div class="field"><label>' + t('checkout.durationLabel') + '</label></div>' +
        '<div class="choice-grid">' + durBtns + '</div>' +
        '<div class="field"><label>' + t('checkout.referralLabel') + '</label>' +
          '<input id="checkout-referral" type="text" maxlength="16" autocomplete="off" placeholder="' + t('checkout.referralPlaceholder') + '">' +
        '</div>' +
        '<div class="pricing-note">' +
          '<div>' +
            '<p id="checkout-price-line">' + t('checkout.calculating') + '</p>' +
            '<p class="checkout-terms">' + t('checkout.termsNotice') + ' ' +
              '<a href="#/terms">' + t('footer.terms') + '</a> ' + t('common.and') + ' ' +
              '<a href="#/refund">' + t('footer.refundPolicy') + '</a>.</p>' +
          '</div>' +
          '<button type="button" class="btn btn-gold" id="checkout-pay" disabled>' + t('checkout.pay') + ARROW_SVG + '</button>' +
        '</div>' +
        '<p class="form-error" id="checkout-error">' + t('checkout.error') + '</p>' +
        '<p class="auth-alt"><a href="#/pricing">' + t('common.back') + '</a></p>' +
      '</section>';

    var refInput = document.getElementById('checkout-referral');
    if (refInput) {
      refInput.value = checkoutState.referralCode;
      refInput.addEventListener('input', function () {
        checkoutState.referralCode = refInput.value.trim();
        clearTimeout(checkoutDebounce);
        checkoutDebounce = setTimeout(refreshCheckoutPreview, 400);
      });
    }

    document.querySelectorAll('[data-plan]').forEach(function (b) {
      b.addEventListener('click', function () {
        checkoutState.plan = b.getAttribute('data-plan');
        renderCheckout();
      });
    });
    document.querySelectorAll('[data-duration]').forEach(function (b) {
      b.addEventListener('click', function () {
        checkoutState.duration = parseInt(b.getAttribute('data-duration'), 10);
        renderCheckout();
      });
    });

    var pay = document.getElementById('checkout-pay');
    if (pay) {
      pay.addEventListener('click', function () {
        var err = document.getElementById('checkout-error');
        if (!checkoutState.plan || !checkoutState.duration) {
          err.classList.add('show');
          return;
        }
        pay.disabled = true;
        var init = callable('initializePayment');
        init({ plan: checkoutState.plan, duration: checkoutState.duration, referralCode: checkoutState.referralCode })
          .then(function (r) {
            if (r.data && r.data.authorizationUrl) {
              window.location.href = r.data.authorizationUrl;
            } else {
              err.classList.add('show');
              pay.disabled = false;
            }
          })
          .catch(function (e2) {
            var code = (e2 && e2.code ? String(e2.code) : '').replace('functions/', '');
            if (code === 'invalid-argument' && e2.message && e2.message.indexOf('self-referral') >= 0) {
              err.textContent = t('checkout.selfReferral');
            } else if (code === 'invalid-argument' && e2.message && e2.message.indexOf('referral') >= 0) {
              err.textContent = t('checkout.invalidCode');
            } else {
              err.textContent = t('checkout.error');
            }
            err.classList.add('show');
            pay.disabled = false;
          });
      });
    }

    afterRender('pricing');
    refreshCheckoutPreview();
    if (window.ELAMarketing) window.ELAMarketing.track('checkout_started', { plan: checkoutState.plan || 'general', duration: checkoutState.duration || 1 });
  }

  /* ---------- Payment result ---------- */
  function getPaymentReference() {
    var sp = new URLSearchParams(window.location.search);
    var ref = sp.get('reference') || sp.get('trxref');
    if (ref) return ref;
    var hash = window.location.hash || '';
    var qi = hash.indexOf('?');
    if (qi >= 0) {
      var hp = new URLSearchParams(hash.slice(qi + 1));
      ref = hp.get('reference') || hp.get('trxref');
    }
    return ref || null;
  }

  function renderPaymentResult() {
    var reference = getPaymentReference();

    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.functions || !reference) {
      app.innerHTML = '' +
        '<section class="auth-wrap">' +
          '<h1 class="auth-title">' + t('payment.result.title.fail') + '</h1>' +
          '<p class="auth-sub">' + t('payment.result.msg.fail') + '</p>' +
          '<div class="hero-actions"><a class="btn btn-solid" href="#/">' + t('payment.result.backHome') + '</a></div>' +
        '</section>';
      afterRender('pricing');
      return;
    }

    app.innerHTML = '' +
      '<section class="auth-wrap">' +
        '<h1 class="auth-title">' + t('payment.result.title.success') + '</h1>' +
        '<p class="auth-sub">' + t('payment.result.verifying') + '</p>' +
      '</section>';
    afterRender('pricing');

    var verify = callable('verifyPaystackPayment');
    verify({ reference: reference })
      .then(function (r) {
        var ok = r.data && r.data.status === 'success';
        app.innerHTML = '' +
          '<section class="auth-wrap">' +
            '<h1 class="auth-title">' + t(ok ? 'payment.result.title.success' : 'payment.result.title.fail') + '</h1>' +
            '<p class="auth-sub">' + t(ok ? 'payment.result.msg.success' : 'payment.result.msg.fail') + '</p>' +
            '<div class="hero-actions">' +
              '<a class="btn btn-solid" href="#/dashboard">' + t('dashboard.title') + '</a>' +
              '<a class="btn btn-outline" href="#/">' + t('payment.result.backHome') + '</a>' +
            '</div>' +
          '</section>';
        afterRender('pricing');
      })
      .catch(function () {
        app.innerHTML = '' +
          '<section class="auth-wrap">' +
            '<h1 class="auth-title">' + t('payment.result.title.fail') + '</h1>' +
            '<p class="auth-sub">' + t('payment.result.msg.fail') + '</p>' +
            '<div class="hero-actions"><a class="btn btn-solid" href="#/">' + t('payment.result.backHome') + '</a></div>' +
          '</section>';
        afterRender('pricing');
      });
  }
/* ---------- Payment success (route #/payment-success, callback Paystack live) ---------- */
  function renderPaymentSuccess() {
    var reference = getPaymentReference();
    app.innerHTML = '' +
      '<section class="auth-wrap">' +
        '<h1 class="auth-title">' + t('payment.result.title.success') + '</h1>' +
        '<p class="auth-sub">' + t('payment.success.msg') + '</p>' +
        (reference ? '<p class="auth-sub" style="margin-top:0.5rem;color:var(--forest)">' + t('payment.reference') + ': <strong>' + escapeHtml(reference) + '</strong></p>' : '') +
        '<div class="hero-actions">' +
          '<a class="btn btn-solid" href="#/dashboard">' + t('dashboard.title') + '</a>' +
          '<a class="btn btn-outline" href="#/\">' + t('payment.result.backHome') + '</a>' +
        '</div>' +
      '</section>';
    afterRender('pricing');
  }

  /* ---------- Learning Assistant (Jalon 3) ---------- */
  var assistantHistory = [];
  var assistantBusy = false;

  var LOADER_SVG =
    '<svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"/></svg>';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function assistantChatHtml() {
    var html = assistantHistory.map(function (m) {
      var cls = m.role === 'user' ? 'user' : 'assistant';
      return '<div class="msg ' + cls + '">' + escapeHtml(m.content) + '</div>';
    }).join('');
    if (assistantBusy) html += '<div class="msg assistant typing">' + LOADER_SVG + '</div>';
    return html;
  }

  function renderAssistantLog() {
    var log = document.getElementById('chat-log');
    if (log) { log.innerHTML = assistantChatHtml(); log.scrollTop = log.scrollHeight; }
  }

  function renderAssistant() {
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth) {
      app.innerHTML = '' +
        '<section class="auth-wrap">' +
          '<h1 class="auth-title">' + t('assistant.title') + '</h1>' +
          '<div class="setup-banner">' + t('register.setup') + '</div>' +
        '</section>';
      afterRender('');
      return;
    }

    var user = firebase.auth().currentUser;
    if (!user) {
      app.innerHTML = '' +
        '<section class="auth-wrap">' +
          '<h1 class="auth-title">' + t('assistant.title') + '</h1>' +
          '<p class="auth-sub">' + t('assistant.signInRequired') + '</p>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-solid" href="#/login">' + t('login.submit') + '</a>' +
            '<a class="btn btn-outline" href="#/register">' + t('login.registerLink') + '</a>' +
          '</div>' +
        '</section>';
      afterRender('');
      return;
    }

    app.innerHTML = '' +
      '<section class="auth-wrap assistant-wrap">' +
        '<h1 class="auth-title">' + t('assistant.title') + '</h1>' +
        '<p class="auth-sub">' + t('assistant.sub') + '</p>' +
        '<div class="chat" id="chat-log">' + assistantChatHtml() + '</div>' +
        '<form id="chat-form" class="chat-input">' +
          '<input id="chat-msg" type="text" maxlength="2000" autocomplete="off" aria-label="' + t('assistant.placeholder') + '" placeholder="' + t('assistant.placeholder') + '">' +
          '<button class="btn btn-solid" type="submit">' + t('assistant.send') + '</button>' +
        '</form>' +
        '<p class="form-error" id="chat-error"></p>' +
      '</section>';

    var form = document.getElementById('chat-form');
    var input = document.getElementById('chat-msg');
    var err = document.getElementById('chat-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (assistantBusy) return;
      var msg = input.value.trim();
      if (!msg) return;
      err.classList.remove('show');
      input.value = '';
      assistantHistory.push({ role: 'user', content: msg });
      assistantBusy = true;
      renderAssistantLog();

      var call = callable('learningAssistant');
      call({ message: msg, history: assistantHistory.slice(0, -1).slice(-20) })
        .then(function (r) {
          assistantBusy = false;
          var d = r.data || {};
          assistantHistory.push({ role: 'assistant', content: d.degraded ? t('assistant.degraded') : (d.reply || t('assistant.error')) });
          renderAssistantLog();
        })
        .catch(function (e2) {
          assistantBusy = false;
          renderAssistantLog();
          var code = (e2 && e2.code ? String(e2.code) : '').replace('functions/', '');
          if (code === 'failed-precondition') {
            err.textContent = t('assistant.subscriptionRequired');
            err.classList.add('show');
          } else if (code === 'resource-exhausted') {
            err.textContent = t('assistant.limitReached');
            err.classList.add('show');
          } else if (code === 'unauthenticated') {
            window.location.hash = '#/login';
          } else {
            err.textContent = t('assistant.error');
            err.classList.add('show');
          }
        });
    });

    afterRender('');
  }

  /* ---------- Dashboard (Jalon 5) ---------- */
  function fmtNaira(n) { return '₦' + Number(n || 0).toLocaleString('en-NG'); }

  function skeletonLoading() {
    return '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<div class="skeleton" style="height:2.4rem;width:55%;margin-bottom:1.6rem"></div>' +
        '<div class="skeleton skeleton-card" style="margin-bottom:1rem"></div>' +
        '<div class="skeleton skeleton-card"></div>' +
      '</section>';
  }

  function dashboardSignIn() {
    app.innerHTML = '' +
      '<section class="auth-wrap">' +
        '<h1 class="auth-title">' + t('dashboard.title') + '</h1>' +
        '<p class="auth-sub">' + t('dashboard.signInRequired') + '</p>' +
        '<div class="hero-actions">' +
          '<a class="btn btn-solid" href="#/login">' + t('login.submit') + '</a>' +
          '<a class="btn btn-outline" href="#/register">' + t('login.registerLink') + '</a>' +
        '</div>' +
      '</section>';
    afterRender('');
  }

      function buildDashboard(d) {
    var sub = d.subscription;
    var now = Date.now();
    var firstName = ((d.user && d.user.displayName) || '').split(' ')[0];
    var prog = d.progress || { completed: 0, total: 0 };
    var scores = d.bestQuizScores || [];
    var nxt = d.nextLiveClass;
    var qstats = d.quizStats || { taken: 0, avg: 0, streak: 0 };
    var certificates = d.certificates || [];
    var progPct = prog.total ? Math.round((prog.completed / prog.total) * 100) : 0;
    var isActive = !!(sub && sub.status === 'active' && sub.endDate && sub.endDate > now);
    var nextLesson = d.nextLesson;
    var myAcademy = d.user && d.user.academy;
    var academyName = myAcademy ? t('academies.' + myAcademy + '.name') : '';
    var role = d.user && d.user.role;

    // ============================================================
    // 1. HERO — salutation + grande progression + prochaine étape
    // ============================================================
    var heroCtaHref = nextLesson ? ('#/lesson?id=' + encodeURIComponent(nextLesson.id)) : '#/courses';
    var heroCtaLabel = nextLesson ? t('dashboard.continue') : t('dashboard.goToCourses');
    var heroHtml = '<div class="dash-hero">' +
      '<div class="dash-hero-text">' +
        '<h1 class="greeting">' + t('dashboard.hello') + (firstName ? ', <em>' + escapeHtml(firstName) + '</em>' : '') + '!</h1>' +
        '<p class="dash-hero-sub">' + t('dashboard.heroPhrase') + '</p>' +
        '<div class="dash-hero-next">' +
          '<span class="next-label">' + t('dashboard.nextStep') + '</span>' +
          '<a class="btn btn-gold-vivid" href="' + heroCtaHref + '">' + heroCtaLabel + ARROW_SVG + '</a>' +
        '</div>' +
      '</div>' +
      '<div class="dash-hero-ring">' +
        '<div class="ring-wrap">' +
          '<div class="ring" style="--p:' + progPct + '"><span>' + progPct + '%</span></div>' +
        '</div>' +
        '<div class="ring-caption">' + t('dashboard.overallProgress') + '</div>' +
      '</div>' +
    '</div>';

    // ============================================================
    // 2. CONTINUE YOUR JOURNEY — carte focale
    // ============================================================
    var journeyHtml;
    if (nextLesson) {
      var isStart = prog.completed === 0;
      var jLevel = nextLesson.level ? ('<span class="badge badge-emerald">' + t('dashboard.level') + ' ' + escapeHtml(nextLesson.level) + '</span>') : '';
      var jAcademy = academyName ? ('<span class="badge badge-muted">' + escapeHtml(academyName) + '</span>') : '';
      var jLesson = nextLesson.order ? ('<span class="badge badge-gold">' + t('dashboard.lesson') + ' ' + nextLesson.order + '</span>') : '';
      journeyHtml = '<div class="journey-card">' +
        '<div class="journey-meta">' + jAcademy + jLevel + jLesson + '</div>' +
        '<h2 class="journey-title">' + (isStart ? t('dashboard.firstLesson') : escapeHtml(nextLesson.title)) + '</h2>' +
        '<p class="journey-sub">' + (isStart ? (t('dashboard.startWith') + ' ' + escapeHtml(nextLesson.title)) : t('dashboard.resumeSub')) + '</p>' +
        '<div class="journey-actions" style="margin-top:1.2rem">' +
          '<a class="btn btn-solid" href="#/lesson?id=' + encodeURIComponent(nextLesson.id) + '">' + t('dashboard.startLesson') + ARROW_SVG + '</a>' +
        '</div>' +
      '</div>';
    } else {
      journeyHtml = '<div class="journey-card">' +
        '<div class="journey-meta"><span class="badge badge-emerald">' + t('dashboard.status.active') + '</span></div>' +
        '<h2 class="journey-title">' + t('dashboard.resumeDone') + '</h2>' +
        '<p class="journey-sub">' + t('dashboard.resumeSub') + '</p>' +
        '<div class="journey-actions" style="margin-top:1.2rem"><a class="btn btn-solid" href="#/courses">' + t('dashboard.goToCourses') + ARROW_SVG + '</a></div>' +
      '</div>';
    }
    var journeySection = '<div class="dashboard-section">' +
      '<div class="dashboard-section-header">' +
        '<h3 class="dashboard-section-title">' + t('dashboard.continueLearning') + '</h3>' +
        '<a class="dashboard-section-link" href="#/courses">' + t('dashboard.goToCourses') + ARROW_SVG + '</a>' +
      '</div>' + journeyHtml +
    '</div>';

    // ============================================================
    // 3. YOUR PROGRESS — 4 stat cards (progression en anneau)
    // ============================================================
    var statsHtml = '<div class="dashboard-section">' +
      '<div class="dashboard-section-header"><h3 class="dashboard-section-title">' + t('dashboard.overallProgress') + '</h3></div>' +
      '<div class="dash-stats-grid">' +
        '<div class="dash-stat-card"><div class="dash-stat-ring"><div class="ring" style="--p:' + progPct + ';--sz:52px"><span style="font-size:0.66rem">' + progPct + '%</span></div></div>' +
          '<div class="dash-stat-label">' + t('dashboard.overallProgress') + '</div>' +
          '<div class="dash-stat-value">' + prog.completed + '/' + prog.total + '</div></div>' +
        '<div class="dash-stat-card"><div class="dash-stat-icon tint-forest">' + ICON_BOOK + '</div>' +
          '<div class="dash-stat-label">' + t('dashboard.lessonsCompleted') + '</div>' +
          '<div class="dash-stat-value">' + prog.completed + '</div>' +
          '<div class="dash-stat-hint">' + t('dashboard.keepGoing') + '</div></div>' +
        '<div class="dash-stat-card"><div class="dash-stat-icon tint-muted">' + ICON_QUIZ + '</div>' +
          '<div class="dash-stat-label">' + t('dashboard.quizzes') + '</div>' +
          '<div class="dash-stat-value">' + qstats.taken + '</div>' +
          '<div class="dash-stat-hint">' + (qstats.avg ? t('dashboard.avgScore') + ' ' + qstats.avg + '%' : '') + '</div></div>' +
        '<div class="dash-stat-card"><div class="dash-stat-icon tint-gold">' + ICON_FLAME + '</div>' +
          '<div class="dash-stat-label">' + t('dashboard.streak') + '</div>' +
          '<div class="dash-stat-value">' + (qstats.streak || 0) + '</div>' +
          '<div class="dash-stat-hint">' + t('dashboard.keepGoing') + '</div></div>' +
      '</div>' +
    '</div>';

    // ============================================================
    // 4. YOUR CURRENT PLAN — parcours (pas une échéance)
    // ============================================================
    var planSection = '';
    if (isActive) {
      var days = Math.max(0, Math.ceil((sub.endDate - now) / 86400000));
      var expiry = new Date(sub.endDate).toLocaleDateString(ELA_I18N.getLang());
      var myProg = (d.academyProgress || []).filter(function (a) { return a.academy === myAcademy; });
      var apct = myProg.length ? (myProg[0].pct || 0) : 0;
      planSection = '<div class="dashboard-section">' +
        '<div class="dashboard-section-header"><h3 class="dashboard-section-title">' + t('dashboard.currentPlan') + '</h3></div>' +
        '<div class="card" style="margin-top:0">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:0.9rem">' +
            '<div><span class="badge badge-emerald">' + t('dashboard.status.active') + '</span>' +
            '<span style="font-weight:700;color:var(--forest);margin-inline-start:0.5rem">' + t('pricing.' + (sub.plan || 'general')) + '</span></div>' +
            '<span style="font-size:0.9rem;color:var(--muted)">' + days + ' ' + t('dashboard.daysRemaining') + ' · ' + t('dashboard.expiresOn') + ' ' + expiry + '</span>' +
          '</div>' +
          (myProg.length
            ? '<div style="margin-bottom:0.4rem"><div style="display:flex;justify-content:space-between;font-size:0.82rem;color:var(--muted);margin-bottom:0.3rem">' +
                '<span>' + t('dashboard.courseProgress') + '</span><span>' + myProg[0].completed + '/' + myProg[0].total + '</span></div>' +
              '<div class="progress-track"><div class="progress-fill" style="width:' + apct + '%"></div></div></div>'
            : '') +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-top:1rem">' +
            '<a class="btn btn-solid btn-sm" href="#/courses">' + t('dashboard.continue') + ARROW_SVG + '</a>' +
            '<a class="dashboard-section-link" href="#/checkout">' + t('dashboard.renew') + '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    } else {
      planSection = '<div class="dashboard-section">' +
        '<div class="upgrade-banner" style="margin:0">' +
          '<div><h3>' + t('dashboard.unlockPath') + '</h3><p>' + t('dashboard.unlockPathSub') + '</p></div>' +
          '<a class="btn btn-gold-vivid" href="#/pricing">' + t('dashboard.viewPlans') + '</a>' +
        '</div>' +
      '</div>';
    }

    // ============================================================
    // 5. UPCOMING LIVE CLASSES — aspirationnel si vide
    // ============================================================
    var liveCard;
    if (nxt) {
      var d0 = new Date(nxt.scheduledAt);
      var mNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      liveCard = '<div class="live-mini">' +
        '<div class="live-mini-top">' +
          '<div class="live-date"><span class="live-date-day">' + d0.getDate() + '</span><span class="live-date-month">' + mNames[d0.getMonth()] + '</span></div>' +
          '<div class="live-info">' +
            '<span class="badge badge-gold"><span class="live-dot" style="margin-inline-end:0.4rem"></span>' + t('dashboard.liveSoon') + '</span>' +
            '<h4>' + escapeHtml(nxt.title) + '</h4>' +
            '<p>' + ICON_CALENDAR + ' ' + d0.toLocaleString(ELA_I18N.getLang()) + '</p>' +
          '</div>' +
        '</div>' +
        '<a class="btn btn-solid btn-sm btn-full" href="#/live">' + ICON_VIDEO + ' ' + t('dashboard.joinLive') + '</a>' +
      '</div>';
    } else {
      liveCard = '<div class="card" style="margin-top:0"><div class="live-aspiration">' +
        '<div class="dash-stat-icon tint-gold" style="margin:0 auto 0.8rem">' + ICON_VIDEO + '</div>' +
        '<p style="font-family:var(--font-display);font-weight:700;font-size:1.2rem;color:var(--forest);margin-bottom:0.4rem">' + t('dashboard.liveAspiration') + '</p>' +
        '<a class="btn btn-gold btn-sm" href="#/live">' + t('dashboard.exploreLive') + ARROW_SVG + '</a>' +
      '</div></div>';
    }
    var liveSection = '<div class="dashboard-section">' +
      '<div class="dashboard-section-header">' +
        '<h3 class="dashboard-section-title">' + t('dashboard.upcomingLive') + '</h3>' +
        '<a class="dashboard-section-link" href="#/live">' + t('dashboard.viewAll') + '</a>' +
      '</div>' + liveCard +
    '</div>';

    // ============================================================
    // 6. YOUR ACHIEVEMENTS — badges SVG (locked/unlocked) + certifs
    // ============================================================
    var ICONS = { quiz: ICON_QUIZ, book: ICON_BOOK, flame: ICON_FLAME, award: ICON_AWARD, trophy: ICON_TROPHY };
    var badgeDefs = [
      { icon: 'quiz', tint: 'tint-emerald', name: 'dashboard.badge.firstQuiz', desc: 'dashboard.badge.firstQuiz.desc', ok: qstats.taken >= 1 },
      { icon: 'book', tint: 'tint-forest', name: 'dashboard.badge.fiveLessons', desc: 'dashboard.badge.fiveLessons.desc', ok: prog.completed >= 5 },
      { icon: 'flame', tint: 'tint-gold', name: 'dashboard.badge.streak', desc: 'dashboard.badge.streak.desc', ok: qstats.streak >= 3 },
      { icon: 'award', tint: 'tint-gold', name: 'dashboard.badge.certified', desc: 'dashboard.badge.certified.desc', ok: certificates.length >= 1 },
      { icon: 'trophy', tint: 'tint-emerald', name: 'dashboard.badge.complete', desc: 'dashboard.badge.complete.desc', ok: prog.total > 0 && prog.completed >= prog.total }
    ];
    var achCells = badgeDefs.map(function (b) {
      return '<div class="ach-badge ' + (b.ok ? 'ach-on' : 'ach-off') + '">' +
        '<div class="dash-stat-icon ' + b.tint + '">' + ICONS[b.icon] + '</div>' +
        '<strong>' + t(b.name) + '</strong>' +
        '<small>' + t(b.desc) + '</small>' +
      '</div>';
    }).join('');
    var certItems = certificates.map(function (c) {
      var date = c.issuedAt ? new Date(c.issuedAt).toLocaleDateString(ELA_I18N.getLang()) : '';
      var meta = [];
      if (c.academy) meta.push(t('academies.' + c.academy + '.name'));
      if (c.percentage != null) meta.push(c.percentage + '%');
      if (date) meta.push(date);
      return '<div style="display:flex;align-items:center;gap:0.8rem;padding:0.6rem 0;border-top:1px solid var(--line-soft)">' +
        '<div style="flex:1"><div style="font-weight:700;color:var(--forest)">' + escapeHtml(c.title) + '</div>' +
        '<div style="font-size:0.8rem;color:var(--muted)">' + escapeHtml(meta.join(' · ')) + '</div></div>' +
        (c.pdfUrl ? '<a class="btn btn-outline btn-sm" href="' + escapeHtml(c.pdfUrl) + '" target="_blank" rel="noopener">' + t('dashboard.download') + '</a>' : '') +
      '</div>';
    }).join('');
    var scoresHtml = scores.length
      ? '<div class="card" style="margin-top:0.8rem;padding:0.9rem 1.3rem"><div style="font-weight:700;color:var(--forest);margin-bottom:0.4rem;font-size:0.9rem">' + t('dashboard.bestScores') + '</div>' +
          '<ul class="tx-list" style="margin:0">' +
          scores.map(function (s) {
            var p = s.total ? Math.round((s.bestScore / s.total) * 100) : 0;
            return '<li><span>' + escapeHtml(s.title) + '</span><span class="badge ' + (p >= 80 ? 'badge-emerald' : 'badge-gold') + '">' + s.bestScore + '/' + s.total + '</span></li>';
          }).join('') + '</ul></div>'
      : '';

    var achievementsSection = '<div class="dashboard-section">' +
      '<div class="dashboard-section-header"><h3 class="dashboard-section-title">' + t('dashboard.achievements') + '</h3></div>' +
      '<div class="ach-grid">' + achCells + '</div>' +
      scoresHtml +
      (certItems ? '<div class="card" style="margin-top:0.8rem;padding:0.9rem 1.3rem">' + certItems + '</div>' : '') +
    '</div>';

    // ============================================================
    // 7. MEET YOUR LANGUAGE TUTOR — grande carte premium
    // ============================================================
    var tutorSection = '<div class="dashboard-section">' +
      '<div class="tutor-card">' +
        '<div style="display:flex;align-items:center;gap:0.9rem;margin-bottom:0.6rem"><div class="dash-stat-icon tint-gold" style="background:rgba(226,172,43,0.18);color:var(--gold-vivid)">' + ICON_CHAT + '</div><span class="badge badge-gold" style="background:rgba(226,172,43,0.16);color:var(--gold-vivid)">' + t('dashboard.assistant') + '</span></div>' +
        '<h3>' + t('dashboard.tutorTitle') + '</h3>' +
        '<p>' + t('dashboard.tutorSub') + '</p>' +
        '<a class="btn btn-gold-vivid" href="#/assistant">' + t('dashboard.tutorCta') + ARROW_SVG + '</a>' +
      '</div>' +
    '</div>';

    // ============================================================
    // 8. REFER & EARN — carte marketing
    // ============================================================
    var referSection = '<div class="dashboard-section">' +
      '<div class="dashboard-section-header"><h3 class="dashboard-section-title">' + t('dashboard.referTitle') + '</h3></div>' +
      '<div class="refer-card">' +
        '<p style="color:var(--forest);font-weight:700;margin-bottom:0.8rem">' + t('dashboard.referValue') + '</p>' +
        '<div class="referral-code">' +
          '<span class="code">' + escapeHtml(d.user.referralCode || '—') + '</span>' +
          '<button type="button" class="btn btn-solid btn-sm" id="copy-code">' + t('dashboard.copy') + '</button>' +
        '</div>' +
        '<p style="font-size:0.8rem;color:var(--muted);margin-top:0.6rem">' + t('dashboard.referralCredit') + ': <strong>' + fmtNaira(d.user.referralCredit) + '</strong></p>' +
      '</div>' +
    '</div>';

    // ============================================================
    // 9. QUICK ACTIONS
    // ============================================================
    var quickActions = '<div class="dashboard-section">' +
      '<div class="dashboard-section-header"><h3 class="dashboard-section-title">' + t('dashboard.quickActions') + '</h3></div>' +
      '<div class="quick-grid">' +
        '<a class="action-tile" href="#/courses"><div class="dash-stat-icon tint-emerald">' + ICON_BOOK + '</div><div class="action-title">' + t('nav.courses') + '</div><div class="action-sub">' + t('dashboard.coursesSub') + '</div></a>' +
        '<a class="action-tile" href="#/quiz"><div class="dash-stat-icon tint-gold">' + ICON_QUIZ + '</div><div class="action-title">' + t('nav.quiz') + '</div><div class="action-sub">' + t('dashboard.takeQuizSub') + '</div></a>' +
        '<a class="action-tile" href="#/live"><div class="dash-stat-icon tint-forest">' + ICON_VIDEO + '</div><div class="action-title">' + t('nav.live') + '</div><div class="action-sub">' + t('dashboard.liveClassesSub') + '</div></a>' +
        '<a class="action-tile" href="#/assistant"><div class="dash-stat-icon tint-muted">' + ICON_CHAT + '</div><div class="action-title">' + t('dashboard.assistant') + '</div><div class="action-sub">' + t('dashboard.assistantSub') + '</div></a>' +
      '</div>' +
    '</div>';

    // ============================================================
    // 10. PAYMENT HISTORY — compacte, tout en bas
    // ============================================================
    var txRows = (d.transactions || []).slice().sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }).map(function (tx) {
      var date = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString(ELA_I18N.getLang()) : '';
      var pill;
      if (tx.status === 'success') pill = '<span class="badge badge-emerald">' + t('dashboard.tx.success') + '</span>';
      else if (tx.status === 'failed') pill = '<span class="badge badge-red">' + t('dashboard.tx.failed') + '</span>';
      else pill = '<span class="badge badge-gold">' + t('dashboard.tx.' + (tx.status || 'pending')) + '</span>';
      return '<tr><td>' + t('pricing.' + (tx.plan || 'general')) + ' · ' + t('checkout.month.' + (tx.duration || 1)) + '</td>' +
        '<td>' + date + '</td>' +
        '<td>' + fmtNaira(tx.amount) + '</td>' +
        '<td>' + pill + '</td></tr>';
    }).join('');
    var txHtml = '<div class="dashboard-section">' +
      '<div class="dashboard-section-header"><h3 class="dashboard-section-title">' + t('dashboard.transactions') + '</h3></div>' +
      (txRows
        ? '<div class="dash-table-wrap"><table class="dash-table"><thead><tr><th>' + t('dashboard.plan') + '</th><th>' + t('dashboard.date') + '</th><th>' + t('dashboard.amount') + '</th><th>' + t('dashboard.status') + '</th></tr></thead><tbody>' + txRows + '</tbody></table></div>'
        : '<div class="card" style="margin-top:0"><div class="empty-state" style="padding:1.2rem 0"><p style="margin:0">' + t('dashboard.noTransactions') + '</p></div></div>') +
    '</div>';

    // ============================================================
    // Panneaux par rôle (teacher/admin) — APRÈS les sections étudiantes
    // ============================================================
    var rolePanel = '';
    if (role === 'teacher') {
      rolePanel = '<div class="dashboard-section">' +
        '<div class="dashboard-section-header"><h3 class="dashboard-section-title">' + t('dashboard.teacherStudio') + '</h3>' +
        '<a class="dashboard-section-link" href="#/teacher">' + t('dashboard.teacherStudio.open') + ARROW_SVG + '</a></div>' +
        '<div class="card" style="margin-top:0">' +
          '<p style="color:var(--muted);margin-bottom:0.9rem">' + t('dashboard.teacherStudioSub') + '</p>' +
          '<div class="quick-grid" style="grid-template-columns:repeat(3,1fr)">' +
            '<a class="action-tile" href="#/teacher"><div class="dash-stat-icon tint-emerald">' + ICON_BOOK + '</div><div class="action-title">' + t('dashboard.teacherStudio.publishLesson') + '</div></a>' +
            '<a class="action-tile" href="#/teacher"><div class="dash-stat-icon tint-gold">' + ICON_QUIZ + '</div><div class="action-title">' + t('dashboard.teacherStudio.publishQuiz') + '</div></a>' +
            '<a class="action-tile" href="#/teacher"><div class="dash-stat-icon tint-forest">' + ICON_VIDEO + '</div><div class="action-title">' + t('dashboard.teacherStudio.scheduleLive') + '</div></a>' +
          '</div>' +
        '</div>' +
      '</div>';
    } else if (role === 'admin') {
      rolePanel = '<div class="dashboard-section">' +
        '<div class="dashboard-section-header"><h3 class="dashboard-section-title">' + t('dashboard.adminPanel') + '</h3>' +
        '<a class="dashboard-section-link" href="#/admin">' + t('dashboard.adminPanel.open') + ARROW_SVG + '</a></div>' +
        '<div class="card" style="margin-top:0">' +
          '<p style="color:var(--muted);margin-bottom:0.9rem">' + t('dashboard.adminPanelSub') + '</p>' +
          '<div class="quick-grid" style="grid-template-columns:repeat(2,1fr)">' +
            '<a class="action-tile" href="#/admin"><div class="dash-stat-icon tint-emerald">' + ICON_AWARD + '</div><div class="action-title">' + t('dashboard.adminPanel.review') + '</div></a>' +
            '<a class="action-tile" href="#/admin"><div class="dash-stat-icon tint-gold">' + ICON_BOOK + '</div><div class="action-title">' + t('dashboard.adminPanel.seed') + '</div></a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    return '' +
      '<section class="auth-wrap assistant-wrap">' +
        heroHtml +
        journeySection +
        statsHtml +
        planSection +
        liveSection +
        achievementsSection +
        tutorSection +
        referSection +
        quickActions +
        txHtml +
        rolePanel +
      '</section>';
  }

  function renderDashboard() {
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth || !firebase.functions) {
      app.innerHTML = '' +
        '<section class="auth-wrap"><h1 class="auth-title">' + t('dashboard.title') + '</h1>' +
        '<div class="setup-banner">' + t('register.setup') + '</div></section>';
      afterRender('');
      return;
    }
    var user = firebase.auth().currentUser;
    if (!user) { dashboardSignIn(); return; }

    app.innerHTML = '' +
      '<section class="auth-wrap assistant-wrap">' +
        '<div class="skeleton" style="height:2.4rem;width:55%;margin-bottom:1.4rem"></div>' +
        '<div class="dash-grid"><div class="skeleton skeleton-card"></div></div>' +
        '<div class="dash-grid" style="margin-top:1.2rem"><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div></div>' +
      '</section>';
    afterRender('');

    var get = callable('getDashboardData');
    get()
      .then(function (r) { app.innerHTML = buildDashboard(r.data); afterRender(''); bindDashboardCopy(); })
      .catch(function () {
        app.innerHTML = '' +
          '<section class="auth-wrap"><h1 class="auth-title">' + t('dashboard.title') + '</h1>' +
          '<p class="auth-sub">' + t('dashboard.error') + '</p></section>';
        afterRender('');
      });
  }

  function bindDashboardCopy() {
    var btn = document.getElementById('copy-code');
    if (!btn) return;
    var code = document.querySelector('.referral-code .code');
    btn.addEventListener('click', function () {
      if (!code) return;
      var text = code.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = t('dashboard.copied');
          setTimeout(function () { btn.textContent = t('dashboard.copy'); }, 2000);
        });
      } else {
        btn.textContent = text;
      }
    });
  }

  /* ---------- Legal pages ---------- */
  function legalPage(title, body) {
    return '' +
      '<section class="section legal">' +
        '<p class="section-label">' + t('legal.label') + '</p>' +
        '<h2 class="section-title">' + title + '</h2>' +
        '<p class="legal-meta">' + t('legal.updated') + ': 19 August 2026</p>' +
        '<div class="legal-body">' + body + '</div>' +
      '</section>';
  }

  function renderTerms() {
    app.innerHTML = legalPage(t('footer.terms'), t('legal.terms.body'));
    afterRender('');
  }

  function renderPrivacy() {
    app.innerHTML = legalPage(t('footer.privacy'), t('legal.privacy.body'));
    afterRender('');
  }

  function renderRefund() {
    app.innerHTML = legalPage(t('footer.refundPolicy'), t('legal.refund.body'));
    afterRender('');
  }


  /* ---------- Student learning module (phase 2) ---------- */
  function getHashParam(name) {
    var hash = window.location.hash || '';
    var qi = hash.indexOf('?');
    if (qi < 0) return null;
    return new URLSearchParams(hash.slice(qi + 1)).get(name);
  }

  function getCurrentAcademy() {
    var user = firebase.auth().currentUser;
    if (!user) return Promise.resolve(null);
    return firebase.firestore().collection('users').doc(user.uid).get()
      .then(function (snap) {
        if (!snap.exists) return null;
        var d = snap.data();
        return d.academy || (Array.isArray(d.academies) && d.academies[0]) || null;
      })
      .catch(function () { return null; });
  }

  function hasActiveSubscription() {
    var user = firebase.auth().currentUser;
    if (!user) return Promise.resolve(false);
    return firebase.firestore().collection('subscriptions').doc(user.uid).get()
      .then(function (snap) {
        if (!snap.exists) return false;
        var s = snap.data();
        var end = s.endDate && s.endDate.toDate ? s.endDate.toDate() : new Date(s.endDate);
        return s.status === 'active' && end > new Date();
      })
      .catch(function () { return false; });
  }

  // Modèle « 1 abonnement = 1 langue » : un élève n'accède qu'à son académie
  // (trial public, admin/teacher non restreints).
  function contentAccess(content) {
    var user = firebase.auth().currentUser;
    if (!user) return Promise.resolve(!!(content && content.isTrial));
    var db = firebase.firestore();
    return Promise.all([
      db.collection('users').doc(user.uid).get(),
      db.collection('subscriptions').doc(user.uid).get()
    ]).then(function (r) {
      var u = r[0].exists ? r[0].data() : {};
      var role = u.role || 'student';
      if (role === 'admin' || role === 'teacher') return true;
      if (content && content.isTrial) return true;
      var s = r[1].exists ? r[1].data() : null;
      var end = s && s.endDate && s.endDate.toDate ? s.endDate.toDate() : (s && s.endDate ? new Date(s.endDate) : null);
      if (!(s && s.status === 'active' && end && end > new Date())) return false;
      var academy = u.academy || (Array.isArray(u.academies) && u.academies[0]) || null;
      return academy ? (content && content.academy === academy) : false;
    }).catch(function () { return false; });
  }

  function studentSignInRequired(title) {
    app.innerHTML = '' +
      '<section class="auth-wrap"><h1 class="auth-title">' + title + '</h1>' +
      '<p class="auth-sub">' + t('assistant.signInRequired') + '</p>' +
      '<div class="hero-actions"><a class="btn btn-solid" href="#/login">' + t('login.submit') + '</a></div></section>';
    afterRender('');
  }

  /* ----- Courses catalog ----- */
  function renderCourses() {
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.functions) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1><div class="setup-banner">' + t('register.setup') + '</div></section>';
      afterRender('courses');
      return;
    }

    app.innerHTML = skeletonLoading();
    afterRender('courses');

    callable('getCatalog')().then(function (r) {
      renderCatalog((r.data && r.data.courses) || []);
    }).catch(function () {
      app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1><div class="card"><div class="empty-state" style="padding:1.4rem 0"><p style="margin:0">' + t('courses.empty') + '</p></div></div></section>';
      afterRender('courses');
    });
  }

  function renderCatalog(courses) {
    if (!courses.length) {
      app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1><div class="card"><div class="empty-state" style="padding:1.4rem 0"><p style="margin:0">' + t('courses.empty') + '</p></div></div></section>';
      afterRender('courses');
      return;
    }
    var byAcademy = {};
    courses.forEach(function (c) { var a = c.academy || 'german'; (byAcademy[a] = byAcademy[a] || []).push(c); });
    var html = Object.keys(byAcademy).map(function (a) {
      var cards = byAcademy[a].map(function (c) {
        return '<a class="card card-hover" href="#/course?id=' + encodeURIComponent(c.id) + '" style="display:block;text-decoration:none;color:inherit;margin-bottom:0.9rem">' +
          '<div style="display:flex;flex-wrap:wrap;gap:0.5rem 1rem;align-items:center;margin-bottom:0.5rem">' +
            '<span class="badge badge-emerald">' + escapeHtml(c.level) + '</span>' +
            '<strong style="font-size:1.05rem;color:var(--forest)">' + escapeHtml(c.title) + '</strong>' +
          '</div>' +
          '<p style="color:var(--muted);font-size:0.9rem;margin:0">' + escapeHtml(c.description) + '</p>' +
        '</a>';
      }).join('');
      return '<h3 class="auth-title" style="font-size:1.25rem;margin-top:1.5rem">' + t('academies.' + a + '.name') + '</h3>' + cards;
    }).join('');
    app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1>' + html + '</section>';
    afterRender('courses');
  }

  function renderCourse() {
    var id = getHashParam('id');
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.functions || !id) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
      afterRender('courses');
      return;
    }

    app.innerHTML = skeletonLoading();
    afterRender('courses');

    callable('getCourse')({ courseId: id }).then(function (r) {
      renderCourseContent(r.data);
    }).catch(function () {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
      afterRender('courses');
    });
  }

  function renderCourseContent(d) {
    var course = d.course, lessons = d.lessons || [], completed = d.completedLessons || [], total = d.total || 0;
    var pct = total ? Math.round((completed.length / total) * 100) : 0;
    var lessonItems = lessons.map(function (l) {
      var done = completed.indexOf(l.id) !== -1;
      var trialBadge = l.isTrial ? '<span class="badge badge-gold">' + t('lesson.trial') + '</span>' : '';
      return '<div class="card" style="margin-bottom:0.7rem">' +
        '<div style="display:flex;flex-wrap:wrap;gap:0.6rem 1rem;align-items:center">' +
          '<span style="color:var(--muted);font-family:var(--font-brand);font-size:0.9rem">' + (l.order < 10 ? '0' : '') + l.order + '</span>' +
          '<a href="#/lesson?id=' + encodeURIComponent(l.id) + '" style="flex:1;color:var(--forest);text-decoration:none;font-weight:700">' + escapeHtml(l.title) + '</a>' +
          trialBadge +
          (done ? '<span class="badge badge-emerald">' + t('lesson.completed') + '</span>' : '') +
          (l.quizId ? '<a class="btn btn-outline btn-sm" href="#/quiz?id=' + encodeURIComponent(l.quizId) + '">' + t('courses.quiz') + '</a>' : '') +
        '</div></div>';
    }).join('');
    var outcomes = (course.learningOutcomes || []).map(function (o) { return '<li>' + escapeHtml(o) + '</li>'; }).join('');

    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<div class="card" style="margin-bottom:1.4rem">' +
          '<span class="badge badge-emerald">' + escapeHtml(course.level) + '</span>' +
          '<h1 class="auth-title" style="margin:0.6rem 0 0.4rem">' + escapeHtml(course.title) + '</h1>' +
          '<p class="auth-sub" style="margin:0">' + escapeHtml(course.description) + '</p>' +
          '<div style="margin-top:1.1rem;display:flex;align-items:center;gap:0.8rem">' +
            '<span style="font-size:0.82rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);white-space:nowrap">' + t('dashboard.progress') + '</span>' +
            '<div class="progress-track" style="flex:1"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
            '<strong style="font-family:var(--font-brand);font-size:0.85rem;color:var(--forest)">' + completed.length + '/' + total + '</strong>' +
          '</div>' +
        '</div>' +
        (outcomes ? '<h3 class="auth-title" style="font-size:1.2rem;margin-top:1.2rem">' + t('course.outcomes') + '</h3><div class="card"><ul class="tx-list" style="margin:0">' + outcomes + '</ul></div>' : '') +
        '<h3 class="auth-title" style="font-size:1.2rem;margin-top:1.2rem">' + t('courses.lessons') + '</h3>' + lessonItems +
        '<p class="auth-alt"><a href="#/courses">' + t('common.back') + '</a></p>' +
      '</section>';
    afterRender('');
  }

  /* ----- Lesson detail ----- */
  function renderLesson() {
    var id = getHashParam('id');
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.firestore || !id) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.lessons') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
      afterRender('courses');
      return;
    }
    var user = firebase.auth().currentUser;
    var uid = user ? user.uid : null;

    app.innerHTML = skeletonLoading();
    afterRender('courses');

    var db = firebase.firestore();
    // Lecture directe : les règles décident (trial → public, sinon admin/teacher/abonné).
    db.collection('lessons').doc(id).get().then(function (snap) {
      if (!snap.exists) {
        app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.lessons') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
        afterRender('courses');
        return;
      }
      var lesson = snap.data();
      contentAccess(lesson).then(function (allowed) {
        if (!allowed) {
          app.innerHTML = '' +
            '<section class="auth-wrap"><h1 class="auth-title">' + t('lesson.lockedTitle') + '</h1>' +
            '<p class="auth-sub">' + t('lesson.lockedSub') + '</p>' +
            '<div class="hero-actions"><a class="btn btn-gold" href="#/pricing">' + t('lesson.lockedCta') + '</a></div>' +
            '<p class="auth-alt"><a href="#/courses">' + t('common.back') + '</a></p></section>';
          afterRender('courses');
          return;
        }
        if (lesson.isTrial && window.ELAMarketing) window.ELAMarketing.track('trial_started', { academy: lesson.academy || 'german', lessonId: id });
        var courseId = lesson.courseId;
        if (courseId && window.firebase && firebase.functions) {
          callable('getCourse')({ courseId: courseId }).then(function (r) {
            renderLessonContent(id, uid, lesson, (r.data && r.data.lessons) || []);
          }).catch(function () {
            renderLessonContent(id, uid, lesson, []);
          });
        } else {
          renderLessonContent(id, uid, lesson, []);
        }
      });
    }).catch(function () {
      if (!user) {
        studentSignInRequired(t('courses.lessons'));
      } else {
        app.innerHTML = '' +
          '<section class="auth-wrap"><h1 class="auth-title">' + t('lesson.subscribeRequired') + '</h1>' +
          '<p class="auth-sub">' + t('lesson.subscribeRequiredSub') + '</p>' +
          '<div class="hero-actions"><a class="btn btn-gold" href="#/checkout">' + t('pricing.subscribe') + '</a></div>' +
          '<p class="auth-alt"><a href="#/courses">' + t('common.back') + '</a></p></section>';
        afterRender('courses');
      }
    });
  }

  function renderLessonContent(id, uid, lesson, siblings) {
    var isDone = false;
    var db = firebase.firestore();
    var sib = siblings || [];
    var sibIdx = -1;
    sib.forEach(function (l, i) { if (l.id === id) sibIdx = i; });
    var prev = sibIdx > 0 ? sib[sibIdx - 1] : null;
    var next = sibIdx >= 0 && sibIdx < sib.length - 1 ? sib[sibIdx + 1] : null;
    var navHtml = (prev || next)
      ? '<div style="display:flex;justify-content:space-between;gap:0.8rem;margin-top:1.5rem;flex-wrap:wrap">' +
          (prev ? '<a class="btn btn-outline btn-sm" href="#/lesson?id=' + encodeURIComponent(prev.id) + '">' + ARROW_LEFT_SVG + t('lesson.previous') + '</a>' : '<span></span>') +
          (next ? '<a class="btn btn-outline btn-sm" href="#/lesson?id=' + encodeURIComponent(next.id) + '">' + t('lesson.next') + ARROW_SVG + '</a>' : '') +
        '</div>'
      : '';

    function build() {
      var objectives = (lesson.objectives || []).map(function (o) { return '<li>' + escapeHtml(o) + '</li>'; }).join('');
      var vocab = (lesson.vocabulary || []).map(function (v) {
        return '<li><span><strong>' + escapeHtml(v.term) + '</strong> — ' + escapeHtml(v.meaning) + '</span></li>';
      }).join('');
      var grammar = (lesson.grammar || []).map(function (g) { return '<li>' + escapeHtml(g) + '</li>'; }).join('');
      var exercises = (lesson.exercises || []).map(function (e) { return '<li>' + escapeHtml(e) + '</li>'; }).join('');

      app.innerHTML = '' +
        '<section class="auth-wrap teacher-wrap">' +
          '<div class="card" style="margin-bottom:1.4rem">' +
            '<span class="badge badge-emerald">' + escapeHtml(lesson.level || '') + '</span>' +
            (lesson.isTrial ? ' <span class="badge badge-gold">' + t('lesson.trial') + '</span>' : '') +
            '<h1 class="auth-title" style="margin:0.6rem 0 0">' + escapeHtml(lesson.title) + '</h1>' +
          '</div>' +
          (lesson.videoUrl ? '<div class="lesson-video"><video src="' + escapeHtml(lesson.videoUrl) + '" controls playsinline></video></div>' : '') +
          (objectives ? '<div class="card" style="margin-bottom:1rem"><h3 class="teacher-card-title" style="margin-bottom:0.6rem">' + t('lesson.objectives') + '</h3><ul class="tx-list" style="margin:0">' + objectives + '</ul></div>' : '') +
          '<div class="card" style="margin-bottom:1rem"><h3 class="teacher-card-title" style="margin-bottom:0.6rem">' + t('lesson.content') + '</h3>' +
          '<div class="lesson-content" style="margin:0">' + escapeHtml(lesson.content || '') + '</div></div>' +
          (vocab ? '<div class="card" style="margin-bottom:1rem"><h3 class="teacher-card-title" style="margin-bottom:0.6rem">' + t('lesson.vocabulary') + '</h3><ul class="tx-list" style="margin:0">' + vocab + '</ul></div>' : '') +
          (grammar ? '<div class="card" style="margin-bottom:1rem"><h3 class="teacher-card-title" style="margin-bottom:0.6rem">' + t('lesson.grammar') + '</h3><ul class="tx-list" style="margin:0">' + grammar + '</ul></div>' : '') +
          (exercises ? '<div class="card" style="margin-bottom:1rem"><h3 class="teacher-card-title" style="margin-bottom:0.6rem">' + t('lesson.exercises') + '</h3><ul class="tx-list" style="margin:0">' + exercises + '</ul></div>' : '') +
          (lesson.quizId ? '<div class="hero-actions" style="margin-top:1.5rem"><a class="btn btn-gold" href="#/quiz?id=' + encodeURIComponent(lesson.quizId) + '">' + t('lesson.takeQuiz') + '</a></div>' : '') +
          (uid ? '<div class="hero-actions" style="margin-top:1.2rem">' +
            '<button type="button" class="btn btn-solid" id="mark-complete" ' + (isDone ? 'disabled' : '') + '>' +
              (isDone ? t('lesson.completed') : t('lesson.markComplete')) + '</button></div>' : '') +
          navHtml +
          '<p class="auth-alt"><a href="#/courses">' + t('common.back') + '</a></p>' +
        '</section>';
      afterRender('courses');

      var btn = document.getElementById('mark-complete');
      if (btn && uid && !isDone) {
        btn.addEventListener('click', function () {
          var ref = db.collection('progress').doc(uid);
          ref.get().then(function (p) {
            var arr = p.exists ? (p.data().completedLessons || []) : [];
            if (arr.indexOf(id) === -1) arr.push(id);
            return ref.set({ completedLessons: arr, updatedAt: new Date() }, { merge: true });
          }).then(function () {
            btn.textContent = t('lesson.completed');
            btn.disabled = true;
          }).catch(function () {});
        });
      }
    }

    if (!uid) { build(); return; }
    db.collection('progress').doc(uid).get().then(function (p) {
      if (p.exists && (p.data().completedLessons || []).indexOf(id) !== -1) isDone = true;
      build();
    }).catch(function () { build(); });
  }

  /* ----- Quiz engine ----- */
  var quizState = { quiz: null, current: 0, answers: [] };

  function renderQuiz() {
    var id = getHashParam('id');
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.firestore) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('nav.quiz') + '</h1><div class="setup-banner">' + t('register.setup') + '</div></section>';
      afterRender('quiz');
      return;
    }
    if (!id) { renderQuizCatalog(); return; }
    var user = firebase.auth().currentUser;

    app.innerHTML = skeletonLoading();
    afterRender('quiz');

    var db = firebase.firestore();
    // Lecture directe : les règles décident (trial → public, sinon admin/teacher/abonné).
    db.collection('quizzes').doc(id).get().then(function (snap) {
      if (!snap.exists || !snap.data().questions || !snap.data().questions.length) {
        app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.quizzes') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
        afterRender('quiz');
        return;
      }
      var qz = snap.data();
      contentAccess(qz).then(function (allowed) {
        if (!allowed) {
          app.innerHTML = '' +
            '<section class="auth-wrap"><h1 class="auth-title">' + t('lesson.lockedTitle') + '</h1>' +
            '<p class="auth-sub">' + t('lesson.lockedSub') + '</p>' +
            '<div class="hero-actions"><a class="btn btn-gold" href="#/pricing">' + t('lesson.lockedCta') + '</a></div>' +
            '<p class="auth-alt"><a href="#/quiz">' + t('common.back') + '</a></p></section>';
          afterRender('quiz');
          return;
        }
        quizState.quiz = { id: id, data: qz };
        quizState.current = 0;
        quizState.answers = new Array(quizState.quiz.data.questions.length).fill(null);
        renderQuizQuestion();
      });
    }).catch(function () {
      if (!user) {
        studentSignInRequired(t('courses.quizzes'));
      } else {
        app.innerHTML = '' +
          '<section class="auth-wrap"><h1 class="auth-title">' + t('lesson.subscribeRequired') + '</h1>' +
          '<p class="auth-sub">' + t('lesson.subscribeRequiredSub') + '</p>' +
          '<div class="hero-actions"><a class="btn btn-gold" href="#/checkout">' + t('pricing.subscribe') + '</a></div>' +
          '<p class="auth-alt"><a href="#/quiz">' + t('common.back') + '</a></p></section>';
        afterRender('quiz');
      }
    });
  }

  function renderQuizCatalog() {
    app.innerHTML = skeletonLoading();
    afterRender('quiz');
    callable('getQuizCatalog')().then(function (r) {
      var quizzes = (r.data && r.data.quizzes) || [];
      if (!quizzes.length) {
        app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('nav.quiz') + '</h1><div class="card"><div class="empty-state" style="padding:1.4rem 0"><p style="margin:0">' + t('courses.empty') + '</p></div></div></section>';
        afterRender('quiz');
        return;
      }
      var byAcademy = {};
      quizzes.forEach(function (q) { var a = q.academy || 'german'; (byAcademy[a] = byAcademy[a] || []).push(q); });
      var html = Object.keys(byAcademy).map(function (a) {
        var cards = byAcademy[a].map(function (q) {
          return '<a class="card card-hover" href="#/quiz?id=' + encodeURIComponent(q.id) + '" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;text-decoration:none;color:inherit;margin-bottom:0.9rem">' +
            '<span style="font-weight:700;color:var(--forest)">' + escapeHtml(q.title) + '</span>' +
            '<span class="badge badge-muted">' + escapeHtml(q.level) + '</span></a>';
        }).join('');
        return '<h3 class="auth-title" style="font-size:1.2rem;margin-top:1.5rem">' + t('academies.' + a + '.name') + '</h3>' + cards;
      }).join('');
      app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('nav.quiz') + '</h1>' + html + '</section>';
      afterRender('quiz');
    }).catch(function () {
      app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('nav.quiz') + '</h1><div class="card"><div class="empty-state" style="padding:1.4rem 0"><p style="margin:0">' + t('courses.empty') + '</p></div></div></section>';
      afterRender('quiz');
    });
  }

  function renderQuizQuestion() {
    var qz = quizState.quiz;
    var total = qz.data.questions.length;
    var q = qz.data.questions[quizState.current];
    var letters = ['A', 'B', 'C', 'D'];
    var opts = q.options.map(function (opt, i) {
      var sel = quizState.answers[quizState.current] === i;
      return '<button type="button" class="quiz-opt' + (sel ? ' selected' : '') + '" data-opt="' + i + '">' +
        '<span class="letter">' + letters[i] + '</span><span>' + escapeHtml(opt) + '</span></button>';
    }).join('');

    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<h1 class="auth-title">' + escapeHtml(qz.data.title) + '</h1>' +
        '<div class="quiz-progress">' +
          '<span class="count">' + t('quiz.question') + ' ' + (quizState.current + 1) + ' / ' + total + '</span>' +
          '<div class="progress-track" style="flex:1"><div class="progress-fill" style="width:' + Math.round(((quizState.current) / total) * 100) + '%"></div></div>' +
        '</div>' +
        '<div class="card quiz-q" style="margin-bottom:1rem;padding:1.2rem 1.4rem"><div class="q-label">' + escapeHtml(q.text) + '</div></div>' +
        '<div class="choice-grid">' + opts + '</div>' +
        '<div class="hero-actions" style="margin-top:1.2rem">' +
          (quizState.current > 0 ? '<button type="button" class="btn btn-outline" id="quiz-prev">' + t('quiz.previous') + '</button>' : '') +
          (quizState.current === total - 1
            ? '<button type="button" class="btn btn-solid" id="quiz-submit">' + t('quiz.submit') + '</button>'
            : '<button type="button" class="btn btn-solid" id="quiz-next">' + t('quiz.next') + '</button>') +
          '<a class="btn btn-outline" href="#/courses">' + t('common.back') + '</a>' +
        '</div>' +
      '</section>';
    afterRender('quiz');

    document.querySelectorAll('[data-opt]').forEach(function (b) {
      b.addEventListener('click', function () {
        quizState.answers[quizState.current] = parseInt(b.getAttribute('data-opt'), 10);
        renderQuizQuestion();
      });
    });
    var prev = document.getElementById('quiz-prev');
    if (prev) prev.addEventListener('click', function () { quizState.current--; renderQuizQuestion(); });
    var next = document.getElementById('quiz-next');
    if (next) next.addEventListener('click', function () { quizState.current++; renderQuizQuestion(); });
    var sub = document.getElementById('quiz-submit');
    if (sub) sub.addEventListener('click', submitQuiz);
  }

  function submitQuiz() {
    var qz = quizState.quiz;
    var total = qz.data.questions.length;
    var correct = 0;
    qz.data.questions.forEach(function (q, i) { if (quizState.answers[i] === q.correctIndex) correct++; });

    var uid = firebase.auth().currentUser.uid;
    var db = firebase.firestore();
    var docId = uid + '_' + qz.id;
    db.collection('quizScores').doc(docId).get().then(function (existing) {
      var best = correct;
      if (existing.exists && existing.data().bestScore > best) best = existing.data().bestScore;
      return db.collection('quizScores').doc(docId).set({
        uid: uid, quizId: qz.id, title: qz.data.title, score: correct, total: total, bestScore: best, updatedAt: new Date()
      }, { merge: true }).then(function () { return best; });
    }).then(function (best) {
      renderQuizResult(correct, total, best);
    }).catch(function () {
      renderQuizResult(correct, total, correct);
    });
  }

  function renderQuizResult(correct, total, best) {
    var pct = Math.round((correct / total) * 100);
    var passed = pct >= 80;
    var letters = ['A', 'B', 'C', 'D'];

    // --- Revue des réponses (correction) ---
    var reviewHtml = '<h3 class="auth-title" style="font-size:1.3rem;margin-top:2rem">' + t('quiz.review') + '</h3>' +
      quizState.quiz.data.questions.map(function (q, i) {
        var given = quizState.answers[i];
        var opts = q.options.map(function (opt, oi) {
          var cls = '';
          var mark = '';
          if (oi === q.correctIndex) { cls = ' correct'; mark = '<span style="margin-inline-start:auto;color:var(--emerald);font-weight:700">' + t('quiz.correct') + '</span>'; }
          else if (given === oi) { cls = ' incorrect'; }
          return '<button type="button" class="quiz-opt' + cls + '" disabled>' +
            '<span class="letter">' + letters[oi] + '</span><span>' + escapeHtml(opt) + '</span>' + mark + '</button>';
        }).join('');
        var ok = given === q.correctIndex;
        return '<div class="card" style="margin-bottom:1rem">' +
          '<div style="display:flex;gap:0.8rem;align-items:center;margin-bottom:0.7rem">' +
            '<span class="badge ' + (ok ? 'badge-emerald' : 'badge-red') + '" style="gap:0.35rem">' + (ok ? ICON_CHECK : ICON_CROSS) + '</span>' +
            '<strong style="color:var(--forest)">' + escapeHtml(q.text) + '</strong>' +
          '</div>' +
          '<div style="display:grid;gap:0.6rem">' + opts + '</div>' +
        '</div>';
      }).join('');

    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<h1 class="auth-title" style="text-align:center">' + escapeHtml(quizState.quiz.data.title) + '</h1>' +
        '<div class="quiz-result-score"><div class="score">' + correct + '<span> / ' + total + '</span></div></div>' +
        '<p class="auth-sub" style="font-size:1.1rem;margin-top:0.8rem;text-align:center">' + pct + '% — ' + t('quiz.best') + ' ' + best + '/' + total + '</p>' +
        '<div class="card" style="margin-top:1rem;text-align:center"><p style="font-size:1.05rem;color:var(--forest)">' +
          (passed ? t('quiz.passed') : t('quiz.tryAgainMsg')) + '</p></div>' +
        '<div class="hero-actions" style="margin-top:1.2rem;justify-content:center">' +
          '<button type="button" class="btn btn-solid" id="quiz-retry">' + t('quiz.retry') + '</button>' +
          '<a class="btn btn-outline" href="#/courses">' + t('common.back') + '</a>' +
        '</div>' +
        reviewHtml +
      '</section>';
    afterRender('quiz');
    document.getElementById('quiz-retry').addEventListener('click', function () {
      quizState.current = 0;
      quizState.answers = new Array(quizState.quiz.data.questions.length).fill(null);
      renderQuizQuestion();
    });
  }

  /* ----- Live classes ----- */
  function renderLive() {
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.functions) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('live.title') + '</h1><div class="setup-banner">' + t('register.setup') + '</div></section>';
      afterRender('live');
      return;
    }

    app.innerHTML = skeletonLoading();
    afterRender('live');

    callable('getLiveCatalog')().then(function (r) {
      renderLiveContent((r.data && r.data.classes) || []);
    }).catch(function () { renderLiveContent([]); });
  }

  function renderLiveContent(classes) {
    var now = Date.now();
    var signedIn = !!firebase.auth().currentUser;
    var sorted = classes.slice().sort(function (a, b) { return (a.scheduledAt || 0) - (b.scheduledAt || 0); });
    var html = sorted.map(function (c) {
      var t0 = new Date(c.scheduledAt);
      var when = t0.toLocaleString(ELA_I18N.getLang());
      var gateStart = t0.getTime() - 15 * 60000;
      var joinable = now >= gateStart;
      var joinHtml;
      if (!signedIn) {
        joinHtml = '<a class="btn btn-outline" href="#/login">' + t('live.joinSignIn') + '</a>';
      } else if (joinable) {
        joinHtml = '<button type="button" class="btn btn-gold" data-join="' + encodeURIComponent(c.id) + '">' + t('live.join') + '</button>';
      } else {
        joinHtml = '<span class="academy-status status-soon">' + t('live.joinSoon') + '</span>';
      }
      return '<div class="card" style="margin-bottom:0.9rem">' +
        '<div style="display:flex;flex-wrap:wrap;gap:0.5rem 1rem;align-items:baseline;margin-bottom:0.5rem">' +
          '<span class="badge badge-forest">' + escapeHtml(t('academies.' + (c.academy || 'german') + '.name')) + '</span>' +
          '<h3 class="teacher-card-title" style="margin:0">' + escapeHtml(c.title) + '</h3>' +
        '</div>' +
        '<p style="color:var(--muted);margin-bottom:0.9rem;font-size:0.9rem">' + when + '</p>' +
        joinHtml +
        '</div>';
    }).join('');

    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<h1 class="auth-title">' + t('live.title') + '</h1>' +
        (sorted.length ? html : '<div class="card"><div class="empty-state" style="padding:1.4rem 0"><p style="margin:0">' + t('live.empty') + '</p></div></div>') +
        '<p class="auth-alt"><a href="#/">' + t('common.back') + '</a></p>' +
      '</section>';
    afterRender('live');

    document.querySelectorAll('[data-join]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var liveId = decodeURIComponent(btn.getAttribute('data-join'));
        var call = callable('getLiveMeetingLink');
        call({ liveClassId: liveId }).then(function (r) {
          if (r.data && r.data.meetingLink) window.open(r.data.meetingLink, '_blank');
        }).catch(function () {
          alert(t('live.joinError'));
        });
      });
    });
  }


  /* ---------- Register: 3-step wizard ---------- */
  var registerState = { step: 1, interfaceLang: null, academy: null };

  function renderRegister() {
    var s = registerState;
    var stepsBar = '<div class="auth-steps">' +
      '<span class="' + (s.step >= 1 ? 'done' : '') + '"></span>' +
      '<span class="' + (s.step >= 2 ? 'done' : '') + '"></span>' +
      '<span class="' + (s.step >= 3 ? 'done' : '') + '"></span></div>';

    var body = '';
    if (s.step === 1) {
      body = '' +
        '<h3 class="auth-title" style="font-size:1.8rem">' + t('register.step1') + '</h3>' +
        '<div class="choice-grid">' +
          '<button type="button" class="choice" data-choice-lang="en"><span class="choice-name">English</span><span class="choice-tag">EN</span></button>' +
          '<button type="button" class="choice" data-choice-lang="fr"><span class="choice-name">Français</span><span class="choice-tag">FR</span></button>' +
          '<button type="button" class="choice" data-choice-lang="ar"><span class="choice-name">العربية</span><span class="choice-tag">AR</span></button>' +
        '</div>';
    } else if (s.step === 2) {
      body = '<h3 class="auth-title" style="font-size:1.8rem">' + t('register.step2') + '</h3>' +
        '<div class="choice-grid">' +
        ACADEMIES.map(function (a) {
          return '<button type="button" class="choice' + (a.open ? '' : ' disabled') + '" data-choice-academy="' + a.key + '"' + (a.open ? '' : ' disabled') + '>' +
            '<span class="choice-name">' + t('academies.' + a.key + '.name') + ' <span style="color:var(--muted);font-size:0.7em">' + a.native + '</span></span>' +
            '<span class="choice-tag' + (a.open ? ' open' : '') + '">' + (a.open ? t('academies.open') : t('academies.soon')) + '</span></button>';
        }).join('') + '</div>' +
        '<button type="button" class="btn btn-outline" id="reg-back">' + t('common.back') + '</button>';
    } else {
      var setupBanner = window.ELA_FIREBASE_READY ? '' : '<div class="setup-banner">' + t('register.setup') + '</div>';
      body = '' +
        '<h3 class="auth-title" style="font-size:1.8rem">' + t('register.step3') + '</h3>' +
        setupBanner +
        '<form id="register-form">' +
          '<div class="field"><label for="reg-name">' + t('register.field.name') + '</label><input id="reg-name" type="text" required autocomplete="name"></div>' +
          '<div class="field"><label for="reg-email">' + t('register.field.email') + '</label><input id="reg-email" type="email" required autocomplete="email"></div>' +
          '<div class="field"><label for="reg-password">' + t('register.field.password') + '</label><input id="reg-password" type="password" minlength="8" required autocomplete="new-password"></div>' +
          '<div class="field"><label for="reg-referral">' + t('register.field.referral') + '</label><input id="reg-referral" type="text" autocomplete="off"></div>' +
          '<p class="form-error" id="reg-error">' + t('register.error') + '</p>' +
          '<button class="btn btn-solid" type="submit">' + t('register.submit') + ARROW_SVG + '</button>' +
        '</form>' +
        '<p class="auth-alt">' + t('register.have') + ' <a href="#/login">' + t('register.loginLink') + '</a></p>';
    }

    app.innerHTML = '' +
      '<section class="auth-wrap">' +
        '<h1 class="auth-title">' + t('register.title') + '</h1>' +
        '<p class="auth-sub">' + t('register.sub') + '</p>' +
        stepsBar + body +
      '</section>';

    bindRegister();
    afterRender('register');
  }

  function bindRegister() {
    document.querySelectorAll('[data-choice-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        registerState.interfaceLang = btn.getAttribute('data-choice-lang');
        ELA_I18N.setLang(registerState.interfaceLang).then(function () {
          registerState.step = 2;
          renderRegister();
        });
      });
    });
    document.querySelectorAll('[data-choice-academy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        registerState.academy = btn.getAttribute('data-choice-academy');
        registerState.step = 3;
        renderRegister();
      });
    });
    var back = document.getElementById('reg-back');
    if (back) back.addEventListener('click', function () { registerState.step = 1; renderRegister(); });

    var form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!window.ELA_FIREBASE_READY) return;
        var name = document.getElementById('reg-name').value.trim();
        var email = document.getElementById('reg-email').value.trim();
        var password = document.getElementById('reg-password').value;
        var referral = document.getElementById('reg-referral').value.trim();
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(function (cred) {
            return firebase.firestore().collection('users').doc(cred.user.uid).set({
              displayName: name,
              email: email,
              role: 'student',
              interfaceLang: registerState.interfaceLang || ELA_I18N.getLang(),
              academies: [registerState.academy || 'german'],
              academy: registerState.academy || 'german',
              referralCode: 'ELA-' + cred.user.uid.slice(0, 6).toUpperCase(),
              referralCodeUsed: referral || null,
              referralCredit: 0,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          })
          .then(function () {
            if (window.ELAMarketing) window.ELAMarketing.track('registration', { academy: registerState.academy || 'german' });
            alert(t('register.success')); window.location.hash = '#/dashboard';
          })
          .catch(function () { document.getElementById('reg-error').classList.add('show'); });
      });
    }
  }

  /* ---------- Login ---------- */
  function renderLogin() {
    var setupBanner = window.ELA_FIREBASE_READY ? '' : '<div class="setup-banner">' + t('register.setup') + '</div>';
    app.innerHTML = '' +
      '<section class="auth-wrap">' +
        '<h1 class="auth-title">' + t('login.title') + '</h1>' +
        '<p class="auth-sub">' + t('login.sub') + '</p>' +
        setupBanner +
        '<form id="login-form">' +
          '<div class="field"><label for="login-email">' + t('register.field.email') + '</label><input id="login-email" type="email" required autocomplete="email"></div>' +
          '<div class="field"><label for="login-password">' + t('register.field.password') + '</label><input id="login-password" type="password" required autocomplete="current-password"></div>' +
          '<p class="form-error" id="login-error">' + t('login.error') + '</p>' +
          '<button class="btn btn-solid" type="submit">' + t('login.submit') + ARROW_SVG + '</button>' +
        '</form>' +
        '<p class="auth-alt">' + t('login.no') + ' <a href="#/register">' + t('login.registerLink') + '</a></p>' +
      '</section>';

    var form = document.getElementById('login-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!window.ELA_FIREBASE_READY) return;
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function () { window.location.hash = '#/dashboard'; })
        .catch(function () { document.getElementById('login-error').classList.add('show'); });
    });
    afterRender('login');
  }

  /* ---------- Shared after-render ---------- */
  function afterRender(route) {
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === route);
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); observer.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
    window.scrollTo(0, 0);
  }

  /* ---------- Router ---------- */
  var ROUTES = {
    '': renderHome,
    '/': renderHome,
    '/academies': renderAcademies,
    '/pricing': renderPricing,
    '/checkout': renderCheckout,
    '/payment/result': renderPaymentResult,
    '/payment-success': renderPaymentSuccess,
    '/assistant': renderAssistant,
    '/dashboard': renderDashboard,
    '/terms': renderTerms,
    '/privacy': renderPrivacy,
    '/refund': renderRefund,
    /* '/teacher' et '/admin' : gérés par js/routes-v2.js (ELA_ROUTE_HANDLERS) */
    '/courses': renderCourses,
    '/course': renderCourse,
    '/lesson': renderLesson,
    '/quiz': renderQuiz,
    '/live': renderLive,
    '/register': renderRegister,
    '/login': renderLogin
  };

  var PAGE_TITLES = {
    '': 'nav.home', '/': 'nav.home',
    '/academies': 'nav.academies', '/pricing': 'nav.pricing',
    '/courses': 'nav.courses', '/course': 'nav.courses', '/lesson': 'nav.courses',
    '/quiz': 'nav.quiz', '/live': 'nav.live',
    '/dashboard': 'dashboard.title', '/assistant': 'assistant.title',
    '/teacher': 'nav.teacher', '/admin': 'nav.admin',
    '/checkout': 'checkout.title', '/register': 'nav.cta', '/login': 'nav.login',
    '/terms': 'footer.terms', '/privacy': 'footer.privacy', '/refund': 'footer.refundPolicy',
    '/payment-success': 'payment.result.title.success'
  };

  function updateMeta(path) {
    var title = t(PAGE_TITLES[path] || 'nav.home');
    document.title = title + ' — E-Learn Language Academy';
    var meta = document.querySelector('meta[name="description"]');
    if (meta && t('meta.description') !== 'meta.description') {
      meta.setAttribute('content', t('meta.description'));
    }
  }

  function route() {
    var hash = window.location.hash.replace(/^#/, '') || '/';
    var qi = hash.indexOf('?');
    var path = qi >= 0 ? hash.slice(0, qi) : hash;
    updateMeta(path);
    /* Routes v2 (refactor admin/teacher) : handlers enregistrés par js/routes-v2.js */
    if (window.ELA_ROUTE_HANDLERS && typeof window.ELA_ROUTE_HANDLERS[path] === 'function') {
      window.ELA_ROUTE_HANDLERS[path]();
      return;
    }
    (ROUTES[path] || renderHome)();
  }

  /* ---------- Boot ---------- */
  /* ============================================================
     NAV PAR RÔLE — MÉCANISME DURABLE (NE PAS SUPPRIMER)
     ------------------------------------------------------------
     Les liens « Teacher area » et « Admin » NE DOIVENT JAMAIS
     exister dans le HTML statique (index.html). Ils sont créés
     UNIQUEMENT ici, en JS, APRÈS confirmation du rôle via
     Firestore (users/{uid}.role). Pour un visiteur (currentUser
     === null) ou un élève simple, aucun lien n'est injecté.
     ➜ TOUTE RÉFONTE du header/nav doit CONSERVER cette fonction
       et ne jamais ajouter de lien teacher/admin dans index.html.
       Si le header est réécrit, garder .nav-links et l'appel
       de updateTeacherNav() (onAuthStateChanged + init).
     ============================================================ */
  function updateTeacherNav() {
    var container = document.querySelector('.nav-links');
    if (!container) return;
    var removeRoleLinks = function () {
      var tEl = document.querySelector('.teacher-nav');
      var aEl = document.querySelector('.admin-nav');
      if (tEl) tEl.remove();
      if (aEl) aEl.remove();
    };
    removeRoleLinks();
    if (!window.firebase || !firebase.auth || !firebase.firestore) return;
    var user = firebase.auth().currentUser;
    if (!user) return;
    firebase.firestore().collection('users').doc(user.uid).get()
      .then(function (snap) {
        var role = snap.exists ? snap.data().role : null;
        var loginLink = container.querySelector('a[data-nav="login"]');
        var insertBefore = function (el) {
          if (loginLink) container.insertBefore(el, loginLink);
          else container.appendChild(el);
        };
        if (role === 'teacher' || role === 'admin') {
          var tLink = document.createElement('a');
          tLink.href = '#/teacher';
          tLink.className = 'teacher-nav';
          tLink.setAttribute('data-nav', 'teacher');
          tLink.setAttribute('data-i18n', 'nav.teacher');
          tLink.textContent = t('nav.teacher');
          insertBefore(tLink);
        }
        if (role === 'admin') {
          var aLink = document.createElement('a');
          aLink.href = '#/admin';
          aLink.className = 'admin-nav';
          aLink.setAttribute('data-nav', 'admin');
          aLink.setAttribute('data-i18n', 'nav.admin');
          aLink.textContent = t('nav.admin');
          insertBefore(aLink);
        }
      })
      .catch(function () { removeRoleLinks(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('nav-logo').innerHTML = LOGO_SVG;
    document.getElementById('footer-logo').innerHTML = LOGO_SVG;

    if (window.ELA_FIREBASE_READY && window.firebase) {
      firebase.initializeApp(window.ELA_FIREBASE_CONFIG);
      firebase.auth().onAuthStateChanged(function () { updateTeacherNav(); });
    }

    var nav = document.querySelector('.nav');
    if (nav) {
      window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 8);
      }, { passive: true });
      var toggle = document.querySelector('.nav-toggle');
      if (toggle) {
        toggle.addEventListener('click', function () {
          var open = nav.classList.toggle('open');
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
    }

    ELA_I18N.init().then(function () {
      route();
      updateTeacherNav();
      window.addEventListener('hashchange', route);
    });
    ELA_I18N.onChange(function () { route(); });
  });
})();
