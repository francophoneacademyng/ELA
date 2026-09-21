/* ============================================================
   ELA — shared/components/academy/quiz-cards.js
   Cartes de quiz par niveau — badge « 20 questions — certificat à 80 % ».
   ============================================================ */

import { QUIZ_QUESTIONS, QUIZ_PASS_SCORE } from '../../config/academies.config.js';
import { t } from '../../../js/core/i18n-helpers.js';

/**
 * @param {{quizzes:Array<{id,title,level,academy}>, levels?:string[]}} opts
 * Les quiz sont groupés par niveau dans l'ordre du référentiel.
 */
export function quizCards(opts) {
  const quizzes = (opts && opts.quizzes) || [];
  const levels = (opts && opts.levels) || [];
  if (!quizzes.length) {
    return '<p class="ac-courses-empty">' + t('academies.quiz.empty') + '</p>';
  }
  const badge = t('academies.quiz.badge')
    .replace('{n}', QUIZ_QUESTIONS)
    .replace('{p}', QUIZ_PASS_SCORE);
  let html = '<div class="ac-quiz-grid">';
  quizzes.forEach(function (q) {
    html += '' +
      '<a class="ac-quiz-card" href="#/quiz?id=' + encodeURIComponent(q.id) + '">' +
        '<span class="ac-quiz-level">' + escapeHtml(q.level || '') + '</span>' +
        '<span class="ac-quiz-title">' + escapeHtml(q.title || '') + '</span>' +
        '<span class="ac-quiz-badge">' + badge + '</span>' +
      '</a>';
  });
  html += '</div>';
  return html;
}

/** Trie les quiz selon l'ordre des niveaux du référentiel. */
export function sortQuizzesByLevel(quizzes, levels) {
  const order = {};
  (levels || []).forEach(function (l, i) { order[String(l).toUpperCase()] = i; });
  return (quizzes || []).slice().sort(function (a, b) {
    const ia = order[String(a.level || '').toUpperCase()];
    const ib = order[String(b.level || '').toUpperCase()];
    return (ia == null ? 99 : ia) - (ib == null ? 99 : ib);
  });
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
