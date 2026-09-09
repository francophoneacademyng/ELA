/* ============================================================
   ELA - teacher/pages/teacher.page.js  (REFONTE PRODUCTION)
   Espace enseignant : sidebar + header + bannière académie
   (branding) + KPIs + actions rapides (pages séparées) +
   mes soumissions. Formulaire déplacé sur des pages séparées.
   ============================================================ */

import { requireTeacher, getProfile } from '../../core/auth.service.js';
import { afterRender, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { t } from '../../core/i18n-helpers.js';
import { getState, setState, reset } from '../services/teacher-state.js';
import { refreshSubmissions } from '../services/submission.service.js';
import { formatDate, escapeHtml } from '../../core/dom.js';
import { ACADEMIES, codeFromKey } from '../../../src/shared/config/academies.config.js';

var ACADEMY_OPT = { FR: 'francophone', DE: 'germanophone', ZH: 'sinophone', EN: 'anglophone', AR: 'arabophone', RU: 'russophone' };
var ACADEMY_FLAG = { FR: '🇫🇷', DE: '🇩🇪', ZH: '🇨🇳', EN: '🇬🇧', AR: '🇸🇦', RU: '🇷🇺' };

function academyName(code) {
  var opt = ACADEMY_OPT[code];
  return opt ? t('academies.option.' + opt) : (code || '');
}

function typeLabel(type) {
  var key = type === 'lesson' ? 'teacher.type.lesson' : type === 'quiz' ? 'teacher.type.quiz' : type === 'live' ? 'teacher.type.live' : null;
  return key ? t(key) : (type || '—');
}

export function renderTeacherPage() {
  var app = document.getElementById('app');
  if (!app) return;
  requireTeacher().then(function (guard) {
    if (!guard.ok) {
      app.innerHTML = '<div class="dashboard-layout"><main class="main-content">' +
        '<div class="empty-state"><div class="empty-icon">🔒</div>' +
        '<p>' + t('teacher.gate.body') + '</p>' +
        '<p style="margin-top:12px"><a class="btn btn-solid" href="#/login">' + t('nav.login') + '</a></p>' +
        '</div></main></div>';
      afterRender('');
      return;
    }
    setState({ profile: guard.profile });
    paint();
    refreshSubmissions();
    callFunction('getTeacherStats').then(function (r) {
      setState({ teacherStats: r });
      paint();
    }).catch(function (e) {
      console.error('[teacher] getTeacherStats échoué :', e);
      paint();
    });
  });
}
function paint() {
  var app = document.getElementById('app');
  if (!app) return;
  var s = getState();
  var ac = academyInfo(s.profile);
  var stats = s.teacherStats && s.teacherStats.stats;
  var recent = (s.teacherStats && s.teacherStats.recent) || [];

  var kpiCourses = stats ? (stats.approved || 0) : '—';
  var kpiPending = stats ? (stats.pending || 0) : '—';
  var kpiLive = stats ? (stats.byType && stats.byType.live || 0) : '—';

  /* --- Progression réelle de l'enseignant (getTeacherStats) --- */
  var kpiTotal = stats ? (stats.total || 0) : 0;
  var kpiApproved = stats ? (stats.approved || 0) : 0;
  var kpiProgress = kpiTotal ? Math.round((kpiApproved / kpiTotal) * 100) : 0;
  var kpiProgressLabel = kpiTotal
    ? t('teacher.dashboard.progressLabel').replace('{approved}', kpiApproved).replace('{total}', kpiTotal)
    : t('teacher.dashboard.noSubmissions');
  var teacherLevel = (s.profile && s.profile.level) || 'A1';
  var teacherLevelName = levelNameFor(teacherLevel, s.profile);

  var subRows = recent.map(function (r) {
    return '<tr><td><span class="user-name">' + escapeHtml(r.title) + '</span></td>' +
      '<td>' + typeLabel(r.type) + '</td>' +
      '<td>' + (r.createdAt ? formatDate(r.createdAt) : '—') + '</td>' +
      '<td>' + statusBadge(r.status) + '</td></tr>';
  }).join('');

  var subTable = '<div class="table-responsive"><table class="data-table" id="teacher-submissions-table">' +
    '<thead><tr><th>' + t('admin.content.col.title') + '</th><th>' + t('admin.content.col.type') + '</th><th>' + t('admin.col.date') + '</th><th>' + t('admin.col.status') + '</th></tr></thead>' +
    '<tbody>' + subRows + '</tbody></table></div>';
  var subEmpty = '<div class="empty-state" id="teacher-submissions-empty">' +
    '<div class="empty-icon">📭</div>' +
    '<p>' + t('teacher.noContent') + '</p>' +
    '<p class="empty-sub">' + t('teacher.dashboard.emptyCTA') + '</p></div>';

  app.innerHTML =
    '<div class="dashboard-layout">' +
      '<aside class="sidebar">' +
        '<div class="sidebar-brand">' + t('teacher.sidebar.brand') + '</div>' +
        '<nav class="sidebar-nav">' +
          '<a href="#/teacher" class="nav-item active">🏠 ' + t('teacher.sidebar.dashboard') + '</a>' +
          '<div class="nav-section">' + t('teacher.navGroup.content') + '</div>' +
          '<a href="#/teacher/courses" class="nav-item">📚 ' + t('teacher.sidebar.courses') + '</a>' +
          '<a href="#/teacher/quizzes" class="nav-item">📝 ' + t('teacher.sidebar.quizzes') + '</a>' +
          '<a href="#/teacher/live" class="nav-item">🔴 ' + t('teacher.sidebar.live') + '</a>' +
          '<div class="nav-section">' + t('teacher.navGroup.management') + '</div>' +
          '<a href="#/teacher/students" class="nav-item">👥 ' + t('teacher.sidebar.students') + '</a>' +
          '<a href="#/teacher/stats" class="nav-item">📊 ' + t('teacher.sidebar.stats') + '</a>' +
          '<div class="nav-section">' + t('teacher.navGroup.account') + '</div>' +
          '<a href="#/teacher/profile" class="nav-item">⚙️ ' + t('teacher.sidebar.profile') + '</a>' +
        '</nav>' +
      '</aside>' +
      '<main class="main-content">' +
        '<header class="dashboard-header"><h1>' +
          t('teacher.dashboard.hello').replace('{name}', escapeHtml((s.profile && (s.profile.displayName || '')) || t('admin.teacher'))) + '</h1>' +
          '<p>' + t('teacher.dashboard.subtitle') + '</p></header>' +
        '<div class="card academy-banner">' +
          '<div class="academy-banner-flag">' + ac.flag + '</div>' +
          '<div class="academy-banner-info"><h2>' + academyName(ac.code) + '</h2>' +
          '<p id="teacher-academy-sub">' + ac.sub + '</p></div>' +
        '</div>' +
        '<section class="kpi-grid">' +
          kpiCard('📚 ' + t('teacher.dashboard.kpi.published'), kpiCourses) +
          kpiCard('⏳ ' + t('teacher.dashboard.kpi.pending'), kpiPending) +
          kpiCard('👥 ' + t('teacher.dashboard.kpi.students'), '—') +
          kpiCard('🔴 ' + t('teacher.dashboard.kpi.live'), kpiLive) +
        '</section>' +
        '<section class="section-title">' + t('teacher.dashboard.section.stats') + '</section>' +
        '<div class="kpi-grid">' +
          kpiCard('📈 ' + t('dashboard.overallProgress'), kpiProgress + '%', kpiProgressLabel) +
          kpiCard('✅ ' + t('teacher.dashboard.kpi.approved'), kpiApproved) +
          kpiCard('📊 ' + t('teacher.dashboard.kpi.total'), kpiTotal) +
          kpiCard('🎯 ' + t('teacher.dashboard.kpi.level'), teacherLevel, teacherLevelName) +
        '</div>' +
        '<section class="section-title">' + t('teacher.dashboard.quickActions') + '</section>' +
        '<div class="action-bar">' +
          '<a class="btn-primary" href="#/teacher/lesson/new">' + t('teacher.dashboard.newLesson') + '</a>' +
          '<a class="btn-primary" href="#/teacher/quiz/new">' + t('teacher.dashboard.newQuiz') + '</a>' +
          '<a class="btn-primary" href="#/teacher/live/new">' + t('teacher.dashboard.newLive') + '</a>' +
          '<a class="btn-secondary" href="#/teacher/courses">' + t('teacher.dashboard.viewCourses') + '</a>' +
        '</div>' +
        '<section class="section-title">' + t('teacher.myContent') + '</section>' +
        '<div class="card">' + (recent.length ? subTable : subEmpty) + '</div>' +
      '</main>' +
    '</div>';

  afterRender('teacher');
}
function kpiCard(label, value, delta) {
  return '<div class="kpi-card"><span class="kpi-label">' + label + '</span>' +
    '<div class="kpi-value">' + value + '</div>' +
    '<div class="kpi-delta">' + (delta || '—') + '</div></div>';
}

/** Nom lisible du niveau (Beginner / Intermediate…) depuis la config académie. */
function levelNameFor(level, profile) {
  var key = profile && profile.academy;
  var code = codeFromKey(key) || String(key || '').toUpperCase();
  var a = ACADEMIES[code];
  if (a && a.levelNames && a.levelNames[level]) return a.levelNames[level];
  return level === 'A1' ? 'Beginner' : '—';
}

function academyInfo(profile) {
  var key = profile && profile.academy;
  var code = (codeFromKey(key) || String(key || '').toUpperCase());
  var ac = ACADEMIES[code];
  if (ac) return { code: code, flag: ACADEMY_FLAG[code] || ac.flag || '🌍', sub: ac.native + ' · ' + ac.certification };
  return { code: '', flag: '🌍', sub: t('teacher.profile.notAssigned') };
}

function statusBadge(status) {
  var map = {
    pending: ['badge-wait', t('teacher.status.pending')],
    approved: ['badge-ok', t('teacher.status.approved')],
    rejected: ['badge-ko', t('teacher.status.rejected')]
  };
  var m = map[status] || ['badge-muted', String(status || '—')];
  return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
}
