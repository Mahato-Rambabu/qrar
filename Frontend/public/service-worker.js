const CACHE_NAME = 'qrar-cache-v2';
const API_CACHE_NAME = 'qrar-api-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/src/main.jsx',
  '/src/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Exclude sensitive paths from caching
  if (url.pathname.includes('/manifest.json') || 
      url.pathname.includes('service-worker') ||
      url.searchParams.has('nocache')) {
    return event.respondWith(fetch(event.request));
  }

  // Cache strategy: StaleWhileRevalidate for API calls
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cached => {
          const fetched = fetch(event.request).then(network => {
            cache.put(event.request, network.clone());
            return network;
          });
          return cached || fetched;
        });
      })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(network => {
        return caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET') {
            cache.put(event.request, network.clone());
          }
          return network;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      return Response.error();
    })
  );
});