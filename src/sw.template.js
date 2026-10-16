/* Curious Minds service worker (generated from src/sw.template.js by scripts/build.ts).
 * Strategy: precache the app shell, content and flags on install; serve them cache-first.
 * Google Fonts are cached on first use (stale-while-revalidate). Old caches are removed on activate.
 * Player data is in IndexedDB, never in this cache. */
const CACHE = '__CACHE__';
const PRECACHE = __PRECACHE__;
const FONT_CACHE = 'curious-minds-fonts';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        const fetching = fetch(req)
          .then((res) => {
            if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || fetching;
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Navigations: network first so new deploys show up, fall back to the cached shell offline.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('index.html')));
    return;
  }
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
