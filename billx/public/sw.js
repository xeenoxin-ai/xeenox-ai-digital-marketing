// BillX service worker: makes the app installable and opens the last
// loaded screen when the internet drops. Pages are fetched fresh from the
// network first, so updates show up straight away.
const CACHE = 'billx-pages-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const isPage = req.mode === 'navigate';
  const isAsset = /\/assets\/.+\.(js|css)$/.test(new URL(req.url).pathname);
  if (!isPage && !isAsset) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || Response.error())),
  );
});
