/* ============================================================
   ELA — academies/base/pages/courses.factory.js
   Fabrique du catalogue de cours d'une académie (filtres +
   cartes de cours).
   ============================================================ */

import { mountShell } from '../../../shared/components/academy/academy-shell.js';
import { checkAcademyAccess } from '../../../shared/components/academy/academy-access.js';
import { courseCards } from '../../../shared/components/academy/course-cards.js';
import { renderFilters, bindFilters, applyCourseFilters } from '../../../shared/components/academy/filters.js';
import { callFunction } from '../../../js/core/api-client.js';
import { renderLockedView } from './dashboard.factory.js';

export function createCoursesPage(code) {
  return function renderAcademyCourses() {
    checkAcademyAccess(code).then(function (access) {
      if (!access.allowed) { renderLockedView(document.getElementById('app'), access.academy); return; }
      const a = access.academy;

      callFunction('getCatalog').then(function (r) {
        const all = (r && r.courses) || [];
        const courses = all.filter(function (c) { return c.academy === a.key; });

        let view = mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification,
          activePage: 'courses',
          contentHtml: '<h3>All courses</h3>' + renderFilters({ levels: a.levels, activeCategory: 'All', activeLevel: 'All' }) +
            '<div id="ac-courses-list">' + courseCards({ courses: courses, emptyLabel: 'No course matches this filter yet.' }) + '</div>'
        });

        const list = document.getElementById('ac-courses-list');
        bindFilters(document.querySelector('.ac-filters'), function (sel) {
          if (list) list.innerHTML = courseCards({ courses: applyCourseFilters(courses, sel.category, sel.level), emptyLabel: 'No course matches this filter yet.' });
        });
      }).catch(function () {
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'courses',
          contentHtml: '<p class="ac-courses-empty">Catalogue indisponible pour le moment.</p>'
        });
      });
    }).catch(function () {
      const app = document.getElementById('app');
      if (app) app.innerHTML = '<p class="ac-courses-empty">Unable to load this academy page. Please try again.</p>';
    });
  };
}
