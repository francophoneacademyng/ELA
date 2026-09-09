/* ============================================================
   ELA — Service Worker (PWA)
   Version du cache : ela-pwa-v3
   Strategie :
     - Cache-First pour les assets statiques (CSS, JS, fonts,
       images clefs).
     - Network-First pour les pages (navigation), avec repli
       sur le cache puis sur index.html (SPA hash-routing).
   ============================================================ */

var CACHE_NAME = 'ela-pwa-v3';

var PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/main.css',
  '/js/firebase-config.js',
  '/js/i18n.js',
  '/js/app.js',
  '/js/routes-v2.js',
  '/js/marketing.js',
  '/js/core/api-client.js',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(PRECACHE_URLS);
      })
      .catch(function (err) {
        if (self.console) console.warn('[SW] Precache incomplete:', err);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;

  /* On ne traite que les GET de meme origine. */
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* Network-First pour les navigations (pages). */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  /* Cache-First pour les assets. */
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (response && (response.status === 200 || response.type === 'basic')) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      });
    })
  );
});
