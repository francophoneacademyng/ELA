/* ============================================================
   ELA — core/dom.js
   ------------------------------------------------------------
   Utilitaires DOM partagés (fin de duplication entre dashboard,
   admin et teacher). Vanilla JS, aucune dépendance.
   ============================================================ */

/** Échappe une valeur texte pour insertion dans du HTML généré. */
export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Timestamp Firestore (ou Date/ISO/ms) → millisecondes (0 si absent). */
export function toMillis(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/** Formate un montant en Naira (les montants restent calculés côté serveur). */
export function fmtNaira(amount) {
  const n = Number(amount) || 0;
  return '₦' + n.toLocaleString('en-NG');
}

/** Formate un montant en Naira, style FA : « NGN 75,000 » (jamais ₦). */
export function fmtNgn(amount) {
  const n = Number(amount) || 0;
  return 'NGN ' + n.toLocaleString('en-NG');
}

/** Formate une date selon la langue d'interface courante. */
export function formatDate(ms, opts) {
  if (!ms) return '—';
  const lang = (typeof window !== 'undefined' && window.ELA_I18N && window.ELA_I18N.getLang) ? window.ELA_I18N.getLang() : 'en';
  try { return new Date(ms).toLocaleDateString(lang, opts || undefined); }
  catch (e) { return new Date(ms).toLocaleDateString(); }
}

export function formatDateTime(ms) {
  if (!ms) return '—';
  const lang = (typeof window !== 'undefined' && window.ELA_I18N && window.ELA_I18N.getLang) ? window.ELA_I18N.getLang() : 'en';
  try { return new Date(ms).toLocaleString(lang); }
  catch (e) { return new Date(ms).toLocaleString(); }
}

/** Paramètre de query d'un hash (#/route?key=value). */
export function getHashParam(name) {
  const hash = (typeof window !== 'undefined' && window.location.hash) || '';
  const qi = hash.indexOf('?');
  if (qi < 0) return null;
  return new URLSearchParams(hash.slice(qi + 1)).get(name);
}

/** Path courant du hash, sans query (#/admin-v2?x → '/admin-v2'). */
export function getHashPath() {
  const hash = (typeof window !== 'undefined' && window.location.hash ? window.location.hash : '').replace(/^#/, '');
  const qi = hash.indexOf('?');
  return qi >= 0 ? hash.slice(0, qi) : (hash || '/');
}

/** Toast non bloquant (remplace les alert()). */
export function toast(message, kind) {
  if (typeof document === 'undefined') return;
  let host = document.getElementById('ela-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'ela-toast-host';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = 'ela-toast ela-toast-' + (kind || 'info');
  el.textContent = String(message == null ? '' : message);
  host.appendChild(el);
  requestAnimationFrame(function () { el.classList.add('show'); });
  setTimeout(function () {
    el.classList.remove('show');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
  }, 3200);
}

/** Déclenche l'observateur .reveal + reset du scroll (comme afterRender d'app.js). */
export function afterRender(routeName) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.classList.toggle('active', a.getAttribute('data-nav') === routeName);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); observer.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
  }
  window.scrollTo(0, 0);
}

if (typeof window !== 'undefined') {
  window.ELA_DOM = { escapeHtml: escapeHtml, toMillis: toMillis, fmtNaira: fmtNaira, formatDate: formatDate, formatDateTime: formatDateTime, getHashParam: getHashParam, getHashPath: getHashPath, toast: toast, afterRender: afterRender };
}
