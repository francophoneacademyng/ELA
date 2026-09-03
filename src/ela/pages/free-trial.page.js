/* ============================================================
   ELA — ela/pages/free-trial.page.js
   Page Free Trial premium : 12 leçons sans compte + 24 avec
   compte gratuit, par les 6 académies. Design premium pro
   (inspiré de francophone.ng) : épuré, élégant, pas de cheap.
   ============================================================ */

import { ACADEMIES, ACADEMY_ORDER } from '../../shared/config/academies.config.js';
import { callFunction } from '../../js/core/api-client.js';

const ACADEMY_TAGS = {
  FR: { tag: 'CECRL', tagColor: '#1D4ED8' },
  DE: { tag: 'Goethe-Zertifikat', tagColor: '#C9A227' },
  ZH: { tag: 'HSK', tagColor: '#C0372F' },
  EN: { tag: 'IELTS', tagColor: '#1E3A5F' },
  AR: { tag: 'ALPT', tagColor: '#0F766E' },
  RU: { tag: 'TORFL', tagColor: '#B22234' }
};

export function renderFreeTrial() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!window.ELA_FIREBASE_READY || !window.firebase) {
    app.innerHTML = '<div class="section"><p class="ac-courses-empty">Loading…</p></div>';
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
}

function renderHero() {
  return '' +
    '<section class="ft-hero">' +
      '<div class="ft-hero-inner">' +
        '<h1 class="ft-display">Master a New Language.<br><em>Start Free.</em></h1>' +
        '<p class="ft-lead">12 free lessons across 6 languages. No credit card. No account needed. Start instantly and discover your new language today.</p>' +
        '<button class="ft-cta" id="ft-hero-cta">Start Learning Free <span>→</span></button>' +
        '<div class="ft-micro">6 Languages <span>•</span> 36 Free Lessons <span>•</span> 1 Account</div>' +
      '</div>' +
    '</section>';
}

function renderAdvantages() {
  return '' +
    '<section class="ft-adv">' +
      '<div class="ft-lessons-head">' +
        '<h2 class="ft-display">Everything You Need to Begin</h2>' +
        '<p>A world-class language learning experience, on your terms.</p>' +
      '</div>' +
      '<div class="ft-adv-grid">' +
        '<div class="ft-adv-card">' +
          '<div class="ft-adv-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>' +
          '<h3 class="ft-display">12 Instant Lessons</h3>' +
          '<p>Start immediately, no account required. Sample lessons from all 6 academies.</p>' +
        '</div>' +
        '<div class="ft-adv-card">' +
          '<div class="ft-adv-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>' +
          '<h3 class="ft-display">Placement Quiz</h3>' +
          '<p>Discover your level from A1 to C2 with our adaptive assessment.</p>' +
        '</div>' +
        '<div class="ft-adv-card">' +
          '<div class="ft-adv-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>' +
          '<h3 class="ft-display">Progress Tracking</h3>' +
          '<p>XP, streaks and a personal dashboard from day one.</p>' +
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
        '<h2 class="ft-display">Start Instantly — No Account Needed</h2>' +
        '<p>12 free lessons. Click and learn, right now.</p>' +
      '</div>' +
      '<div class="ft-academy-grid">' + instantHtml + '</div>' +
    '</section>' +
    '<section class="ft-lessons">' +
      '<div class="ft-lessons-head">' +
        '<h2 class="ft-display">Unlock 24 More Lessons</h2>' +
        '<p>Create a free account to continue your journey. No payment required.</p>' +
      '</div>' +
      '<div class="ft-academy-grid">' + signupHtml + '</div>' +
    '</section>';

  bindLessonClicks(isAuth);
}

function renderAcademyCard(code, a, lessons, type, isAuth) {
  let rows = '';

  if (lessons.length === 0) {
    rows = '<div class="ft-lesson-row ft-lesson-locked"><span class="ft-lesson-title">Coming soon</span><span class="ft-pill ft-pill-comingSoon">Soon</span></div>';
  } else {
    lessons.forEach(function (l) {
      const title = l.title || ('Lesson ' + l.order);
      if (type === 'instant') {
        rows += '<a class="ft-lesson-row ft-lesson-open" href="#/lesson/' + l.id + '" data-lesson-id="' + l.id + '">' +
          '<span class="ft-lesson-title">' + escapeHtml(title) + '</span>' +
          '<span class="ft-pill ft-pill-instant">Free</span>' +
        '</a>';
      } else {
        const locked = !isAuth;
        rows += '<div class="ft-lesson-row ft-lesson-locked' + (locked ? ' ft-locked' : '') + '" data-lesson-id="' + l.id + '" data-locked="' + locked + '">' +
          '<span class="ft-lesson-title">' + escapeHtml(title) + '</span>' +
          '<span class="ft-pill ft-pill-signup">' + (locked ? 'Sign Up' : 'Free') + '</span>' +
        '</div>';
      }
    });
  }

  return '' +
    '<div class="ft-academy-card">' +
      '<div class="ft-academy-top">' +
        '<span class="ft-academy-flag">' + a.flag + '</span>' +
        '<div>' +
          '<span class="ft-academy-name">' + a.label + '</span>' +
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
}

function renderFinalCTA() {
  return '' +
    '<section class="ft-final">' +
      '<h2 class="ft-display">Ready for Fluency?</h2>' +
      '<p>Unlock every lesson, live classes with certified teachers, and your official ELA certificate.</p>' +
      '<a class="ft-cta" href="#/pricing">See Plans &amp; Pricing <span>→</span></a>' +
    '</section>';
}

function renderNewsletter() {
  return '' +
    '<section class="ft-newsletter">' +
      '<h2 class="ft-display">Language Tips Every Week</h2>' +
      '<p>Join thousands of learners. No spam, unsubscribe anytime.</p>' +
      '<form class="ft-newsletter-form" id="ft-newsletter-form">' +
        '<input type="email" id="ft-newsletter-email" placeholder="Your email address" required />' +
        '<button type="submit" class="ft-cta" style="padding:0.9rem 1.8rem">Subscribe</button>' +
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
      msg.textContent = 'Please enter a valid email address.';
      msg.style.color = '#b91c1c';
      return;
    }
    if (!window.ELA_FIREBASE_READY || !window.firebase) {
      msg.textContent = 'Service temporarily unavailable. Please try again later.';
      msg.style.color = '#b91c1c';
      return;
    }
    var fb = window.firebase;
    fb.firestore().collection('newsletterSubscribers').add({
      email: email,
      ts: Date.now(),
      source: 'free-trial'
    }).then(function () {
      msg.textContent = 'Thank you! You\'re subscribed.';
      msg.style.color = '#065f46';
      form.reset();
    }).catch(function () {
      msg.textContent = 'Something went wrong. Please try again.';
      msg.style.color = '#b91c1c';
    });

function renderAuthModal() {
  return '' +
    '<div class="ft-modal-overlay" id="ft-auth-modal">' +
      '<div class="ft-modal">' +
        '<h3 class="ft-display">Create Your Free Account</h3>' +
        '<p class="ft-modal-sub">Unlock 24 more lessons and track your progress. No payment required.</p>' +
        '<div class="ft-modal-err" id="ft-auth-err"></div>' +
        '<label for="ft-auth-email">Email</label>' +
        '<input type="email" id="ft-auth-email" placeholder="you@example.com" />' +
        '<label for="ft-auth-password">Password</label>' +
        '<input type="password" id="ft-auth-password" placeholder="At least 6 characters" />' +
        '<div class="ft-modal-actions">' +
          '<button class="ft-cta" id="ft-auth-submit">Create Free Account</button>' +
          '<button class="ft-modal-cancel" id="ft-auth-cancel">Cancel</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function bindAuthModal() {
  var overlay = document.getElementById('ft-auth-modal');
  if (!overlay) return;

  document.getElementById('ft-auth-cancel').addEventListener('click', closeAuthModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeAuthModal();
  });

  document.getElementById('ft-auth-submit').addEventListener('click', function () {
    var email = document.getElementById('ft-auth-email').value.trim();
    var password = document.getElementById('ft-auth-password').value;
    var err = document.getElementById('ft-auth-err');

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      err.textContent = 'Please enter a valid email address.';
      return;
    }
    if (!password || password.length < 6) {
      err.textContent = 'Password must be at least 6 characters.';
      return;
    }

    var fb = window.firebase;
    fb.auth().createUserWithEmailAndPassword(email, password)
      .then(function (cred) {
        return fb.firestore().collection('users').doc(cred.user.uid).set({
          displayName: email.split('@')[0],
          email: email,
          role: 'student',
          interfaceLang: 'en',
          academies: [],
          trialProgress: { startedAt: Date.now(), lessonsCompleted: [] },
          createdAt: fb.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(function () {
        closeAuthModal();
        window.location.reload();
      })
      .catch(function (e) {
        err.textContent = (e && e.message) ? e.message : 'Account creation failed.';
      });
  });
}

function openAuthModal() {
  var overlay = document.getElementById('ft-auth-modal');
  if (overlay) overlay.classList.add('active');
}

function closeAuthModal() {
  var overlay = document.getElementById('ft-auth-modal');
  if (overlay) overlay.classList.remove('active');
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

  });
}

