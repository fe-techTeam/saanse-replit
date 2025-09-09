// SAANSE Service Worker - Enhanced PWA functionality
const CACHE_NAME = 'saanse-v3.0.0';
const STATIC_CACHE = 'saanse-static-v3.0.0';
const DYNAMIC_CACHE = 'saanse-dynamic-v3.0.0';

const staticAssets = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Crimson+Text:wght@400;600&display=swap'
];

const apiEndpoints = [
  '/api/videos',
  '/api/series',
  '/api/users'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('SAANSE SW: Installing...');
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('SAANSE: Caching static assets');
        return cache.addAll(staticAssets);
      }),
      caches.open(DYNAMIC_CACHE) // Pre-create dynamic cache
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('SAANSE SW: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('SAANSE: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SAANSE SW: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone response before caching
          const responseClone = response.clone();
          if (response.ok) {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache or offline page
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return cached index for SPA routing
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request).then(response => {
        // Don't cache if it's not a successful response
        if (!response.ok) {
          return response;
        }
        
        // Cache successful responses
        const responseClone = response.clone();
        const cacheToUse = staticAssets.some(asset => request.url.includes(asset)) 
          ? STATIC_CACHE 
          : DYNAMIC_CACHE;
          
        caches.open(cacheToUse).then(cache => {
          cache.put(request, responseClone);
        });
        
        return response;
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('SAANSE SW: Background sync triggered');
  // Handle offline actions like view history, likes, etc.
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New content available on SAANSE!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Content',
        icon: '/icon-play.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SAANSE - Divine Stories', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});