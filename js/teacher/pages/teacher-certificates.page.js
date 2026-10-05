/* ============================================================
   ELA - teacher/pages/teacher-certificates.page.js
   Page « Certificats » (/teacher/certificates).
   Réutilise le backend existant listELACertificates (scope
   admin/teacher : liste paginée des certificats). Aucune nouvelle
   logique ; aucune donnée inventée. État vide honnête si aucun
   certificat n'est encore émis.
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { t } from '../../core/i18n-helpers.js';
import { TI } from '../components/teacher-icons.js';

export function renderTeacherCertificates() {
  renderTeacherShell({
    active: '#/teacher/certificates',
    title: t('teacher.certs.title', 'Certificates'),
    subtitle: t('teacher.certs.subtitle', 'Learner certificates.'),
    renderContent: function () {
      return '<div class="card" data-certs-list>' + loadingHtml() + '</div>';
    },
    onBind: function () {
      load();
    }
  });
}

function loadingHtml() {
  return '<div class="empty-state"><div class="empty-icon">' + TI.clock + '</div><p>' + t('teacher.certs.loading', 'Loading…') + '</p></div>';
}

function load() {
  var box = document.querySelector('[data-certs-list]');
  if (!box) return;
  box.innerHTML = loadingHtml();
  callFunction('listELACertificates', { pageSize: 100 }).then(function (r) {
    paint(r && r.items ? r.items : []);
  }).catch(function () {
    paintError();
  });
}

function paintError() {
  var box = document.querySelector('[data-certs-list]');
  if (box) box.innerHTML = '<div class="empty-state"><div class="empty-icon">' + TI.empty + '</div><p>' + t('teacher.certs.error', 'Could not load certificates.') + '</p></div>';
}

function paint(items) {
  var box = document.querySelector('[data-certs-list]');
  if (!box) return;
  if (!items.length) {
    box.innerHTML = '<div class="empty-state"><div class="empty-icon">' + TI.award + '</div>' +
      '<p>' + t('teacher.certs.empty', 'No certificates issued yet.') + '</p></div>';
    return;
  }
  var rows = items.map(function (c) {
    return '<tr><td><span class="user-name">' + escapeHtml(c.studentName || '—') + '</span></td>' +
      '<td>' + escapeHtml(c.academyLabel || c.academyCode || '—') + '</td>' +
      '<td>' + escapeHtml(c.cecrLevel || '—') + '</td>' +
      '<td>' + escapeHtml(c.certificateType || '—') + '</td>' +
      '<td>' + (c.issueDate ? formatDate(c.issueDate) : '—') + '</td>' +
      '<td>' + statusBadge(c.status) + '</td></tr>';
  }).join('');
  box.innerHTML = '<div class="table-responsive"><table class="data-table">' +
    '<thead><tr><th>' + t('teacher.certs.col.student', 'Student') + '</th><th>' + t('teacher.certs.col.academy', 'Academy') + '</th><th>' + t('teacher.certs.col.level', 'Level') + '</th><th>' + t('teacher.certs.col.type', 'Type') + '</th><th>' + t('teacher.certs.col.issued', 'Issued') + '</th><th>' + t('teacher.certs.col.status', 'Status') + '</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}

function statusBadge(status) {
  var map = {
    active: ['badge-ok', t('teacher.status.approved', 'Active')],
    revoked: ['badge-ko', t('admin.status.revoked', 'Revoked')],
    superseded: ['badge-muted', 'Superseded'],
    expired: ['badge-muted', t('admin.status.expired', 'Expired')]
  };
  var m = map[status] || ['badge-muted', String(status || '—')];
  return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
}
