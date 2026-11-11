export class ArrayUtil {
  static dedupe<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }

  static dedupeBy<T>(arr: T[], keyFn: (item: T) => any): T[] {
    const seen = new Set();
    return arr.filter((item) => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  static groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return arr.reduce((acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }
}

