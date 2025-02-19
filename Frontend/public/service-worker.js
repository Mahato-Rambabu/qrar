const CACHE_NAME = 'qrar-cache-v3'; // Updated version
const API_CACHE_NAME = 'qrar-api-cache-v2'; // Updated version
const ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/src/main.jsx',
  '/src/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude certain requests from caching
  if (url.pathname.includes('/manifest.json') || 
      url.pathname.includes('service-worker') ||
      url.searchParams.has('nocache')) {
    return event.respondWith(fetch(event.request));
  }

  // Stale-while-revalidate strategy for API calls
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            // Update cache with the latest network response.
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          // Return cached response immediately if available, otherwise wait for network.
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        // Only cache GET requests
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      return Response.error();
    })
  );
});
