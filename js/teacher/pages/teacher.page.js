/* ============================================================
   ELA - teacher/pages/teacher.page.js  (REFONTE PRODUCTION)
   Espace enseignant : sidebar + header + bannière académie
   (branding) + KPIs + actions rapides (pages séparées) +
   mes soumissions. Formulaire déplacé sur des pages séparées.
   ============================================================ */

import { requireTeacher, getProfile } from '../../core/auth.service.js';
import { afterRender, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { getState, setState, reset } from '../services/teacher-state.js';
import { refreshSubmissions } from '../services/submission.service.js';
import { formatDate, escapeHtml } from '../../core/dom.js';
import { ACADEMIES, codeFromKey } from '../../../src/shared/config/academies.config.js';

var TYPE_LABEL = { lesson: 'Leçon', quiz: 'Quiz', live: 'Live' };

var ACADEMY_CARDS = {
  FR: { flag: '🇫🇷', name: 'Francophone Academy', sub: 'Français · CECRL' },
  DE: { flag: '🇩🇪', name: 'Germanophone Academy', sub: 'Deutsch · Goethe-Zertifikat' },
  ZH: { flag: '🇨🇳', name: 'Sinophone Academy', sub: '中文 · HSK' },
  EN: { flag: '🇬🇧', name: 'Anglophone Pro Academy', sub: 'English · IELTS' },
  AR: { flag: '🇸🇦', name: 'Arabophone Academy', sub: 'العربية · ALPT' },
  RU: { flag: '🇷🇺', name: 'Russophone Academy', sub: 'Русский · TORFL' }
};

export function renderTeacherPage() {
  var app = document.getElementById('app');
  if (!app) return;
  requireTeacher().then(function (guard) {
    if (!guard.ok) {
      app.innerHTML = '<div class="dashboard-layout"><main class="main-content">' +
        '<div class="empty-state"><div class="empty-icon">🔒</div>' +
        '<p>Accès réservé aux enseignants et administrateurs.</p>' +
        '<p style="margin-top:12px"><a class="btn btn-solid" href="#/login">Se connecter</a></p>' +
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
    ? (kpiApproved + ' approuvés / ' + kpiTotal)
    : 'Aucune soumission';
  var teacherLevel = (s.profile && s.profile.level) || 'A1';
  var teacherLevelName = levelNameFor(teacherLevel, s.profile);

  var subRows = recent.map(function (r) {
    return '<tr><td><span class="user-name">' + escapeHtml(r.title) + '</span></td>' +
      '<td>' + (TYPE_LABEL[r.type] || r.type) + '</td>' +
      '<td>' + (r.createdAt ? formatDate(r.createdAt) : '—') + '</td>' +
      '<td>' + statusBadge(r.status) + '</td></tr>';
  }).join('');

  var subTable = '<div class="table-responsive"><table class="data-table" id="teacher-submissions-table">' +
    '<thead><tr><th>Contenu</th><th>Type</th><th>Date</th><th>Statut</th></tr></thead>' +
    '<tbody>' + subRows + '</tbody></table></div>';
  var subEmpty = '<div class="empty-state" id="teacher-submissions-empty">' +
    '<div class="empty-icon">📭</div>' +
    '<p>Aucune soumission pour le moment.</p>' +
    '<p class="empty-sub">Commencez par créer votre première leçon !</p></div>';

  app.innerHTML =
    '<div class="dashboard-layout">' +
      '<aside class="sidebar">' +
        '<div class="sidebar-brand">ELA Enseignant</div>' +
        '<nav class="sidebar-nav">' +
          '<a href="#/teacher" class="nav-item active">🏠 Tableau de bord</a>' +
          '<div class="nav-section">Contenu</div>' +
          '<a href="#/teacher/courses" class="nav-item">📚 Mes cours</a>' +
          '<a href="#/teacher/quizzes" class="nav-item">📝 Mes quiz</a>' +
          '<a href="#/teacher/live" class="nav-item">🔴 Mes classes Live</a>' +
          '<div class="nav-section">Gestion</div>' +
          '<a href="#/teacher/students" class="nav-item">👥 Mes étudiants</a>' +
          '<a href="#/teacher/stats" class="nav-item">📊 Statistiques</a>' +
          '<div class="nav-section">Compte</div>' +
          '<a href="#/teacher/profile" class="nav-item">⚙️ Mon profil</a>' +
        '</nav>' +
      '</aside>' +
      '<main class="main-content">' +
        '<header class="dashboard-header"><h1>Bonjour, <span id="teacher-name">' +
          escapeHtml((s.profile && (s.profile.displayName || 'Enseignant')) || 'Enseignant') + '</span> 👋</h1>' +
          '<p>Bienvenue dans votre espace enseignant.</p></header>' +
        '<div class="card academy-banner">' +
          '<div class="academy-banner-flag">' + ac.flag + '</div>' +
          '<div class="academy-banner-info"><h2>' + ac.name + '</h2>' +
          '<p id="teacher-academy-sub">' + ac.sub + '</p></div>' +
        '</div>' +
        '<section class="kpi-grid">' +
          kpiCard('📚 Cours publiés', kpiCourses) +
          kpiCard('⏳ En attente', kpiPending) +
          kpiCard('👥 Élèves', '—') +
          kpiCard('🔴 Classes Live', kpiLive) +
        '</section>' +
        '<section class="section-title">Mes statistiques</section>' +
        '<div class="kpi-grid">' +
          kpiCard('📈 Progression globale', kpiProgress + '%', kpiProgressLabel) +
          kpiCard('✅ Contenus approuvés', kpiApproved) +
          kpiCard('📊 Soumissions totales', kpiTotal) +
          kpiCard('🎯 Niveau actuel', teacherLevel, teacherLevelName) +
        '</div>' +
        '<section class="section-title">Actions rapides</section>' +
        '<div class="action-bar">' +
          '<a class="btn-primary" href="#/teacher/lesson/new">+ Créer une leçon</a>' +
          '<a class="btn-primary" href="#/teacher/quiz/new">+ Créer un quiz</a>' +
          '<a class="btn-primary" href="#/teacher/live/new">+ Créer une classe Live</a>' +
          '<a class="btn-secondary" href="#/teacher/courses">📚 Voir mes cours</a>' +
        '</div>' +
        '<section class="section-title">Mes soumissions</section>' +
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
  var ac = ACADEMY_CARDS[code] || null;
  if (ac) return ac;
  // Fallback : config branding complète via ACADEMIES (sinon neutre).
  var a2 = ACADEMIES[code];
  if (a2) return { flag: a2.flag, name: a2.label, sub: a2.native + ' · ' + a2.certification };
  return { flag: '🌍', name: 'Academy', sub: 'E-Learn Language Academy' };
}

function statusBadge(status) {
  var map = { pending: ['badge-wait', 'En attente'], approved: ['badge-ok', 'Approuvé'], rejected: ['badge-ko', 'Rejeté'] };
  var m = map[status] || ['badge-muted', status || '—'];
  return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
}