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
import { getState, setState } from '../services/admin-state.js';
import { fetchAdminPanelData } from '../repositories/admin-data.repository.js';
import { refreshQueue } from '../services/admin-review.service.js';

let query = '';
let manageUid = null;

var PLAN_LABEL = { free: 'Free', general: 'General Path', premium: 'Premium Path', business: 'Business French' };
var PLAN_CLASS = { free: 'badge-free', general: 'badge-general', premium: 'badge-premium', business: 'badge-business' };
var ACADEMY_OPTIONS = [
  ['', '— Aucune —'],
  ['french', '🇫🇷 Francophone Academy'],
  ['german', '🇩🇪 Germanophone Academy'],
  ['mandarin', '🇨🇳 Sinophone Academy'],
  ['english', '🇬🇧 Anglophone Pro Academy'],
  ['arabic', '🇸🇦 Arabophone Academy'],
  ['russian', '🇷🇺 Russophone Academy']
];

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
    title: 'Utilisateurs 👥',
    subtitle: 'Comptes, formules et académies des étudiants ELA.',
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
            toast('Liste actualisée ✅', 'success');
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
      '<input type="text" id="user-search" placeholder="Rechercher un nom ou un email…" class="search-input" value="' + escapeHtml(q) + '">' +
      '<button class="btn-refresh" id="btn-refresh">🔄 Rafraîchir</button>' +
    '</div>' +
    '<div class="table-responsive"><table class="data-table fa-style" id="admin-users-table">' +
      '<thead><tr><th>ÉTUDIANT</th><th>ID</th><th>FORMULE</th><th>EXPIRE</th><th>INSCRIT</th><th>ACTION</th></tr></thead>' +
      '<tbody id="users-tbody">' + rowsHtml(filtered(users, q)) + '</tbody>' +
    '</table></div>' +
    (users.length ? '' :
      '<div class="empty-state-premium"><div style="font-size:48px;margin-bottom:16px;">🗂️</div>' +
      '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucun utilisateur inscrit</h3>' +
      '<p style="margin:0;color:#6b7280;font-size:14px;">Les comptes apparaîtront ici dès les premières inscriptions.</p></div>') +
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
      '<td><span class="badge-plan ' + (PLAN_CLASS[plan] || 'badge-free') + '">' + (PLAN_LABEL[plan] || plan) + '</span></td>' +
      '<td style="color:#6b7280;font-size:13px;">' + (activeSub ? formatDate(s.endDate) : '—') + '</td>' +
      '<td style="color:#6b7280;font-size:13px;">' + joined + '</td>' +
      '<td><button class="btn-manage" data-manage="' + escapeHtml(u.id) + '">Gérer</button></td>' +
    '</tr>';
  }).join('');
}

/* ============================================================
   Modale « Gérer l'utilisateur » (remplace tous les prompt/alert)
   ============================================================ */
function manageModalHtml() {
  const academyOpts = ACADEMY_OPTIONS.map(function (a) {
    return '<option value="' + a[0] + '">' + a[1] + '</option>';
  }).join('');
  return '<div class="modal-overlay" id="manage-modal">' +
    '<div class="manage-card">' +
      '<h2>Gérer l\'utilisateur</h2>' +
      '<div class="form-row"><label>Rôle</label><select id="m-role" class="manage-select">' +
        '<option value="student">Student</option>' +
        '<option value="teacher">Instructor</option>' +
        '<option value="admin">Administrator</option></select></div>' +
      '<div class="form-row"><label>Formule</label><select id="m-plan" class="manage-select">' +
        '<option value="free">Free</option>' +
        '<option value="general">General Path</option>' +
        '<option value="premium">Premium Path</option>' +
        '<option value="business">Business French</option></select></div>' +
      '<div class="form-row"><label>Durée d\'engagement</label><select id="m-duration" class="manage-select">' +
        '<option value="1">1 mois</option>' +
        '<option value="3">3 mois</option>' +
        '<option value="6">6 mois</option></select></div>' +
      '<div class="form-row"><label>Académie</label><select id="m-academy" class="manage-select">' + academyOpts + '</select></div>' +
      '<div class="status-row"><span>Statut actuel : </span><strong id="m-status">Chargement…</strong></div>' +
      '<div class="manage-actions">' +
        '<button class="btn-manage-cancel" id="m-cancel">Annuler</button>' +
        '<button class="btn-manage-revoke" id="m-revoke">Révoquer l\'abonnement</button>' +
        '<button class="btn-manage-save" id="m-save">Enregistrer</button>' +
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
  const status = (active ? 'Abonnement actif — ' : 'Compte sans abonnement — ') + (PLAN_LABEL[userPlan(user)] || 'Free');
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
      toast('Modifications enregistrées ✅', 'success');
      setTimeout(function () { location.reload(); }, 800);
    })
    .catch(function (err) {
      toast('Erreur : ' + ((err && (err.code || err.message)) || 'Échec de la sauvegarde'), 'error');
    });
}

function revokeSubscription() {
  if (!manageUid) return;
  if (!window.confirm("Révoquer l'abonnement de cet utilisateur ? Cette action est irréversible.")) return;
  callFunction('updateUserProfile', {
    uid: manageUid,
    updates: { plan: 'free', durationMonths: null, subscriptionStatus: 'revoked' }
  })
    .then(function () {
      closeManageModal();
      toast('Abonnement révoqué ✅', 'success');
      setTimeout(function () { location.reload(); }, 800);
    })
    .catch(function (err) {
      toast('Erreur : ' + ((err && (err.code || err.message)) || 'Échec'), 'error');
    });
}
