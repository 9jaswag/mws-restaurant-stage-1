let dbPromise;

/**
 * Function for getting indexDB
 * reference: https://github.com/jakearchibald/svgomg/blob/master/src/js/utils/storage.js#L5
 */
const getDb = () => {
  // use variable to ensure the db is not opened more than once
  if (!dbPromise) {
    // promisify indexedDB
    dbPromise = new Promise((resolve, reject) => {
      const openDb = indexedDB.open('mws-keyval', 1);

      openDb.onerror = () => {
        reject(openDb.error);
      };

      // when a higher db version is loaded, create a new store
      openDb.onupgradeneeded = () => {
        openDb.result.createObjectStore('restaurants');
      };

      openDb.onsuccess = () => {
        resolve(openDb.result);
      };
    });
  }
  return dbPromise
};

/**
 * Function for passing a callback to the store after it's request is complete
 * reference: https://github.com/jakearchibald/svgomg/blob/master/src/js/utils/storage.js#L26
 * @param {String} type action type to be run on the object store
 * @param {Function} callback Callback function to be run on the object store
 */
const withDb = async (type, callback) => {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('restaurants', type);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    // pass the store to the callback function
    callback(transaction.objectStore('restaurants'));
  });
};

const setDbValue = (key, value) => {
  const setDbValueCallback = db => db.put(key, value);
  return withDb('readwrite', setDbValueCallback);
};

const getDbValue = async (key) => {
  let request;
  const getDbValueCallback = db => request = db.get(key);
  await withDb('readonly', getDbValueCallback);
  return request.result;
};

const deleteDbValue = (key) => {
  const deleteDbValueCallback = db => db.delete(key);
  return withDb('readwrite', deleteDbValueCallback);
};
