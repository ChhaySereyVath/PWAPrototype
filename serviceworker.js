// Versioning for cache
const CACHE_NAME = 'weyer-pwa-cache-v1.1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/pages/about.html',
    '/pages/booking.html',
    '/pages/contact.html',
    '/pages/entertainment.html',
    '/pages/reservation.html',
    '/pages/signin.html',
    '/pages/signup.html',
    '/materialize/materialize.min.css',
    '/materialize/styles.css',
    '/js/materialize.min.js',
    '/js/scripts.js',
    '/js/firebaseDB.js',
    '/js/indexDB.js',
];

// Install service worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
      (async () => {
          const cache = await caches.open(CACHE_NAME);
          for (const asset of ASSETS_TO_CACHE) {
              try {
                  await cache.add(asset);
                  console.log(`Service Worker: Cached Succesfully`);
              } catch (error) {
                  console.error(`Service Worker: Failed to cache ${asset}`, error);
              }
          }
      })()
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Deleting old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event with async/await
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async function () {
      // Only cache GET requests
      if (event.request.method !== "GET") {
        return fetch(event.request);
      }

      const cachedResponse = await caches.match(event.request);

      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone()); // Update cache with the fetched response
        return networkResponse;
      } catch (error) {
        console.error("Fetch failed, returning offline page:", error);
        // Optionally, return an offline page here if available in the cache
      }
    })()
  );
});