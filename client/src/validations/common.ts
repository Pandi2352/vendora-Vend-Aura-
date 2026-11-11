import { z } from 'zod';

/**
 * Reusable field rules. Each builder takes the field label so every message
 * reads naturally ("Phone is required", "Enter a valid email address").
 * Empty optional inputs ('' from text boxes) become undefined.
 */

const emptyToUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value);

export const INDIAN_MOBILE = /^[6-9]\d{9}$/;
export const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PINCODE = /^[1-9]\d{5}$/;

export const rules = {
  /** Required text with optional length limits. */
  text(label: string, { min = 1, max = 200 }: { min?: number; max?: number } = {}) {
    return z
      .string({ error: `${label} is required` })
      .trim()
      .min(1, `${label} is required`)
      .min(min, `${label} must be at least ${min} characters`)
      .max(max, `${label} must be at most ${max} characters`);
  },

  /** Optional text; '' becomes undefined. */
  optionalText(label: string, { max = 500 }: { max?: number } = {}) {
    return z.preprocess(emptyToUndefined, z.string().trim().max(max, `${label} must be at most ${max} characters`).optional());
  },

  email(label = 'Email') {
    return z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).email('Enter a valid email address');
  },

  optionalEmail() {
    return z.preprocess(emptyToUndefined, z.string().trim().email('Enter a valid email address').optional());
  },

  /** 10-digit Indian mobile (PhoneField already strips non-digits). */
  phone(label = 'Mobile number') {
    return z
      .string({ error: `${label} is required` })
      .trim()
      .min(1, `${label} is required`)
      .regex(INDIAN_MOBILE, 'Enter a valid 10-digit mobile number starting with 6-9');
  },

  optionalPhone() {
    return z.preprocess(emptyToUndefined, z.string().regex(INDIAN_MOBILE, 'Enter a valid 10-digit mobile number').optional());
  },

  optionalGstin() {
    return z.preprocess(
      (v) => (typeof v === 'string' ? emptyToUndefined(v.toUpperCase()) : v),
      z.string().regex(GSTIN, 'Enter a valid 15-character GSTIN (e.g. 33ABCDE1234F1Z5)').optional(),
    );
  },

  pincode(label = 'PIN code') {
    return z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).regex(PINCODE, 'Enter a valid 6-digit PIN code');
  },

  optionalPincode() {
    return z.preprocess(emptyToUndefined, z.string().regex(PINCODE, 'Enter a valid 6-digit PIN code').optional());
  },

  /** Number field (NumberField / AmountField give number | undefined). */
  number(label: string, { min, max, integer = false }: { min?: number; max?: number; integer?: boolean } = {}) {
    let schema = z.number({
      error: (issue) => (issue.input === undefined || issue.input === null ? `${label} is required` : `${label} must be a number`),
    });
    if (integer) schema = schema.int(`${label} must be a whole number`);
    if (min !== undefined) schema = schema.min(min, `${label} must be at least ${min.toLocaleString('en-IN')}`);
    if (max !== undefined) schema = schema.max(max, `${label} must be at most ${max.toLocaleString('en-IN')}`);
    return schema;
  },

  /** Money amount in rupees, 2 decimals max. */
  amount(label: string, { min = 0, max }: { min?: number; max?: number } = {}) {
    return rules
      .number(label, { min, max })
      .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, `${label} can have at most 2 decimals`);
  },

  password(label = 'Password', { min = 8 }: { min?: number } = {}) {
    return z
      .string({ error: `${label} is required` })
      .min(1, `${label} is required`)
      .min(min, `${label} must be at least ${min} characters`)
      .regex(/[A-Za-z]/, `${label} must contain a letter`)
      .regex(/\d/, `${label} must contain a number`);
  },

  /** Required dropdown (Dropdown gives null when nothing is selected). */
  select(label: string) {
    return z.string({ error: `Select ${label.toLowerCase()}` }).min(1, `Select ${label.toLowerCase()}`);
  },

  /** Required dropdown limited to known values. */
  selectOneOf<const T extends readonly [string, ...string[]]>(label: string, values: T) {
    return z.enum(values, { error: `Select ${label.toLowerCase()}` });
  },

  optionalSelect() {
    return z.string().nullable().optional();
  },

  /** Checkbox that must be ticked (terms, confirmations). */
  mustAccept(message = 'Please confirm to continue') {
    return z.literal(true, { error: message });
  },
};

/** Adds a "confirm password" match check to an object schema. */
export function withPasswordConfirmation<T extends z.ZodObject<{ newPassword: z.ZodTypeAny; confirmPassword: z.ZodTypeAny }>>(schema: T) {
  return schema.refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
}
