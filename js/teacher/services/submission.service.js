/* ============================================================
   ELA — teacher/services/submission.service.js
   Orchestration : validation model → repository → rafraîchissement
   de la liste. L'académie/uid ne sont JAMAIS pris du formulaire :
   ils viennent du profil authentifié (teacherAuth).
   ============================================================ */

import { submitContent, fetchMySubmissions } from '../repositories/content.repository.js';
import { getState, setState } from './teacher-state.js';
import { getProfile } from '../../core/auth.service.js';

/**
 * Valide et soumet un brouillon.
 * @param {LessonDraft|QuizDraft|LiveDraft} draft (validate() + toPayload())
 * @param {'lesson'|'quiz'|'live'} type
 * @returns {Promise<{ok:boolean, errors:object|string[]}>}
 */
export function submitDraft(draft, type) {
  const validation = draft.validate();
  if (!validation.ok) {
    setState({ formErrors: validation.errors || {} });
    return Promise.resolve({ ok: false, errors: validation.errors });
  }
  setState({ submitting: true, formErrors: {}, error: null });
  return submitContent(type, draft.toPayload())
    .then(function () {
      setState({ submitting: false });
      return refreshSubmissions().then(function () { return { ok: true, errors: {} }; });
    })
    .catch(function (e) {
      setState({ submitting: false, error: e });
      return { ok: false, errors: {}, code: e && e.code };
    });
}

/** Recharge « mes soumissions » à partir du profil authentifié. */
export function refreshSubmissions() {
  setState({ contentLoading: true });
  return getProfile().then(function (profile) {
    if (!profile) { setState({ contentLoading: false, submissions: [] }); return []; }
    return fetchMySubmissions(profile.uid).then(function (subs) {
      setState({ submissions: subs, contentLoading: false });
      return subs;
    });
  }).catch(function () {
    setState({ contentLoading: false });
    return [];
  });
}
