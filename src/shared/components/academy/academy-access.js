/* ============================================================
   ELA — shared/components/academy/academy-access.js
   Garde d'accès par abonnement (Phase D).
   - Source de vérité : Cloud Function getMyAcademies (callable).
   - Cache client de 60 s. La sécurité reste côté serveur :
     cette garde n'est qu'une UX, jamais la protection réelle.
   ============================================================ */

import { callFunction } from '../../../js/core/api-client.js';
import { getAcademy } from '../../config/academies.config.js';

const CACHE_TTL = 60 * 1000;
let cache = { value: null, ts: 0 };

/**
 * Liste des codes d'académies accessibles pour l'utilisateur courant.
 * @param {boolean} [force] ignorer le cache
 * @returns {Promise<string[]>} codes (FR/DE/ZH/EN/AR/RU), [] si aucune.
 */
export function getMyAcademies(force) {
  if (!force && cache.value && (Date.now() - cache.ts) < CACHE_TTL) {
    return Promise.resolve(cache.value);
  }
  return callFunction('getMyAcademies').then(function (r) {
    const codes = (r && r.academies) || [];
    cache = { value: codes, ts: Date.now() };
    return codes;
  });
}

/** Invalide le cache (après un paiement, une déconnexion…). */
export function invalidateAcademiesCache() {
  cache = { value: null, ts: 0 };
}

/**
 * Vérifie l'accès à une académie.
 * @returns {Promise<{allowed:boolean, academies:string[], academy:Object}>}
 */
export function checkAcademyAccess(code) {
  const academy = getAcademy(code);
  if (!academy) return Promise.resolve({ allowed: false, academies: [], academy: null });
  return getMyAcademies().then(function (codes) {
    return {
      allowed: codes.indexOf(academy.code) >= 0,
      academies: codes,
      academy: academy
    };
  });
}
