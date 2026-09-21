/* ============================================================
   ELA — academies/base/pages/live.factory.js
   Fabrique de la page Live Classes d'une académie.
   UI seule : les données viennent du catalogue existant
   (getLiveCatalog → id, title, scheduledAt, academy) et la
   jonction utilise le mécanisme existant getLiveMeetingLink
   (auth + abonnement + fenêtre d'ouverture -15 min/+4 h).
   ============================================================ */

import { mountShell } from '../../../shared/components/academy/academy-shell.js';
import { checkAcademyAccess } from '../../../shared/components/academy/academy-access.js';
import { callFunction } from '../../../js/core/api-client.js';
import { t, getLang } from '../../../js/core/i18n-helpers.js';
import { renderLockedView } from './dashboard.factory.js';

/* Icônes SVG inline (trait currentColor, harmonisées ELA — pas d'emoji). */
var ICONS = {
  video: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
};

/* Fenêtre d'ouverture d'une classe : -15 min avant le début,
   alignée sur la logique serveur existante (getLiveMeetingLink). */
var GATE_MS = 15 * 60 * 1000;

function fmtDate(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleString(getLang(), { dateStyle: 'full', timeStyle: 'short' }); }
  catch (e) { try { return new Date(ts).toLocaleString(); } catch (e2) { return ''; } }
}

/* Statut affiché d'une classe du catalogue (classes à venir uniquement). */
function liveStatus(scheduledAt) {
  var t0 = Number(scheduledAt) || 0;
  var now = Date.now();
  if (now >= t0) return { key: 'live', label: t('academies.live.statusLive'), cls: 'status-open' };
  if (now >= t0 - GATE_MS) return { key: 'soon', label: t('live.joinSoon'), cls: 'status-soon' };
  return { key: 'scheduled', label: t('studentLive.statusScheduled'), cls: 'status-scheduled' };
}

/* CTA d'une classe : Rejoindre (mécanisme existant), connexion, ou statut. */
function joinCta(cls, signedIn) {
  var st = liveStatus(cls.scheduledAt);
  if (st.key === 'live') {
    return signedIn
      ? '<button type="button" class="btn btn-solid btn-sm sl-join" data-live-join="' + esc(cls.id) + '">' +
          '<span class="sl-join-icon" aria-hidden="true">' + ICONS.video + '</span>' + esc(t('live.join')) + '</button>'
      : '<a class="btn btn-outline btn-sm" href="#/login">' + esc(t('live.joinSignIn')) + '</a>';
  }
  return '<span class="academy-status ' + st.cls + '" role="status">' + esc(st.label) + '</span>';
}

/* Ligne statique : le CTA est rempli par hydrateLive après montage du shell. */
function liveRow(c, i) {
  var iso = '';
  try { iso = new Date(Number(c.scheduledAt)).toISOString(); } catch (e) { iso = ''; }
  return '' +
    '<div class="academy-row sl-row" style="pointer-events:none">' +
      '<span class="academy-num" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="academy-name">' + esc(c.title) + '</span>' +
      '<span class="academy-desc"><span class="sl-when-icon" aria-hidden="true">' + ICONS.calendar + '</span>' +
        (iso ? '<time datetime="' + iso + '">' : '<span>') + esc(fmtDate(c.scheduledAt)) + (iso ? '</time>' : '</span>') + '</span>' +
      '<span class="sl-cta"></span>' +
    '</div>';
}

function isSignedIn() {
  try {
    return !!(window.firebase && firebase.auth && firebase.auth().currentUser);
  } catch (e) { return false; }
}

/* Message d'erreur inline (jamais d'alert()). */
function showJoinError(container, message) {
  var zone = container.querySelector('#student-live-status');
  if (!zone) return;
  zone.innerHTML = '<p class="ac-status-error" role="alert">' + esc(message) + '</p>';
  clearTimeout(showJoinError._t);
  showJoinError._t = setTimeout(function () {
    if (zone.firstChild && zone.firstChild.textContent === message) zone.innerHTML = '';
  }, 6000);
}

/* Jonction via le mécanisme existant : getLiveMeetingLink
   (auth + abonnement + fenêtre d'ouverture vérifiés côté serveur). */
function bindJoinButtons(container) {
  container.querySelectorAll('[data-live-join]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var liveId = btn.getAttribute('data-live-join');
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      callFunction('getLiveMeetingLink', { liveClassId: liveId }).then(function (r) {
        if (r && r.meetingLink) {
          window.open(r.meetingLink, '_blank', 'noopener');
        } else {
          showJoinError(container, t('live.joinError'));
        }
      }).catch(function () {
        showJoinError(container, t('live.joinError'));
      }).then(function () {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      });
    });
  });
}

export function createLivePage(code) {
  return function renderAcademyLive() {
    checkAcademyAccess(code).then(function (access) {
      if (!access.allowed) { renderLockedView(document.getElementById('app'), access.academy); return; }
      const a = access.academy;

      callFunction('getLiveCatalog').then(function (r) {
        const all = (r && r.classes) || [];
        const classes = all.filter(function (c) { return c.academy === a.key; })
          .sort(function (x, y) { return (Number(x.scheduledAt) || 0) - (Number(y.scheduledAt) || 0); });

        let listHtml;
        if (classes.length) {
          listHtml = '<div class="academies student-live-list">';
          classes.forEach(function (c, i) { listHtml += liveRow(c, i); });
          listHtml += '</div>';
        } else {
          listHtml = '<div class="empty-state student-empty"><div class="empty-icon" aria-hidden="true">' + ICONS.calendar + '</div>' +
            '<p>' + t('academies.live.empty') + '</p></div>';
        }

        const content = '<div class="hub-top">' +
            '<h3>' + t('academies.shell.live') + '</h3>' +
            '<span class="academy-status ' + (classes.length ? 'status-open' : 'status-soon') + '" role="status">' +
              (classes.length ? t('studentLive.count').replace('{n}', String(classes.length)) : t('academies.live.empty')) +
            '</span>' +
          '</div>' +
          '<div id="student-live-status" aria-live="polite"></div>' +
          listHtml;

        const root = mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'live',
          contentHtml: content
        });
        hydrateLive(root, classes);
      }).catch(function () {
        mountShell({
          code: code, label: a.label, native: a.native, flag: a.flag,
          color: a.color, certification: a.certification, activePage: 'live',
          contentHtml: '<div class="empty-state student-empty"><div class="empty-icon" aria-hidden="true">' + ICONS.video + '</div>' +
            '<p>' + t('academies.live.unavailable') + '</p>' +
            '<p><button type="button" class="btn btn-outline btn-sm" id="student-live-retry">' + t('common.retry') + '</button></p></div>'
        });
        const app = document.getElementById('app');
        const retry = app && app.querySelector('#student-live-retry');
        if (retry) retry.addEventListener('click', function () { renderAcademyLive(); });
      });
    }).catch(function () {
      const app = document.getElementById('app');
      if (app) app.innerHTML = '<p class="ac-courses-empty">' + t('academies.loadError') + '</p>';
    });
  };
}

/* Second passage : remplit les CTA (statique → interactif) une fois le
   shell monté, avec l'état d'authentification réel de l'utilisateur. */
function hydrateLive(root, classes) {
  if (!root) return;
  const signedIn = isSignedIn();
  root.querySelectorAll('.sl-row').forEach(function (row, i) {
    const c = classes[i];
    if (!c) return;
    const ctaSlot = row.querySelector('.sl-cta');
    if (ctaSlot) ctaSlot.innerHTML = joinCta(c, signedIn);
    row.removeAttribute('style');
  });
  bindJoinButtons(root);
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
