/* ============================================================
   ELA - admin/pages/admin-certificates.page.js
   Page « Certifications » (/admin/certificates).
   - Vérificateur : input + bouton → CertificateRepository.getById
     (lecture admin autorisée par firestore.rules).
   - Table des certificats : réutilise la section existante
     (callable listELACertificates + filtres + révocation).
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { certificationsHtml, bindCertificationsEvents, loadCertifications } from './sections/certifications.js';
import { CertificateRepository } from '../../../src/ela/certification/repositories/CertificateRepository.js';

export function renderAdminCertificates() {
  renderAdminShell({
    active: '#/admin/certificates',
    title: t('admin.certs.title'),
    subtitle: t('admin.certs.subtitle'),
    needsData: false,
    renderContent: function () { return layoutHtml(); },
    onBind: function (app) {
      bindCertificationsEvents(app);
      bindVerifier(app);
    }
  });
}

function layoutHtml() {
  return '' +
    '<section class="section-title">' + t('admin.certs.verifySection') + '</section>' +
    '<div class="card">' +
      '<div style="display:flex;gap:0.6rem;flex-wrap:wrap;align-items:center">' +
        '<input type="text" id="ela-verify-id" class="input" style="max-width:340px" ' +
          'placeholder="' + t('admin.certs.verifyPlaceholder') + '" aria-label="' + t('admin.certs.verifyPlaceholder') + '">' +
        '<button class="btn btn-solid btn-sm" id="ela-verify-btn">' + t('admin.certs.verify') + '</button>' +
      '</div>' +
      '<div id="ela-verify-result" style="margin-top:0.8rem"></div>' +
    '</div>' +
    '<section class="section-title">' + t('admin.certs.issuedSection') + '</section>' +
    certificationsHtml();
}

function bindVerifier(app) {
  var btn = document.getElementById('ela-verify-btn');
  var input = document.getElementById('ela-verify-id');
  var out = document.getElementById('ela-verify-result');
  if (!btn || !input || !out) return;

  function run() {
    var id = (input.value || '').trim();
    if (!id) { toast(t('admin.certs.verifyEmpty'), 'error'); return; }
    out.innerHTML = '<p class="muted">' + t('admin.certs.verifying') + '</p>';
    CertificateRepository.getById(id).then(function (data) {
      if (!data) {
        out.innerHTML = '<div class="empty-state"><div class="empty-icon">❌</div>' +
          '<p>' + t('admin.certs.verifyNotFound').replace('{id}', escapeHtml(id)) + '</p></div>';
        return;
      }
      var status = String(data.status || 'active');
      var statusLabel = status === 'active' ? t('admin.status.active')
        : status === 'revoked' ? t('admin.status.revoked')
        : status === 'expired' ? t('admin.status.expired') : escapeHtml(status);
      var badge = status === 'active' ? '<span class="badge badge-ok">' + statusLabel + '</span>'
        : status === 'revoked' ? '<span class="badge badge-ko">' + statusLabel + '</span>'
        : '<span class="badge badge-muted">' + statusLabel + '</span>';
      out.innerHTML = '<div class="table-responsive"><table class="data-table">' +
        '<thead><tr><th>ID</th><th>' + t('admin.certs.student') + '</th><th>' + t('admin.certs.academy') + '</th><th>' + t('admin.certs.level') + '</th><th>' + t('admin.certs.status') + '</th></tr></thead>' +
        '<tbody><tr><td>' + escapeHtml(data.id || id) + '</td>' +
        '<td><span class="user-name">' + escapeHtml(data.studentName || data.studentId || '—') + '</span></td>' +
        '<td>' + escapeHtml(data.academyCode || '—') + '</td>' +
        '<td>' + escapeHtml(data.level || data.cecrl || '—') + '</td>' +
        '<td>' + badge + '</td></tr></tbody></table></div>';
    }).catch(function (err) {
      console.warn('[admin-certificates] vérification échouée :', err && (err.code || err.message));
      out.innerHTML = '<div class="empty-state"><div class="empty-icon">📡</div>' +
        '<h3>' + t('admin.certs.unavailableTitle') + '</h3>' +
        '<p>' + t('admin.certs.unavailableBody') + '</p></div>';
    });
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
}