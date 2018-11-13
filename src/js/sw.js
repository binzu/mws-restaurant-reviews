// think of this as a background server running
const cacheID = 'mws-restaurant-v1';
const cacheSyncID = 'mws-restaurant-sync-v1'

// install service worker caches
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/index.bundle.js',
        '/restaurant.html',
        '/restaurant.bundle.js',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('mws-') && !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// listen for fetch events
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        let responseClone = response.clone();
        caches.open(cacheID).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        // console.log('Fetch successful: ', response);

        return response;
      });
    }).catch(function(error) {
      // return caches.match('/img/restaurant-default.jpg');
      // console.log('Fetch responds with error: ', error);
    })
  );
});
