/* ============================================================
   ELA — routes-v2.js
   Enregistrement des routes du refactor admin/teacher.
   PHASE 4 (switch) : #/admin et #/teacher pointent désormais
   vers les nouvelles pages. Le hook est lu par route() de
   js/app.js via ELA_ROUTE_HANDLERS (prioritaire sur ROUTES).
   PHASE 5 (suppression de l'ancien code inline) : à faire
   après validation utilisateur uniquement.
   ============================================================ */

import { renderAdminPage } from './admin/pages/admin.page.js';
import { renderTeacherPage } from './teacher/pages/teacher.page.js';

if (typeof window !== 'undefined') {
  window.ELA_ROUTE_HANDLERS = window.ELA_ROUTE_HANDLERS || {};
  window.ELA_ROUTE_HANDLERS['/admin-v2'] = renderAdminPage;
  window.ELA_ROUTE_HANDLERS['/teacher-v2'] = renderTeacherPage;
  /* PHASE 4 — switch : les routes canoniques utilisent les nouvelles pages */
  window.ELA_ROUTE_HANDLERS['/admin'] = renderAdminPage;
  window.ELA_ROUTE_HANDLERS['/teacher'] = renderTeacherPage;
}
