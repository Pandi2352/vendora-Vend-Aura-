export class DateUtil {
  static nowUtc(): Date {
    return new Date();
  }

  static toIso(date: Date = new Date()): string {
    return date.toISOString();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  static startOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  static endOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  static isExpired(expiryDate: Date): boolean {
    return new Date().getTime() > new Date(expiryDate).getTime();
  }

  static diffInMinutes(a: Date, b: Date): number {
    return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 60000);
  }

  static diffInDays(a: Date, b: Date): number {
    return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
  }

  static parse(dateStr: string): Date | null {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
}
