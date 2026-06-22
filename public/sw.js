// Starlink Jewels — Image Cache Service Worker
//
// What this does:
//   1. Intercepts requests to Firebase Storage AND wsrv.nl (our image CDN)
//   2. CacheFirst strategy: serves from Cache Storage if available (instant)
//   3. On cache miss: fetches from network, caches the response
//
// Result:
//   First visit  → wsrv.nl fetches compressed WebP from Firebase (~smaller file)
//   Every visit after → served from local Cache Storage (zero network, instant)

const CACHE = 'starlink-img-v2';

// All hostnames whose GET responses we cache
const CACHE_HOSTS = [
  'wsrv.nl',                           // our image CDN (WebP-converted images)
  'firebasestorage.googleapis.com',    // raw Firebase Storage (fallback)
  'storage.googleapis.com',
];

// ── Install: activate immediately ─────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

// ── Activate: delete any old caches from previous SW versions ─────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('starlink-img-') && k !== CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: CacheFirst for all image CDN requests ───────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch { return; }

  // Only intercept our image hosts
  if (!CACHE_HOSTS.some((h) => url.hostname.includes(h))) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // 1. Cache hit → serve instantly (zero network)
      const cached = await cache.match(request);
      if (cached) return cached;

      // 2. Cache miss → fetch from network, cache, return
      try {
        const response = await fetch(request.clone());
        if (response.ok) {
          const ct = response.headers.get('content-type') || '';
          // Only cache actual image responses (not error HTML pages etc.)
          if (ct.startsWith('image/') || url.hostname === 'wsrv.nl') {
            cache.put(request, response.clone());
          }
        }
        return response;
      } catch {
        // Offline — return empty 503 (skeleton stays visible, no crash)
        return new Response(null, { status: 503, statusText: 'Offline' });
      }
    })
  );
});
