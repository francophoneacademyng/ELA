/* ============================================================
   ELA — core/i18n-helpers.js
   Petit adaptateur i18n : t(key, fallback) — renvoie la clé
   elle-même si absente (au lieu de casser l'affichage).
   ============================================================ */

export function t(key, fallback) {
  const w = typeof window !== 'undefined' ? window : null;
  if (w && w.ELA_I18N && typeof w.ELA_I18N.t === 'function') {
    const val = w.ELA_I18N.t(key);
    if (val && val !== key) return val;
  }
  return fallback != null ? fallback : key;
}

export function getLang() {
  const w = typeof window !== 'undefined' ? window : null;
  return (w && w.ELA_I18N && w.ELA_I18N.getLang) ? w.ELA_I18N.getLang() : 'en';
}
