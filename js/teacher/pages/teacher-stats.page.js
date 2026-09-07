/* ============================================================
   ELA - teacher/pages/teacher-stats.page.js
   Page « Mes statistiques » (/teacher/stats).
   KPIs issus du callable getTeacherStats (stats + recent) :
   contenus approuvés / en attente / répartis par type, et
   activité récente. Aucune donnée inventée.
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';

var TYPE_LABEL = { lesson: 'Leçon', quiz: 'Quiz', live: 'Live' };

export function renderTeacherStats() {
  renderTeacherShell({
    active: '#/teacher/stats',
    title: 'Mes statistiques 📊',
    subtitle: 'Votre activité sur la plateforme.',
    renderContent: function () {
      return '<div class="card" data-stats-box>' +
        '<div class="empty-state"><div class="empty-icon">⏳</div><p>Chargement…</p></div></div>';
    },
    onBind: function () {
      callFunction('getTeacherStats').then(function (r) {
        paint(r || {});
      }).catch(function () {
        toast('Impossible de charger vos statistiques.', 'error');
        paint({});
      });
    }
  });
}

function paint(r) {
  var box = document.querySelector('[data-stats-box]');
  if (!box) return;
  var s = r.stats || {};
  var recent = r.recent || [];
  var byType = s.byType || {};
  var total = (s.approved || 0) + (s.pending || 0) + (s.rejected || 0);

  var kpis =
    kpi('✅ Contenus approuvés', s.approved || 0) +
    kpi('⏳ En attente', s.pending || 0) +
    kpi('📦 Total soumis', total) +
    kpi('🔴 Classes Live', byType.live || 0);

  var recentHtml;
  if (!recent.length) {
    recentHtml = '<div class="empty-state"><div class="empty-icon">📊</div>' +
      '<p>Aucune activité enregistrée pour le moment.</p>' +
      '<p class="empty-sub">Créez votre premier contenu pour voir vos statistiques évoluer.</p></div>';
  } else {
    var rows = recent.map(function (x) {
      return '<tr><td>' + escapeHtml(x.title) + '</td>' +
        '<td>' + (TYPE_LABEL[x.type] || x.type || '—') + '</td>' +
        '<td>' + (x.createdAt ? formatDate(x.createdAt) : '—') + '</td>' +
        '<td>' + statusBadge(x.status) + '</td></tr>';
    }).join('');
    recentHtml = '<div class="table-responsive"><table class="data-table">' +
      '<thead><tr><th>Contenu</th><th>Type</th><th>Date</th><th>Statut</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  box.innerHTML = '<section class="kpi-grid" style="margin-bottom:1.5rem">' + kpis + '</section>' +
    '<section class="section-title">Activité récente</section>' + recentHtml;
}

function kpi(label, value) {
  return '<div class="kpi-card"><span class="kpi-label">' + label + '</span>' +
    '<div class="kpi-value">' + value + '</div><div class="kpi-delta">—</div></div>';
}

function statusBadge(status) {
  var map = { pending: ['badge-wait', 'En attente'], approved: ['badge-ok', 'Approuvé'], rejected: ['badge-ko', 'Rejeté'] };
  var m = map[status] || ['badge-muted', status || '—'];
  return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
}