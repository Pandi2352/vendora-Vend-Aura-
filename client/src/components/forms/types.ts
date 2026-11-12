import type { ReactNode } from 'react';

/**
 * Props every form field accepts (TextField, NumberField, DropdownField, DateField, …).
 * Keep new fields on this contract so all fields behave the same.
 */
export interface FieldCommonProps {
  /** Form value path, e.g. "phone" or "items.0.quantity". */
  name: string;
  label?: ReactNode;
  /** Keep the label for screen readers but hide it visually (repeated table rows). */
  hideLabel?: boolean;
  /** Red asterisk + aria-required. The schema enforces the rule. */
  required?: boolean;
  /** Shows "(optional)" after the label (use on forms where most fields are required). */
  optional?: boolean;
  /** Info icon next to the label with this help text (hover / focus). */
  tooltip?: ReactNode;
  /** Small element on the right of the label row, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode;
  /** Help text between the label and the control (format examples, rules). */
  description?: ReactNode;
  /** Help text under the control (replaced by error / warning / success when present). */
  hint?: ReactNode;
  /** Non-blocking advice under the control (amber). Does not stop submit. */
  warning?: ReactNode;
  /** Positive confirmation under the control (green), e.g. "Shop ID is available". */
  success?: ReactNode;
  /** Error shown in addition to / instead of the form's validation error (e.g. async check). */
  error?: string;
  disabled?: boolean;
  /** Shows the value but prevents editing (still submitted, still focusable). */
  readOnly?: boolean;
  /** Label above (default) or beside the control on wide screens. */
  layout?: 'vertical' | 'horizontal';
  autoFocus?: boolean;
  /** Other fields to re-validate when this one changes (e.g. confirmPassword). */
  deps?: string[];
  id?: string;
  /** Classes for the field wrapper (grid placement). */
  className?: string;
}

const COMMON_KEYS = [
  'name', 'label', 'hideLabel', 'required', 'optional', 'tooltip', 'labelAction', 'description', 'hint',
  'warning', 'success', 'error', 'disabled', 'readOnly', 'layout', 'autoFocus', 'deps', 'id', 'className',
] as const satisfies readonly (keyof FieldCommonProps)[];

/**
 * Splits a field's props into the common field props (for useFieldBinding) and
 * the rest (for the control), so fields never forward label/hint/etc. to inputs.
 */
export function splitFieldProps<P extends FieldCommonProps>(props: P) {
  const common = {} as FieldCommonProps;
  const rest = { ...props } as Record<string, unknown>;
  for (const key of COMMON_KEYS) {
    if (key in rest) {
      (common as unknown as Record<string, unknown>)[key] = rest[key];
      delete rest[key];
    }
  }
  return [common, rest as Omit<P, keyof FieldCommonProps>] as const;
}
