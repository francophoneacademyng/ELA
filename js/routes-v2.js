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
import { renderAdminOverview } from './admin/pages/admin-overview.page.js';
import { renderAdminLive } from './admin/pages/admin-live.page.js';
import { renderAdminReferrals } from './admin/pages/admin-referrals.page.js';
import { renderAdminWhatsApp } from './admin/pages/admin-whatsapp.page.js';
import { renderAdminInvoices } from './admin/pages/admin-invoices.page.js';
import { renderAdminUsers } from './admin/pages/admin-users.page.js';
import { renderAdminTeachers } from './admin/pages/admin-teachers.page.js';
import { renderAdminAcademies } from './admin/pages/admin-academies.page.js';
import { renderAdminContent } from './admin/pages/admin-content.page.js';
import { renderAdminRevenue } from './admin/pages/admin-revenue.page.js';
import { renderAdminPayments } from './admin/pages/admin-payments.page.js';
import { renderAdminCertificates } from './admin/pages/admin-certificates.page.js';
import { renderAdminTools } from './admin/pages/admin-tools.page.js';
import { renderTeacherPage } from './teacher/pages/teacher.page.js';
import { renderTeacherCourses } from './teacher/pages/teacher-courses.page.js';
import { renderTeacherQuizzes } from './teacher/pages/teacher-quizzes.page.js';
import { renderTeacherLiveList } from './teacher/pages/teacher-live-list.page.js';
import { renderTeacherStudents } from './teacher/pages/teacher-students.page.js';
import { renderTeacherStats } from './teacher/pages/teacher-stats.page.js';
import { renderTeacherProfile } from './teacher/pages/teacher-profile.page.js';
import { renderTeacherLessonNew } from './teacher/pages/teacher-lesson.page.js';
import { renderTeacherQuizNew } from './teacher/pages/teacher-quiz.page.js';
import { renderTeacherLiveNew } from './teacher/pages/teacher-live.page.js';
import { registerAcademyRoutes } from '../src/academies/registry.js';
import { renderStudentHub } from '../src/ela/pages/student-hub.page.js';
import { renderAcademiesPublic } from '../src/ela/pages/academies-public.page.js';
import { renderFreeTrial } from '../src/ela/pages/free-trial.page.js';

if (typeof window !== 'undefined') {
  window.ELA_ROUTE_HANDLERS = window.ELA_ROUTE_HANDLERS || {};
  window.ELA_ROUTE_HANDLERS['/admin-v2'] = renderAdminPage;
  window.ELA_ROUTE_HANDLERS['/teacher-v2'] = renderTeacherPage;
  /* PHASE 4 — switch : les routes canoniques utilisent les nouvelles pages */
  window.ELA_ROUTE_HANDLERS['/admin'] = renderAdminPage;
  /* Sous-pages admin (sidebar complète) */
  window.ELA_ROUTE_HANDLERS['/admin/overview'] = renderAdminOverview;
  window.ELA_ROUTE_HANDLERS['/admin/live'] = renderAdminLive;
  window.ELA_ROUTE_HANDLERS['/admin/referrals'] = renderAdminReferrals;
  window.ELA_ROUTE_HANDLERS['/admin/whatsapp'] = renderAdminWhatsApp;
  window.ELA_ROUTE_HANDLERS['/admin/invoices'] = renderAdminInvoices;
  window.ELA_ROUTE_HANDLERS['/admin/users'] = renderAdminUsers;
  window.ELA_ROUTE_HANDLERS['/admin/teachers'] = renderAdminTeachers;
  window.ELA_ROUTE_HANDLERS['/admin/academies'] = renderAdminAcademies;
  window.ELA_ROUTE_HANDLERS['/admin/content'] = renderAdminContent;
  window.ELA_ROUTE_HANDLERS['/admin/revenue'] = renderAdminRevenue;
  window.ELA_ROUTE_HANDLERS['/admin/payments'] = renderAdminPayments;
  window.ELA_ROUTE_HANDLERS['/admin/certificates'] = renderAdminCertificates;
  window.ELA_ROUTE_HANDLERS['/admin/tools'] = renderAdminTools;
  window.ELA_ROUTE_HANDLERS['/teacher'] = renderTeacherPage;
  /* Sous-pages enseignant (sidebar complète) */
  window.ELA_ROUTE_HANDLERS['/teacher/courses'] = renderTeacherCourses;
  window.ELA_ROUTE_HANDLERS['/teacher/quizzes'] = renderTeacherQuizzes;
  window.ELA_ROUTE_HANDLERS['/teacher/live'] = renderTeacherLiveList;
  window.ELA_ROUTE_HANDLERS['/teacher/students'] = renderTeacherStudents;
  window.ELA_ROUTE_HANDLERS['/teacher/stats'] = renderTeacherStats;
  window.ELA_ROUTE_HANDLERS['/teacher/profile'] = renderTeacherProfile;
  /* Formulaires enseignant sur pages séparées */
  window.ELA_ROUTE_HANDLERS['/teacher/lesson/new'] = renderTeacherLessonNew;
  window.ELA_ROUTE_HANDLERS['/teacher/quiz/new'] = renderTeacherQuizNew;
  window.ELA_ROUTE_HANDLERS['/teacher/live/new'] = renderTeacherLiveNew;
  /* Hub étudiant + page publique académies */
  window.ELA_ROUTE_HANDLERS['/dashboard'] = renderStudentHub;
  window.ELA_ROUTE_HANDLERS['/academies'] = renderAcademiesPublic;
  window.ELA_ROUTE_HANDLERS['/free-trial'] = renderFreeTrial;
  /* Académies immersives (6 langues) */
  registerAcademyRoutes();
}
