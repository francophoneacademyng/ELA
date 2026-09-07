/* ============================================================
   ELA — admin/services/admin-review.service.js
   Orchestration de la validation de contenu (approve/reject)
   au-dessus du repository, avec état encapsulé dans admin-state.
   ============================================================ */

import { fetchReviewQueue, submitReview } from '../repositories/content-review.repository.js';
import { getState, setState } from './admin-state.js';

/** Recharge la file d'attente.
 *  NB : l'erreur est relancée au caller mais n'est JAMAIS écrite dans
 *  state.error — c'est un état local à la file, pas un échec global
 *  du panel (sinon les pages /admin/* affichent « Impossible de
 *  charger » alors que getAdminPanelData a réussi). */
export function refreshQueue() {
  setState({ queueLoading: true });
  return fetchReviewQueue()
    .then(function (items) { setState({ queue: items, queueLoading: false }); return items; })
    .catch(function (e) {
      setState({ queueLoading: false });
      throw e;
    });
}

/** Approuve un élément de la file. */
export function approveItem(item) {
  return submitReview(item.collection, item.id, 'approve', '')
    .then(function () { return refreshQueue(); });
}

/** Rejette un élément avec motif (obligatoire, validé ici aussi). */
export function rejectItem(item, reason) {
  const r = String(reason || '').trim();
  if (!r) return Promise.reject({ code: 'reason-required' });
  return submitReview(item.collection, item.id, 'reject', r)
    .then(function () {
      setState({ rejectingKey: null });
      return refreshQueue();
    });
}

/** Ouvre/ferme le formulaire de rejet d'un élément (clé 'collection:id'). */
export function toggleRejectForm(key) {
  setState({ rejectingKey: getState().rejectingKey === key ? null : key });
}
