/** Business timezone used for display. */
export const APP_TIMEZONE = 'Asia/Kolkata';
const LOCALE = 'en-IN';

type DateInput = string | number | Date | null | undefined;

export function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 09/02/2027 */
export const formatDate = (value: DateInput, timeZone = APP_TIMEZONE) => {
  const d = toDate(value);
  return d ? d.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone }) : '—';
};

/** 09 Feb, 4:05 pm */
export const formatDateTime = (value: DateInput, timeZone = APP_TIMEZONE) => {
  const d = toDate(value);
  return d
    ? d.toLocaleString(LOCALE, { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', timeZone })
    : '—';
};

/** 4:05 pm */
export const formatTime = (value: DateInput, timeZone = APP_TIMEZONE) => {
  const d = toDate(value);
  return d ? d.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit', timeZone }) : '—';
};

/** "3 minutes ago", "in 2 days" */
export function formatRelative(value: DateInput, now: Date = new Date()) {
  const d = toDate(value);
  if (!d) return '—';
  const seconds = Math.round((d.getTime() - now.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, 'second');
}

/** "01 Nov – 30 Nov 2026" */
export function formatDateRange(start: DateInput, end: DateInput, timeZone = APP_TIMEZONE) {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return '—';
  const short = (d: Date) => d.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', timeZone });
  return `${short(s)} – ${short(e)} ${e.toLocaleDateString(LOCALE, { year: 'numeric', timeZone })}`;
}

export const isSameDay = (a: DateInput, b: DateInput, timeZone = APP_TIMEZONE) => {
  const da = toDate(a);
  const db = toDate(b);
  return !!da && !!db && formatDate(da, timeZone) === formatDate(db, timeZone);
};

export const isBefore = (a: DateInput, b: DateInput) => {
  const da = toDate(a);
  const db = toDate(b);
  return !!da && !!db && da.getTime() < db.getTime();
};

/** ISO string for the API, or undefined. */
export const toIsoString = (value: DateInput) => toDate(value)?.toISOString();

/** yyyy-mm-dd in the business timezone (for <input type="date"> and API date params). */
export const toDateInputValue = (value: DateInput, timeZone = APP_TIMEZONE) => {
  const d = toDate(value);
  return d ? new Intl.DateTimeFormat('en-CA', { timeZone }).format(d) : '';
};
