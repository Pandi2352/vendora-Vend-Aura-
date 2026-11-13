import type { MasterAdapter, MasterRecord, MasterValues } from './types';

const storageKey = (shopId: string, resource: string) => `vendora.master.${shopId}.${resource}`;

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, rows: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    // Storage full or blocked: the change stays in memory for this session.
  }
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Keeps a Master list in this browser, separately per shop. Used until the
 * server has an endpoint for the list; swap for an API adapter then.
 */
export function localAdapter<T extends MasterRecord>(shopId: string, resource: string): MasterAdapter<T> {
  const key = storageKey(shopId, resource);
  return {
    list: async () => read<T>(key),
    create: async (values: MasterValues<T>) => {
      const row = { ...values, id: newId() } as T;
      write(key, [...read<T>(key), row]);
      return row;
    },
    update: async (id: string, values: MasterValues<T>) => {
      const row = { ...values, id } as T;
      write(
        key,
        read<T>(key).map((r) => (r.id === id ? row : r)),
      );
      return row;
    },
    remove: async (id: string) =>
      write(
        key,
        read<T>(key).filter((r) => r.id !== id),
      ),
  };
}
