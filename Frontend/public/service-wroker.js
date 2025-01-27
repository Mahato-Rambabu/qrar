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
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching Static Assets...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Force immediate activation
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Start controlling pages
});

// Fetch event for caching dynamic content
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching...', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            if (event.request.url.startsWith('http')) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        })
      );
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});