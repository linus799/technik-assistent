const base = self.registration.scope;
const prefix = 'technik-assistent:' + base + ':';
const cacheName = prefix + '09638e1e34b589c8';
const assets = ["./","./index.html","./manifest.webmanifest","./apple-touch-icon.png","./icon-192.png","./icon-512.png","./favicon.png","./assets/index-LGUF-im3.js","./assets/index-DA8npiDL.css"].map(path => new URL(path, base).href);
const shell = new URL('./', base).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter(name => name.startsWith(prefix) && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const page = request.mode === 'navigate' && (
    url.origin + url.pathname === shell || url.origin + url.pathname === new URL('./index.html', base).href
  );
  if (!page && !assets.includes(url.href)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    // These URLs are fixed build assets, including scripts requested with CORS.
    return await cache.match(page ? shell : request.url, { ignoreVary: true }) ?? fetch(request);
  })());
});
