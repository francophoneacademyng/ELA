/* ============================================================
   ELA — teacher/components/status-badge.js
   Badge de statut de soumission (pending/approved/rejected + motif).
   ============================================================ */

import { t } from '../../core/i18n-helpers.js';

const CLASS = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };

export function statusBadgeHtml(submission) {
  const cls = CLASS[submission.status] || 'badge-muted';
  const reason = submission.isRejected() && submission.rejectReason
    ? '<span class="reject-reason"> — ' + submission.rejectReason + '</span>' : '';
  return '<span class="badge ' + cls + '">' + t('teacher.status.' + submission.status, submission.status) + '</span>' + reason;
}
