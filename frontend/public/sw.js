/**
 * Service Worker – Cache-First strategy for all static assets.
 *
 * Strategy:
 *  - HTML (navigation requests)  → Network-first (always fresh)
 *  - JS / CSS / fonts / images   → Cache-first (instant on repeat visits)
 *  - API calls (/api/*)          → Network-only (never cache dynamic data)
 */

const CACHE_NAME = 'aecians-static-v3';

// ─── Install: pre-cache the shell ────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/', '/index.html', '/manifest.json'])
    )
  );
});

// ─── Activate: clear old caches ──────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n !== CACHE_NAME)
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch handler ───────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') return;

  // 2. Skip API calls — always go to network
  if (url.pathname.startsWith('/api/')) return;

  // 3. Skip cross-origin requests (Google Fonts, OAuth, etc.)
  if (url.origin !== self.location.origin) return;

  // 4. Navigation (HTML pages) → Network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 5. Static assets (JS, CSS, images, fonts) → Cache-first
  //    Hashed filenames mean content never changes, so cache forever.
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    /\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ico)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached; // ← instant from disk
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        });
      })
    );
  }
});
