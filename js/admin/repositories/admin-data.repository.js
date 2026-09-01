/* ============================================================
   ELA — admin/repositories/admin-data.repository.js
   Source de données admin : callable getAdminPanelData (agrégats
   calculés côté serveur — fix D4, plus aucune lecture pleine
   collection côté client). Retourne des instances de models.
   ============================================================ */

import { callFunction } from '../../core/api-client.js';
import { AdminUser } from '../models/admin-user.model.js';
import { Payment } from '../models/payment.model.js';
import { Subscription } from '../models/subscription.model.js';
import { LiveClass } from '../models/live-class.model.js';

/**
 * Charge toutes les données du panel admin.
 * Résout { users: AdminUser[], transactions: Payment[],
 *          subscriptions: Subscription[], liveClasses: LiveClass[], metrics }.
 */
export function fetchAdminPanelData() {
  return callFunction('getAdminPanelData', {}).then(function (d) {
    d = d || {};
    return {
      users: (d.users || []).map(function (u) { return new AdminUser(u.id, u); }),
      transactions: (d.transactions || []).map(function (x) { return new Payment(x.id, x); }),
      subscriptions: (d.subscriptions || []).map(function (s) { return new Subscription(s.uid, s); }),
      liveClasses: (d.liveClasses || []).map(function (l) { return new LiveClass(l.id, l); }),
      metrics: d.metrics || {}
    };
  });
}
