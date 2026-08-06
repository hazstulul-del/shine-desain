const CACHE = 'shine-v1.1';
const ASSETS = ['/', '/index.html', '/css/styles.css', '/js/config.js', '/js/storage.js', '/js/ai.js', '/js/three-bg.js', '/js/three-viewport.js', '/js/app.js', '/manifest.json', '/icons/favicon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/') || e.request.url.includes('api.groq.com')) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached)));
});
