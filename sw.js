const CACHE = 'pbm-v1';
const CACHE_ASSETS = [
  '/dashboard',
  '/area-estudos',
  '/js/api.js',
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
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Skip API calls and non-GET requests
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
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
