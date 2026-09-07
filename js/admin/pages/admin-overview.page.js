/* ============================================================
   ELA - admin/pages/admin-overview.page.js
   Page « Vue d'ensemble » (/admin/overview) — 6 KPIs premium :
   revenus du mois, étudiants, enseignants, cours (getContentStats),
   inscriptions 7j, parrainages. Données réelles du panel.
   ============================================================ */

import { renderAdminShell } from './admin-shell.js';
import { fmtNgn } from '../../core/dom.js';
import { callFunction } from '../../core/api-client.js';
import { getState } from '../services/admin-state.js';

export function renderAdminOverview() {
  renderAdminShell({
    active: '#/admin/overview',
    title: 'Vue d\'ensemble',
    subtitle: 'Activité globale de la plateforme.',
    renderContent: function () { return kpisHtml({ courses: '…' }); },
    onBind: function () { loadCourseStats(); paint(); }
  });
}

function paint() {
  const s = getState();
  const now = Date.now();
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const weekAgo = now - 7 * 24 * 3600 * 1000;

  let revenue = 0;
  (s.transactions || []).forEach(function (t) {
    if (t.status === 'success' && (t.createdAt || 0) >= monthStart.getTime()) revenue += t.amount || 0;
  });
  const students = (s.users || []).filter(function (u) { return u.role === 'student'; }).length;
  const teachers = (s.users || []).filter(function (u) { return u.role === 'teacher'; }).length;
  const newUsers = (s.users || []).filter(function (u) { return (u.createdAt || 0) >= weekAgo; }).length;
  const referrals = (s.users || []).filter(function (u) { return !!u.referralCodeUsed; }).length;

  set('ov-revenue', fmtNgn(revenue));
  set('ov-students', String(students));
  set('ov-teachers', String(teachers));
  set('ov-new', String(newUsers));
  set('ov-referrals', String(referrals));
}

function loadCourseStats() {
  callFunction('getContentStats', {}).then(function (stats) {
    if (stats && stats.courses !== undefined) set('ov-courses', String(stats.courses));
  }).catch(function () {
    const s = getState();
    set('ov-courses', String((s.metrics && s.metrics.courses) || 0));
  });
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function kpisHtml(stats) {
  return '<div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr);">' +
    kpi('💰 REVENUS DU MOIS', 'ov-revenue', 'NGN 0') +
    kpi('👥 ÉTUDIANTS ACTIFS', 'ov-students', '0') +
    kpi('👨‍🏫 ENSEIGNANTS', 'ov-teachers', '0') +
    kpi('📚 COURS', 'ov-courses', String(stats.courses || 0)) +
    kpi('🆕 INSCRIPTIONS (7J)', 'ov-new', '0') +
    kpi('🎁 PARRAINAGES', 'ov-referrals', '0') +
  '</div>';
}

function kpi(label, id, val) {
  return '<div class="kpi-card"><div class="kpi-label">' + label + '</div>' +
    '<div class="kpi-value" id="' + id + '">' + val + '</div></div>';
}
