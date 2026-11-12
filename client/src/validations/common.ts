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
    const required = z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`);
    // Only add the length rule when it says something beyond "required" (avoids two messages for an empty field).
    return (min > 1 ? required.min(min, `${label} must be at least ${min} characters`) : required).max(
      max,
      `${label} must be at most ${max} characters`,
    );
  },

  /** Optional text; '' becomes undefined. */
  optionalText(label: string, { max = 500 }: { max?: number } = {}) {
    return z.preprocess(
      emptyToUndefined,
      z.string().trim().max(max, `${label} must be at most ${max} characters`).optional(),
    );
  },

  email(label = 'Email') {
    return z
      .string({ error: `${label} is required` })
      .trim()
      .min(1, `${label} is required`)
      .email('Enter a valid email address');
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
    return z.preprocess(
      emptyToUndefined,
      z.string().regex(INDIAN_MOBILE, 'Enter a valid 10-digit mobile number').optional(),
    );
  },

  optionalGstin() {
    return z.preprocess(
      (v) => (typeof v === 'string' ? emptyToUndefined(v.toUpperCase()) : v),
      z.string().regex(GSTIN, 'Enter a valid 15-character GSTIN (e.g. 33ABCDE1234F1Z5)').optional(),
    );
  },

  pincode(label = 'PIN code') {
    return z
      .string({ error: `${label} is required` })
      .trim()
      .min(1, `${label} is required`)
      .regex(PINCODE, 'Enter a valid 6-digit PIN code');
  },

  optionalPincode() {
    return z.preprocess(emptyToUndefined, z.string().regex(PINCODE, 'Enter a valid 6-digit PIN code').optional());
  },

  /** Number field (NumberField / AmountField give number | undefined). */
  number(label: string, { min, max, integer = false }: { min?: number; max?: number; integer?: boolean } = {}) {
    let schema = z.number({
      error: (issue) =>
        issue.input === undefined || issue.input === null ? `${label} is required` : `${label} must be a number`,
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

export interface CrossFieldRule<T> {
  /** Fields the rule reads; it runs as soon as these are valid (even if other fields are not). */
  fields: (keyof T & string)[];
  /** Report problems with `ctx.addIssue({ code: 'custom', path: ['field'], message })`. */
  check: (values: T, ctx: z.RefinementCtx) => void;
}

/**
 * Attaches rules that compare several fields (password = confirm, paid ≤ total…).
 * Plain object refinements only run once EVERY field is valid, so their errors
 * show late. Zod 4's `when` runs each rule as soon as its own fields parse.
 */
export function withCrossFieldRules<Shape extends z.ZodRawShape>(
  schema: z.ZodObject<Shape>,
  crossRules: CrossFieldRule<z.output<z.ZodObject<Shape>>>[],
) {
  type Out = z.output<z.ZodObject<Shape>>;
  type In = z.input<z.ZodObject<Shape>>;
  return crossRules.reduce<z.ZodType<Out, In>>((acc, rule) => {
    const mask = Object.fromEntries(rule.fields.map((f) => [f, true])) as Parameters<typeof schema.pick>[0];
    const subset = schema.pick(mask);
    return acc.superRefine((values, ctx) => rule.check(values as Out, ctx), {
      when: (payload) => subset.safeParse(payload.value).success,
    });
  }, schema);
}

/** Rule: confirmPassword must equal newPassword. */
export function passwordsMatchRule<T extends { newPassword: string; confirmPassword: string }>(): CrossFieldRule<T> {
  return {
    fields: ['newPassword', 'confirmPassword'] as (keyof T & string)[],
    check: (v, ctx) => {
      if (v.newPassword !== v.confirmPassword) {
        ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match' });
      }
    },
  };
}

/** Adds a "confirm password" match check (shows as soon as both password fields are filled). */
export function withPasswordConfirmation<
  Shape extends z.ZodRawShape & { newPassword: z.ZodType<string>; confirmPassword: z.ZodType<string> },
>(schema: z.ZodObject<Shape>) {
  return withCrossFieldRules(schema, [passwordsMatchRule() as unknown as CrossFieldRule<z.output<z.ZodObject<Shape>>>]);
}
