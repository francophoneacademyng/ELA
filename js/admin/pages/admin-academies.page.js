/* ============================================================
   ELA - admin/pages/admin-academies.page.js
   Page « Académies » (/admin/academies).
   Les 6 cartes académies + stats (utilisateurs & classes live)
   par académie. Données via getAdminPanelData.
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml } from '../../core/dom.js';
import { getState } from '../services/admin-state.js';
import { ACADEMY_ORDER, ACADEMIES, codeFromKey } from '../../../src/shared/config/academies.config.js';

export function renderAdminAcademies() {
  renderAdminShell({
    active: '#/admin/academies',
    title: 'Gestion des académies 🎓',
    subtitle: 'Vue d\'ensemble des 6 académies immersives ELA.',
    renderContent: function (s) {
      const stats = {};
      ACADEMY_ORDER.forEach(function (c) { stats[c] = { users: 0, live: 0 }; });
      (s.users || []).forEach(function (u) {
        const c = normalize(u.academy);
        if (stats[c]) stats[c].users++;
      });
      (s.liveClasses || []).forEach(function (l) {
        const c = normalize(l.academy);
        if (stats[c]) stats[c].live++;
      });

      const cards = ACADEMY_ORDER.map(function (code) {
        const a = ACADEMIES[code];
        if (!a) return '';
        return '<div class="academy-card" style="border-left-color:' + a.color + '">' +
          '<span class="ac-flag">' + a.flag + '</span>' +
          '<h3>' + escapeHtml(a.label) + '</h3>' +
          '<p>' + escapeHtml(a.native) + ' · ' + escapeHtml(a.certification) + '</p>' +
          '<div class="kpi-delta" style="margin-top:8px">👥 ' + stats[code].users +
            ' · 🔴 ' + stats[code].live + '</div>' +
        '</div>';
      }).join('');

      return '<div class="academy-grid">' + cards + '</div>' +
        '<section class="section-title">Résumé</section>' +
        '<div class="kpi-grid">' +
          kpi('Total utilisateurs', s.users.length) +
          kpi('Classes live à venir', (s.liveClasses || []).filter(function (l) { return l.isUpcoming(); }).length) +
          kpi('Abonnements', s.subscriptions.length) +
        '</div>';
    }
  });
}

function normalize(key) {
  return codeFromKey(key) || String(key || '').toUpperCase();
}

function kpi(label, value) {
  return '<div class="kpi-card"><span class="kpi-label">' + label + '</span>' +
    '<div class="kpi-value">' + value + '</div><div class="kpi-delta">—</div></div>';
}