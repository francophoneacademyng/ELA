/* ============================================================
   ELA — academies/base/pages/live.factory.js
   Fabrique de la page Live Classes d'une académie.
   ============================================================ */

import { mountShell } from '../../../shared/components/academy/academy-shell.js';
import { checkAcademyAccess } from '../../../shared/components/academy/academy-access.js';
import { callFunction } from '../../../js/core/api-client.js';
import { renderLockedView } from './dashboard.factory.js';

function fmtDate(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
  catch (e) { return ''; }
}

export function createLivePage(code) {
  return function renderAcademyLive() {
    checkAcademyAccess(code).then(function (access) {
      if (!access.allowed) { renderLockedView(document.getElementById('app'), access.academy); return; }
      const a = access.academy;

      callFunction('getLiveCatalog').then(function (r) {
        const all = (r && r.classes) || [];
        const classes = all.filter(function (c) { return c.academy === a.key; });
        let listHtml;
        if (classes.length) {
          listHtml = '<div class="academies">';
          classes.forEach(function (c) {
            listHtml += '' +
              '<div class="academy-row" style="pointer-events:none">' +
                '<span class="academy-num">📅</span>' +
                '<span class="academy-name">' + esc(c.title) + '</span>' +
                '<span class="academy-desc">' + fmtDate(c.scheduledAt) + '</span>' +
                '<span class="academy-status status-open">Live</span>' +
              '</div>';
          });
          listHtml += '</div>';
        } else {
          listHtml = '<p class="ac-courses-empty">No upcoming live class for this academy. Check back soon.</p>';
        }
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'live',
          contentHtml: '<h3>Live Classes</h3>' + listHtml
        });
      }).catch(function () {
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'live',
          contentHtml: '<p class="ac-courses-empty">Live classes indisponibles pour le moment.</p>'
        });
      });
    });
  };
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
