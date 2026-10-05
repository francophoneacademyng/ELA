/* ============================================================
   ELA — functions/publication-policy.js   (PUR, sans accès base)
   ------------------------------------------------------------
   Politique UNIQUE de publication du contenu curriculaire.
   Utilisée par toutes les voies de publication privilégiées afin
   qu'aucune ne puisse publier un contenu non légitimement
   publiable. La règle est :
     READY             → publiable
     DRAFT             → refusé (contenu non finalisé)
     REVIEW_REQUIRED   → refusé (revue académique humaine requise)
     MISSING           → refusé (contenu absent)
   Le serveur est l'autorité : un client ne peut JAMAIS faire passer
   un contenu en READY ni contourner ce garde-fou.
   ============================================================ */

'use strict';

const PUBLISHABLE_STATES = ['READY'];

function canPublishContent(contentState) {
  const s = String(contentState == null ? 'MISSING' : contentState).trim().toUpperCase();
  if (s === 'READY') return { ok: true, state: s, reason: null };
  if (s === 'DRAFT') return { ok: false, state: s, reason: 'content-draft' };
  if (s === 'REVIEW_REQUIRED') return { ok: false, state: s, reason: 'review-required' };
  if (s === 'MISSING') return { ok: false, state: s, reason: 'content-missing' };
  return { ok: false, state: s, reason: 'unknown-content-state' };
}

function isPublishable(contentState) {
  return canPublishContent(contentState).ok;
}

module.exports = {
  PUBLISHABLE_STATES,
  canPublishContent,
  isPublishable
};
