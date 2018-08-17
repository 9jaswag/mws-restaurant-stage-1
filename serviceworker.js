const cacheName = 'mws-restaurant';
const urlsToCache = [
  "./",
  "./css/styles.css",
  "./js/main.js",
  "./js/restaurant_info.js",
  "./js/dbhelper.js",
  "./data/restaurants.json",
  "./restaurant.html",
  "./404.html",
  "./img/1.jpg",
  "./img/10.jpg",
  "./img/2.jpg",
  "./img/3.jpg",
  "./img/4.jpg",
  "./img/5.jpg",
  "./img/6.jpg",
  "./img/7.jpg",
  "./img/8.jpg",
  "./img/9.jpg",
  "http://localhost:8000/data/restaurants.json",
  "https://unpkg.com/leaflet@1.3.1/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.3.1/dist/leaflet.js"
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
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {

    if (requestUrl.pathname === '/') {
      event.respondWith(serveCachedData(event.request, '/'));
    }

    if (requestUrl.href.includes('restaurant.html')) {
      event.respondWith(serveCachedData(event.request, 'restaurant.html'));
    }

    if (requestUrl.pathname === '/data/restaurants.json') {
      event.respondWith(serveCachedData(event.request, 'data/restaurants.json'));
    }

    if (requestUrl.pathname === '/js/main.js') {
      event.respondWith(serveCachedData(event.request, 'js/main.js'));
    }

    if (requestUrl.pathname === '/css/styles.css') {
      event.respondWith(serveCachedData(event.request, 'css/styles.css'));
    }

    if (requestUrl.pathname === '/js/restaurant_info.js') {
      event.respondWith(serveCachedData(event.request, 'js/restaurant_info.js'));
    }

    if (requestUrl.pathname === '/js/dbhelper.js') {
      event.respondWith(serveCachedData(event.request, 'js/dbhelper.js'));
    }

    if (requestUrl.pathname.includes('/img/')) {
      const storageUrl = requestUrl.pathname.slice(1, requestUrl.pathname.length)
      event.respondWith(serveCachedData(event.request, storageUrl));
    }
  }
});

// const serveRestaurantData = (request) => {
//   const storageUrl = 'data/restaurants.json';
//   return caches.open(cacheName).then(cache => {
//     return cache.match(storageUrl).then(response => {
//       let networkFetch = fetch(request).then(networkResponse => {
//         cache.put(storageUrl, networkResponse.clone());
//         return networkResponse;
//       });

//       return response || networkFetch
//     });
//   });
// };

const serveCachedData = (request, storageUrl) => {
  return caches.match(storageUrl).then(response => {
    if (response) {
      return response;
    }
    return fetch(request).then(response => {
      if (response.status === 404) {
        return caches.match('404.html');
      }
      return caches.open(cacheName).then(cache => {
        cache.put(storageUrl, response.clone())
        return response;
      });
    })
      .catch(error => {
        return caches.match('404.html');
      });
  })
    .catch(error => {
      return caches.match('404.html');
    });
}
