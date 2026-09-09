/* ============================================================
   ELA â€” shared/components/academy/filters.js
   Filtres de catÃ©gorie (Grammar/Vocabulary/â€¦) et de niveau
   (All/A1/â€¦/C2 ou HSK1â†’6). Rendu + binding des handlers.
   Les valeurs techniques (data-*) restent inchangÃ©es ; seuls
   les libellÃ©s affichÃ©s sont localisÃ©s.
   ============================================================ */

import { CATEGORY_FILTERS } from '../../config/academies.config.js';
import { t } from '../../../js/core/i18n-helpers.js';

function catLabel(c) {
  if (c === 'All') return t('academies.filter.all');
  var key = 'academies.filter.cat.' + c;
  var val = t(key);
  return val === key ? c : val;
}

/**
 * Rend les deux rangÃ©es de filtres.
 * @param {{levels:string[], activeCategory?:string, activeLevel?:string}} opts
 */
export function renderFilters(opts) {
  const levels = (opts && opts.levels) || [];
  const activeCat = (opts && opts.activeCategory) || 'All';
  const activeLevel = (opts && opts.activeLevel) || 'All';

  let html = '<div class="ac-filters">';
  html += '<div class="ac-filter-row" data-filter-group="category">';
  CATEGORY_FILTERS.forEach(function (c) {
    html += '<button type="button" class="ac-filter-btn' + (c === activeCat ? ' active' : '') + '" data-filter-category="' + c + '">' + catLabel(c) + '</button>';
  });
  html += '</div>';
  html += '<div class="ac-filter-row" data-filter-group="level">';
  ['All'].concat(levels).forEach(function (l) {
    const show = l === 'All' ? t('academies.filter.all') : l;
    html += '<button type="button" class="ac-filter-btn ac-filter-level' + (l === activeLevel ? ' active' : '') + '" data-filter-level="' + l + '">' + show + '</button>';
  });
  html += '</div></div>';
  return html;
}

/**
 * Lie les clics de filtres. onSelect({category, level}).
 */
export function bindFilters(root, onSelect) {
  if (!root) return;
  let category = 'All';
  let level = 'All';
  root.querySelectorAll('[data-filter-category]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      category = btn.getAttribute('data-filter-category');
      root.querySelectorAll('[data-filter-category]').forEach(function (b) { b.classList.toggle('active', b === btn); });
      if (typeof onSelect === 'function') onSelect({ category: category, level: level });
    });
  });
  root.querySelectorAll('[data-filter-level]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      level = btn.getAttribute('data-filter-level');
      root.querySelectorAll('[data-filter-level]').forEach(function (b) { b.classList.toggle('active', b === btn); });
      if (typeof onSelect === 'function') onSelect({ category: category, level: level });
    });
  });
}

/** Applique les filtres Ã  une liste de cours. */
export function applyCourseFilters(courses, category, level) {
  return (courses || []).filter(function (c) {
    const okCat = category === 'All' || String(c.category || '').toLowerCase() === String(category).toLowerCase();
    const okLevel = level === 'All' || String(c.level || '').toUpperCase() === String(level).toUpperCase();
    return okCat && okLevel;
  });
}
