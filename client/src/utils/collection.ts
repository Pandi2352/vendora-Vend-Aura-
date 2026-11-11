/** Array & object helpers. */

export const unique = <T,>(items: T[]) => Array.from(new Set(items));

export function uniqueBy<T>(items: T[], key: (item: T) => unknown) {
  const seen = new Set<unknown>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function groupBy<T, K extends string | number>(items: T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      (acc[key(item)] ??= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

/** Non-mutating sort by a key. */
export function sortBy<T>(items: T[], key: (item: T) => string | number | Date, direction: 'asc' | 'desc' = 'asc') {
  const dir = direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (typeof ka === 'string' && typeof kb === 'string') return ka.localeCompare(kb) * dir;
    return (Number(ka) - Number(kb)) * dir;
  });
}

export const findBy = <T, K extends keyof T>(items: T[], key: K, value: T[K]) => items.find((item) => item[key] === value);

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const out = { ...obj };
  for (const k of keys) delete out[k];
  return out;
}

/** Structured clone for plain data (not class instances / functions). */
export const deepClone = <T,>(value: T): T => structuredClone(value);

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/** Drops undefined / null / '' values (clean query params and request bodies). */
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>;
}
