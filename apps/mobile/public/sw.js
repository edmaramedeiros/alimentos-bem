// Minimal service worker: exists so the browser considers this app installable as a PWA.
// Deliberately does not cache anything yet, to avoid serving stale bundles while iterating.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
