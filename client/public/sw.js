// SAANSE Service Worker - Force cache refresh
const CACHE_NAME = 'saanse-v2.0.0';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css'
];

self.addEventListener('install', event => {
  // Force immediate activation of new service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SAANSE: Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  // Clear all old caches to force refresh
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SAANSE: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force all clients to use new service worker immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  // Always fetch from network first for HTML files to ensure fresh content
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});