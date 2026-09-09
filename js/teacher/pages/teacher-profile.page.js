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
import { ACADEMIES, codeFromKey } from '../../../src/shared/config/academies.config.js';

export function renderTeacherProfile() {
  renderTeacherShell({
    active: '#/teacher/profile',
    title: 'Mon profil ⚙️',
    subtitle: 'Vos informations personnelles.',
    renderContent: function (profile) { return layoutHtml(profile); },
    onBind: function () { bindSave(); }
  });
}

function layoutHtml(profile) {
  var p = profile || {};
  var academyLabel = academyOf(p.academy);
  var initials = String(p.displayName || p.email || '?').trim().charAt(0).toUpperCase();

  return '<div class="card" style="max-width:640px">' +
    '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.2rem">' +
      '<div style="width:56px;height:56px;border-radius:50%;background:var(--forest);color:#fff;' +
        'display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700">' + initials + '</div>' +
      '<div><strong class="user-name">' + esc(p.displayName || 'Enseignant') + '</strong>' +
        '<p class="muted" style="margin:0">' + academyLabel + '</p></div>' +
    '</div>' +
    '<div style="margin-bottom:0.9rem">' +
      '<label for="tp-name" style="display:block;font-weight:600;margin-bottom:0.3rem">Nom affiché</label>' +
      '<input type="text" id="tp-name" class="input" style="width:100%" value="' + esc(p.displayName || '') + '">' +
    '</div>' +
    '<div style="margin-bottom:0.9rem">' +
      '<label style="display:block;font-weight:600;margin-bottom:0.3rem">Email</label>' +
      '<input type="text" class="input" style="width:100%" value="' + esc(p.email || '') + '" readonly disabled>' +
    '</div>' +
    '<div style="margin-bottom:0.9rem">' +
      '<label style="display:block;font-weight:600;margin-bottom:0.3rem">Académie</label>' +
      '<input type="text" class="input" style="width:100%" value="' + esc(academyLabel) + '" readonly disabled>' +
      '<p class="muted" style="margin:0.3rem 0 0;font-size:0.8rem">L\'académie est attribuée par l\'administration.</p>' +
    '</div>' +
    '<button class="btn btn-solid" id="tp-save">Enregistrer</button>' +
  '</div>';
}

function bindSave() {
  var btn = document.getElementById('tp-save');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var name = (document.getElementById('tp-name') || {}).value || '';
    name = name.trim();
    if (!name) { toast('Le nom ne peut pas être vide.', 'error'); return; }
    getProfile().then(function (profile) {
      if (!profile || !profile.uid) { toast('Profil introuvable.', 'error'); return; }
      var db = window.firebase && window.firebase.firestore;
      if (!db) { toast('Service indisponible.', 'error'); return; }
      btn.disabled = true;
      return db().collection('users').doc(profile.uid).update({ displayName: name })
        .then(function () {
          toast('Profil enregistré ✅', 'success');
          return getProfile(true); // invalide le cache
        })
        .catch(function () { toast("Erreur lors de l'enregistrement.", 'error'); })
        .then(function () { btn.disabled = false; });
    });
  });
}

function academyOf(key) {
  var code = codeFromKey(key) || String(key || '').toUpperCase();
  var a = ACADEMIES[code];
  return a ? a.label : 'Non assignée';
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
  });
}