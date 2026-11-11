const LOCALE = 'en-IN';

const inr = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

/** ₹1,23,456.5 */
export const formatInr = (amount: number | null | undefined) => inr.format(amount || 0);

/** 1,23,456 */
export const formatNumber = (value: number | null | undefined, fractionDigits = 0) =>
  (value ?? 0).toLocaleString(LOCALE, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });

/** 12.5% (value is a percentage, not a fraction) */
export const formatPercent = (value: number | null | undefined, fractionDigits = 1) => `${formatNumber(value ?? 0, fractionDigits)}%`;

/** 1.2L / 3.4Cr style compact numbers for tiles. */
export const formatCompact = (value: number | null | undefined) =>
  new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0);

/** Fixed decimals as a string: toDecimal(2.5) -> '2.50' */
export const toDecimal = (value: number | null | undefined, digits = 2) => (value ?? 0).toFixed(digits);

/** Rounds half away from zero to `digits` places. */
export const round = (value: number, digits = 2) => {
  const f = 10 ** digits;
  return Math.round((value + Number.EPSILON) * f) / f;
};

/** Parses user input like "1,200.50" -> 1200.5; returns fallback when not a number. */
export const parseNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const n = Number(String(value ?? '').replace(/,/g, '').trim());
  return String(value ?? '').trim() !== '' && Number.isFinite(n) ? n : fallback;
};

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** 1536 -> "1.5 KB" */
export function formatFileSize(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${round(bytes / 1024 ** i, 1)} ${units[i]}`;
}
