import idb from 'idb';

//TODO: refactor to work with Redux to maintain state
const dbPromise = {
    // creation and updating of database happens here.
    db: idb.open('restaurant-reviews-db', 2, function (upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
        case 1:
          upgradeDb.createObjectStore('reviews', { keyPath: 'id' })
            .createIndex('restaurant_id', 'restaurant_id');
      }
    }),

    /**
     * Save a restaurant or array of restaurants into idb, using promises.
     */
    putRestaurants(restaurants) {
      if (!restaurants.push) restaurants = [restaurants];
      return this.db.then(db => {
        const store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
        Promise.all(restaurants.map(networkRestaurant => {
          return store.get(networkRestaurant.id).then(idbRestaurant => {
            if (!idbRestaurant || networkRestaurant.updatedAt > idbRestaurant.updatedAt) {
              return store.put(networkRestaurant);
            }
          });
        })).then(function () {
          return store.complete;
        });
      });
    },

    /**
     * Get a restaurant, by its id, or all stored restaurants in idb using promises.
     * If no argument is passed, all restaurants will returned.
     */
    getRestaurants(id = undefined) {
      return this.db.then(db => {
        const store = db.transaction('restaurants').objectStore('restaurants');
        if (id) return store.get(Number(id));
        return store.getAll();
      });
    },

    /**
     * Save a review or array of reviews into idb, using promises.
     */
    putReviews(reviews) {
      if (!reviews.push) reviews = [reviews]; // in the case of one review
      return this.db.then(db => {
        const store = db.transaction('reviews', 'readwrite').objectStore('reviews');
        Promise.all(reviews.map(networkReview => {
          return store.get(networkReview.id).then(idbReview => {
            if (!idbReview || networkReview.updatedAt > idbReview.updatedAt) {
              return store.put(networkReview);
            }
          })
        }))
      })
    },

    /**
     * Get a all reviews for a restaurant by its id
     */
    getReviewsForRestaurant(id) {
      return this.db.then(db => {
        const storeIndex = db.transaction('reviews').objectStore('reviews').index('restaurant_id');
        return storeIndex.getAll(Number(id));
      })
    }
};

export default dbPromise;