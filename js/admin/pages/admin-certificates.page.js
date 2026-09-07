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
import { certificationsHtml, bindCertificationsEvents, loadCertifications } from './sections/certifications.js';
import { CertificateRepository } from '../../../src/ela/certification/repositories/CertificateRepository.js';

export function renderAdminCertificates() {
  renderAdminShell({
    active: '#/admin/certificates',
    title: 'Certifications 🏆',
    subtitle: 'Certificats ELA délivrés et vérification publique.',
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
    '<section class="section-title">Vérifier un certificat</section>' +
    '<div class="card">' +
      '<div style="display:flex;gap:0.6rem;flex-wrap:wrap;align-items:center">' +
        '<input type="text" id="ela-verify-id" class="input" style="max-width:340px" ' +
          'placeholder="Identifiant du certificat (ex : ELA-…)" aria-label="Identifiant du certificat">' +
        '<button class="btn btn-solid btn-sm" id="ela-verify-btn">Vérifier</button>' +
      '</div>' +
      '<div id="ela-verify-result" style="margin-top:0.8rem"></div>' +
    '</div>' +
    '<section class="section-title">Certificats émis</section>' +
    certificationsHtml();
}

function bindVerifier(app) {
  var btn = document.getElementById('ela-verify-btn');
  var input = document.getElementById('ela-verify-id');
  var out = document.getElementById('ela-verify-result');
  if (!btn || !input || !out) return;

  function run() {
    var id = (input.value || '').trim();
    if (!id) { toast('Saisissez un identifiant de certificat.', 'error'); return; }
    out.innerHTML = '<p class="muted">Vérification en cours…</p>';
    CertificateRepository.getById(id).then(function (data) {
      if (!data) {
        out.innerHTML = '<div class="empty-state"><div class="empty-icon">❌</div>' +
          '<p>Aucun certificat trouvé pour « ' + escapeHtml(id) + ' ».</p></div>';
        return;
      }
      var status = String(data.status || 'active');
      var badge = status === 'active' ? '<span class="badge badge-ok">Actif</span>'
        : status === 'revoked' ? '<span class="badge badge-ko">Révoqué</span>'
        : '<span class="badge badge-muted">' + escapeHtml(status) + '</span>';
      out.innerHTML = '<div class="table-responsive"><table class="data-table">' +
        '<thead><tr><th>ID</th><th>Étudiant</th><th>Académie</th><th>Niveau</th><th>Statut</th></tr></thead>' +
        '<tbody><tr><td>' + escapeHtml(data.id || id) + '</td>' +
        '<td>' + escapeHtml(data.studentName || data.studentId || '—') + '</td>' +
        '<td>' + escapeHtml(data.academyCode || '—') + '</td>' +
        '<td>' + escapeHtml(data.level || data.cecrl || '—') + '</td>' +
        '<td>' + badge + '</td></tr></tbody></table></div>';
    }).catch(function (err) {
      console.warn('[admin-certificates] vérification échouée :', err && (err.code || err.message));
      out.innerHTML = '<div class="empty-state"><div class="empty-icon">📡</div>' +
        '<h3>Vérification momentanément indisponible</h3>' +
        '<p>Le service ne répond pas pour le moment. Réessayez dans quelques instants.</p></div>';
    });
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
}