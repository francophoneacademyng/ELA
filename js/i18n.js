/* ============================================================
   ELA — i18n engine (interface languages: en / fr / ar / de / ru / zh)
   NOTE : ES (espagnol) est temporairement désactivé (i18n/es.json conservé).
   - Loads i18n/<lang>.json
   - Applies [data-i18n] keys to static shell (nav, footer, announce)
   - Pages are rendered by app.js using ELA_I18N.t(key)
   - Sets <html lang> and dir (rtl for Arabic, ltr otherwise)
   ============================================================ */

window.ELA_I18N = (function () {
  var current = 'en';
  var dict = {};
  var fallback = {};
  var listeners = [];

  /* Langues d'interface ACTIVES.
     ES (espagnol) est temporairement DÉSACTIVÉ : i18n/es.json est conservé
     et peut être réactivé en le rajoutant simplement à cette liste. */
  var ACTIVE_LANGS = ['en', 'fr', 'ar', 'de', 'ru', 'zh'];

  function t(key) {
    return dict[key] || fallback[key] || key;
  }

  function loadFallback() {
    if (fallback && Object.keys(fallback).length) return Promise.resolve();
    return fetch('i18n/en.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { fallback = data || {}; })
      .catch(function () { /* repli silencieux */ });
  }

  function applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (dict[key]) el.setAttribute('aria-label', dict[key]);
    });
    document.querySelectorAll('[data-wa-text]').forEach(function (el) {
      var key = el.getAttribute('data-wa-text');
      var base = el.getAttribute('data-wa-base');
      if (dict[key] && base) el.setAttribute('href', base + '?text=' + encodeURIComponent(dict[key]));
    });
    /* Titre de page + meta description localisés (clés meta.*). */
    if (dict['meta.title']) document.title = dict['meta.title'];
    var desc = document.querySelector('meta[name="description"]');
    if (desc && dict['meta.description']) desc.setAttribute('content', dict['meta.description']);
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === current);
    });
  }

  function setLang(lang) {
    if (ACTIVE_LANGS.indexOf(lang) < 0) lang = 'en';
    return loadFallback()
      .then(function () { return fetch('i18n/' + lang + '.json'); })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        dict = data;
        current = lang;
        localStorage.setItem('ela-lang', lang);
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        applyStatic();
        listeners.forEach(function (fn) { fn(lang); });
      })
      .catch(function (err) { console.error('i18n load failed:', err); });
  }

  function init() {
    var saved = localStorage.getItem('ela-lang') || 'en';
    if (ACTIVE_LANGS.indexOf(saved) < 0) saved = 'en';
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
    });
    return setLang(saved);
  }

  function onChange(fn) { listeners.push(fn); }
  function getLang() { return current; }

  return { t: t, init: init, setLang: setLang, onChange: onChange, getLang: getLang };
})();
