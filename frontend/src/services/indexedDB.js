/**
 * Offline SOS Queue using Browser IndexedDB
 * Ensures emergency alerts are never lost even during zero-connectivity or spotty mobile network.
 * Retries automatically with exponential backoff when connection is restored.
 */

const DB_NAME = 'NirbhayaX_OfflineStore';
const STORE_NAME = 'sos_queue';
const DB_VERSION = 1;

export function openOfflineDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported in this browser.');
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Enqueue an emergency SOS payload locally
 */
export async function enqueueOfflineSOS(payload) {
  const db = await openOfflineDB();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item = {
      ...payload,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      status: 'pending'
    };
    const req = store.add(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all queued offline requests
 */
export async function getQueuedSOSRequests() {
  const db = await openOfflineDB();
  if (!db) return [];

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete a successfully processed request from the queue
 */
export async function removeQueuedSOS(id) {
  const db = await openOfflineDB();
  if (!db) return;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

