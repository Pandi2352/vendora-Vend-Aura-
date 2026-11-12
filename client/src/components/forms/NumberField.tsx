import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import { Input } from '../ui/Input';
import { FormField } from './FormField';
import { useFieldBinding } from './useFormFieldController';
import { splitFieldProps, type FieldCommonProps } from './types';
import { clamp, round } from '@/utils/number';

export interface NumberFieldProps extends FieldCommonProps {
  placeholder?: string;
  /** Digits allowed after the decimal point (0 = whole numbers only). */
  decimals?: number;
  allowNegative?: boolean;
  /** Clamped on blur; also bounds the stepper. */
  min?: number;
  max?: number;
  /** Stepper / arrow-key increment. */
  step?: number;
  /** ± buttons on the right. */
  stepper?: boolean;
  /** Group digits (1,23,456.50) while the field is not focused. */
  grouped?: boolean;
  leftAddon?: ReactNode;
  /** Unit after the value, e.g. "kg", "%", "days". */
  suffix?: ReactNode;
  /** Any element after the value (kept for compatibility; prefer `suffix`). */
  rightAddon?: ReactNode;
  inputClassName?: string;
  onValueChange?: (value: number | undefined) => void;
}

const toText = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? String(value) : '');
const groupedText = (value: unknown, decimals: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: decimals })
    : '';

/**
 * Numeric input stored as `number | undefined` (empty = undefined so "required"
 * works). Typing is filtered (digits, one point, allowed decimals, optional
 * minus); min/max clamp on blur; ↑/↓ and the stepper change by `step`.
 */
export function NumberField(props: NumberFieldProps) {
  const [common, own] = splitFieldProps(props);
  const {
    placeholder,
    decimals = 2,
    allowNegative = false,
    min,
    max,
    step = 1,
    stepper = false,
    grouped = false,
    leftAddon,
    suffix,
    rightAddon,
    inputClassName,
    onValueChange,
  } = own;
  const { field, invalid, disabled, readOnly, shell, a11y } = useFieldBinding(common);
  const [text, setText] = useState(() => toText(field.value));
  const [focused, setFocused] = useState(false);
  // Last value this input emitted; anything else came from outside (reset / setValue).
  const emitted = useRef<unknown>(field.value);

  useEffect(() => {
    if (field.value !== emitted.current) {
      emitted.current = field.value;
      setText(toText(field.value));
    }
  }, [field.value]);

  const pattern = new RegExp(`^${allowNegative ? '-?' : ''}\\d*${decimals > 0 ? `(\\.\\d{0,${decimals}})?` : ''}$`);
  const lower = min ?? (allowNegative ? -Infinity : 0);
  const upper = max ?? Infinity;

  const emit = (value: number | undefined, nextText = toText(value)) => {
    setText(nextText);
    emitted.current = value;
    field.onChange(value);
    onValueChange?.(value);
  };

  const stepBy = (direction: 1 | -1) => {
    if (disabled || readOnly) return;
    const current = typeof field.value === 'number' ? field.value : min ?? 0;
    emit(round(clamp(current + direction * step, lower, upper), decimals));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (stepper && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      stepBy(e.key === 'ArrowUp' ? 1 : -1);
    }
  };

  const stepButton = (direction: 1 | -1) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={direction === 1 ? 'Increase' : 'Decrease'}
      disabled={disabled || readOnly || (direction === 1 ? (field.value as number) >= upper : (field.value as number) <= lower)}
      onClick={() => stepBy(direction)}
      className="w-7 h-7 inline-flex items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      {direction === 1 ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
    </button>
  );

  const trailing =
    suffix || stepper || rightAddon ? (
      <span className="flex items-center gap-0.5">
        {(suffix ?? rightAddon) && <span className="px-1.5 text-sm text-zinc-500">{suffix ?? rightAddon}</span>}
        {stepper && (
          <>
            {stepButton(-1)}
            {stepButton(1)}
          </>
        )}
      </span>
    ) : undefined;

  return (
    <FormField {...shell}>
      <Input
        {...a11y}
        ref={field.ref}
        name={field.name}
        type="text"
        inputMode={decimals > 0 ? 'decimal' : 'numeric'}
        autoComplete="off"
        autoFocus={common.autoFocus}
        placeholder={placeholder}
        role={stepper ? 'spinbutton' : undefined}
        aria-valuemin={stepper && min !== undefined ? min : undefined}
        aria-valuemax={stepper && max !== undefined ? max : undefined}
        aria-valuenow={stepper && typeof field.value === 'number' ? field.value : undefined}
        value={grouped && !focused ? groupedText(field.value, decimals) : text}
        onFocus={() => setFocused(true)}
        onKeyDown={onKeyDown}
        onChange={(e) => {
          const next = e.target.value.replace(/,/g, '').trim();
          if (!pattern.test(next)) return; // ignore invalid keystrokes
          const value = next === '' || next === '-' || next === '.' ? undefined : Number(next);
          emit(value, next);
        }}
        onBlur={() => {
          setFocused(false);
          if (typeof field.value === 'number') {
            const clamped = clamp(field.value, lower, upper);
            if (clamped !== field.value) emit(clamped);
          }
          field.onBlur();
        }}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        leftAddon={leftAddon}
        rightAddon={trailing}
        className={['tabular-nums', inputClassName].filter(Boolean).join(' ')}
      />
    </FormField>
  );
}

/** Rupee amount (₹ prefix, 2 decimals, grouped when not focused). */
export function AmountField(props: Omit<NumberFieldProps, 'leftAddon' | 'decimals'>) {
  return <NumberField placeholder="0.00" grouped {...props} leftAddon="₹" decimals={2} />;
}

/** Percentage 0–100 with a % suffix. */
export function PercentField(props: Omit<NumberFieldProps, 'suffix' | 'min' | 'max'>) {
  return <NumberField placeholder="0" decimals={2} {...props} suffix="%" min={0} max={100} />;
}
