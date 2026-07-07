/**
 * Service Worker – Cache-First strategy for all static assets.
 *
 * Strategy:
 *  - HTML (navigation requests)  → Network-first (always fresh)
 *  - JS / CSS / fonts / images   → Cache-first (instant on repeat visits)
 *  - API calls (/api/*)          → Network-only (never cache dynamic data)
 *
 * Keep-Alive:
 *  - Pings the backend health endpoint every 10 minutes via a periodic
 *    alarm to prevent Render Free Tier cold starts (50–60 second spin-up).
 */

const CACHE_NAME = 'aecians-static-v4';

// ─── Backend health endpoint to keep warm ────────────
// Simple /api/health endpoint — returns 200 OK with no auth required.
// nginx proxies /api → backend:8080/api, so this goes through correctly.
const KEEPALIVE_URL = '/api/health';
const KEEPALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Install: pre-cache the shell ────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/', '/index.html', '/manifest.json'])
    )
  );
});

// ─── Activate: clear old caches + start keepalive ────
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
      .then(() => scheduleKeepalive())
  );
});

// ─── Keepalive: ping backend every 10 min ────────────
function pingBackend() {
  fetch(KEEPALIVE_URL, { method: 'GET', cache: 'no-store' })
    .then(() => console.log('[SW] Backend keepalive ping OK'))
    .catch(() => console.log('[SW] Backend keepalive ping failed (offline?)'));
}

function scheduleKeepalive() {
  // Ping immediately on SW activation, then every 10 minutes
  pingBackend();
  setInterval(pingBackend, KEEPALIVE_INTERVAL_MS);
}

// ─── Message handler: manual ping trigger ────────────
// The app sends a 'PING_BACKEND' message when the page loads
// so we ping immediately on every fresh visit too.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PING_BACKEND') {
    pingBackend();
  }
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
