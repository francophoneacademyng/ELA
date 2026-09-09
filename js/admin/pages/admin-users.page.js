/* ============================================================
   ELA - admin/pages/admin-users.page.js
   Page « Utilisateurs » (/admin/users) — style Francophone
   Academy : tableau premium + modale « Gérer l'utilisateur ».
   Aucun prompt()/alert(). Données via getAdminPanelData +
   updateUserProfile (callable).
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { t } from '../../core/i18n-helpers.js';
import { getState, setState } from '../services/admin-state.js';
import { fetchAdminPanelData } from '../repositories/admin-data.repository.js';
import { refreshQueue } from '../services/admin-review.service.js';

let query = '';
let manageUid = null;

var PLAN_CLASS = { free: 'badge-free', general: 'badge-general', premium: 'badge-premium', business: 'badge-business' };
var PLAN_DISPLAY = { free: 'pricing.free', general: 'pricing.general', premium: 'pricing.premium', business: 'pricing.business' };
var ROLE_KEYS = { student: 'admin.role.student', teacher: 'admin.role.teacher', admin: 'admin.role.admin' };
var ACADEMY_OPTIONS = [
  ['', 'academies.option.none'],
  ['french', 'academies.option.francophone'],
  ['german', 'academies.option.germanophone'],
  ['mandarin', 'academies.option.sinophone'],
  ['english', 'academies.option.anglophone'],
  ['arabic', 'academies.option.arabophone'],
  ['russian', 'academies.option.russophone']
];
var ACADEMY_FLAG = { french: '🇫🇷', german: '🇩🇪', mandarin: '🇨🇳', english: '🇬🇧', arabic: '🇸🇦', russian: '🇷🇺' };

function planLabel(plan) {
  return t(PLAN_DISPLAY[plan] || 'pricing.general');
}

function roleLabel(role) {
  return t(ROLE_KEYS[role] || 'admin.role.student');
}

/** Carte uid → subscription (la plus récente). */
function subMap() {
  const map = {};
  (getState().subscriptions || []).forEach(function (s) {
    if (!map[s.uid] || (s.endDate || 0) > (map[s.uid].endDate || 0)) map[s.uid] = s;
  });
  return map;
}

function userPlan(u) {
  const s = subMap()[u.id];
  return s && s.status === 'active' && s.plan ? s.plan : 'free';
}

export function renderAdminUsers() {
  renderAdminShell({
    active: '#/admin/users',
    title: t('admin.users.title'),
    subtitle: t('admin.users.subtitle'),
    renderContent: function (s) { return contentHtml(s.users, query); },
    onBind: function () {
      const renderRows = function () {
        const tbody = document.getElementById('users-tbody');
        if (tbody) tbody.innerHTML = rowsHtml(filtered(getState().users, query));
      };
      const search = document.getElementById('user-search');
      if (search) search.addEventListener('input', function () { query = search.value; renderRows(); });
      const refresh = document.getElementById('btn-refresh');
      if (refresh) refresh.addEventListener('click', function () {
        refresh.disabled = true;
        Promise.all([fetchAdminPanelData(), refreshQueue().catch(function () { return []; })])
          .then(function (r) {
            const d = r[0] || {};
            setState({ users: d.users || [], transactions: d.transactions || [],
              subscriptions: d.subscriptions || [], liveClasses: d.liveClasses || [], metrics: d.metrics || {} });
            renderRows();
            toast(t('admin.users.updated') + ' ✅', 'success');
          })
          .finally(function () { refresh.disabled = false; });
      });
      bindManageModal();
    }
  });
}

function filtered(users, q) {
  const needle = String(q || '').trim().toLowerCase();
  if (!needle) return users;
  return users.filter(function (u) {
    return (u.name || '').toLowerCase().indexOf(needle) >= 0 ||
           (u.email || '').toLowerCase().indexOf(needle) >= 0;
  });
}

function contentHtml(users, q) {
  return '<div class="card">' +
    '<div class="table-toolbar">' +
      '<input type="text" id="user-search" placeholder="' + t('admin.searchPlaceholder') + '" class="search-input" value="' + escapeHtml(q) + '">' +
      '<button class="btn-refresh" id="btn-refresh">🔄 ' + t('admin.refresh') + '</button>' +
    '</div>' +
    '<div class="table-responsive"><table class="data-table fa-style" id="admin-users-table">' +
      '<thead><tr><th>' + t('admin.users.col.student') + '</th><th>' + t('admin.users.col.id') + '</th><th>' + t('admin.users.col.plan') + '</th><th>' + t('admin.users.col.expires') + '</th><th>' + t('admin.users.col.joined') + '</th><th>' + t('admin.users.col.action') + '</th></tr></thead>' +
      '<tbody id="users-tbody">' + rowsHtml(filtered(users, q)) + '</tbody>' +
    '</table></div>' +
    (users.length ? '' :
      '<div class="empty-state-premium"><div style="font-size:48px;margin-bottom:16px;">🗂️</div>' +
      '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">' + t('admin.users.empty.title') + '</h3>' +
      '<p style="margin:0;color:#6b7280;font-size:14px;">' + t('admin.users.empty.body') + '</p></div>') +
    manageModalHtml() +
  '</div>';
}

function rowsHtml(users) {
  if (!users.length) return '';
  const subs = subMap();
  return users.map(function (u) {
    const plan = userPlan(u);
    const id = u.id ? 'ELA-' + u.id.substring(0, 6).toUpperCase() : '—';
    const joined = u.createdAt ? formatDate(u.createdAt) : '—';
    const s = subs[u.id];
    const activeSub = s && s.status === 'active';
    return '<tr>' +
      '<td><div class="user-cell"><span class="user-name">' + escapeHtml(u.displayName()) + '</span>' +
        '<span class="user-email">' + escapeHtml(u.email || '—') + '</span></div></td>' +
      '<td class="id-ela" style="font-family:monospace;font-size:13px;">' + id + '</td>' +
      '<td><span class="badge-plan ' + (PLAN_CLASS[plan] || 'badge-free') + '">' + planLabel(plan) + '</span></td>' +
      '<td style="color:#6b7280;font-size:13px;">' + (activeSub ? formatDate(s.endDate) : '—') + '</td>' +
      '<td style="color:#6b7280;font-size:13px;">' + joined + '</td>' +
      '<td><button class="btn-manage" data-manage="' + escapeHtml(u.id) + '">' + t('admin.manage') + '</button></td>' +
    '</tr>';
  }).join('');
}

/* ============================================================
   Modale « Gérer l'utilisateur » (remplace tous les prompt/alert)
   ============================================================ */
function manageModalHtml() {
  const roleOpts = ['student', 'teacher', 'admin'].map(function (r) {
    return '<option value="' + r + '">' + t(ROLE_KEYS[r]) + '</option>';
  }).join('');
  const planOpts = ['free', 'general', 'premium', 'business'].map(function (p) {
    return '<option value="' + p + '">' + t('pricing.' + p) + '</option>';
  }).join('');
  const durationOpts = [1, 3, 6].map(function (m) {
    return '<option value="' + m + '">' + t('checkout.month.' + m) + '</option>';
  }).join('');
  const academyOpts = ACADEMY_OPTIONS.map(function (a) {
    return '<option value="' + a[0] + '">' + (ACADEMY_FLAG[a[0]] ? ACADEMY_FLAG[a[0]] + ' ' : '') + t(a[1]) + '</option>';
  }).join('');
  return '<div class="modal-overlay" id="manage-modal">' +
    '<div class="manage-card">' +
      '<h2>' + t('admin.manageUser.title') + '</h2>' +
      '<div class="form-row"><label>' + t('admin.role') + '</label><select id="m-role" class="manage-select">' + roleOpts + '</select></div>' +
      '<div class="form-row"><label>' + t('admin.plan') + '</label><select id="m-plan" class="manage-select">' + planOpts + '</select></div>' +
      '<div class="form-row"><label>' + t('admin.duration') + '</label><select id="m-duration" class="manage-select">' + durationOpts + '</select></div>' +
      '<div class="form-row"><label>' + t('admin.academy') + '</label><select id="m-academy" class="manage-select">' + academyOpts + '</select></div>' +
      '<div class="status-row"><span>' + t('admin.currentStatus') + ' </span><strong id="m-status">' + t('common.loading') + '</strong></div>' +
      '<div class="manage-actions">' +
        '<button class="btn-manage-cancel" id="m-cancel">' + t('admin.cancel') + '</button>' +
        '<button class="btn-manage-revoke" id="m-revoke">' + t('admin.revokeSubscription') + '</button>' +
        '<button class="btn-manage-save" id="m-save">' + t('admin.save') + '</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function bindManageModal() {
  const app = document.getElementById('app');
  if (!app) return;

  app.querySelectorAll('[data-manage]').forEach(function (btn) {
    btn.addEventListener('click', function () { openManageModal(btn.getAttribute('data-manage')); });
  });

  const modal = document.getElementById('manage-modal');
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeManageModal(); });

  const cancel = document.getElementById('m-cancel');
  if (cancel) cancel.addEventListener('click', closeManageModal);

  const save = document.getElementById('m-save');
  if (save) save.addEventListener('click', saveManageChanges);

  const revoke = document.getElementById('m-revoke');
  if (revoke) revoke.addEventListener('click', revokeSubscription);
}

function openManageModal(uid) {
  const user = getState().users.filter(function (u) { return u.id === uid; })[0];
  if (!user) return;
  manageUid = uid;

  document.getElementById('m-role').value = user.role || 'student';
  document.getElementById('m-plan').value = userPlan(user);
  const sub = subMap()[uid];
  const months = (sub && sub.status === 'active' && sub.endDate)
    ? Math.max(1, Math.round((sub.endDate - Date.now()) / (30 * 24 * 3600 * 1000)))
    : 1;
  document.getElementById('m-duration').value = String([1, 3, 6].indexOf(months) >= 0 ? months : 1);
  document.getElementById('m-academy').value = user.academy || '';

  const active = !!(sub && sub.status === 'active');
  const status = (active ? t('admin.plan.activePrefix') : t('admin.plan.nonePrefix')) + planLabel(userPlan(user));
  document.getElementById('m-status').textContent = status;

  document.getElementById('manage-modal').classList.add('active');
}

function closeManageModal() {
  const modal = document.getElementById('manage-modal');
  if (modal) modal.classList.remove('active');
  manageUid = null;
}

function saveManageChanges() {
  if (!manageUid) return;
  const updates = {
    role: document.getElementById('m-role').value,
    plan: document.getElementById('m-plan').value,
    durationMonths: parseInt(document.getElementById('m-duration').value, 10),
    academy: document.getElementById('m-academy').value
  };
  callFunction('updateUserProfile', { uid: manageUid, updates: updates })
    .then(function () {
      closeManageModal();
      toast(t('admin.users.saved') + ' ✅', 'success');
      setTimeout(function () { location.reload(); }, 800);
    })
    .catch(function (err) {
      toast(t('admin.users.saveError') + ' : ' + ((err && (err.code || err.message)) || '—'), 'error');
    });
}

function revokeSubscription() {
  if (!manageUid) return;
  if (!window.confirm(t('admin.users.revokeConfirm'))) return;
  callFunction('updateUserProfile', {
    uid: manageUid,
    updates: { plan: 'free', durationMonths: null, subscriptionStatus: 'revoked' }
  })
    .then(function () {
      closeManageModal();
      toast(t('admin.users.revoked') + ' ✅', 'success');
      setTimeout(function () { location.reload(); }, 800);
    })
    .catch(function (err) {
      toast(t('admin.users.saveError') + ' : ' + ((err && (err.code || err.message)) || '—'), 'error');
    });
}
