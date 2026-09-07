/* ============================================================
   ELA - admin/components/reject-modal.js
   Modale « Motif de rejet » — remplace les derniers window.prompt()
   de la validation de contenu. Aucun prompt()/alert() nulle part.
   ============================================================ */

/** HTML de la modale (à injecter une fois dans la page). */
export function rejectModalHtml() {
  return '<div class="modal-overlay" id="reject-modal">' +
    '<div class="manage-card">' +
      '<h2>Rejeter ce contenu</h2>' +
      '<div class="form-row"><label>Motif du rejet (obligatoire)</label>' +
        '<textarea id="reject-reason" class="manage-input" rows="4" ' +
        'placeholder="Expliquez pourquoi ce contenu est rejeté…" ' +
        'style="resize:vertical;font-family:inherit;"></textarea></div>' +
      '<div class="manage-actions">' +
        '<button class="btn-manage-cancel" id="reject-cancel">Annuler</button>' +
        '<button class="btn-manage-save" id="reject-confirm" style="background:#991b1b;">Confirmer le rejet</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/** Ouvre la modale pour la clé de contenu donnée. */
export function openRejectModal(key) {
  const modal = document.getElementById('reject-modal');
  if (!modal) return;
  modal.setAttribute('data-key', key);
  const input = document.getElementById('reject-reason');
  if (input) input.value = '';
  modal.classList.add('active');
  if (input) input.focus();
}

function closeRejectModal() {
  const modal = document.getElementById('reject-modal');
  if (modal) { modal.classList.remove('active'); modal.removeAttribute('data-key'); }
}

/**
 * Attache les événements de la modale.
 * @param {function(string, string)} onConfirm (key, reason) => Promise
 */
export function bindRejectModal(onConfirm) {
  const modal = document.getElementById('reject-modal');
  if (!modal) return;
  modal.addEventListener('click', function (e) { if (e.target === modal) closeRejectModal(); });
  const cancel = document.getElementById('reject-cancel');
  if (cancel) cancel.addEventListener('click', closeRejectModal);
  const confirm = document.getElementById('reject-confirm');
  if (confirm) confirm.addEventListener('click', function () {
    const key = modal.getAttribute('data-key');
    const reason = String(document.getElementById('reject-reason').value || '').trim();
    if (!reason) { document.getElementById('reject-reason').focus(); return; }
    confirm.disabled = true;
    Promise.resolve(onConfirm(key, reason)).catch(function () { /* géré par l'appelant */ })
      .then(function () { confirm.disabled = false; closeRejectModal(); });
  });
}
