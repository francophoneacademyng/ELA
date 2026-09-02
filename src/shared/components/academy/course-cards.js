/* ============================================================
   ELA — shared/components/academy/course-cards.js
   Cartes de cours — réutilise le style éditorial .academy-row.
   ============================================================ */

/**
 * @param {{courses:Array<{id,title,level,category,description,academy}>,
 *          emptyLabel?:string}} opts
 */
export function courseCards(opts) {
  const courses = (opts && opts.courses) || [];
  const emptyLabel = (opts && opts.emptyLabel) || 'No course available for this filter yet.';
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
        '<span class="academy-status status-open">' + escapeHtml(c.category || 'Course') + '</span>' +
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
