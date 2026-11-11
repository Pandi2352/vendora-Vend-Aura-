import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Input } from '../ui/Input';
import { FormField } from './FormField';
import { useFormFieldController } from './useFormFieldController';

export interface NumberFieldProps {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  placeholder?: string;
  /** Digits allowed after the decimal point (0 = whole numbers only). */
  decimals?: number;
  allowNegative?: boolean;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** Screen-reader-only label (repeated rows). */
  hideLabel?: boolean;
}

const toText = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? String(value) : '');

/**
 * Numeric input stored as `number | undefined` (empty = undefined, so "required"
 * works). Typing is filtered to digits, one decimal point and the allowed decimals;
 * the text is kept separately so "12." can be typed.
 */
export function NumberField({
  name,
  label,
  hint,
  required,
  placeholder,
  decimals = 2,
  allowNegative = false,
  leftAddon,
  rightAddon,
  disabled,
  id,
  className,
  hideLabel,
}: NumberFieldProps) {
  const { field, error, invalid, ids } = useFormFieldController(name, id);
  const [text, setText] = useState(() => toText(field.value));
  // Last value this input emitted; anything else came from outside (reset / setValue).
  const emitted = useRef<unknown>(field.value);

  useEffect(() => {
    if (field.value !== emitted.current) {
      emitted.current = field.value;
      setText(toText(field.value));
    }
  }, [field.value]);

  const pattern = new RegExp(`^${allowNegative ? '-?' : ''}\\d*${decimals > 0 ? `(\\.\\d{0,${decimals}})?` : ''}$`);

  return (
    <FormField label={label} required={required} hint={hint} error={error} ids={ids} className={className} hideLabel={hideLabel}>
      <Input
        id={ids.id}
        ref={field.ref}
        name={field.name}
        type="text"
        inputMode={decimals > 0 ? 'decimal' : 'numeric'}
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const next = e.target.value.replace(/,/g, '').trim();
          if (!pattern.test(next)) return; // ignore invalid keystrokes
          setText(next);
          const value = next === '' || next === '-' || next === '.' ? undefined : Number(next);
          emitted.current = value;
          field.onChange(value);
        }}
        onBlur={field.onBlur}
        disabled={disabled || field.disabled}
        invalid={invalid}
        leftAddon={leftAddon}
        rightAddon={rightAddon}
        aria-required={required || undefined}
        aria-describedby={ids.describedBy}
        className="tabular-nums"
      />
    </FormField>
  );
}

/** Rupee amount (₹ prefix, 2 decimals). */
export function AmountField(props: Omit<NumberFieldProps, 'leftAddon' | 'decimals'>) {
  return <NumberField placeholder="0.00" {...props} leftAddon="₹" decimals={2} />;
}
