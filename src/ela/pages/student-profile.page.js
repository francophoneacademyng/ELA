/* ============================================================
   ELA — ela/pages/student-profile.page.js
   Profil étudiant en lecture seule (aucune écriture backend) :
   - Compte : displayName, email, rôle, académie, membre depuis
     (Firebase Auth = source de vérité + users/{uid} via le
     service existant js/core/auth.service.js)
   - Apprentissage : KPI (leçons, streak, XP, progression globale)
     via getDashboardData (Cloud Function existante)
   - Abonnement, code de parrainage, certificats (lecture)
   Déconnexion via l'API Firebase Auth existante.
   ============================================================ */

import { callFunction } from '../../js/core/api-client.js';
import { getProfile } from '../../js/core/auth.service.js';
import { t, getLang } from '../../js/core/i18n-helpers.js';
import { academyDisplayName } from '../../shared/components/academy/academy-shell.js';

/* Icônes SVG inline (trait currentColor, harmonisées ELA — pas d'emoji). */
var ICONS = {
  user: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  lessons: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  streak: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2c1 4-4 6-4 11a4 4 0 0 0 8 0c0-2-.8-3.4-1.6-4.6C13.5 10 15 9 12 2z"/></svg>',
  xp: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 17 5.5 21 7.5 13.8 2 9.3 9 9"/></svg>',
  cert: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="6"/><path d="M15.5 13l1.5 9-5-3-5 3 1.5-9"/></svg>'
};

var XP_PER_LESSON = 10; /* même convention que le hub étudiant */

function shell(inner) {
  return '<div class="dashboard-layout">' +
    '<main class="main-content" style="margin-left:0;max-width:100%">' + inner + '</main>' +
  '</div>';
}

function msgState(icon, message, extraHtml) {
  return shell('<div class="empty-state student-empty"><div class="empty-icon" aria-hidden="true">' + icon + '</div>' +
    '<p role="status">' + esc(message) + '</p>' + (extraHtml || '') + '</div>');
}

function signInState() {
  return msgState(ICONS.user, t('profile.authRequired'),
    '<p><a class="btn btn-solid" href="#/login">' + esc(t('nav.login')) + '</a></p>');
}

function errorState() {
  return msgState(ICONS.clock, t('profile.loadError'),
    '<p><button type="button" class="btn btn-outline" id="profile-retry">' + esc(t('common.retry')) + '</button></p>');
}

function fmtDate(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleDateString(getLang(), { dateStyle: 'long' }); }
  catch (e) { try { return new Date(ts).toLocaleDateString(); } catch (e2) { return ''; } }
}

function roleLabel(role) {
  if (role === 'teacher') return t('role.teacher');
  if (role === 'admin' || role === 'system') return t('role.admin');
  return t('role.student');
}

function academyLabel(code) {
  return academyDisplayName(code, code || '');
}

function fieldRow(label, value, opts) {
  var o = opts || {};
  return '<div class="sp-row">' +
    '<span class="sp-row-label">' + esc(label) + '</span>' +
    '<span class="sp-row-value' + (o.muted ? ' sp-muted' : '') + '">' + (value == null || value === '' ? esc(t('profile.notProvided')) : esc(value)) + '</span>' +
  '</div>';
}

/* ---------- Rendu authentifié ---------- */

function avatarHtml(name, photoURL, big) {
  var initial = String(name || '').trim().charAt(0).toUpperCase() || '?';
  return '<span class="sp-avatar' + (big ? ' sp-avatar-lg' : '') + '">' +
    (photoURL
      ? '<img src="' + esc(photoURL) + '" alt="" width="' + (big ? 72 : 44) + '" height="' + (big ? 72 : 44) + '">'
      : '<span aria-hidden="true">' + esc(initial) + '</span>') +
  '</span>';
}

function kpiCard(icon, labelKey, value) {
  return '<div class="kpi-card student-kpi">' +
    '<span class="kpi-label student-kpi-label"><span class="student-kpi-icon" aria-hidden="true">' + ICONS[icon] + '</span>' + t(labelKey) + '</span>' +
    '<div class="kpi-value">' + esc(value) + '</div></div>';
}

function cardTitle(icon, key) {
  return '<h3 class="sp-card-title"><span class="student-kpi-icon" aria-hidden="true">' + icon + '</span>' + t(key) + '</h3>';
}

function buildProfileHtml(auth, fp, prof) {
  const name = (fp.displayName || auth.displayName || prof.displayName || '').trim()
    || (auth.email ? auth.email.split('@')[0] : t('dashboard.learner'));
  const sub = fp.subscription;
  const progress = fp.progress || { completed: 0, total: 0 };
  const pct = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
  const certs = fp.certificates || [];

  const accountCard = '<section class="card sp-card">' +
    cardTitle(ICONS.user, 'profile.accountTitle') +
    '<div class="sp-head">' + avatarHtml(name, auth.photoURL, true) +
      '<div><div class="sp-name">' + esc(name) + '</div>' +
      '<span class="academy-status status-open" role="status">' + esc(roleLabel(prof.role)) + '</span></div>' +
    '</div>' +
    fieldRow(t('profile.name'), name) +
    fieldRow(t('profile.email'), auth.email || prof.email) +
    fieldRow(t('profile.academy'), prof.academy ? academyLabel(prof.academy) : '') +
    fieldRow(t('profile.memberSince'), auth.metadata && auth.metadata.creationTime ? fmtDate(auth.metadata.creationTime) : '') +
    '<button type="button" class="btn btn-outline btn-sm" id="profile-signout">' + esc(t('profile.signOut')) + '</button>' +
  '</section>';

  const learningCard = '<section class="card sp-card">' +
    cardTitle(ICONS.lessons, 'profile.learningTitle') +
    '<div class="kpi-grid sp-kpis">' +
      kpiCard('lessons', 'dashboard.kpi.lessons', String(progress.completed || 0)) +
      kpiCard('streak', 'dashboard.kpi.streak', String((fp.quizStats && fp.quizStats.streak) || 0) + t('dashboard.streakUnit')) +
      kpiCard('xp', 'dashboard.kpi.xp', String((progress.completed || 0) * XP_PER_LESSON)) +
    '</div>' +
    '<div class="sp-progress"><span class="sp-row-label">' + t('dashboard.overallProgress') + '</span>' +
      '<div class="sp-bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100">' +
        '<span class="sp-bar-fill" style="width:' + pct + '%"></span></div>' +
      '<span class="sp-pct">' + pct + '%</span></div>' +
    '<a class="btn btn-solid btn-sm" href="#/dashboard">' + esc(t('academies.shell.backToHub')) + '</a>' +
  '</section>';

  const subCard = '<section class="card sp-card">' +
    cardTitle(ICONS.clock, 'profile.subscriptionTitle') +
    (sub
      ? fieldRow(t('profile.plan'), sub.plan) +
        fieldRow(t('profile.status'), sub.status) +
        fieldRow(t('profile.startDate'), fmtDate(sub.startDate)) +
        fieldRow(t('profile.endDate'), fmtDate(sub.endDate))
      : '<p class="ac-courses-empty">' + t('profile.subscriptionNone') + '</p>' +
        '<a class="btn btn-solid btn-sm" href="#/pricing">' + esc(t('academies.dashboard.seePricing')) + '</a>') +
  '</section>';

  const referralCard = '<section class="card sp-card">' +
    cardTitle(ICONS.xp, 'profile.referralTitle') +
    fieldRow(t('profile.referralCode'), prof.referralCode) +
    fieldRow(t('profile.referralCredit'), prof.referralCredit ? String(prof.referralCredit) + ' NGN' : '') +
    '<p class="sp-hint">' + t('profile.referralHint') + '</p>' +
  '</section>';

  let certList = '';
  if (certs.length) {
    certList = '<div class="academies student-live-list">';
    certs.slice(0, 5).forEach(function (c, i) {
      certList += '<div class="academy-row sl-row">' +
        '<span class="academy-num" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="academy-name">' + esc(c.title || 'ELA') + '</span>' +
        '<span class="academy-desc">' + esc(String(c.level || '')) + ' · ' + esc(fmtDate(c.issuedAt)) + '</span>' +
        '<span class="sl-cta">' +
          (c.pdfUrl ? '<a class="btn btn-outline btn-sm" href="' + esc(c.pdfUrl) + '" target="_blank" rel="noopener">' + esc(t('profile.viewPdf')) + '</a>' : '') +
        '</span></div>';
    });
    certList += '</div>';
  } else {
    certList = '<p class="ac-courses-empty">' + t('academies.certificates.empty') + '</p>';
  }

  const certsCard = '<section class="card sp-card sp-card-wide">' +
    '<div class="hub-top">' + cardTitle(ICONS.cert, 'profile.certificatesTitle') +
      '<span class="academy-status ' + (certs.length ? 'status-open' : 'status-soon') + '" role="status">' +
        t('profile.certsCount').replace('{n}', String(certs.length)) + '</span>' +
    '</div>' + certList +
  '</section>';

  return shell(
    '<header class="dashboard-header">' +
      '<h1><span class="student-kpi-icon" aria-hidden="true">' + ICONS.user + '</span> ' + t('profile.title') + '</h1>' +
      '<p>' + t('profile.subtitle') + '</p>' +
    '</header>' +
    '<div class="sp-grid">' + accountCard + learningCard + subCard + referralCard + certsCard + '</div>' +
    '<div id="profile-status" aria-live="polite"></div>'
  );
}

/* ---------- Entrée de page ---------- */

export function renderStudentProfile() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!window.ELA_FIREBASE_READY || !window.firebase || !firebase.auth || !firebase.functions) {
    app.innerHTML = msgState(ICONS.clock, t('common.loading'));
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) { app.innerHTML = signInState(); return; }

  app.innerHTML = msgState(ICONS.clock, t('common.loading'));

  callFunction('getDashboardData').then(function (d) {
    const fp = {
      subscription: (d && d.subscription) || null,
      progress: (d && d.progress) || { completed: 0, total: 0 },
      quizStats: (d && d.quizStats) || { streak: 0 },
      certificates: (d && d.certificates) || []
    };
    return getProfile().then(function (prof) {
      app.innerHTML = buildProfileHtml(user, fp, prof || { role: 'student' });
      bindProfileActions(app);
    });
  }).catch(function () {
    app.innerHTML = errorState();
    const retry = document.getElementById('profile-retry');
    if (retry) retry.addEventListener('click', function () { renderStudentProfile(); });
  });
}

function bindProfileActions(app) {
  const out = document.getElementById('profile-signout');
  if (out) {
    out.addEventListener('click', function () {
      out.disabled = true;
      firebase.auth().signOut().then(function () {
        window.location.hash = '#/';
      }).catch(function () {
        out.disabled = false;
        const zone = document.getElementById('profile-status');
        if (zone) zone.innerHTML = '<p class="ac-status-error" role="alert">' + esc(t('error.signOutFailed')) + '</p>';
      });
    });
  }
}