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
      ? '<span class="academy-status status-open">' + t('academies.open') + '</span>'
      : '<span class="academy-status status-soon">' + t('academies.soon') + '</span>';
    return '' +
      '<a class="academy-row reveal" href="#/register" style="transition-delay:' + (i * 60) + 'ms">' +
        '<span class="academy-num">0' + (i + 1) + '</span>' +
        '<span class="academy-name">' + t('academies.' + a.key + '.name') +
          '<span class="native">' + a.native + '</span></span>' +
        '<span class="academy-desc">' + t('academies.' + a.key + '.desc') + '</span>' +
        status +
        '<span class="academy-bar" style="background:' + a.accent + '"></span>' +
      '</a>';
  }

  /* ---------- Pages ---------- */

  function renderHome() {
    var rows = ACADEMIES.map(academyRow).join('');
    app.innerHTML = '' +
      '<section class="hero">' +
        '<div class="reveal">' +
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
            '<a class="btn btn-solid" href="#/register">' + t('hero.cta.primary') + ARROW_SVG + '</a>' +
            '<a class="btn btn-outline" href="#/pricing">' + t('hero.cta.secondary') + '</a>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section academies" id="academies">' +
        '<p class="section-label reveal">' + t('academies.label') + '</p>' +
        '<h2 class="section-title reveal" style="margin-bottom:2.5rem">' +
          t('academies.title.1') + '<br><em>' + t('academies.title.2') + '</em></h2>' +
        rows +
      '</section>' +

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

      '<section class="section">' +
        '<p class="section-label reveal">' + t('steps.label') + '</p>' +
        '<h2 class="section-title reveal">' + t('steps.title') + '</h2>' +
        '<div class="steps">' +
          '<div class="step reveal"><span class="step-num">01</span><h3>' + t('steps.1.title') + '</h3><p>' + t('steps.1.desc') + '</p></div>' +
          '<div class="step reveal" style="transition-delay:100ms"><span class="step-num">02</span><h3>' + t('steps.2.title') + '</h3><p>' + t('steps.2.desc') + '</p></div>' +
          '<div class="step reveal" style="transition-delay:200ms"><span class="step-num">03</span><h3>' + t('steps.3.title') + '</h3><p>' + t('steps.3.desc') + '</p></div>' +
        '</div>' +
      '</section>' +

      '<section class="referral"><div class="section">' +
        '<div class="reveal">' +
          '<h2 class="section-title">' + t('referral.title.1') + '<br><em>' + t('referral.title.2') + '</em></h2>' +
          '<p>' + t('referral.p') + '</p>' +
        '</div>' +
        '<div class="referral-figure reveal" style="transition-delay:120ms">' +
          t('referral.figure') + '<small>' + t('referral.figure.sub') + '</small>' +
        '</div>' +
      '</div></section>';
    afterRender('home');
  }

  function renderAcademies() {
    var rows = ACADEMIES.map(academyRow).join('');
    app.innerHTML = '' +
      '<section class="section academies">' +
        '<p class="section-label reveal">' + t('academies.label') + '</p>' +
        '<h2 class="section-title reveal" style="margin-bottom:2.5rem">' +
          t('academies.title.1') + '<br><em>' + t('academies.title.2') + '</em></h2>' +
        rows +
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
      '</section>';
    afterRender('pricing');
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

    var subHtml;
    if (sub && sub.status === 'active' && sub.endDate && sub.endDate > now) {
      var days = Math.max(0, Math.ceil((sub.endDate - now) / 86400000));
      subHtml = '<div class="pricing-note"><p>' +
        '<span class="academy-status status-open">' + t('dashboard.status.active') + '</span> ' +
        t('pricing.' + (sub.plan || 'general')) + ' · ' + t('checkout.month.' + (sub.duration || 1)) +
        '<br><span style="color:var(--muted)">' + days + ' ' + t('dashboard.daysRemaining') + '</span></p>' +
        '<a class="btn btn-outline" href="#/checkout">' + t('dashboard.renew') + '</a></div>';
    } else if (sub && sub.status === 'expired') {
      subHtml = '<div class="pricing-note"><p>' +
        '<span class="academy-status status-soon">' + t('dashboard.status.expired') + '</span> ' +
        t('pricing.' + (sub.plan || 'general')) + '</p>' +
        '<a class="btn btn-gold" href="#/checkout">' + t('dashboard.renew') + '</a></div>';
    } else {
      subHtml = '<div class="pricing-note"><p>' + t('dashboard.status.none') + '</p>' +
        '<a class="btn btn-gold" href="#/checkout">' + t('pricing.subscribe') + '</a></div>';
    }

    var refHtml = '<div class="pricing-note"><p>' +
      '<span style="color:var(--muted)">' + t('dashboard.referralCode') + ':</span> <strong>' + (d.user.referralCode || '—') + '</strong>' +
      '<br><span style="color:var(--muted)">' + t('dashboard.referralCredit') + ':</span> <strong>' + fmtNaira(d.user.referralCredit) + '</strong></p>' +
      '<a class="btn btn-outline" href="#/assistant">' + t('dashboard.assistant') + '</a></div>';

    var prog = d.progress || { completed: 0, total: 0 };
    var scores = d.bestQuizScores || [];
    var nxt = d.nextLiveClass;

    var learningHtml = '<h3 class="auth-title" style="font-size:1.2rem;margin-top:1.5rem">' + t('dashboard.learning') + '</h3>' +
      '<div class="hero-actions" style="margin:0.8rem 0 1rem">' +
        '<a class="btn btn-solid" href="#/courses">' + t('dashboard.courses') + '</a>' +
        '<a class="btn btn-outline" href="#/live">' + t('dashboard.live') + '</a>' +
      '</div>' +
      '<div class="pricing-note"><p>' +
        '<span style="color:var(--muted)">' + t('dashboard.progress') + ':</span> <strong>' + prog.completed + ' / ' + prog.total + '</strong>' +
      '</p></div>' +
      (nxt
        ? '<div class="pricing-note"><p>' + t('dashboard.nextLive') + ': <strong>' + escapeHtml(nxt.title) + '</strong><br>' +
          '<span style="color:var(--muted)">' + new Date(nxt.scheduledAt).toLocaleString(ELA_I18N.getLang()) + '</span></p>' +
          '<a class="btn btn-outline" href="#/live">' + t('dashboard.live') + '</a></div>'
        : '') +
      (scores.length
        ? '<div class="pricing-note"><p>' + t('dashboard.bestScores') + '</p><ul class="tx-list">' +
          scores.map(function (s) {
            return '<li><span>' + escapeHtml(s.title) + '</span><span><strong>' + s.bestScore + '/' + s.total + '</strong></span></li>';
          }).join('') + '</ul></div>'
        : '');

    var txRows = (d.transactions || []).map(function (tx) {
      var date = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString(ELA_I18N.getLang()) : '';
      var pill = tx.status === 'success'
        ? '<span class="academy-status status-open">' + t('dashboard.tx.success') + '</span>'
        : '<span class="academy-status status-soon">' + t('dashboard.tx.' + (tx.status || 'pending')) + '</span>';
      return '<li><span>' + t('pricing.' + (tx.plan || 'general')) + ' · ' + t('checkout.month.' + (tx.duration || 1)) + '</span>' +
        '<span style="color:var(--muted)">' + date + '</span>' +
        '<span>' + fmtNaira(tx.amount) + '</span>' + pill + '</li>';
    }).join('');

    var txHtml = '<h3 class="auth-title" style="font-size:1.3rem;margin-top:2rem">' + t('dashboard.transactions') + '</h3>' +
      '<ul class="tx-list">' + (txRows || '<li>' + t('dashboard.noTransactions') + '</li>') + '</ul>';

    return '' +
      '<section class="auth-wrap assistant-wrap">' +
        '<h1 class="auth-title">' + t('dashboard.title') + '</h1>' +
        '<h3 class="auth-title" style="font-size:1.2rem;margin-top:1.5rem">' + t('dashboard.subscription') + '</h3>' + subHtml +
        refHtml + learningHtml + txHtml +
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
        '<h1 class="auth-title">' + t('dashboard.title') + '</h1>' +
        '<p class="auth-sub">' + t('dashboard.loading') + '</p>' +
      '</section>';
    afterRender('');

    var get = callable('getDashboardData');
    get()
      .then(function (r) { app.innerHTML = buildDashboard(r.data); afterRender(''); })
      .catch(function () {
        app.innerHTML = '' +
          '<section class="auth-wrap"><h1 class="auth-title">' + t('dashboard.title') + '</h1>' +
          '<p class="auth-sub">' + t('dashboard.error') + '</p></section>';
        afterRender('');
      });
  }

  /* ---------- Legal pages ---------- */
  function legalPage(title, body) {
    return '' +
      '<section class="section legal">' +
        '<p class="section-label">Legal</p>' +
        '<h2 class="section-title">' + title + '</h2>' +
        '<p class="legal-meta">Last updated: 19 August 2026</p>' +
        '<div class="legal-body">' + body + '</div>' +
      '</section>';
  }

  function renderTerms() {
    var body =
      '<h3>1. About us</h3>' +
      '<p>E-Learn Language Academy ("ELA", "we", "our") is an online language school operated by YAYAKHALIF COMPANY LIMITED, registered in Nigeria. We offer live online courses in German, Mandarin Chinese, English, Arabic and Russian, delivered by qualified teachers.</p>' +
      '<h3>2. Services</h3>' +
      '<p>ELA provides subscription-based access to online language classes, learning materials and the Learning Assistant (an automated study support tool). Class schedules, formats and teacher assignments are communicated after enrollment and may be adjusted with reasonable notice.</p>' +
      '<h3>3. Eligibility and accounts</h3>' +
      '<p>You must provide accurate information when creating an account. You are responsible for keeping your login credentials confidential and for all activity under your account. One account per person; accounts are personal and non-transferable.</p>' +
      '<h3>4. Subscriptions and pricing</h3>' +
      '<p>Access is granted through monthly, 3-month or 6-month subscriptions, in the following plans (per academy):</p>' +
      '<table class="price-table">' +
        '<thead><tr><th>Plan</th><th>1 month</th><th>3 months</th><th>6 months</th></tr></thead>' +
        '<tbody>' +
          '<tr><td>General</td><td>₦75,000</td><td>₦200,000</td><td>₦405,000</td></tr>' +
          '<tr><td>Premium</td><td>₦120,000</td><td>₦320,000</td><td>₦648,000</td></tr>' +
          '<tr><td>Business</td><td>₦150,000</td><td>₦420,000</td><td>₦840,000</td></tr>' +
        '</tbody>' +
      '</table>' +
      '<p>Prices are in Nigerian Naira (NGN) and processed by Paystack. A subscription starts on the day payment is confirmed and ends on the expiry date shown in your dashboard. Renewing before expiry extends your current period; the new period starts at your existing end date.</p>' +
      '<h3>5. Payments</h3>' +
      '<p>Payments are processed securely by Paystack. ELA never stores your card or bank details. By paying, you also accept Paystack\'s terms of service.</p>' +
      '<h3>6. Acceptable use</h3>' +
      '<p>You agree not to: share your account or course access with third parties; record, redistribute or resell course content; disrupt classes or harass teachers or other students; use the Learning Assistant to generate unlawful, harmful or abusive content. Violation may lead to suspension or termination without refund.</p>' +
      '<h3>7. Intellectual property</h3>' +
      '<p>All course materials, content and the ELA brand are the property of YAYAKHALIF COMPANY LIMITED. You receive a personal, non-transferable license to use them for your own learning during an active subscription.</p>' +
      '<h3>8. Learning Assistant disclaimer</h3>' +
      '<p>The Learning Assistant provides automated study support. It may occasionally produce inaccurate information. It does not replace teachers and must not be relied upon for professional, legal, medical or certified-translation purposes.</p>' +
      '<h3>9. Service availability</h3>' +
      '<p>We aim for continuous availability but do not guarantee uninterrupted service (maintenance, network or provider outages). Scheduled classes missed due to a verified outage on our side will be rescheduled or compensated.</p>' +
      '<h3>10. Termination</h3>' +
      '<p>You may stop using the service at any time; subscriptions remain active until their expiry date. We may suspend or terminate accounts that breach these Terms.</p>' +
      '<h3>11. Limitation of liability</h3>' +
      '<p>To the maximum extent permitted by Nigerian law, ELA\'s liability is limited to the amount you paid for your current subscription period. We are not liable for indirect losses (missed exams, lost income, etc.).</p>' +
      '<h3>12. Governing law</h3>' +
      '<p>These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes will first be addressed through good-faith negotiation with our support team.</p>' +
      '<h3>13. Contact</h3>' +
      '<p>languageacademyelearn@gmail.com</p>';
    app.innerHTML = legalPage('Terms and Conditions', body);
    afterRender('');
  }

  function renderPrivacy() {
    var body =
      '<h3>1. Data we collect</h3>' +
      '<ul>' +
        '<li>Account data: name, email address, authentication identifier.</li>' +
        '<li>Subscription and transaction data: plan, duration, payment references, expiry dates (we never see or store your card/bank details — these are handled entirely by Paystack).</li>' +
        '<li>Usage data: Learning Assistant conversations and daily message counts, dashboard activity.</li>' +
        '<li>Referral data: your referral code and referral credits.</li>' +
      '</ul>' +
      '<h3>2. How we use your data</h3>' +
      '<ul>' +
        '<li>To create and manage your account and subscriptions.</li>' +
        '<li>To process and verify payments (via Paystack).</li>' +
        '<li>To operate the referral programme.</li>' +
        '<li>To send transactional emails (payment receipts, expiry reminders, expiry notifications) via SendGrid.</li>' +
        '<li>To improve our courses and support.</li>' +
      '</ul>' +
      '<h3>3. Third-party processors</h3>' +
      '<ul>' +
        '<li>Paystack (payments) — subject to Paystack\'s privacy policy.</li>' +
        '<li>Google Firebase (hosting, database, authentication).</li>' +
        '<li>SendGrid (transactional emails).</li>' +
        '<li>OpenRouter (Learning Assistant request processing — message content is transmitted to generate responses).</li>' +
      '</ul>' +
      '<p>We do not sell your personal data to anyone.</p>' +
      '<h3>4. Data retention</h3>' +
      '<p>Account and subscription data are kept while your account is active and for up to 24 months after closure for accounting and legal obligations. Learning Assistant conversations may be retained for service improvement and abuse prevention.</p>' +
      '<h3>5. Your rights</h3>' +
      '<p>Under the Nigeria Data Protection Act 2023, you may request access to, correction of, or deletion of your personal data by emailing languageacademyelearn@gmail.com. Deletion of your account also deletes access to active subscriptions without refund.</p>' +
      '<h3>6. Security</h3>' +
      '<p>We use industry-standard measures (HTTPS, authenticated access, server-side payment verification). No system is 100% secure; report any suspected breach to our support immediately.</p>' +
      '<h3>7. Children</h3>' +
      '<p>Our services are intended for users aged 16 and above. Younger students may enroll only through a parent or guardian\'s account and consent.</p>' +
      '<h3>8. Changes</h3>' +
      '<p>We may update this policy; material changes will be announced on the website or by email.</p>' +
      '<h3>9. Contact</h3>' +
      '<p>languageacademyelearn@gmail.com</p>';
    app.innerHTML = legalPage('Privacy Policy', body);
    afterRender('');
  }

  function renderRefund() {
    var body =
      '<h3>1. Refunds</h3>' +
      '<ul>' +
        '<li>Payments are <strong>non-refundable</strong> once subscription access has been activated, including partial use of a period.</li>' +
        '<li>Exception: if a payment was debited but your subscription was not activated (technical failure on our side), contact us within 7 days with your payment reference; we will activate your subscription or issue a full refund.</li>' +
        '<li>Duplicate payments for the same period are refunded in full or converted into subscription extension, at your choice.</li>' +
        '<li>Refunds are processed to the original payment method via Paystack, typically within 5–10 business days.</li>' +
      '</ul>' +
      '<h3>2. Referral programme</h3>' +
      '<ul>' +
        '<li>Each student receives a personal referral code.</li>' +
        '<li><strong>Referred student (filleul):</strong> ₦15,000 discount on the first subscription payment. One referral code may be used per new account, on the first payment only.</li>' +
        '<li><strong>Referring student (parrain):</strong> ₦10,000 academic credit, added after the referred student\'s first successful payment.</li>' +
        '<li>Referral credits are <strong>non-transferable and non-refundable</strong>, and can only be used as a discount on future ELA subscription payments.</li>' +
        '<li>Self-referrals (using your own code) are prohibited and will void both the discount and the credit.</li>' +
        '<li>We may suspend the programme or withhold credits in case of abuse.</li>' +
      '</ul>' +
      '<h3>3. Contact</h3>' +
      '<p>languageacademyelearn@gmail.com</p>';
    app.innerHTML = legalPage('Refund & Referral Policy', body);
    afterRender('');
  }

  /* ---------- Teacher area (mission 1) ---------- */
  var teacherAcademy = null;

  function renderTeacher() {
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth || !firebase.firestore) {
      app.innerHTML = '' +
        '<section class="auth-wrap"><h1 class="auth-title">' + t('teacher.title') + '</h1>' +
        '<div class="setup-banner">' + t('register.setup') + '</div></section>';
      afterRender('teacher');
      return;
    }
    var user = firebase.auth().currentUser;
    if (!user) {
      app.innerHTML = '' +
        '<section class="auth-wrap"><h1 class="auth-title">' + t('teacher.title') + '</h1>' +
        '<p class="auth-sub">' + t('assistant.signInRequired') + '</p>' +
        '<div class="hero-actions"><a class="btn btn-solid" href="#/login">' + t('login.submit') + '</a></div></section>';
      afterRender('teacher');
      return;
    }
    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('teacher.title') + '</h1>' +
      '<p class="auth-sub">' + t('dashboard.loading') + '</p></section>';
    afterRender('teacher');

    firebase.firestore().collection('users').doc(user.uid).get()
      .then(function (snap) {
        var d = snap.exists ? snap.data() : {};
        var role = d.role;
        if (role !== 'teacher' && role !== 'admin') {
          app.innerHTML = '' +
            '<section class="auth-wrap"><h1 class="auth-title">' + t('teacher.title') + '</h1>' +
            '<p class="auth-sub">' + t('teacher.notTeacher') + '</p></section>';
          afterRender('teacher');
          return;
        }
        teacherAcademy = d.academy || null;
        renderTeacherDashboard(user.uid, teacherAcademy);
      })
      .catch(function () {
        app.innerHTML = '' +
          '<section class="auth-wrap"><h1 class="auth-title">' + t('teacher.title') + '</h1>' +
          '<p class="auth-sub">' + t('teacher.error') + '</p></section>';
        afterRender('teacher');
      });
  }

  function quizQuestionCardHtml(index) {
    return '<div class="quiz-q">' +
      '<label>' + t('teacher.quiz.question') + ' ' + (index + 1) + '</label>' +
      '<input class="q-text" type="text" placeholder="' + t('teacher.quiz.question') + '">' +
      '<label>' + t('teacher.quiz.options') + '</label>' +
      '<div class="q-opts">' +
        '<input class="q-opt" type="text" placeholder="1"><input class="q-opt" type="text" placeholder="2">' +
        '<input class="q-opt" type="text" placeholder="3"><input class="q-opt" type="text" placeholder="4">' +
      '</div>' +
      '<label>' + t('teacher.quiz.correct') + '</label>' +
      '<select class="q-correct"><option value="0">1</option><option value="1">2</option><option value="2">3</option><option value="3">4</option></select>' +
    '</div>';
  }

  function renderTeacherDashboard(uid, academy) {
    var academyLabel = t('academies.' + (academy || 'german') + '.name');
    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<h1 class="auth-title">' + t('teacher.title') + '</h1>' +
        '<p class="auth-sub">' + t('teacher.academy') + ' <strong>' + academyLabel + '</strong></p>' +

        '<div class="teacher-card"><h3 class="teacher-card-title">' + t('teacher.lesson.title') + '</h3>' +
          '<div class="field"><label>' + t('teacher.lesson.field.title') + '</label><input id="tls-title" type="text"></div>' +
          '<div class="field"><label>' + t('teacher.lesson.field.description') + '</label><input id="tls-desc" type="text"></div>' +
          '<div class="field"><label>' + t('teacher.lesson.field.content') + '</label><textarea id="tls-content" rows="6"></textarea></div>' +
          '<div class="field"><label>' + t('teacher.lesson.field.level') + '</label>' +
            '<select id="tls-level"><option value="beginner">' + t('teacher.level.beginner') + '</option><option value="intermediate">' + t('teacher.level.intermediate') + '</option><option value="advanced">' + t('teacher.level.advanced') + '</option></select></div>' +
          '<p class="form-error" id="tls-error">' + t('teacher.error') + '</p>' +
          '<button type="button" class="btn btn-solid" id="tls-submit">' + t('teacher.lesson.submit') + '</button>' +
        '</div>' +

        '<div class="teacher-card"><h3 class="teacher-card-title">' + t('teacher.quiz.title') + '</h3>' +
          '<div class="field"><label>' + t('teacher.quiz.field.title') + '</label><input id="tqz-title" type="text"></div>' +
          '<div id="tqz-questions"></div>' +
          '<button type="button" class="btn btn-outline" id="tqz-add">' + t('teacher.quiz.addQuestion') + '</button>' +
          '<p class="form-error" id="tqz-error">' + t('teacher.error') + '</p>' +
          '<button type="button" class="btn btn-solid" id="tqz-submit">' + t('teacher.quiz.submit') + '</button>' +
        '</div>' +

        '<div class="teacher-card"><h3 class="teacher-card-title">' + t('teacher.live.title') + '</h3>' +
          '<div class="field"><label>' + t('teacher.live.field.title') + '</label><input id="tlv-title" type="text"></div>' +
          '<div class="field"><label>' + t('teacher.live.field.datetime') + '</label><input id="tlv-datetime" type="datetime-local"></div>' +
          '<div class="field"><label>' + t('teacher.live.field.link') + '</label><input id="tlv-link" type="url"></div>' +
          '<p class="form-error" id="tlv-error">' + t('teacher.error') + '</p>' +
          '<button type="button" class="btn btn-solid" id="tlv-submit">' + t('teacher.live.submit') + '</button>' +
        '</div>' +

        '<h3 class="auth-title" style="font-size:1.3rem;margin-top:2rem">' + t('teacher.content') + '</h3>' +
        '<ul class="tx-list" id="teacher-content"><li>' + t('dashboard.loading') + '</li></ul>' +
      '</section>';

    document.getElementById('tqz-questions').insertAdjacentHTML('beforeend', quizQuestionCardHtml(0));
    bindTeacher(uid, academy);
    loadTeacherContent(uid);
    afterRender('teacher');
  }

  function bindTeacher(uid, academy) {
    var db = firebase.firestore();
    var ts = function () { return firebase.firestore.FieldValue.serverTimestamp(); };

    document.getElementById('tls-submit').addEventListener('click', function () {
      var title = document.getElementById('tls-title').value.trim();
      var desc = document.getElementById('tls-desc').value.trim();
      var content = document.getElementById('tls-content').value.trim();
      var level = document.getElementById('tls-level').value;
      var err = document.getElementById('tls-error');
      if (!title || !content) { err.classList.add('show'); return; }
      db.collection('lessons').add({
        title: title, description: desc, content: content, level: level,
        academy: academy, teacherUid: uid, status: 'pending', createdAt: ts()
      }).then(function () {
        alert(t('teacher.success'));
        document.getElementById('tls-title').value = '';
        document.getElementById('tls-desc').value = '';
        document.getElementById('tls-content').value = '';
        loadTeacherContent(uid);
      }).catch(function () { err.classList.add('show'); });
    });

    document.getElementById('tqz-add').addEventListener('click', function () {
      var c = document.getElementById('tqz-questions');
      c.insertAdjacentHTML('beforeend', quizQuestionCardHtml(c.querySelectorAll('.quiz-q').length));
    });

    document.getElementById('tqz-submit').addEventListener('click', function () {
      var title = document.getElementById('tqz-title').value.trim();
      var err = document.getElementById('tqz-error');
      var questions = [];
      document.querySelectorAll('#tqz-questions .quiz-q').forEach(function (card) {
        var text = card.querySelector('.q-text').value.trim();
        var opts = Array.prototype.map.call(card.querySelectorAll('.q-opt'), function (o) { return o.value.trim(); });
        var correct = parseInt(card.querySelector('.q-correct').value, 10);
        if (text && opts.every(function (o) { return o; })) questions.push({ text: text, options: opts, correctIndex: correct });
      });
      if (!title || !questions.length) { err.classList.add('show'); return; }
      db.collection('quizzes').add({
        title: title, questions: questions, academy: academy, teacherUid: uid, status: 'pending', createdAt: ts()
      }).then(function () {
        alert(t('teacher.success'));
        document.getElementById('tqz-title').value = '';
        document.getElementById('tqz-questions').innerHTML = '';
        document.getElementById('tqz-questions').insertAdjacentHTML('beforeend', quizQuestionCardHtml(0));
        loadTeacherContent(uid);
      }).catch(function () { err.classList.add('show'); });
    });

    document.getElementById('tlv-submit').addEventListener('click', function () {
      var title = document.getElementById('tlv-title').value.trim();
      var datetime = document.getElementById('tlv-datetime').value;
      var link = document.getElementById('tlv-link').value.trim();
      var err = document.getElementById('tlv-error');
      if (!title || !datetime || !link) { err.classList.add('show'); return; }
      db.collection('liveClasses').add({
        title: title, scheduledAt: new Date(datetime), meetingLink: link,
        academy: academy, teacherUid: uid, status: 'pending', createdAt: ts()
      }).then(function () {
        alert(t('teacher.success'));
        document.getElementById('tlv-title').value = '';
        document.getElementById('tlv-datetime').value = '';
        document.getElementById('tlv-link').value = '';
        loadTeacherContent(uid);
      }).catch(function () { err.classList.add('show'); });
    });
  }

  function loadTeacherContent(uid) {
    var el = document.getElementById('teacher-content');
    if (!el) return;
    var db = firebase.firestore();
    Promise.all([
      db.collection('lessons').where('teacherUid', '==', uid).get(),
      db.collection('quizzes').where('teacherUid', '==', uid).get(),
      db.collection('liveClasses').where('teacherUid', '==', uid).get()
    ]).then(function (results) {
      var items = [];
      results[0].forEach(function (d) { items.push({ type: t('teacher.type.lesson'), title: d.data().title, status: d.data().status, rejectReason: d.data().rejectReason, createdAt: d.data().createdAt }); });
      results[1].forEach(function (d) { items.push({ type: t('teacher.type.quiz'), title: d.data().title, status: d.data().status, rejectReason: d.data().rejectReason, createdAt: d.data().createdAt }); });
      results[2].forEach(function (d) { items.push({ type: t('teacher.type.live'), title: d.data().title, status: d.data().status, rejectReason: d.data().rejectReason, createdAt: d.data().createdAt }); });
      items.sort(function (a, b) {
        var at = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        var bt = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return bt - at;
      });
      if (!items.length) { el.innerHTML = '<li>' + t('teacher.content.empty') + '</li>'; return; }
      el.innerHTML = items.map(function (it) {
        var badge;
        if (it.status === 'approved') badge = '<span class="academy-status status-open">' + t('teacher.status.approved') + '</span>';
        else if (it.status === 'rejected') badge = '<span class="academy-status status-soon">' + t('teacher.status.rejected') + '</span>';
        else badge = '<span class="academy-status status-soon">' + t('teacher.status.pending') + '</span>';
        var reason = (it.status === 'rejected' && it.rejectReason) ? ' — ' + escapeHtml(it.rejectReason) : '';
        return '<li><span>' + escapeHtml(it.type + ' — ' + it.title) + reason + '</span>' + badge + '</li>';
      }).join('');
    }).catch(function () { el.innerHTML = '<li>' + t('teacher.error') + '</li>'; });
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

  function studentSignInRequired(title) {
    app.innerHTML = '' +
      '<section class="auth-wrap"><h1 class="auth-title">' + title + '</h1>' +
      '<p class="auth-sub">' + t('assistant.signInRequired') + '</p>' +
      '<div class="hero-actions"><a class="btn btn-solid" href="#/login">' + t('login.submit') + '</a></div></section>';
    afterRender('');
  }

  /* ----- Courses catalog ----- */
  function renderCourses() {
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth || !firebase.firestore) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1><div class="setup-banner">' + t('register.setup') + '</div></section>';
      afterRender('');
      return;
    }
    if (!firebase.auth().currentUser) { studentSignInRequired(t('courses.title')); return; }

    app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1><p class="auth-sub">' + t('dashboard.loading') + '</p></section>';
    afterRender('');

    getCurrentAcademy().then(function (academy) {
      if (!academy) {
        app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
        afterRender('');
        return;
      }
      var db = firebase.firestore();
      Promise.all([
        db.collection('lessons').where('academy', '==', academy).where('status', '==', 'approved').get(),
        db.collection('quizzes').where('academy', '==', academy).where('status', '==', 'approved').get()
      ]).then(function (res) {
        var lessons = []; res[0].forEach(function (d) { lessons.push({ id: d.id, data: d.data() }); });
        var quizzes = []; res[1].forEach(function (d) { quizzes.push({ id: d.id, data: d.data() }); });
        renderCoursesContent(academy, lessons, quizzes);
      }).catch(function () {
        app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.title') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
        afterRender('');
      });
    });
  }

  function renderCoursesContent(academy, lessons, quizzes) {
    var academyLabel = t('academies.' + academy + '.name');
    var lessonItems = lessons.map(function (l) {
      return '<a class="choice" href="#/lesson?id=' + encodeURIComponent(l.id) + '">' +
        '<span class="choice-name">' + escapeHtml(l.data.title) + '</span>' +
        '<span class="choice-tag">' + t('teacher.level.' + (l.data.level || 'beginner')) + '</span></a>';
    }).join('');
    var quizItems = quizzes.map(function (q) {
      return '<a class="choice" href="#/quiz?id=' + encodeURIComponent(q.id) + '">' +
        '<span class="choice-name">' + escapeHtml(q.data.title) + '</span>' +
        '<span class="choice-tag">' + t('courses.quiz') + '</span></a>';
    }).join('');

    var empty = !lessons.length && !quizzes.length;
    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<h1 class="auth-title">' + t('courses.title') + '</h1>' +
        '<p class="auth-sub">' + academyLabel + '</p>' +
        (empty ? '<div class="pricing-note"><p>' + t('courses.empty') + '</p></div>' : '') +
        (lessons.length ? '<h3 class="auth-title" style="font-size:1.25rem;margin-top:1rem">' + t('courses.lessons') + '</h3><div class="choice-grid">' + lessonItems + '</div>' : '') +
        (quizzes.length ? '<h3 class="auth-title" style="font-size:1.25rem;margin-top:1.5rem">' + t('courses.quizzes') + '</h3><div class="choice-grid">' + quizItems + '</div>' : '') +
      '</section>';
    afterRender('');
  }

  /* ----- Lesson detail ----- */
  function renderLesson() {
    var id = getHashParam('id');
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.firestore || !id) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.lessons') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
      afterRender('');
      return;
    }
    if (!firebase.auth().currentUser) { studentSignInRequired(t('courses.lessons')); return; }

    app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('dashboard.loading') + '</h1></section>';
    afterRender('');

    var db = firebase.firestore();
    var uid = firebase.auth().currentUser.uid;
    hasActiveSubscription().then(function (active) {
      if (!active) {
        app.innerHTML = '' +
          '<section class="auth-wrap"><h1 class="auth-title">' + t('lesson.subscribeRequired') + '</h1>' +
          '<p class="auth-sub">' + t('lesson.subscribeRequiredSub') + '</p>' +
          '<div class="hero-actions"><a class="btn btn-gold" href="#/checkout">' + t('pricing.subscribe') + '</a></div></section>';
        afterRender('');
        return;
      }
      db.collection('lessons').doc(id).get().then(function (snap) {
        if (!snap.exists) {
          app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.lessons') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
          afterRender('');
          return;
        }
        renderLessonContent(id, uid, snap.data());
      }).catch(function () {
        app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('lesson.subscribeRequired') + '</h1><p class="auth-sub">' + t('lesson.subscribeRequiredSub') + '</p></section>';
        afterRender('');
      });
    });
  }

  function renderLessonContent(id, uid, lesson) {
    var isDone = false;
    var db = firebase.firestore();
    db.collection('progress').doc(uid).get().then(function (p) {
      if (p.exists && (p.data().completedLessons || []).indexOf(id) !== -1) isDone = true;
      app.innerHTML = '' +
        '<section class="auth-wrap teacher-wrap">' +
          '<p class="section-label">' + t('courses.lessons') + '</p>' +
          '<h1 class="auth-title">' + escapeHtml(lesson.title) + '</h1>' +
          '<p class="auth-sub"><span class="academy-status status-open">' + t('teacher.level.' + (lesson.level || 'beginner')) + '</span></p>' +
          (lesson.description ? '<p class="auth-sub">' + escapeHtml(lesson.description) + '</p>' : '') +
          '<div class="lesson-content">' + escapeHtml(lesson.content || '') + '</div>' +
          '<button type="button" class="btn btn-solid" id="mark-complete" ' + (isDone ? 'disabled' : '') + '>' +
            (isDone ? t('lesson.completed') : t('lesson.markComplete')) + '</button>' +
          '<p class="auth-alt"><a href="#/courses">' + t('common.back') + '</a></p>' +
        '</section>';
      afterRender('');

      var btn = document.getElementById('mark-complete');
      if (btn && !isDone) {
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
    });
  }

  /* ----- Quiz engine ----- */
  var quizState = { quiz: null, current: 0, answers: [] };

  function renderQuiz() {
    var id = getHashParam('id');
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.firestore || !id) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.quizzes') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
      afterRender('');
      return;
    }
    if (!firebase.auth().currentUser) { studentSignInRequired(t('courses.quizzes')); return; }

    app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('dashboard.loading') + '</h1></section>';
    afterRender('');

    var db = firebase.firestore();
    hasActiveSubscription().then(function (active) {
      if (!active) {
        app.innerHTML = '' +
          '<section class="auth-wrap"><h1 class="auth-title">' + t('lesson.subscribeRequired') + '</h1>' +
          '<p class="auth-sub">' + t('lesson.subscribeRequiredSub') + '</p>' +
          '<div class="hero-actions"><a class="btn btn-gold" href="#/checkout">' + t('pricing.subscribe') + '</a></div></section>';
        afterRender('');
        return;
      }
      db.collection('quizzes').doc(id).get().then(function (snap) {
        if (!snap.exists || !snap.data().questions || !snap.data().questions.length) {
          app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('courses.quizzes') + '</h1><p class="auth-sub">' + t('courses.empty') + '</p></section>';
          afterRender('');
          return;
        }
        quizState.quiz = { id: id, data: snap.data() };
        quizState.current = 0;
        quizState.answers = new Array(quizState.quiz.data.questions.length).fill(null);
        renderQuizQuestion();
      }).catch(function () {
        app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('lesson.subscribeRequired') + '</h1><p class="auth-sub">' + t('lesson.subscribeRequiredSub') + '</p></section>';
        afterRender('');
      });
    });
  }

  function renderQuizQuestion() {
    var qz = quizState.quiz;
    var total = qz.data.questions.length;
    var q = qz.data.questions[quizState.current];
    var opts = q.options.map(function (opt, i) {
      var sel = quizState.answers[quizState.current] === i;
      return '<button type="button" class="choice' + (sel ? ' selected' : '') + '" data-opt="' + i + '">' +
        '<span class="choice-name">' + escapeHtml(opt) + '</span></button>';
    }).join('');

    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<h1 class="auth-title">' + escapeHtml(qz.data.title) + '</h1>' +
        '<p class="auth-sub">' + t('quiz.question') + ' ' + (quizState.current + 1) + ' / ' + total + '</p>' +
        '<div class="quiz-q" style="margin-bottom:1rem"><label>' + escapeHtml(q.text) + '</label></div>' +
        '<div class="choice-grid">' + opts + '</div>' +
        '<div class="hero-actions" style="margin-top:1.2rem">' +
          (quizState.current === total - 1
            ? '<button type="button" class="btn btn-solid" id="quiz-submit">' + t('quiz.submit') + '</button>'
            : '<button type="button" class="btn btn-solid" id="quiz-next">' + t('quiz.next') + '</button>') +
          '<a class="btn btn-outline" href="#/courses">' + t('common.back') + '</a>' +
        '</div>' +
      '</section>';
    afterRender('');

    document.querySelectorAll('[data-opt]').forEach(function (b) {
      b.addEventListener('click', function () {
        quizState.answers[quizState.current] = parseInt(b.getAttribute('data-opt'), 10);
        renderQuizQuestion();
      });
    });
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
    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<h1 class="auth-title">' + escapeHtml(quizState.quiz.data.title) + '</h1>' +
        '<p class="section-title" style="font-size:3rem;color:var(--emerald)">' + correct + ' / ' + total + '</p>' +
        '<p class="auth-sub">' + pct + '% — ' + t('quiz.best') + ' ' + best + '/' + total + '</p>' +
        '<div class="hero-actions">' +
          '<button type="button" class="btn btn-solid" id="quiz-retry">' + t('quiz.retry') + '</button>' +
          '<a class="btn btn-outline" href="#/courses">' + t('common.back') + '</a>' +
        '</div>' +
      '</section>';
    afterRender('');
    document.getElementById('quiz-retry').addEventListener('click', function () {
      quizState.current = 0;
      quizState.answers = new Array(quizState.quiz.data.questions.length).fill(null);
      renderQuizQuestion();
    });
  }

  /* ----- Live classes ----- */
  function renderLive() {
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.firestore) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('live.title') + '</h1><div class="setup-banner">' + t('register.setup') + '</div></section>';
      afterRender('');
      return;
    }
    if (!firebase.auth().currentUser) { studentSignInRequired(t('live.title')); return; }

    app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('live.title') + '</h1><p class="auth-sub">' + t('dashboard.loading') + '</p></section>';
    afterRender('');

    var db = firebase.firestore();
    getCurrentAcademy().then(function (academy) {
      if (!academy) { renderLiveContent([]); return; }
      db.collection('liveClasses').where('academy', '==', academy).where('status', '==', 'approved').get()
        .then(function (res) {
          var classes = [];
          res.forEach(function (d) { classes.push({ id: d.id, data: d.data() }); });
          renderLiveContent(classes);
        })
        .catch(function () { renderLiveContent([]); });
    });
  }

  function renderLiveContent(classes) {
    var now = Date.now();
    var sorted = classes.slice().sort(function (a, b) {
      var at = a.data.scheduledAt && a.data.scheduledAt.toDate ? a.data.scheduledAt.toDate().getTime() : 0;
      var bt = b.data.scheduledAt && b.data.scheduledAt.toDate ? b.data.scheduledAt.toDate().getTime() : 0;
      return at - bt;
    });
    var html = sorted.map(function (c) {
      var d = c.data;
      var t0 = d.scheduledAt && d.scheduledAt.toDate ? d.scheduledAt.toDate() : new Date(d.scheduledAt);
      var when = t0.toLocaleString(ELA_I18N.getLang());
      var gateStart = t0.getTime() - 15 * 60000;
      var joinable = now >= gateStart;
      var joinHtml = joinable
        ? '<button type="button" class="btn btn-gold" data-join="' + encodeURIComponent(c.id) + '">' + t('live.join') + '</button>'
        : '<span class="academy-status status-soon">' + t('live.joinSoon') + '</span>';
      return '<div class="teacher-card">' +
        '<h3 class="teacher-card-title">' + escapeHtml(d.title) + '</h3>' +
        '<p style="color:var(--muted);margin-bottom:0.6rem">' + when + '</p>' +
        joinHtml +
        '</div>';
    }).join('');

    app.innerHTML = '' +
      '<section class="auth-wrap teacher-wrap">' +
        '<h1 class="auth-title">' + t('live.title') + '</h1>' +
        (sorted.length ? html : '<div class="pricing-note"><p>' + t('live.empty') + '</p></div>') +
        '<p class="auth-alt"><a href="#/dashboard">' + t('common.back') + '</a></p>' +
      '</section>';
    afterRender('');

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

  /* ---------- Admin validation ---------- */
  var adminState = { items: [], rejectingId: null };

  function renderAdmin() {
    if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth || !firebase.firestore) {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('admin.title') + '</h1><div class="setup-banner">' + t('register.setup') + '</div></section>';
      afterRender('admin');
      return;
    }
    var user = firebase.auth().currentUser;
    if (!user) { studentSignInRequired(t('admin.title')); return; }

    app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('admin.title') + '</h1><p class="auth-sub">' + t('dashboard.loading') + '</p></section>';
    afterRender('admin');

    firebase.firestore().collection('users').doc(user.uid).get().then(function (snap) {
      var role = snap.exists ? snap.data().role : null;
      if (role !== 'admin') {
        app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('admin.title') + '</h1><p class="auth-sub">' + t('teacher.notTeacher') + '</p></section>';
        afterRender('admin');
        return;
      }
      loadAdminQueue();
    }).catch(function () {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('admin.title') + '</h1><p class="auth-sub">' + t('teacher.error') + '</p></section>';
      afterRender('admin');
    });
  }

  function adminPreviewHtml(it) {
    var p = it.preview || {};
    if (p.kind === 'lesson') return '<p>' + escapeHtml(p.description || p.content || '') + '</p>';
    if (p.kind === 'quiz') return '<p>' + (p.questionCount || 0) + ' ' + t('admin.questions') + '</p>';
    if (p.kind === 'live') return '<p>' + t('admin.liveAt') + ': ' + (p.scheduledAt ? new Date(p.scheduledAt).toLocaleString(ELA_I18N.getLang()) : '—') + '</p>';
    return '';
  }

  function renderAdminList() {
    var items = adminState.items;
    if (!items.length) {
      app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('admin.title') + '</h1><div class="pricing-note"><p>' + t('admin.empty') + '</p></div></section>';
      afterRender('admin');
      return;
    }
    var html = items.map(function (it) {
      var typeLabel = t('teacher.type.' + (it.collection === 'lessons' ? 'lesson' : it.collection === 'quizzes' ? 'quiz' : 'live'));
      var academyLabel = t('academies.' + (it.academy || 'german') + '.name');
      var date = it.submittedAt ? new Date(it.submittedAt).toLocaleDateString(ELA_I18N.getLang()) : '';
      var rejecting = adminState.rejectingId === it.id;
      var actions = rejecting
        ? '<div class="field"><input id="reject-reason" type="text" placeholder="' + t('admin.rejectReason') + '"></div>' +
          '<div class="hero-actions"><button type="button" class="btn btn-gold" data-confirm-reject="' + encodeURIComponent(it.id) + '">' + t('admin.confirm') + '</button>' +
          '<button type="button" class="btn btn-outline" data-cancel-reject>' + t('admin.cancel') + '</button></div>'
        : '<div class="hero-actions"><button type="button" class="btn btn-solid" data-approve="' + encodeURIComponent(it.id) + '">' + t('admin.approve') + '</button>' +
          '<button type="button" class="btn btn-outline" data-reject="' + encodeURIComponent(it.id) + '">' + t('admin.reject') + '</button></div>';
      return '<div class="teacher-card">' +
        '<div style="display:flex;flex-wrap:wrap;gap:0.5rem 1rem;align-items:baseline;margin-bottom:0.5rem">' +
          '<span class="academy-status status-open">' + typeLabel + '</span>' +
          '<strong>' + escapeHtml(it.title) + '</strong>' +
          '<span style="color:var(--muted)">' + academyLabel + '</span>' +
        '</div>' +
        '<p style="color:var(--muted);font-size:0.85rem;margin-bottom:0.6rem">' +
          t('admin.teacher') + ': ' + escapeHtml(it.teacherName || '—') + ' · ' + t('admin.submitted') + ' ' + date + '</p>' +
        adminPreviewHtml(it) + actions +
      '</div>';
    }).join('');

    app.innerHTML = '<section class="auth-wrap teacher-wrap"><h1 class="auth-title">' + t('admin.title') + '</h1>' + html + '</section>';
    afterRender('admin');

    document.querySelectorAll('[data-approve]').forEach(function (b) {
      b.addEventListener('click', function () { adminReview(decodeURIComponent(b.getAttribute('data-approve')), 'approve', ''); });
    });
    document.querySelectorAll('[data-reject]').forEach(function (b) {
      b.addEventListener('click', function () { adminState.rejectingId = decodeURIComponent(b.getAttribute('data-reject')); renderAdminList(); });
    });
    document.querySelectorAll('[data-confirm-reject]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = decodeURIComponent(b.getAttribute('data-confirm-reject'));
        var reason = document.getElementById('reject-reason').value.trim();
        if (!reason) { alert(t('admin.rejectReason')); return; }
        adminReview(id, 'reject', reason);
      });
    });
    document.querySelectorAll('[data-cancel-reject]').forEach(function (b) {
      b.addEventListener('click', function () { adminState.rejectingId = null; renderAdminList(); });
    });
  }

  function adminReview(id, decision, reason) {
    var item = adminState.items.filter(function (x) { return x.id === id; })[0];
    if (!item) return;
    callable('reviewContent')({ collection: item.collection, docId: item.id, decision: decision, reason: reason })
      .then(function () { adminState.rejectingId = null; loadAdminQueue(); })
      .catch(function () { alert(t('teacher.error')); });
  }

  function loadAdminQueue() {
    callable('getAdminQueue')().then(function (r) {
      adminState.items = (r.data && r.data.items) || [];
      adminState.rejectingId = null;
      renderAdminList();
    }).catch(function () {
      app.innerHTML = '<section class="auth-wrap"><h1 class="auth-title">' + t('admin.title') + '</h1><p class="auth-sub">' + t('teacher.error') + '</p></section>';
      afterRender('admin');
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
          .then(function () { alert(t('register.success')); window.location.hash = '#/dashboard'; })
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
    '/assistant': renderAssistant,
    '/dashboard': renderDashboard,
    '/terms': renderTerms,
    '/privacy': renderPrivacy,
    '/refund': renderRefund,
    '/teacher': renderTeacher,
    '/admin': renderAdmin,
    '/courses': renderCourses,
    '/lesson': renderLesson,
    '/quiz': renderQuiz,
    '/live': renderLive,
    '/register': renderRegister,
    '/login': renderLogin
  };

  function route() {
    var hash = window.location.hash.replace(/^#/, '') || '/';
    var qi = hash.indexOf('?');
    var path = qi >= 0 ? hash.slice(0, qi) : hash;
    (ROUTES[path] || renderHome)();
  }

  /* ---------- Boot ---------- */
  function updateTeacherNav() {
    var tLink = document.querySelector('.teacher-nav');
    var aLink = document.querySelector('.admin-nav');
    var hide = function () { if (tLink) tLink.style.display = 'none'; if (aLink) aLink.style.display = 'none'; };
    if (!window.firebase || !firebase.auth) { hide(); return; }
    var user = firebase.auth().currentUser;
    if (!user) { hide(); return; }
    firebase.firestore().collection('users').doc(user.uid).get()
      .then(function (snap) {
        var role = snap.exists ? snap.data().role : null;
        if (tLink) tLink.style.display = (role === 'teacher' || role === 'admin') ? '' : 'none';
        if (aLink) aLink.style.display = (role === 'admin') ? '' : 'none';
      })
      .catch(hide);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('nav-logo').innerHTML = LOGO_SVG;
    document.getElementById('footer-logo').innerHTML = LOGO_SVG;

    if (window.ELA_FIREBASE_READY && window.firebase) {
      firebase.initializeApp(window.ELA_FIREBASE_CONFIG);
      firebase.auth().onAuthStateChanged(function () { updateTeacherNav(); });
    }

    ELA_I18N.init().then(function () {
      route();
      updateTeacherNav();
      window.addEventListener('hashchange', route);
    });
    ELA_I18N.onChange(function () { route(); });
  });
})();
