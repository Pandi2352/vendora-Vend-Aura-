import { z } from 'zod';
import { diffDays, isoToDmy, parseIsoDate, toIsoDate } from '@/components/ui/calendar/calendar-utils';

/**
 * Rules for DateField ('YYYY-MM-DD' | null), DateRangeField ({ start, end })
 * and TimeField ('HH:mm' | null). While the typed text is not a real date /
 * time the fields hold that text, so these rules show the format message.
 */

export const DATE_FORMAT_MESSAGE = 'Enter a date like 31/12/2026';
export const TIME_FORMAT_MESSAGE = 'Enter a time like 14:30';

type DateLimit = string | Date;
interface DateLimits {
  /** Earliest allowed day ('YYYY-MM-DD' or Date). */
  min?: DateLimit;
  /** Latest allowed day ('YYYY-MM-DD' or Date). */
  max?: DateLimit;
}

const isoOf = (limit: DateLimit) => (typeof limit === 'string' ? limit : toIsoDate(limit));
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;
const lower = (label: string) => label.toLowerCase();

interface LimitMessages {
  min: (day: string) => string;
  max: (day: string) => string;
}

const dayMessages = (label: string): LimitMessages => ({
  min: (day) => `${label} must be on or after ${day}`,
  max: (day) => `${label} must be on or before ${day}`,
});

/** Adds the format / min / max issue for one day value; returns false when the day is not valid. */
function checkDay(value: string, { min, max }: DateLimits, messages: LimitMessages, ctx: z.RefinementCtx) {
  if (!parseIsoDate(value)) {
    ctx.addIssue({ code: 'custom', message: DATE_FORMAT_MESSAGE });
    return false;
  }
  if (min !== undefined && value < isoOf(min)) {
    ctx.addIssue({ code: 'custom', message: messages.min(isoToDmy(isoOf(min))) });
    return false;
  }
  if (max !== undefined && value > isoOf(max)) {
    ctx.addIssue({ code: 'custom', message: messages.max(isoToDmy(isoOf(max))) });
    return false;
  }
  return true;
}

const dayInput = z.string({ error: DATE_FORMAT_MESSAGE }).nullable().optional();

/** Required day ('YYYY-MM-DD'). With `required: false` the output is string | null. */
export function dateRule(label: string, options?: DateLimits & { required?: true }): z.ZodType<string, string | null | undefined>;
export function dateRule(label: string, options: DateLimits & { required: false }): z.ZodType<string | null, string | null | undefined>;
export function dateRule(
  label: string,
  { required = true, ...limits }: DateLimits & { required?: boolean } = {},
): z.ZodType<string | null, string | null | undefined> {
  if (!required) return optionalDate(label, limits);
  return dayInput
    .superRefine((value, ctx) => {
      if (!value) ctx.addIssue({ code: 'custom', message: `Enter ${lower(label)}` });
      else checkDay(value, limits, dayMessages(label), ctx);
    })
    .transform((value) => value ?? '');
}

/** Optional day: empty → null; filled values are checked like dateRule. */
export function optionalDate(label = 'Date', limits: DateLimits = {}) {
  return dayInput
    .superRefine((value, ctx) => {
      if (value) checkDay(value, limits, dayMessages(label), ctx);
    })
    .transform((value) => value || null);
}

interface RangeOptions extends DateLimits {
  /** Longest allowed range in days (start and end both count). */
  maxDays?: number;
  required?: boolean;
}

const rangeInput = z
  .object({ start: z.string().nullable().optional(), end: z.string().nullable().optional() })
  .nullable()
  .optional();
type RangeInput = z.input<typeof rangeInput>;

/**
 * { start, end } from DateRangeField. Both are needed (unless `required: false`
 * and both are empty), start ≤ end, optional min / max and length limit.
 * Issues are reported on the field itself so they show under the trigger.
 */
export function dateRangeRule(
  label: string,
  options?: RangeOptions & { required?: true },
): z.ZodType<{ start: string; end: string }, RangeInput>;
export function dateRangeRule(
  label: string,
  options: RangeOptions & { required: false },
): z.ZodType<{ start: string; end: string } | null, RangeInput>;
export function dateRangeRule(
  label: string,
  { maxDays, required = true, min, max }: RangeOptions = {},
): z.ZodType<{ start: string; end: string } | null, RangeInput> {
  return rangeInput
    .superRefine((value, ctx) => {
      const start = value?.start || null;
      const end = value?.end || null;
      if (!start && !end) {
        if (required) ctx.addIssue({ code: 'custom', message: `Enter ${lower(label)}` });
        return;
      }
      if (!start) return ctx.addIssue({ code: 'custom', message: `Enter the start date of ${lower(label)}` });
      if (!end) return ctx.addIssue({ code: 'custom', message: `Enter the end date of ${lower(label)}` });
      const messages: LimitMessages = {
        min: (day) => `${label} must start on or after ${day}`,
        max: (day) => `${label} must end on or before ${day}`,
      };
      if (!checkDay(start, { min }, messages, ctx) || !checkDay(end, { max }, messages, ctx)) return;
      if (end < start) return ctx.addIssue({ code: 'custom', message: `End date must be on or after ${isoToDmy(start)}` });
      const days = diffDays(parseIsoDate(start) as Date, parseIsoDate(end) as Date) + 1;
      if (maxDays !== undefined && days > maxDays) {
        ctx.addIssue({ code: 'custom', message: `${label} can be at most ${maxDays} days` });
      }
    })
    .transform((value) => (value?.start && value.end ? { start: value.start, end: value.end } : null));
}

/** 'HH:mm' (24h). With `required: false`, empty → null. */
export function timeRule(label: string, options?: { required?: true }): z.ZodType<string, string | null | undefined>;
export function timeRule(label: string, options: { required: false }): z.ZodType<string | null, string | null | undefined>;
export function timeRule(label: string, { required = true }: { required?: boolean } = {}): z.ZodType<string | null, string | null | undefined> {
  return z
    .string({ error: TIME_FORMAT_MESSAGE })
    .nullable()
    .optional()
    .superRefine((value, ctx) => {
      if (!value) {
        if (required) ctx.addIssue({ code: 'custom', message: `Enter ${lower(label)}` });
      } else if (!HH_MM.test(value)) ctx.addIssue({ code: 'custom', message: TIME_FORMAT_MESSAGE });
    })
    .transform((value) => value || null);
}
