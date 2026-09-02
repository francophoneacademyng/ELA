/* ============================================================
   ELA — academies/base/pages/quiz.factory.js
   Fabrique de la page Quiz & Assessments d'une académie.
   ============================================================ */

import { mountShell } from '../../../shared/components/academy/academy-shell.js';
import { checkAcademyAccess } from '../../../shared/components/academy/academy-access.js';
import { quizCards, sortQuizzesByLevel } from '../../../shared/components/academy/quiz-cards.js';
import { callFunction } from '../../../js/core/api-client.js';
import { renderLockedView } from './dashboard.factory.js';

export function createQuizPage(code) {
  return function renderAcademyQuiz() {
    checkAcademyAccess(code).then(function (access) {
      if (!access.allowed) { renderLockedView(document.getElementById('app'), access.academy); return; }
      const a = access.academy;

      callFunction('getQuizCatalog').then(function (r) {
        const all = (r && r.quizzes) || [];
        const quizzes = sortQuizzesByLevel(
          all.filter(function (q) { return q.academy === a.key; }),
          a.levels
        );
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'quiz',
          contentHtml: '<h3>Quiz & Assessments</h3>' +
            '<p class="ac-header-cert" style="margin:0 0 1rem">20 questions — certificate at 80%</p>' +
            (quizzes.length
              ? quizCards({ quizzes: quizzes, levels: a.levels })
              : '<p class="ac-courses-empty">No quiz available yet for this academy.</p>')
        });
      }).catch(function () {
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'quiz',
          contentHtml: '<p class="ac-courses-empty">Quiz indisponibles pour le moment.</p>'
        });
      });
    });
  };
}
