const CACHE = 'pbm-v5';
const CACHE_ASSETS = [
  '/images/emblem-pbm.png',
  '/images/pwa-192.png',
  '/images/pwa-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CACHE_ASSETS.map(url => new Request(url, { cache: 'reload' })).filter(() => true)))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isHtmlRequest(req) {
  if (req.mode === 'navigate') return true;
  const accept = req.headers.get('accept') || '';
  return accept.includes('text/html');
}

function isStaticAsset(url) {
  return /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(url.pathname);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // HTML / navigation: network-first com fallback ao cache
  if (isHtmlRequest(req)) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // JS/CSS dinâmicos: força revalidação (no-cache) para não servir versões
  // antigas que ficaram no HTTP cache do browser entre deploys.
  if (/\.(js|css)$/i.test(url.pathname)) {
    e.respondWith(
      fetch(req, { cache: 'no-cache' }).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Imagens e fontes: cache-first (mudam pouco)
  if (isStaticAsset(url)) {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }))
    );
    return;
  }

  // Demais: network-first sem cachear
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});

// ── PUSH NOTIFICATIONS ──────────────────────────────────────────────────────

self.addEventListener('push', function (event) {
  if (!event.data) return;
  const data = event.data.json();
  const title = data.title || 'Protocolo Bravo Mike';
  const options = {
    body: data.body || 'Você tem novidades.',
    icon: data.icon || '/images/emblem-pbm.png',
    badge: data.badge || '/images/emblem-pbm.png',
    data: data.data || { url: '/dashboard' },
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
