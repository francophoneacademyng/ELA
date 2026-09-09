/* ============================================================
   ELA — admin/pages/sections/certifications.js
   ------------------------------------------------------------
   Section "Certifications" du panel admin ELA : table
   ela_certificates (via callable listELACertificates — jamais
   Firestore direct), filtres academy/status, pagination,
   révocation avec modal "Motif" (callable revokeELACertificate).
   ============================================================ */

import { callFunction } from '../../../core/api-client.js';
import { t } from '../../../core/i18n-helpers.js';

const PAGE_SIZE = 15;
const certState = { items: [], nextCursor: null, academy: '', status: '', loading: false };

export function certificationsHtml() {
  return '<div class="card" style="padding:1rem 1.3rem;margin-bottom:1.5rem">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.6rem">' +
      '<h3 style="margin:0;color:var(--forest)">' + t('admin.certs.title') + '</h3>' +
      '<div style="display:flex;gap:0.5rem;align-items:center">' +
        '<select id="ela-cert-filter-academy" class="input" style="padding:0.35rem 0.5rem">' +
          '<option value="">' + t('admin.certs.allAcademies') + '</option>' +
          '<option value="FR">FR — ' + t('admin.certs.francophone') + '</option>' +
          '<option value="EN">EN</option><option value="DE">DE</option>' +
          '<option value="ZH">ZH</option><option value="AR">AR</option><option value="RU">RU</option>' +
        '</select>' +
        '<select id="ela-cert-filter-status" class="input" style="padding:0.35rem 0.5rem">' +
          '<option value="">' + t('admin.certs.allStatuses') + '</option>' +
          '<option value="active">' + t('admin.status.active') + '</option>' +
          '<option value="revoked">' + t('admin.status.revoked') + '</option>' +
          '<option value="expired">' + t('admin.status.expired') + '</option>' +
        '</select>' +
        '<button type="button" class="btn btn-outline btn-sm" id="ela-cert-refresh">' + t('admin.refresh') + '</button>' +
      '</div>' +
    '</div>' +
    '<div id="ela-cert-table"></div>' +
    '<div style="margin-top:0.7rem;text-align:right">' +
      '<button type="button" class="btn btn-outline btn-sm" id="ela-cert-more" style="display:none">' + t('admin.certs.more') + '</button>' +
    '</div>' +
    /* Modal révocation (motif obligatoire) */
    '<div id="ela-cert-revoke-modal" style="display:none;position:fixed;inset:0;background:rgba(6,61,44,0.55);z-index:60;align-items:center;justify-content:center">' +
      '<div class="card" style="max-width:420px;width:92%;padding:1.3rem">' +
        '<h4 style="margin:0 0 0.4rem;color:var(--forest)">' + t('admin.certs.revokeTitle') + '</h4>' +
        '<p style="font-size:0.85rem;color:var(--muted);margin:0 0 0.6rem"><span id="ela-cert-revoke-id"></span></p>' +
        '<textarea id="ela-cert-revoke-reason" class="input" rows="3" style="width:100%" placeholder="' + t('admin.certs.reasonPlaceholder') + '"></textarea>' +
        '<p id="ela-cert-revoke-error" style="color:#b3261e;font-size:0.8rem;margin:0.3rem 0 0;display:none"></p>' +
        '<div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:0.8rem">' +
          '<button type="button" class="btn btn-outline btn-sm" id="ela-cert-revoke-cancel">' + t('admin.certs.cancel') + '</button>' +
          '<button type="button" class="btn btn-solid btn-sm" id="ela-cert-revoke-confirm">' + t('admin.certs.confirmRevoke') + '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/** Charge et rend la table (filtres + pagination). */
export function loadCertifications(append) {
  const table = document.getElementById('ela-cert-table');
  if (!table || certState.loading) return;
  certState.loading = true;
  if (!append) table.innerHTML = '<div class="skeleton" style="height:120px"></div>';

  callFunction('listELACertificates', {
    pageSize: PAGE_SIZE,
    academyCode: certState.academy || undefined,
    status: certState.status || undefined
  }).then(function (res) {
    certState.loading = false;
    certState.items = append ? certState.items.concat(res.items || []) : (res.items || []);
    certState.nextCursor = (res && res.nextCursor) || null;
    renderTable();
  }).catch(function (err) {
    certState.loading = false;
    // Erreur réseau/permissions : état calme avec réessai (pas de ⚠️).
    table.innerHTML =
      '<div class="empty-state"><div class="empty-icon">📡</div>' +
      '<h3>Certificats momentanément indisponibles</h3>' +
      '<p>Le service met plus de temps que prévu à répondre.</p>' +
      '<button class="btn btn-outline btn-sm" id="ela-cert-retry">🔄 Réessayer</button></div>';
    const retry = document.getElementById('ela-cert-retry');
    if (retry) retry.addEventListener('click', function () { loadCertifications(false); });
  });
}
function renderTable() {
  const table = document.getElementById('ela-cert-table');
  const more = document.getElementById('ela-cert-more');
  if (!table) return;
  if (!certState.items.length) {
    table.innerHTML = '<p class="muted" style="font-size:0.85rem;padding:0.6rem 0">' + t('admin.certs.empty') + '</p>';
    if (more) more.style.display = 'none';
    return;
  }
  const rows = certState.items.map(function (c) {
    const statusLabel = c.status === 'active' ? t('admin.status.active')
      : c.status === 'revoked' ? t('admin.status.revoked')
      : c.status === 'expired' ? t('admin.status.expired') : esc(c.status || '');
    const pill = c.status === 'active'
      ? '<span class="badge badge-emerald">' + statusLabel + '</span>'
      : c.status === 'revoked'
        ? '<span class="badge badge-red">' + statusLabel + '</span>'
        : '<span class="badge badge-gold">' + statusLabel + '</span>';
    return '<tr>' +
      '<td style="font-family:monospace;font-size:0.78rem">' + esc(c.id) + '</td>' +
      '<td><span class="user-name">' + esc(c.studentName) + '</span></td>' +
      '<td>' + esc(c.academyLabel || c.academyCode || '') + '</td>' +
      '<td>' + esc(c.cecrLevel || '') + '</td>' +
      '<td>' + esc(c.certificateType || '') + '</td>' +
      '<td>' + esc(c.issueDate || '') + '</td>' +
      '<td>' + pill + '</td>' +
      '<td style="white-space:nowrap">' +
        (c.pdfUrl ? '<a class="btn btn-outline btn-sm" href="' + esc(c.pdfUrl) + '" target="_blank" rel="noopener">PDF</a> ' : '') +
        (c.status === 'active'
          ? '<button type="button" class="btn btn-solid btn-sm" data-revoke="' + esc(c.id) + '">' + t('admin.certs.revoke') + '</button>'
          : '') +
      '</td>' +
    '</tr>';
  }).join('');
  table.innerHTML =
    '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.85rem">' +
      '<thead><tr style="text-align:left;color:var(--muted);border-bottom:1px solid var(--line-soft)">' +
        '<th>ID</th><th>' + t('admin.certs.student') + '</th><th>' + t('admin.certs.academy') + '</th>' +
        '<th>CECRL</th><th>' + t('admin.certs.type') + '</th><th>' + t('admin.certs.issued') + '</th>' +
        '<th>' + t('admin.certs.status') + '</th><th></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  if (more) more.style.display = certState.nextCursor ? '' : 'none';
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

/** Bind unique par paint (délégation d'événements). */
export function bindCertificationsEvents(app) {
  const refresh = document.getElementById('ela-cert-refresh');
  const fAcademy = document.getElementById('ela-cert-filter-academy');
  const fStatus = document.getElementById('ela-cert-filter-status');
  const more = document.getElementById('ela-cert-more');
  const modal = document.getElementById('ela-cert-revoke-modal');

  if (refresh) refresh.addEventListener('click', function () { loadCertifications(false); });
  if (fAcademy) fAcademy.addEventListener('change', function () {
    certState.academy = fAcademy.value; loadCertifications(false);
  });
  if (fStatus) fStatus.addEventListener('change', function () {
    certState.status = fStatus.value; loadCertifications(false);
  });
  if (more) more.addEventListener('click', function () { loadCertifications(true); });

  app.addEventListener('click', function (e) {
    const btn = e.target.closest && e.target.closest('[data-revoke]');
    if (btn && modal) {
      modal.style.display = 'flex';
      modal.setAttribute('data-id', btn.getAttribute('data-revoke'));
      const idEl = document.getElementById('ela-cert-revoke-id');
      const errEl = document.getElementById('ela-cert-revoke-error');
      const reasonEl = document.getElementById('ela-cert-revoke-reason');
      if (idEl) idEl.textContent = btn.getAttribute('data-revoke');
      if (errEl) errEl.style.display = 'none';
      if (reasonEl) reasonEl.value = '';
    }
  });

  const cancel = document.getElementById('ela-cert-revoke-cancel');
  if (cancel) cancel.addEventListener('click', function () { modal.style.display = 'none'; });

  const confirm = document.getElementById('ela-cert-revoke-confirm');
  if (confirm) confirm.addEventListener('click', function () {
    const id = modal ? modal.getAttribute('data-id') : '';
    const reasonEl = document.getElementById('ela-cert-revoke-reason');
    const errEl = document.getElementById('ela-cert-revoke-error');
    const reason = reasonEl ? reasonEl.value.trim() : '';
    if (reason.length < 3) {
      if (errEl) { errEl.textContent = t('admin.certs.reasonRequired'); errEl.style.display = ''; }
      return;
    }
    confirm.disabled = true;
    callFunction('revokeELACertificate', { id: id, reason: reason })
      .then(function () {
        if (modal) modal.style.display = 'none';
        loadCertifications(false);
      })
      .catch(function (err) {
        if (errEl) { errEl.textContent = (err && err.code) || t('admin.certs.revokeError'); errEl.style.display = ''; }
      })
      .then(function () { confirm.disabled = false; });
  });

  if (!certState.items.length) loadCertifications(false);
}