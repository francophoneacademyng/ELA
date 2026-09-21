/* ============================================================
   ELA - teacher/pages/teacher-profile.page.js
   Page « Mon profil » (/teacher/profile).
   - Lecture : profil authentifié (users/{uid} via getProfile).
   - Écriture : displayName uniquement, mise à jour directe de
     users/{uid} autorisée par firestore.rules (rôle inchangé).
   - Email / académie : en lecture seule (imposés côté serveur).
   ============================================================ */

import { renderTeacherShell } from './teacher-shell.js';
import { getProfile } from '../../core/auth.service.js';
import { toast } from '../../core/dom.js';
import { t } from '../../core/i18n-helpers.js';
import { ACADEMIES, codeFromKey } from '../../../src/shared/config/academies.config.js';

var ACADEMY_OPT = { FR: 'francophone', DE: 'germanophone', ZH: 'sinophone', EN: 'anglophone', AR: 'arabophone', RU: 'russophone' };

export function renderTeacherProfile() {
  renderTeacherShell({
    active: '#/teacher/profile',
    title: t('teacher.profile.title'),
    subtitle: t('teacher.profile.subtitle'),
    renderContent: function (profile) { return layoutHtml(profile); },
    onBind: function () { bindSave(); }
  });
}

function layoutHtml(profile) {
  var p = profile || {};
  var academyLabel = academyOf(p.academy);
  var initials = String(p.displayName || p.email || '?').trim().charAt(0).toUpperCase();

  return '<div class="card ela-teacher-form">' +
    '<div class="profile-head">' +
      '<div class="profile-avatar">' + initials + '</div>' +
      '<div><strong class="user-name">' + esc(p.displayName || t('admin.teacher')) + '</strong>' +
        '<p class="muted">' + academyLabel + '</p></div>' +
    '</div>' +
    '<div class="form-field">' +
      '<label for="tp-name">' + t('teacher.profile.displayName') + '</label>' +
      '<input type="text" id="tp-name" class="input" value="' + esc(p.displayName || '') + '">' +
    '</div>' +
    '<div class="form-field">' +
      '<label>' + t('admin.email') + '</label>' +
      '<input type="text" class="input" value="' + esc(p.email || '') + '" readonly disabled>' +
    '</div>' +
    '<div class="form-field">' +
      '<label>' + t('admin.academy') + '</label>' +
      '<input type="text" class="input" value="' + esc(academyLabel) + '" readonly disabled>' +
      '<p class="muted form-hint">' + t('teacher.profile.academyHint') + '</p>' +
    '</div>' +
    '<button class="btn-primary" id="tp-save">' + t('admin.save') + '</button>' +
  '</div>';
}

function bindSave() {
  var btn = document.getElementById('tp-save');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var name = (document.getElementById('tp-name') || {}).value || '';
    name = name.trim();
    if (!name) { toast(t('teacher.profile.nameEmpty'), 'error'); return; }
    getProfile().then(function (profile) {
      if (!profile || !profile.uid) { toast(t('teacher.profile.saveError'), 'error'); return; }
      var db = window.firebase && window.firebase.firestore;
      if (!db) { toast(t('teacher.profile.serviceUnavailable'), 'error'); return; }
      btn.disabled = true;
      return db().collection('users').doc(profile.uid).update({ displayName: name })
        .then(function () {
          toast(t('teacher.profile.saved'), 'success');
          return getProfile(true); // invalide le cache
        })
        .catch(function () { toast(t('teacher.profile.saveError'), 'error'); })
        .then(function () { btn.disabled = false; });
    });
  });
}

function academyOf(key) {
  var code = codeFromKey(key) || String(key || '').toUpperCase();
  var opt = ACADEMY_OPT[code];
  if (opt) return t('academies.option.' + opt);
  var a = ACADEMIES[code];
  return a ? a.label : t('teacher.profile.notAssigned');
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
  });
}
