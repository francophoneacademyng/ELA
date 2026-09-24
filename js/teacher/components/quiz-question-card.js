/* ============================================================
   ELA — teacher/components/quiz-question-card.js
   Carte « question de quizz » réutilisable (extrait de
   quizQuestionCardHtml de l'ancien code).
   ============================================================ */

import { escapeHtml } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { TI } from './teacher-icons.js';

/**
 * @param {object} q { text, options[4], correctIndex }
 * @param {number} index index de la question (0-based)
 * @param {boolean} removable bouton suppression
 * @returns {string} HTML
 */
export function quizQuestionCardHtml(q, index, removable) {
  const options = [0, 1, 2, 3].map(function (oi) {
    return '<input type="text" class="input" data-quiz-option="' + index + '" data-oi="' + oi +
      '" placeholder="' + t('teacher.option') + ' ' + (oi + 1) + '" value="' + escapeHtml(q.options[oi] || '') + '">';
  }).join('');

  const radios = [0, 1, 2, 3].map(function (oi) {
    return '<label class="quiz-radio"><input type="radio" name="quiz-correct-' + index +
      '" data-quiz-correct="' + index + '" value="' + oi + '"' +
      (q.correctIndex === oi ? ' checked' : '') + '> ' + (oi + 1) + '</label>';
  }).join('');

  return '<div class="quiz-question-card" data-question-index="' + index + '">' +
    '<div class="quiz-question-head"><strong>' + t('teacher.question') + ' ' + (index + 1) + '</strong>' +
      (removable ? '<button type="button" class="btn btn-ghost btn-sm" data-remove-question="' + index + '" aria-label="Remove">' + TI.remove + '</button>' : '') +
    '</div>' +
    '<input type="text" class="input" data-quiz-text="' + index + '" placeholder="' +
      t('teacher.questionText') + '" value="' + escapeHtml(q.text) + '">' +
    '<div class="quiz-options">' + options + '</div>' +
    '<div class="quiz-correct">' + t('teacher.correctAnswer') + ' : ' + radios + '</div>' +
  '</div>';
}
