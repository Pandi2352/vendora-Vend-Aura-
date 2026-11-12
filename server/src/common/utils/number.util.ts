export class NumberUtil {
  static round(val: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  static formatInr(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static safeParseInt(val: unknown, fallback: number = 0): number {
    const parsed = parseInt(String(val), 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  static safeParseFloat(val: unknown, fallback: number = 0): number {
    const parsed = parseFloat(String(val));
    return isNaN(parsed) ? fallback : parsed;
  }
}

