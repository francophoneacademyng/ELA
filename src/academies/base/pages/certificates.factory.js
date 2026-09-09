/* ============================================================
   ELA â€” academies/base/pages/certificates.factory.js
   Fabrique de la page Certificates d'une acadÃ©mie.
   Liste les certificats ELA Ã©mis pour cette acadÃ©mie (via
   listELACertificates â€” le filtrage par academyCode est cÃ´tÃ©
   serveur).
   ============================================================ */

import { mountShell } from '../../../shared/components/academy/academy-shell.js';
import { checkAcademyAccess } from '../../../shared/components/academy/academy-access.js';
import { callFunction } from '../../../js/core/api-client.js';
import { t } from '../../../js/core/i18n-helpers.js';
import { renderLockedView } from './dashboard.factory.js';

function statusLabel(status) {
  if (status === 'active') return t('admin.status.active');
  if (status === 'revoked') return t('admin.status.revoked');
  if (status === 'expired') return t('admin.status.expired');
  return String(status || 'â€”');
}

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
                '<span class="academy-num">â–</span>' +
                '<span class="academy-name">ELA ' + esc(c.academyCode) + ' Â· ' + esc(c.cecrLevel || '') + '</span>' +
                '<span class="academy-desc">' + esc(c.studentName || '') + ' Â· ' + esc(c.issueDate || '') + '</span>' +
                '<span class="academy-status status-open">' + statusLabel(c.status) + '</span>' +
              '</div>';
          });
          listHtml += '</div>';
        } else {
          listHtml = '<p class="ac-courses-empty">' + t('academies.certificates.empty') + '</p>';
        }
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'certificates',
          contentHtml: '<h3>' + t('academies.certificates.title') + '</h3>' + listHtml
        });
      }).catch(function () {
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'certificates',
          contentHtml: '<p class="ac-courses-empty">' + t('academies.certificates.unavailable') + '</p>'
        });
      });
    }).catch(function () {
      const app = document.getElementById('app');
      if (app) app.innerHTML = '<p class="ac-courses-empty">' + t('academies.loadError') + '</p>';
    });
  };
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
