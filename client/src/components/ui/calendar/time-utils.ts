/** Pure helpers for 'HH:mm' (24-hour) time values. */

const pad = (n: number) => String(n).padStart(2, '0');
const MINUTES_PER_DAY = 24 * 60;

export const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const toMinutes = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (total: number) => {
  const t = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
};

/**
 * Reads typed time: "14:30", "1430", "930", "9", "9:30 pm", "2:30PM", "12 am".
 * Returns 'HH:mm' or null when it is not a real time.
 */
export function parseTime(text: string): string | null {
  const m = /^(\d{1,2})(?::?(\d{2}))?\s*([ap])?\.?\s*m?\.?$/i.exec(text.trim().replace(/\s+/g, ' '));
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = m[2] === undefined ? 0 : Number(m[2]);
  const meridiem = m[3]?.toLowerCase();
  if (minutes > 59) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (meridiem === 'p' ? 12 : 0);
  } else if (hours > 23) return null;
  return `${pad(hours)}:${pad(minutes)}`;
}

/** 'HH:mm' → "14:30" or, with hour12, "2:30 pm". */
export function formatTimeValue(value: string, hour12 = false): string {
  if (!HH_MM.test(value)) return value;
  if (!hour12) return value;
  const [h, m] = value.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`;
}

/**
 * Keystroke filter. 24h: digits with an automatic colon after the hours.
 * 12h: digits, one colon, a space and am/pm letters (normalised on blur).
 */
export function maskTime(raw: string, hour12 = false): string {
  if (hour12) return raw.replace(/[^\d:apmAPM ]/g, '').slice(0, 8);
  const parts = ['', ''];
  let i = 0;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      if (parts[i].length === 2) {
        if (i === 1) break;
        i++;
      }
      parts[i] += ch;
    } else if (ch === ':' && parts[0] && i === 0) {
      i = 1;
    }
  }
  return parts.slice(0, i + 1).join(':');
}

/** Next multiple of `step` minutes up (1) or down (-1), wrapping around midnight. */
export function stepTime(value: string, step: number, direction: 1 | -1): string {
  const current = toMinutes(value);
  const snapped = direction === 1 ? Math.floor(current / step) * step + step : Math.ceil(current / step) * step - step;
  return fromMinutes(snapped);
}
