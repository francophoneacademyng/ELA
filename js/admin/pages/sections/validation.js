/* ============================================================
   ELA — admin/pages/sections/validation.js
   File d'attente de validation (approve/reject avec motif).
   ============================================================ */

import { statusBadgeHtml } from '../../components/badge.js';
import { t } from '../../../core/i18n-helpers.js';
import { escapeHtml, formatDateTime } from '../../../core/dom.js';
import { toast } from '../../../core/dom.js';
import { getState } from '../../services/admin-state.js';
import { approveItem, rejectItem, toggleRejectForm } from '../../services/admin-review.service.js';
import { rerender } from '../refresh.js';

function previewHtml(it) {
  const p = it.preview || {};
  if (p.kind === 'lesson') return '<p>' + escapeHtml(p.description || p.content || '') + '</p>';
  if (p.kind === 'quiz') return '<p>' + (p.questionCount || 0) + ' ' + t('admin.questions') + '</p>';
  if (p.kind === 'live') return '<p>' + formatDateTime(p.scheduledAt) + '</p>';
  return '';
}

export function validationHtml() {
  const s = getState();
  if (s.queueLoading) return '<section class="dashboard-section"><div class="skeleton" style="height:120px"></div></section>';
  if (!s.queue.length) {
    return '<section class="dashboard-section"><p class="muted">' + t('admin.noPending') + '</p></section>';
  }

  const cards = s.queue.map(function (it) {
    const key = it.key();
    const rejecting = s.rejectingKey === key;
    const rejectForm = rejecting
      ? '<div class="reject-form">' +
        '<input type="text" id="reject-reason-' + key + '" class="input" placeholder="' + t('admin.rejectReason') + '">' +
        '<button class="btn btn-danger btn-sm" data-confirm-reject="' + key + '">' + t('admin.confirmReject') + '</button>' +
        '<button class="btn btn-ghost btn-sm" data-cancel-reject="' + key + '">' + t('admin.cancel') + '</button>' +
      '</div>'
      : '';
    return '<div class="content-card">' +
      '<div class="content-card-head"><h4>' + escapeHtml(it.title) + '</h4>' + statusBadgeHtml('pending') + '</div>' +
      '<p class="muted">' + escapeHtml(it.teacherName || '—') + ' · ' +
        (it.academy ? escapeHtml(it.academy) : '—') + ' · ' + formatDateTime(it.submittedAt) + '</p>' +
      previewHtml(it) +
      '<div class="content-actions">' +
        '<button class="btn btn-solid btn-sm" data-approve="' + key + '">' + t('admin.approve') + '</button>' +
        '<button class="btn btn-ghost btn-sm" data-reject="' + key + '">' + t('admin.reject') + '</button>' +
      '</div>' + rejectForm +
    '</div>';
  }).join('');

  return '<section class="dashboard-section" id="admin-validation"><h3>' +
    t('admin.pendingReview') + ' (' + s.queue.length + ')</h3>' + cards + '</section>';
}

/** Délégation d'événements pour la section validation (bind unique). */
export function bindValidationEvents(root) {
  if (!root) return;
  root.addEventListener('click', function (ev) {
    const btn = ev.target.closest ? ev.target.closest('[data-approve],[data-reject],[data-confirm-reject],[data-cancel-reject]') : null;
    if (!btn) return;
    const key = btn.getAttribute('data-approve') || btn.getAttribute('data-reject') ||
                btn.getAttribute('data-confirm-reject') || btn.getAttribute('data-cancel-reject');
    const item = getState().queue.filter(function (x) { return x.key() === key; })[0];
    if (!item) return;

    if (btn.hasAttribute('data-approve')) {
      approveItem(item).then(function () {
        toast(t('admin.approved'), 'success'); rerender();
      }).catch(function () { toast(t('teacher.error'), 'error'); });
    } else if (btn.hasAttribute('data-reject')) {
      toggleRejectForm(key); rerender();
    } else if (btn.hasAttribute('data-cancel-reject')) {
      toggleRejectForm(key); rerender();
    } else if (btn.hasAttribute('data-confirm-reject')) {
      const input = document.getElementById('reject-reason-' + key);
      rejectItem(item, input ? input.value : '').then(function () {
        toast(t('admin.rejected'), 'success'); rerender();
      }).catch(function (e) {
        toast(e && e.code === 'reason-required' ? t('admin.reasonRequired') : t('teacher.error'), 'error');
      });
    }
  });
}
