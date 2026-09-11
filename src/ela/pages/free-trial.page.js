/* ============================================================
   ELA — ela/pages/free-trial.page.js
   Page Free Trial premium : 12 leçons sans compte + 24 avec
   compte gratuit, par les 6 académies. Design premium pro
   (inspiré de francophone.ng) : épuré, élégant, pas de cheap.
   ============================================================ */

import { ACADEMIES, ACADEMY_ORDER } from '../../shared/config/academies.config.js';
import { callFunction } from '../../js/core/api-client.js';
import { t } from '../../js/core/i18n-helpers.js';

const ACADEMY_TAGS = {
  FR: { tag: 'CECRL', tagColor: '#1D4ED8' },
  DE: { tag: 'Goethe-Zertifikat', tagColor: '#C9A227' },
  ZH: { tag: 'HSK', tagColor: '#C0372F' },
  EN: { tag: 'IELTS', tagColor: '#1E3A5F' },
  AR: { tag: 'ALPT', tagColor: '#0F766E' },
  RU: { tag: 'TORFL', tagColor: '#B22234' }
};

const OPT_KEY = { FR: 'francophone', DE: 'germanophone', ZH: 'sinophone', EN: 'anglophone', AR: 'arabophone', RU: 'russophone' };

function academyLabel(code, fallback) {
  const opt = OPT_KEY[String(code || '').toUpperCase()];
  return opt ? t('academies.option.' + opt) : (fallback || code || '');
}

function renderAuthModal() {
  return '' +
    '<div class="ft-modal-overlay" id="ft-auth-modal">' +
      '<div class="ft-modal">' +
        '<h3 class="ft-display">' + t('trial.modal.title') + '</h3>' +
        '<p class="ft-modal-sub">' + t('trial.modal.subtitle') + '</p>' +
        '<div class="ft-modal-err" id="ft-auth-err"></div>' +
        '<label for="ft-auth-email">' + t('register.field.email') + '</label>' +
        '<input type="email" id="ft-auth-email" placeholder="you@example.com" />' +
        '<label for="ft-auth-password">' + t('register.field.password') + '</label>' +
        '<input type="password" id="ft-auth-password" placeholder="' + t('trial.modal.passwordPlaceholder') + '" />' +
        '<div class="ft-modal-actions">' +
          '<button class="ft-cta" id="ft-auth-submit">' + t('trial.modal.cta') + '</button>' +
          '<button class="ft-modal-cancel" id="ft-auth-cancel">' + t('admin.cancel') + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function closeAuthModal() {
  var overlay = document.getElementById('ft-auth-modal');
  if (overlay) overlay.classList.remove('active');
}

function openAuthModal() {
  var overlay = document.getElementById('ft-auth-modal');
  if (overlay) overlay.classList.add('active');
  if (window.ELAMarketing) window.ELAMarketing.track('signup_modal_open', { source: 'free-trial' });
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function ftAuthErrorText(e) {
  const code = (e && e.code) ? String(e.code).replace('functions/', '') : '';
  const msg = (e && e.message) ? String(e.message) : '';
  if (code === 'already-exists' || msg.indexOf('email-in-use') >= 0) return t('register.emailTaken');
  if (code === 'resource-exhausted' || msg.indexOf('rate-limit') >= 0) return t('register.error.rateLimited');
  if (msg.indexOf('weak-password') >= 0 || msg.indexOf('invalid-email') >= 0 || code === 'invalid-argument') return t('register.error.invalidInput');
  return t('register.error');
}

function bindAuthModal() {
  var overlay = document.getElementById('ft-auth-modal');
  if (!overlay) return;

  document.getElementById('ft-auth-cancel').addEventListener('click', closeAuthModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeAuthModal();
  });

  document.getElementById('ft-auth-submit').addEventListener('click', function () {
    var email = document.getElementById('ft-auth-email').value.trim().toLowerCase();
    var password = document.getElementById('ft-auth-password').value;
    var err = document.getElementById('ft-auth-err');
    var btn = document.getElementById('ft-auth-submit');

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      err.textContent = t('trial.error.email');
      return;
    }
    if (!password || password.length < 8) {
      err.textContent = t('trial.error.password');
      return;
    }

    err.textContent = '';
    if (btn) btn.disabled = true;

    // Audit inscription (approche hybride) : pré-check d'unicité serveur puis
    // création 100 % serveur via createAccount (transaction atomique + rate
    // limit 3/min/IP). Plus aucune écriture Firestore directe du client.
    callFunction('checkEmailUnique', { email: email })
      .then(function (r) {
        if (r && r.exists) return Promise.reject({ code: 'already-exists', message: 'email-in-use' });
        return callFunction('createAccount', {
          displayName: email.split('@')[0],
          email: email,
          password: password,
          source: 'trial'
        });
      })
      .then(function () {
        // createAccount passe par l'Admin SDK → aucune session client.
        var fb = window.firebase;
        return fb.auth().signInWithEmailAndPassword(email, password);
      })
      .then(function () {
        closeAuthModal();
        window.location.reload();
      })
      .catch(function (e) {
        if (btn) btn.disabled = false;
        err.textContent = ftAuthErrorText(e);
      });
  });
}

function renderHero() {
  return '' +
    '<section class="ft-hero">' +
      '<div class="ft-hero-inner">' +
        '<h1 class="ft-display">' + t('trial.hero.title') + '<br><em>' + t('trial.hero.titleEm') + '</em></h1>' +
        '<p class="ft-lead">' + t('trial.hero.lead') + '</p>' +
        '<button class="ft-cta" id="ft-hero-cta">' + t('trial.hero.cta') + ' <span>→</span></button>' +
        '<div class="ft-micro">' + t('trial.hero.micro') + '</div>' +
      '</div>' +
    '</section>';
}

function renderAdvantages() {
  return '' +
    '<section class="ft-adv">' +
      '<div class="ft-lessons-head">' +
        '<h2 class="ft-display">' + t('trial.adv.title') + '</h2>' +
        '<p>' + t('trial.adv.sub') + '</p>' +
      '</div>' +
      '<div class="ft-adv-grid">' +
        '<div class="ft-adv-card">' +
          '<div class="ft-adv-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>' +
          '<h3 class="ft-display">' + t('trial.adv.instant.title') + '</h3>' +
          '<p>' + t('trial.adv.instant.body') + '</p>' +
        '</div>' +
        '<div class="ft-adv-card">' +
          '<div class="ft-adv-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>' +
          '<h3 class="ft-display">' + t('trial.adv.quiz.title') + '</h3>' +
          '<p>' + t('trial.adv.quiz.body') + '</p>' +
        '</div>' +
        '<div class="ft-adv-card">' +
          '<div class="ft-adv-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>' +
          '<h3 class="ft-display">' + t('trial.adv.progress.title') + '</h3>' +
          '<p>' + t('trial.adv.progress.body') + '</p>' +
        '</div>' +
      '</div>' +
    '</section>';
}

function renderLessons(byAcademy, isAuth) {
  const container = document.getElementById('ft-lessons');
  if (!container) return;

  let instantHtml = '';
  let signupHtml = '';

  ACADEMY_ORDER.forEach(function (code) {
    const a = ACADEMIES[code];
    if (!a) return;
    const lessons = byAcademy[code] || [];
    const instant = lessons.filter(function (l) { return l.trialAccess === 'instant'; });
    const signup = lessons.filter(function (l) { return l.trialAccess === 'signup'; });

    instantHtml += renderAcademyCard(code, a, instant, 'instant', isAuth);
    signupHtml += renderAcademyCard(code, a, signup, 'signup', isAuth);
  });

  container.innerHTML = '' +
    '<section class="ft-lessons">' +
      '<div class="ft-lessons-head">' +
        '<h2 class="ft-display">' + t('trial.instantTitle') + '</h2>' +
        '<p>' + t('trial.instantSubtitle') + '</p>' +
      '</div>' +
      '<div class="ft-academy-grid">' + instantHtml + '</div>' +
    '</section>' +
    '<section class="ft-lessons">' +
      '<div class="ft-lessons-head">' +
        '<h2 class="ft-display">' + t('trial.signupTitle') + '</h2>' +
        '<p>' + t('trial.signupSubtitle') + '</p>' +
      '</div>' +
      '<div class="ft-academy-grid">' + signupHtml + '</div>' +
    '</section>';

  bindLessonClicks(isAuth);
}

function renderAcademyCard(code, a, lessons, type, isAuth) {
  let rows = '';

  if (lessons.length === 0) {
    rows = '<div class="ft-lesson-row ft-lesson-locked"><span class="ft-lesson-title">' + t('trial.comingSoon') + '</span><span class="ft-pill ft-pill-comingSoon">' + t('trial.soon') + '</span></div>';
  } else {
    lessons.forEach(function (l) {
      const title = l.title || (t('trial.lessonFallback') + ' ' + l.order);
      if (type === 'instant') {
        rows += '<a class="ft-lesson-row ft-lesson-open" href="#/lesson?id=' + encodeURIComponent(l.id) + '" data-lesson-id="' + l.id + '" data-academy="' + code + '">' +
          '<span class="ft-lesson-title">' + escapeHtml(title) + '</span>' +
          '<span class="ft-pill ft-pill-instant">' + t('trial.startNow') + '</span>' +
        '</a>';
      } else {
        const locked = !isAuth;
        rows += '<div class="ft-lesson-row ft-lesson-locked' + (locked ? ' ft-locked' : '') + '" data-lesson-id="' + l.id + '" data-locked="' + locked + '">' +
          '<span class="ft-lesson-title">' + escapeHtml(title) + '</span>' +
          (locked ? '<span class="ft-lock-overlay"><span class="ft-lock-icon">🔒</span></span>' : '') +
          '<span class="ft-pill ft-pill-signup">' + (locked ? t('trial.signUp') : t('trial.startNow')) + '</span>' +
        '</div>';
      }
    });
  }

  return '' +
    '<div class="ft-academy-card">' +
      '<div class="ft-academy-top">' +
        '<span class="ft-academy-flag">' + a.flag + '</span>' +
        '<div>' +
          '<span class="ft-academy-name">' + academyLabel(code, a.label) + '</span>' +
          '<span class="ft-academy-native">' + a.native + ' · ' + a.certification + '</span>' +
        '</div>' +
      '</div>' +
      rows +
    '</div>';
}

function bindLessonClicks(isAuth) {
  var heroCta = document.getElementById('ft-hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', function () {
      var el = document.getElementById('ft-lessons');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  var lockedRows = document.querySelectorAll('.ft-locked');
  lockedRows.forEach(function (row) {
    row.addEventListener('click', function () {
      openAuthModal();
    });
  });

  var openRows = document.querySelectorAll('.ft-lesson-open');
  openRows.forEach(function (row) {
    row.addEventListener('click', function () {
      if (window.ELAMarketing) {
        window.ELAMarketing.track('trial_lesson_started', {
          lessonId: row.getAttribute('data-lesson-id') || '',
          academy: row.getAttribute('data-academy') || '',
          access: 'instant'
        });
      }
    });
  });
}

function renderFinalCTA() {
  return '' +
    '<section class="ft-final">' +
      '<h2 class="ft-display">' + t('trial.final.title') + '</h2>' +
      '<p>' + t('trial.final.body') + '</p>' +
      '<a class="ft-cta" href="#/pricing">' + t('trial.final.cta') + ' <span>→</span></a>' +
    '</section>';
}

function renderNewsletter() {
  return '' +
    '<section class="ft-newsletter">' +
      '<h2 class="ft-display">' + t('trial.news.title') + '</h2>' +
      '<p>' + t('trial.news.body') + '</p>' +
      '<form class="ft-newsletter-form" id="ft-newsletter-form">' +
        '<input type="email" id="ft-newsletter-email" placeholder="' + t('trial.news.placeholder') + '" required />' +
        '<button type="submit" class="ft-cta" style="padding:0.9rem 1.8rem">' + t('trial.news.subscribe') + '</button>' +
      '</form>' +
      '<div class="ft-newsletter-msg" id="ft-newsletter-msg"></div>' +
    '</section>';
}

function bindNewsletter() {
  var form = document.getElementById('ft-newsletter-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('ft-newsletter-email').value.trim();
    var msg = document.getElementById('ft-newsletter-msg');
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      msg.textContent = t('trial.news.msg.invalid');
      msg.style.color = '#b91c1c';
      return;
    }
    if (!window.ELA_FIREBASE_READY || !window.firebase) {
      msg.textContent = t('trial.news.msg.unavailable');
      msg.style.color = '#b91c1c';
      return;
    }
    var fb = window.firebase;
    fb.firestore().collection('newsletterSubscribers').add({
      email: email,
      ts: Date.now(),
      source: 'free-trial'
    }).then(function () {
      msg.textContent = t('trial.news.msg.success');
      msg.style.color = '#065f46';
      form.reset();
    }).catch(function () {
      msg.textContent = t('trial.news.msg.error');
      msg.style.color = '#b91c1c';
    });
  });
}

export function renderFreeTrial() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!window.ELA_FIREBASE_READY || !window.firebase) {
    app.innerHTML = '<div class="section"><p class="ac-courses-empty">' + t('common.loading') + '</p></div>';
    return;
  }

  const fb = window.firebase;
  const isAuth = !!(fb.auth && fb.auth().currentUser);

  app.innerHTML = '' +
    '<div class="ft-section">' +
      renderHero() +
      renderAdvantages() +
      '<div id="ft-lessons"></div>' +
      renderFinalCTA() +
      renderNewsletter() +
      renderAuthModal() +
    '</div>';

  callFunction('getTrialLessons').then(function (data) {
    const byAcademy = (data && data.academies) || {};
    renderLessons(byAcademy, isAuth);
  }).catch(function () {
    renderLessons({}, isAuth);
  });

  bindNewsletter();
  bindAuthModal();
  if (window.ELAMarketing) window.ELAMarketing.track('free_trial_view', {});
}
