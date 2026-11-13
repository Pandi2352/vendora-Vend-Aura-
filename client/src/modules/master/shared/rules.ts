import { z } from 'zod';
import { INDIAN_MOBILE, rules, type CrossFieldRule } from '@/validations/common';

const blankToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

/** Field rules shared by the Master forms. */
export const masterRules = {
  /** Required short code, stored upper-case (e.g. "WH01"). */
  code: (label: string, max = 10) =>
    z
      .string({ error: `${label} is required` })
      .trim()
      .min(1, `${label} is required`)
      .max(max, `${label} must be at most ${max} characters`)
      .regex(/^[A-Za-z0-9_-]+$/, `${label} can use letters, numbers, - and _ only`)
      .transform((v) => v.toUpperCase()),
  name: (label: string, max = 80) => rules.text(label, { max }),
  optionalText: (label: string, max = 120) => rules.optionalText(label, { max }),
  optionalPhone: () =>
    z.preprocess(blankToUndefined, z.string().regex(INDIAN_MOBILE, 'Enter a valid 10-digit mobile number').optional()),
  optionalDigits: (label: string, max = 15) =>
    z.preprocess(
      blankToUndefined,
      z
        .string()
        .regex(/^\d+$/, `${label} can only contain digits`)
        .max(max, `${label} must be at most ${max} digits`)
        .optional(),
    ),
  active: () => z.boolean(),
};

/**
 * Codes must be unique within a list (case-insensitive), ignoring the row being
 * edited. Use with withCrossFieldRules so the error shows as soon as Code is valid.
 */
export function uniqueCodeRule<T extends { code: string }>(
  rows: { id: string; code: string }[],
  editingId: string | undefined,
  label = 'Code',
): CrossFieldRule<T> {
  return {
    fields: ['code'] as (keyof T & string)[],
    check: (values, ctx) => {
      const wanted = values.code.trim().toUpperCase();
      if (rows.some((r) => r.id !== editingId && r.code.toUpperCase() === wanted)) {
        ctx.addIssue({ code: 'custom', path: ['code'], message: `${label} ${wanted} is already used` });
      }
    },
  };
}
