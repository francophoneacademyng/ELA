/* ============================================================
   ELA — i18n engine (interface language: en / fr / ar)
   - Loads i18n/<lang>.json
   - Applies [data-i18n] keys to static shell (nav, footer, announce)
   - Pages are rendered by app.js using ELA_I18N.t(key)
   - Sets <html lang> and dir (rtl for Arabic)
   ============================================================ */

window.ELA_I18N = (function () {
  var current = 'en';
  var dict = {};
  var listeners = [];

  function t(key) {
    return dict[key] || key;
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
    return fetch('i18n/' + lang + '.json')
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
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
    });
    return setLang(saved);
  }

  function onChange(fn) { listeners.push(fn); }
  function getLang() { return current; }

  return { t: t, init: init, setLang: setLang, onChange: onChange, getLang: getLang };
})();
