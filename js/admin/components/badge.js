/* ============================================================
   ELA — admin/components/badge.js
   Badges de statut réutilisables (classes badge-* existantes).
   ============================================================ */

import { t } from '../../core/i18n-helpers.js';

const STATUS_CLASS = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-danger',
  success: 'badge-success',
  failed: 'badge-danger',
  active: 'badge-success',
  expired: 'badge-muted'
};

export function statusBadgeHtml(status) {
  const s = String(status || 'pending');
  const cls = STATUS_CLASS[s] || 'badge-muted';
  return '<span class="badge ' + cls + '">' + t('admin.status.' + s, s) + '</span>';
}

export function roleBadgeHtml(role) {
  const cls = role === 'admin' ? 'badge-danger' : role === 'teacher' ? 'badge-info' : 'badge-muted';
  return '<span class="badge ' + cls + '">' + t('admin.role.' + role, role) + '</span>';
}
