const CACHE_NAME = 'qrar-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png', // Adjust paths based on your setup
  '/src/main.jsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap',
];

// Install the service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
  // Force the waiting service worker to become active
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  // Clean up old caches if any
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== 'your-cache-name') {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
  return self.clients.claim(); // Immediately start controlling pages
});

// Fetch event for caching dynamic content
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching...', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
