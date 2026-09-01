/* ============================================================
   ELA — core/api-client.js
   ------------------------------------------------------------
   Unique point d'accès aux Cloud Functions (facade réseau).
   - Force la région africa-south1 (les fonctions y sont déployées ;
     sans région le SDK compat cible us-central1 → erreur CORS).
   - Normalise les erreurs en { code, messageKey } exploitable par l'i18n.
   Exposé en module ES et sur window.ELA_API (compat script classique).
   ============================================================ */

const REGION = 'africa-south1';

/** Retourne le callable Firebase régional (lazy : firebase chargé au runtime). */
export function callable(name) {
  const fb = typeof window !== 'undefined' ? window.firebase : null;
  if (!fb || !fb.app || !fb.functions) {
    throw new Error('firebase-not-ready');
  }
  return fb.app().functions(REGION).httpsCallable(name);
}

/**
 * Appelle une Cloud Function et renvoie r.data.
 * Rejette avec { code, messageKey } où messageKey est une clé i18n
 * (errors.<code>) ou null si le code est inconnu.
 */
export function callFunction(name, data) {
  return new Promise(function (resolve, reject) {
    let fn;
    try {
      fn = callable(name);
    } catch (e) {
      reject(normalizeError(e));
      return;
    }
    fn(data || {})
      .then(function (r) { resolve(r && r.data); })
      .catch(function (e) { reject(normalizeError(e)); });
  });
}

/** Normalise une erreur Firebase Functions en { code, messageKey }. */
export function normalizeError(err) {
  const raw = err && err.code ? String(err.code) : '';
  const code = raw.replace('functions/', '') || (err && err.message) || 'unknown';
  return { code: code, messageKey: 'errors.' + code, original: err };
}

/* Enregistrement global (compat avec le script classique js/app.js). */
if (typeof window !== 'undefined') {
  window.ELA_API = { callFunction: callFunction, callable: callable, normalizeError: normalizeError, REGION: REGION };
}
