/* ============================================================
   ELA - admin/pages/admin-invoices.page.js
   Page « Factures personnalisées » (/admin/invoices) — liste via
   getInvoiceList, création via modale (createCustomInvoice),
   actions Lien / Email / WhatsApp réelles. Aucun prompt()/alert().
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { escapeHtml, formatDate, toast } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';

export function renderAdminInvoices() {
  renderAdminShell({
    active: '#/admin/invoices',
    title: 'Factures personnalisées 📄',
    subtitle: 'Facturation manuelle.',
    renderContent: function () { return layoutHtml(); },
    onBind: function () {
      const newBtn = document.getElementById('btn-new-invoice');
      if (newBtn) newBtn.addEventListener('click', openInvoiceModal);
      bindInvoiceModal();
      loadInvoices();
    }
  });
}

function loadInvoices() {
  callFunction('getInvoiceList', {}).then(function (d) {
    paintInvoices((d && d.invoices) || []);
  }).catch(function () {
    paintInvoices([]);
  });
}

function layoutHtml() {
  return '<div style="margin-bottom:24px;">' +
    '<button class="btn-primary" id="btn-new-invoice" ' +
      'style="background:#064e3b;color:#fff;padding:10px 20px;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:14px;">' +
      '+ Nouvelle facture personnalisée</button></div>' +
  '<div class="card"><div class="table-responsive"><table class="data-table fa-style">' +
    '<thead><tr><th>FACTURE</th><th>CLIENT</th><th>PROGRAMME</th><th>DURÉE</th><th>FRÉQ.</th><th>MONTANT</th><th>STATUT</th><th>DATE</th><th>ACTIONS</th></tr></thead>' +
    '<tbody id="invoices-tbody"><tr><td colspan="9" style="text-align:center;padding:48px;color:#6b7280;">Chargement…</td></tr></tbody>' +
  '</table></div>' +
  '<div class="empty-state-premium" id="invoices-empty" style="display:none;">' +
    '<div style="font-size:48px;margin-bottom:16px;">📄</div>' +
    '<h3 style="margin:0 0 8px;font-size:18px;color:#111827;">Aucune facture personnalisée</h3>' +
    '<p style="margin:0;color:#6b7280;font-size:14px;">Créez votre première facture avec le bouton ci-dessus.</p>' +
  '</div></div>' +
  invoiceModalHtml();
}

function invoiceModalHtml() {
  return '<div class="modal-overlay" id="invoice-modal">' +
    '<div class="manage-card">' +
      '<h2>Nouvelle facture personnalisée</h2>' +
      '<div class="form-row"><label>Nom du client</label><input type="text" id="inv-name" class="manage-input" placeholder="Ex. Hamadama R."></div>' +
      '<div class="form-row"><label>Email du client</label><input type="email" id="inv-email" class="manage-input" placeholder="client@gmail.com"></div>' +
      '<div class="form-row"><label>Programme</label><select id="inv-program" class="manage-select">' +
        '<option value="General Path">General Path</option>' +
        '<option value="Premium Path">Premium Path</option>' +
        '<option value="Business French">Business French</option></select></div>' +
      '<div class="form-row"><label>Durée</label><select id="inv-duration" class="manage-select">' +
        '<option value="1 mois">1 mois</option>' +
        '<option value="3 mois">3 mois</option>' +
        '<option value="6 mois">6 mois</option></select></div>' +
      '<div class="form-row"><label>Fréquence des cours</label><input type="text" id="inv-frequency" class="manage-input" placeholder="Ex. 2 séances / semaine"></div>' +
      '<div class="form-row"><label>Montant (NGN)</label><input type="number" id="inv-amount" class="manage-input" min="1" placeholder="75000"></div>' +
      '<div class="manage-actions">' +
        '<button class="btn-manage-cancel" id="inv-cancel">Annuler</button>' +
        '<button class="btn-manage-save" id="inv-create">Créer la facture</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function bindInvoiceModal() {
  const modal = document.getElementById('invoice-modal');
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('active'); });
  const cancel = document.getElementById('inv-cancel');
  if (cancel) cancel.addEventListener('click', function () { modal.classList.remove('active'); });
  const create = document.getElementById('inv-create');
  if (create) create.addEventListener('click', createInvoice);
}

function openInvoiceModal() {
  const modal = document.getElementById('invoice-modal');
  if (modal) modal.classList.add('active');
}

function createInvoice() {
  const email = String(document.getElementById('inv-email').value || '').trim();
  const amount = Number(document.getElementById('inv-amount').value);
  if (!email || !amount || amount <= 0) {
    toast('Renseignez un email client et un montant valide.', 'error');
    return;
  }
  const btn = document.getElementById('inv-create');
  btn.disabled = true;
  callFunction('createCustomInvoice', {
    clientName: document.getElementById('inv-name').value,
    clientEmail: email,
    program: document.getElementById('inv-program').value,
    duration: document.getElementById('inv-duration').value,
    frequency: document.getElementById('inv-frequency').value,
    amount: amount
  }).then(function () {
    document.getElementById('invoice-modal').classList.remove('active');
    toast('Facture créée ✅', 'success');
    loadInvoices();
  }).catch(function (err) {
    toast('Erreur : ' + ((err && (err.code || err.message)) || 'Création impossible'), 'error');
  }).then(function () { btn.disabled = false; });
}

function paintInvoices(invoices) {
  const tbody = document.getElementById('invoices-tbody');
  const empty = document.getElementById('invoices-empty');
  if (!tbody) return;
  if (!invoices.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  tbody.innerHTML = invoices.map(function (inv) {
    return '<tr>' +
      '<td style="font-family:monospace;font-size:13px;">' + escapeHtml(inv.invoiceNumber) + '</td>' +
      '<td><div class="user-cell"><span class="user-name">' + escapeHtml(inv.clientName || '—') + '</span>' +
        '<span class="user-email">' + escapeHtml(inv.clientEmail) + '</span></div></td>' +
      '<td style="color:#6b7280;font-size:13px;">' + escapeHtml(inv.program || '—') + '</td>' +
      '<td style="color:#6b7280;font-size:13px;">' + escapeHtml(inv.duration || '—') + '</td>' +
      '<td style="color:#6b7280;font-size:13px;">' + escapeHtml(inv.frequency || '—') + '</td>' +
      '<td style="font-weight:600;">NGN ' + Number(inv.amount).toLocaleString('en-NG') + '</td>' +
      '<td><span class="badge-plan ' + (inv.status === 'pending' ? 'badge-pending' : inv.status === 'paid' ? 'badge-general' : 'badge-free') + '">' +
        (inv.status === 'pending' ? 'En attente' : inv.status) + '</span></td>' +
      '<td style="color:#6b7280;font-size:13px;">' + formatDate(inv.createdAt) + '</td>' +
      '<td>' + invoiceActionsHtml(inv) + '</td>' +
    '</tr>';
  }).join('');
  bindInvoiceActions();
}

function invoiceLink(inv) {
  return window.location.origin + window.location.pathname + '#/invoice/' + encodeURIComponent(inv.invoiceNumber);
}

function invoiceActionsHtml(inv) {
  const num = escapeHtml(inv.invoiceNumber);
  return '<button class="btn-action-sm" data-inv-link="' + escapeHtml(invoiceLink(inv)) + '">🔗 Lien</button>' +
    '<button class="btn-action-sm" data-inv-mail="' + escapeHtml(inv.clientEmail) + '" data-inv-num="' + num + '">✉️ Email</button>' +
    '<button class="btn-action-sm" data-inv-wa="' + escapeHtml(invoiceLink(inv)) + '" data-inv-num="' + num + '">📱 WhatsApp</button>';
}

function bindInvoiceActions() {
  document.querySelectorAll('[data-inv-link]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const link = btn.getAttribute('data-inv-link');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(function () { toast('Lien copié ✅', 'success'); });
      } else {
        toast(link, 'info');
      }
    });
  });
  document.querySelectorAll('[data-inv-mail]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.location.href = 'mailto:' + btn.getAttribute('data-inv-mail') +
        '?subject=' + encodeURIComponent('Votre facture ELA ' + btn.getAttribute('data-inv-num')) +
        '&body=' + encodeURIComponent('Bonjour,\n\nVeuillez trouver votre facture personnalisée ELA ici : ' + invoiceLink({ invoiceNumber: btn.getAttribute('data-inv-num') }) + '\n\nE-Learn Language Academy');
    });
  });
  document.querySelectorAll('[data-inv-wa]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.open('https://wa.me/?text=' + encodeURIComponent('Votre facture ELA ' + btn.getAttribute('data-inv-num') + ' : ' + btn.getAttribute('data-inv-wa')), '_blank');
    });
  });
}
