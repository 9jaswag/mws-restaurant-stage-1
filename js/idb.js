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
        openDb.result.createObjectStore('reviews');
        openDb.result.createObjectStore('offline-reviews', { autoIncrement: true });
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
const withDb = async (type, callback, dbs) => {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(dbs, type);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    // pass the store to the callback function
    callback(transaction.objectStore(dbs));
  });
};

const setDbValue = (key, value, dbs = 'restaurants') => {
  let setDbValueCallback;
  if (key) {
    setDbValueCallback = db => db.put(key, value);
  } else {
    setDbValueCallback = db => db.put(value);
  }
  return withDb('readwrite', setDbValueCallback, dbs);
};

const getDbValue = async (key, dbs = 'restaurants') => {
  let request;
  const getDbValueCallback = db => request = db.get(key);
  await withDb('readonly', getDbValueCallback, dbs);
  return request.result;
};

const deleteDbValue = (key, dbs = 'restaurants') => {
  const deleteDbValueCallback = db => db.delete(key);
  return withDb('readwrite', deleteDbValueCallback, dbs);
};

const getAllDbContent = async (dbs = 'restaurants') => {
  let request;
  const getAllDbContentCallback = db => request = db.getAll();
  await withDb('readonly', getAllDbContentCallback, dbs);
  return request.result;
};
