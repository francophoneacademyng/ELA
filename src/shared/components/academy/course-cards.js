/* ============================================================
   ELA â€” shared/components/academy/course-cards.js
   Cartes de cours â€” rÃ©utilise le style Ã©ditorial .academy-row.
   ============================================================ */

import { t } from '../../../js/core/i18n-helpers.js';

/**
 * @param {{courses:Array<{id,title,level,category,description,academy}>,
 *          emptyLabel?:string}} opts
 */
function catChip(value) {
  if (!value) return t('academies.courses.chip');
  var key = 'academies.filter.cat.' + value;
  var val = t(key);
  return val === key ? value : val;
}

export function courseCards(opts) {
  const courses = (opts && opts.courses) || [];
  const emptyLabel = (opts && opts.emptyLabel) || t('academies.courses.empty');
  if (!courses.length) {
    return '<p class="ac-courses-empty">' + emptyLabel + '</p>';
  }
  let html = '<div class="academies ac-courses">';
  courses.forEach(function (c, i) {
    html += '' +
      '<a class="academy-row ac-course-row" href="#/course?id=' + encodeURIComponent(c.id) + '">' +
        '<span class="academy-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="academy-name">' + escapeHtml(c.title || '') + '<span class="native">' + escapeHtml(c.level || '') + '</span></span>' +
        '<span class="academy-desc">' + escapeHtml(c.description || '') + '</span>' +
        '<span class="academy-status status-open">' + catChip(c.category) + '</span>' +
      '</a>';
  });
  html += '</div>';
  return html;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
