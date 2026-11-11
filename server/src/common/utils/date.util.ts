import { DEFAULT_TIMEZONE } from '../constants/app.constant';

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

  /**
   * Start of the calendar day containing `date`, as seen in `timeZone`
   * (default: business timezone). Independent of the server's own timezone.
   */
  static startOfDay(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): Date {
    const { year, month, day } = DateUtil.zonedParts(date, timeZone);
    return DateUtil.zonedTimeToUtc(year, month, day, 0, 0, 0, 0, timeZone);
  }

  /** End (23:59:59.999) of the calendar day containing `date` in `timeZone`. */
  static endOfDay(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): Date {
    const { year, month, day } = DateUtil.zonedParts(date, timeZone);
    return DateUtil.zonedTimeToUtc(year, month, day, 23, 59, 59, 999, timeZone);
  }

  /** Calendar year of `date` in `timeZone`. */
  static yearIn(timeZone: string = DEFAULT_TIMEZONE, date: Date = new Date()): number {
    return DateUtil.zonedParts(date, timeZone).year;
  }

  /** Start of the Indian financial year (1 April) containing `date` in `timeZone`. */
  static startOfFinancialYear(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): Date {
    const { year, month } = DateUtil.zonedParts(date, timeZone);
    const fyStartYear = month >= 4 ? year : year - 1;
    return DateUtil.zonedTimeToUtc(fyStartYear, 4, 1, 0, 0, 0, 0, timeZone);
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

  /** Wall-clock parts of `date` in `timeZone` (month is 1-12). */
  private static zonedParts(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: DateUtil.safeZone(timeZone),
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return {
      year: get('year'),
      month: get('month'),
      day: get('day'),
      hour: get('hour'),
      minute: get('minute'),
      second: get('second'),
    };
  }

  /** UTC instant for a wall-clock time in `timeZone`. */
  private static zonedTimeToUtc(
    year: number, month: number, day: number,
    hour: number, minute: number, second: number, ms: number,
    timeZone: string,
  ): Date {
    const asUtc = Date.UTC(year, month - 1, day, hour, minute, second, ms);
    // Offset of the zone at that moment, derived from how it renders asUtc.
    const p = DateUtil.zonedParts(new Date(asUtc), timeZone);
    const renderedAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, ms);
    const offset = renderedAsUtc - asUtc;
    return new Date(asUtc - offset);
  }

  private static safeZone(timeZone: string): string {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone });
      return timeZone;
    } catch {
      return DEFAULT_TIMEZONE;
    }
  }
}
