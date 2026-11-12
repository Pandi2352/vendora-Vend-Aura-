export class ObjectUtil {
  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => {
      delete result[key];
    });
    return result;
  }

  static safeJsonParse<T = unknown>(str: string, fallback: T): T {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }

  static isNil(val: unknown): boolean {
    return val === null || val === undefined;
  }

  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  }
}
