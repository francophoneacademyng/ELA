/* ============================================================
   ELA — academies/base/pages/certificates.factory.js
   Fabrique de la page Certificates d'une académie.
   Liste les certificats ELA émis pour cette académie (via
   listELACertificates — le filtrage par academyCode est côté
   serveur).
   ============================================================ */

import { mountShell } from '../../../shared/components/academy/academy-shell.js';
import { checkAcademyAccess } from '../../../shared/components/academy/academy-access.js';
import { callFunction } from '../../../js/core/api-client.js';
import { renderLockedView } from './dashboard.factory.js';

export function createCertificatesPage(code) {
  return function renderAcademyCertificates() {
    checkAcademyAccess(code).then(function (access) {
      if (!access.allowed) { renderLockedView(document.getElementById('app'), access.academy); return; }
      const a = access.academy;

      callFunction('listELACertificates').then(function (r) {
        const all = (r && r.certificates) || [];
        const certs = all.filter(function (c) { return String(c.academyCode).toUpperCase() === code; });
        let listHtml;
        if (certs.length) {
          listHtml = '<div class="academies">';
          certs.forEach(function (c) {
            listHtml += '' +
              '<div class="academy-row" style="pointer-events:none">' +
                '<span class="academy-num">❖</span>' +
                '<span class="academy-name">ELA ' + esc(c.academyCode) + ' · ' + esc(c.cecrLevel || '') + '</span>' +
                '<span class="academy-desc">' + esc(c.studentName || '') + ' · ' + esc(c.issueDate || '') + '</span>' +
                '<span class="academy-status status-open">' + esc(c.status || 'active') + '</span>' +
              '</div>';
          });
          listHtml += '</div>';
        } else {
          listHtml = '<p class="ac-courses-empty">No certificate yet — pass a quiz with 80% to earn your first one.</p>';
        }
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'certificates',
          contentHtml: '<h3>Your Certificates</h3>' + listHtml
        });
      }).catch(function () {
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'certificates',
          contentHtml: '<p class="ac-courses-empty">Certificates unavailable at the moment.</p>'
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
