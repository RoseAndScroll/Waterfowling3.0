// Incremented CACHE_VERSION to ensure the new assets are loaded by the PWA
const CACHE_VERSION = 2; 
const CACHE_NAME = `waterfowling-redux-v${CACHE_VERSION}`;

// List of files to cache immediately
const urlsToCache = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  // Crucial: Cache the external CSS and Fonts used by the game so it looks correct offline
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=VT323&display=swap'
];

// Install event: Cache the assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        // Added error handling in case external resources fail to cache
        return cache.addAll(urlsToCache).catch(err => {
            console.error('Service Worker: Failed to cache some files', err);
        });
      })
  );
  self.skipWaiting(); // Activate worker immediately
});

// Fetch event: Serve from cache if available (Cache-first strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      }
    )
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches if the version number changes
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});