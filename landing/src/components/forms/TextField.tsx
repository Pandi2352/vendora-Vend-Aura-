import type { InputHTMLAttributes, ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { cn } from '../ui/cn';
import { FormField } from './FormField';
import { useFieldBinding } from './useFieldBinding';
import { splitFieldProps, type FieldCommonProps } from './types';
import { digitsOnly } from '../../lib/string';

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue' | 'className' | 'id' | 'disabled' | 'readOnly' | 'autoFocus'
>;

export interface TextFieldProps extends FieldCommonProps, NativeInputProps {
  /** Fixed text before the value, e.g. "₹" or "+91" (separated by a divider). */
  leftAddon?: ReactNode;
  /** Element after the value (e.g. a button). */
  rightAddon?: ReactNode;
  /** Icon inside the input on the left. */
  leftIcon?: ReactNode;
  /** Icon inside the input on the right. */
  rightIcon?: ReactNode;
  /** × button to empty the field. */
  clearable?: boolean;
  /** Spinner on the right (async checks such as "is this Shop ID free?"). */
  loading?: boolean;
  /** "12 / 40" counter in the message line (needs maxLength). */
  showCount?: boolean;
  /** Rewrites the typed value (e.g. uppercase, digits only) before it is stored. */
  normalize?: (value: string) => string;
  /** Classes for the <input> itself (e.g. font-mono). */
  inputClassName?: string;
  /** Side effect after the user changes the value. */
  onValueChange?: (value: string) => void;
}

/** Text input connected to the surrounding <Form>. Supports every FieldCommonProps feature. */
export function TextField(props: TextFieldProps) {
  const [common, own] = splitFieldProps(props);
  const {
    leftAddon,
    rightAddon,
    leftIcon,
    rightIcon,
    clearable,
    loading,
    showCount,
    normalize,
    inputClassName,
    onValueChange,
    maxLength,
    ...inputProps
  } = own;
  const { hint, autoFocus } = common;
  const { field, invalid, disabled, readOnly, shell, a11y } = useFieldBinding(common);
  const value = (field.value as string | undefined) ?? '';

  const setValue = (next: string) => {
    const normalized = normalize ? normalize(next) : next;
    field.onChange(normalized);
    onValueChange?.(normalized);
  };

  const showClear = clearable && value !== '' && !disabled && !readOnly;
  // Keep the addon area mounted whenever it *can* show something: toggling it would
  // change the input's DOM structure, remount the <input> and drop focus mid-typing.
  const trailing =
    clearable || loading !== undefined || rightIcon || rightAddon ? (
      <span className="flex items-center gap-0.5">
        {loading && <Spinner size="sm" className="text-zinc-400 mx-1.5" label="Checking" />}
        {showClear && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => setValue('')}
            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {rightIcon && <span className="px-1.5 text-zinc-400 [&>svg]:w-4 [&>svg]:h-4">{rightIcon}</span>}
        {rightAddon}
      </span>
    ) : undefined;

  const counter =
    showCount && maxLength ? (
      <span className="ml-auto tabular-nums" aria-hidden>
        {value.length}/{maxLength}
      </span>
    ) : null;

  return (
    <FormField {...shell} hint={counter && !hint ? counter : hint}>
      <Input
        {...inputProps}
        {...a11y}
        ref={field.ref}
        name={field.name}
        value={value}
        maxLength={maxLength}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        onBlur={field.onBlur}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        leftAddon={leftAddon ?? (leftIcon ? <span className="text-zinc-400 [&>svg]:w-4 [&>svg]:h-4">{leftIcon}</span> : undefined)}
        rightAddon={trailing}
        className={cn(readOnly && 'bg-zinc-50', inputClassName)}
      />
    </FormField>
  );
}

/** Keeps the 10-digit national number: strips spaces/dashes and a pasted +91 / 0 prefix. */
export function normalizeIndianMobile(value: string) {
  const digits = digitsOnly(value);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(0, 10);
}

/** 10-digit mobile: digits only (also when pasted), +91 prefix, numeric keypad. */
export function PhoneField(props: Omit<TextFieldProps, 'type' | 'normalize' | 'leftAddon' | 'maxLength'>) {
  return (
    <TextField
      placeholder="10-digit mobile number"
      autoComplete="tel-national"
      inputMode="numeric"
      {...props}
      type="tel"
      leftAddon="+91"
      maxLength={14}
      normalize={normalizeIndianMobile}
    />
  );
}

/** Upper-case codes (GSTIN, coupon…). */
export function UppercaseField(props: Omit<TextFieldProps, 'normalize'>) {
  return <TextField autoCapitalize="characters" spellCheck={false} {...props} normalize={(v) => v.toUpperCase()} />;
}

/** Email: email keyboard, lower-case, no spaces. */
export function EmailField(props: Omit<TextFieldProps, 'type' | 'normalize'>) {
  return (
    <TextField
      placeholder="name@example.com"
      autoComplete="email"
      inputMode="email"
      spellCheck={false}
      {...props}
      type="email"
      normalize={(v) => v.replace(/\s/g, '').toLowerCase()}
    />
  );
}

