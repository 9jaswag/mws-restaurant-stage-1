/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    return 'http://localhost:1337/restaurants';
  }

  /**
   * URL for fetching reviews
   */
  static FETCH_REVIEWS_URL(id) {
    return `http://localhost:1337/reviews/?restaurant_id=${id}`
  }

  /**
   * Fetch all restaurants.
   */
  static async fetchRestaurants(callback) {
    const networkFetch = fetch(DBHelper.DATABASE_URL)
      .then(response => {
        if (response.status != 200) {
          return false;
        }
        return response.json();
      })
      .catch(error => {
        console.log('offline')
        callback(error, null);
      });

    const networkResponse = await networkFetch;

    getDbValue('restaurants').then(response => {
      if (!response && !networkResponse) {
        // show offline message or so
      }

      if (networkResponse && networkResponse.length > 0) {
        deleteDbValue('restaurants');
        setDbValue(networkResponse, 'restaurants');
      }

      callback(null, response || networkResponse);
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`./img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      })
    marker.addTo(newMap);
    return marker;
  }

  /**
   * 
   * @param {String} message text to be displayed in the alert
   * @param {String} type alert type
   */
  static displayAlert(message, type) {
    const alert = document.querySelector('.offline-alert');
    alert.style.display = 'block';
    if (type === 'success') alert.classList.add('success');
    alert.innerText = message;
  }

  /**
   * Function for clearing alert message on page
   */
  static clearAlert() {
    const alert = document.querySelector('.offline-alert');
    if (alert.classList.contains('success')) alert.classList.remove('success');
    alert.innerText = '';
    alert.style.display = 'none';
  }

  /**
   * Display offline alert message
   */
  static offlineAlert() {
    window.ononline = () => DBHelper.clearAlert();
    window.onoffline = () => DBHelper.displayAlert("You're offline");

    if (navigator.onLine) {
      DBHelper.clearAlert();
    } else {
      DBHelper.displayAlert("You're offline");
    }
  }

  /**
   * Fetch all reviews for a restaurant
   * @param {number} restaurant_id restaurant's ID
   * @returns {Array} Array of reviews
   */
  static async fetchReviews(restaurant_id) {
    // return fetch(DBHelper.FETCH_REVIEWS_URL(restaurant_id)).then(response => response.json()).then(response => response);
    const networkFetch = fetch(DBHelper.FETCH_REVIEWS_URL(restaurant_id))
      .then(response => {
        if (response.status != 200) {
          return false;
        }
        return response.json();
      })
      .catch(error => {
        // callback(error, null)
      });

    const networkResponse = await networkFetch;

    return getDbValue(restaurant_id, 'reviews').then(response => {
      if (!response && !networkResponse) {
        // show offline message or so
      }

      if (networkResponse && networkResponse.length > 0) {
        deleteDbValue(restaurant_id, 'reviews');
        setDbValue(networkResponse, restaurant_id, 'reviews');
      }

      return response || networkResponse;
    });
  }

  /**
   * Submit a review
   * @param {Object} review review object
   * @returns {Object} review object
   */
  static submitReview(review) {
    return fetch('http://localhost:1337/reviews', {
      method: 'POST',
      body: JSON.stringify(review)
    }).then(response => response.json())
      .then(response => response)
      .catch(error => console.log(error));
  }

  /**
   * Submit offline reviews saved in the indexDB
   */
  static submitOfflineReviews() {
    if (navigator.onLine) {
      const offlineReviews = getAllDbContent('offline-reviews');
      offlineReviews.then(reviews => {
        reviews.forEach((review, index) => {
          (async () => {
            const rev = await DBHelper.submitReview(review);
            if (rev) {
              deleteDbValue(index + 1, 'offline-reviews');
            };
          })()
        });
      });
    }
  }

  /**
   * Update restaurant's favourite
   * @param {Object} restaurant restaurant object
   */
  static toggleRestaurantFav(restaurant) {
    const id = restaurant.id;
    const bool = !restaurant.is_favorite;
    const url = `http://localhost:1337/restaurants/${id}/?is_favorite=${bool}`;

    return fetch(url, { method: 'PUT' })
      .then(response => response.json())
      .then(response => response);
  }

}

