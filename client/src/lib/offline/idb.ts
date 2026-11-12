/**
 * IndexedDB lightweight promise wrapper for offline POS storage.
 * Stores products, customers, and pending offline sales orders.
 * Includes in-memory fallback when IndexedDB is unavailable or restricted.
 */

const DB_NAME = 'vendora_pos_db';
const DB_VERSION = 1;

export const STORES = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  PENDING_ORDERS: 'pending_orders',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

function isIdbAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

let dbInstance: IDBDatabase | null = null;
const memoryStore = new Map<string, Map<IDBValidKey, unknown>>([
  [STORES.PRODUCTS, new Map()],
  [STORES.CUSTOMERS, new Map()],
  [STORES.PENDING_ORDERS, new Map()],
]);

export async function openPosDb(): Promise<IDBDatabase | null> {
  if (!isIdbAvailable()) return null;
  if (dbInstance) return dbInstance;

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
          db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.CUSTOMERS)) {
          db.createObjectStore(STORES.CUSTOMERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.PENDING_ORDERS)) {
          db.createObjectStore(STORES.PENDING_ORDERS, { keyPath: 'offlineRef' });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        dbInstance.onversionchange = () => {
          dbInstance?.close();
          dbInstance = null;
        };
        resolve(dbInstance);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

function getItemKey(storeName: StoreName, item: unknown): IDBValidKey {
  if (typeof item === 'object' && item !== null) {
    if (storeName === STORES.PENDING_ORDERS && 'offlineRef' in item) {
      return (item as { offlineRef: IDBValidKey }).offlineRef;
    }
    if ('id' in item) {
      return (item as { id: IDBValidKey }).id;
    }
  }
  return String(Date.now());
}

export async function idbGetAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openPosDb();
  if (!db) {
    return Array.from(memoryStore.get(storeName)?.values() || []) as T[];
  }
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => resolve(Array.from(memoryStore.get(storeName)?.values() || []) as T[]);
    } catch {
      resolve(Array.from(memoryStore.get(storeName)?.values() || []) as T[]);
    }
  });
}

export async function idbGet<T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await openPosDb();
  if (!db) {
    return memoryStore.get(storeName)?.get(key) as T | undefined;
  }
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => resolve(memoryStore.get(storeName)?.get(key) as T | undefined);
    } catch {
      resolve(memoryStore.get(storeName)?.get(key) as T | undefined);
    }
  });
}

export async function idbPut<T>(storeName: StoreName, value: T): Promise<void> {
  memoryStore.get(storeName)?.set(getItemKey(storeName, value), value);
  const db = await openPosDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function idbPutMany<T>(storeName: StoreName, items: T[]): Promise<void> {
  for (const item of items) {
    memoryStore.get(storeName)?.set(getItemKey(storeName, item), item);
  }
  const db = await openPosDb();
  if (!db || items.length === 0) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function idbDelete(storeName: StoreName, key: IDBValidKey): Promise<void> {
  memoryStore.get(storeName)?.delete(key);
  const db = await openPosDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function idbCount(storeName: StoreName): Promise<number> {
  const db = await openPosDb();
  if (!db) {
    return memoryStore.get(storeName)?.size || 0;
  }
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(memoryStore.get(storeName)?.size || 0);
    } catch {
      resolve(memoryStore.get(storeName)?.size || 0);
    }
  });
}

export async function idbClear(storeName: StoreName): Promise<void> {
  memoryStore.get(storeName)?.clear();
  const db = await openPosDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}
