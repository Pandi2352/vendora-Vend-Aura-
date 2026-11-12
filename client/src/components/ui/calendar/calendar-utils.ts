import { toDateInputValue } from '@/utils/date';

/**
 * Pure calendar-date helpers. Calendar dates are local `Date`s at midnight;
 * forms store them as 'YYYY-MM-DD' strings so time zones never shift a day.
 */

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DMY_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const pad = (n: number, len = 2) => String(n).padStart(len, '0');

/** Local date from parts, or null when the day does not exist (31/02). */
export function makeDate(year: number, month: number, day: number): Date | null {
  if (year < 1000 || year > 9999 || month < 0 || month > 11 || day < 1) return null;
  const d = new Date(year, month, day);
  return d.getMonth() === month && d.getDate() === day ? d : null;
}

/** 'YYYY-MM-DD' → local Date (null for empty / invalid). */
export function parseIsoDate(value: string | null | undefined): Date | null {
  const m = value ? ISO_DATE.exec(value) : null;
  return m ? makeDate(+m[1], +m[2] - 1, +m[3]) : null;
}

/** Local Date → 'YYYY-MM-DD'. */
export const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Local Date → 'dd/mm/yyyy'. */
export const formatDmy = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

/** 'YYYY-MM-DD' → 'dd/mm/yyyy' ('' when empty / invalid). */
export const isoToDmy = (value: string | null | undefined) => {
  const d = parseIsoDate(value);
  return d ? formatDmy(d) : '';
};

/** Typed 'd/m/yyyy' or 'dd/mm/yyyy' → Date (null when not a real date). */
export function parseDmy(text: string): Date | null {
  const m = DMY_DATE.exec(text.trim());
  return m ? makeDate(+m[3], +m[2] - 1, +m[1]) : null;
}

/**
 * Input mask for dd/mm/yyyy: digits only, a slash is added once a part is
 * full (or typed by the user), so backspace over a slash still works.
 */
export function maskDmy(raw: string): string {
  const max = [2, 2, 4];
  const parts = ['', '', ''];
  let i = 0;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      if (parts[i].length === max[i]) {
        if (i === 2) break;
        i++;
      }
      parts[i] += ch;
    } else if (ch === '/' && parts[i] && i < 2) {
      i++;
    }
  }
  return parts.slice(0, i + 1).join('/');
}

/** Today in the business time zone, as a local calendar date. */
export const todayDate = () => parseIsoDate(toDateInputValue(new Date())) as Date;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Same day in another month, clamped to that month's length (31 Jan + 1 → 28/29 Feb). */
export function addMonths(d: Date, n: number): Date {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), endOfMonth(first).getDate()));
}

export const addYears = (d: Date, n: number) => addMonths(d, n * 12);

export function startOfWeek(d: Date, weekStartsOn: WeekDay = 1) {
  return addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));
}

export const endOfWeek = (d: Date, weekStartsOn: WeekDay = 1) => addDays(startOfWeek(d, weekStartsOn), 6);

/** Negative when a is before b, 0 for the same day. */
export const compareDays = (a: Date, b: Date) => startOfDay(a).getTime() - startOfDay(b).getTime();
export const isSameDate = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && compareDays(a, b) === 0;
export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Whole days from a to b (b − a). */
export const diffDays = (a: Date, b: Date) => Math.round(compareDays(b, a) / 86_400_000);

export function clampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  if (min && compareDays(d, min) < 0) return startOfDay(min);
  if (max && compareDays(d, max) > 0) return startOfDay(max);
  return d;
}

export const isOutOfBounds = (d: Date, min?: Date | null, max?: Date | null) =>
  (!!min && compareDays(d, min) < 0) || (!!max && compareDays(d, max) > 0);

/** True when d lies between a and b (inclusive), in either order. */
export function isBetween(d: Date, a: Date, b: Date) {
  const [lo, hi] = compareDays(a, b) <= 0 ? [a, b] : [b, a];
  return compareDays(d, lo) >= 0 && compareDays(d, hi) <= 0;
}

/** Weeks of the month; days from other months are null (blank cells). */
export function monthWeeks(month: Date, weekStartsOn: WeekDay = 1): (Date | null)[][] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const weeks: (Date | null)[][] = [];
  let cursor = startOfWeek(first, weekStartsOn);
  while (compareDays(cursor, last) <= 0) {
    const week: (Date | null)[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(isSameMonth(cursor, month) ? cursor : null);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** [{ short: 'Mon', long: 'Monday' }, …] starting at weekStartsOn. */
export function weekdayNames(locale: string, weekStartsOn: WeekDay = 1) {
  const monday = new Date(2024, 0, 1); // a Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, ((weekStartsOn + 6) % 7) + i);
    return {
      short: d.toLocaleDateString(locale, { weekday: 'short' }),
      long: d.toLocaleDateString(locale, { weekday: 'long' }),
    };
  });
}

export const monthNames = (locale: string, format: 'short' | 'long' = 'long') =>
  Array.from({ length: 12 }, (_, m) => new Date(2024, m, 1).toLocaleDateString(locale, { month: format }));

/** "Wednesday, 11 November 2026" (accessible name of a day cell). */
export const longDateLabel = (d: Date, locale: string) =>
  d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const monthYearLabel = (d: Date, locale: string) => d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

/** Indian financial year (1 April – 31 March) containing d. */
export function financialYear(d: Date): { start: Date; end: Date } {
  const startYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return { start: new Date(startYear, 3, 1), end: new Date(startYear + 1, 2, 31) };
}

export type RangePresetKey = 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'lastMonth' | 'thisFy';

export const RANGE_PRESETS: { key: RangePresetKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'thisFy', label: 'This financial year' },
];

export function presetRange(key: RangePresetKey, today: Date): { start: Date; end: Date } {
  switch (key) {
    case 'today':
      return { start: today, end: today };
    case 'yesterday': {
      const y = addDays(today, -1);
      return { start: y, end: y };
    }
    case 'last7':
      return { start: addDays(today, -6), end: today };
    case 'thisMonth':
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case 'lastMonth': {
      const prev = addMonths(startOfMonth(today), -1);
      return { start: prev, end: endOfMonth(prev) };
    }
    case 'thisFy':
      return financialYear(today);
  }
}
