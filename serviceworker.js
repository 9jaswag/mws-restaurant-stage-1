const cacheName = 'mws-restaurant-v1';
const imageCacheName = 'mws-restaurant-image-v1';
const urlsToCache = [
  "./",
  "./css/styles.css",
  "./js/main.js",
  "./js/restaurant_info.js",
  "./js/dbhelper.js",
  "./js/idb.js",
  "./restaurant.html",
  "./404.html",
  "https://fonts.googleapis.com/css?family=Lato|Open+Sans",
  "https://fonts.gstatic.com/s/lato/v14/S6uyw4BMUTPHjx4wXiWtFCc.woff2",
  "https://fonts.gstatic.com/s/opensans/v15/mem8YaGs126MiZpBA-UFVZ0bf8pkAg.woff2",
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png'
];

// install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// listen for fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(serveCachedImage(event));
  } else {
    event.respondWith(serveCachedData(event));
  }
});

self.addEventListener('activate', (event) => {
  const currentCaches = [cacheName, imageCacheName];
  event.waitUntil(
    caches.keys().then(cacheList => {
      cacheList.filter(cache => {
        return cache.startsWith('mws-restaurant') && !currentCaches.includes(cache);
      }).map(staleCache => {
        return caches.delete(staleCache);
      });
    })
  )
});

const serveCachedData = (event) => {
  const { pathname } = getRequestPath(event);
  let storageUrl;
  if (pathname === "/") {
    storageUrl = "/";
  } else {
    storageUrl = pathname.slice(1, pathname.length);
  }

  return caches.open(cacheName).then(cache => {
    return cache.match(storageUrl, { ignoreSearch: true }).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        if (storageUrl === 'restaurants') return networkResponse;
        if (storageUrl === 'reviews/') return networkResponse;
        return caches.open(cacheName).then(cache => {
          cache.put(storageUrl, networkResponse.clone());
          return networkResponse;
        });
        // .catch
      });
      // .catch
    })
      .catch(() => {
        if (storageUrl.includes('restaurant.html')) {
          caches.match('./404.html')
        }
      });
  });
};

serveCachedImage = (event) => {
  const { pathname } = getRequestPath(event);

  return caches.open(imageCacheName).then(cache => {
    return cache.match(pathname).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        return caches.open(imageCacheName).then(cache => {
          cache.put(pathname, networkResponse.clone());
          return networkResponse;
        });
      });
      // possible catch for network failure
    });
    // possible .catch for network and cache failure
  }).catch(error => {
    // serve offline image
  })
};

const getRequestPath = (event) => new URL(event.request.url);
