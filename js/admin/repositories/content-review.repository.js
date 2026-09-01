/* ============================================================
   ELA — admin/repositories/content-review.repository.js
   File de validation : callables getAdminQueue / reviewContent.
   ============================================================ */

import { callFunction } from '../../core/api-client.js';
import { ContentItem } from '../models/content-item.model.js';

/** File d'attente → ContentItem[]. */
export function fetchReviewQueue() {
  return callFunction('getAdminQueue', {}).then(function (d) {
    return ((d && d.items) || []).map(ContentItem.fromQueueItem);
  });
}

/**
 * Décision de validation.
 * @param {string} collection 'lessons'|'quizzes'|'liveClasses'
 * @param {string} docId
 * @param {'approve'|'reject'} decision
 * @param {string} reason (requis si reject)
 */
export function submitReview(collection, docId, decision, reason) {
  return callFunction('reviewContent', {
    collection: collection, docId: docId, decision: decision, reason: reason || ''
  });
}
