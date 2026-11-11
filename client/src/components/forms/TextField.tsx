import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { Input } from '../ui/Input';
import { FormField } from './FormField';
import { useFormFieldController } from './useFormFieldController';
import { digitsOnly } from '@/utils/string';

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue'>;

export interface TextFieldProps extends NativeInputProps {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  /** Rewrites the typed value (e.g. uppercase, digits only) before it is stored. */
  normalize?: (value: string) => string;
  /** Classes for the field wrapper (grid placement). */
  className?: string;
  /** Classes for the <input> itself (e.g. font-mono). */
  inputClassName?: string;
  hideLabel?: boolean;
}

/** Text input connected to the surrounding <Form>. */
export function TextField({
  name,
  label,
  hint,
  required,
  normalize,
  className,
  inputClassName,
  hideLabel,
  id,
  disabled,
  ...inputProps
}: TextFieldProps) {
  const { field, error, invalid, ids } = useFormFieldController(name, id);

  return (
    <FormField label={label} required={required} hint={hint} error={error} ids={ids} className={className} hideLabel={hideLabel}>
      <Input
        {...inputProps}
        className={inputClassName}
        id={ids.id}
        ref={field.ref}
        name={field.name}
        value={(field.value as string | undefined) ?? ''}
        onChange={(e) => field.onChange(normalize ? normalize(e.target.value) : e.target.value)}
        onBlur={field.onBlur}
        disabled={disabled || field.disabled}
        invalid={invalid}
        aria-required={required || undefined}
        aria-describedby={ids.describedBy}
      />
    </FormField>
  );
}

/** Password input with a show / hide button. */
export function PasswordField(props: Omit<TextFieldProps, 'type' | 'rightAddon'>) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      autoComplete="current-password"
      {...props}
      type={visible ? 'text' : 'password'}
      rightAddon={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="w-8 h-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
        >
          {visible ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}

/** 10-digit mobile: digits only, +91 prefix, numeric keypad on phones. */
export function PhoneField(props: Omit<TextFieldProps, 'type' | 'normalize' | 'leftAddon' | 'maxLength'>) {
  return (
    <TextField
      placeholder="10-digit mobile number"
      autoComplete="tel-national"
      inputMode="numeric"
      {...props}
      type="tel"
      leftAddon="+91"
      maxLength={10}
      normalize={(v) => digitsOnly(v, 10)}
    />
  );
}

/** Uppercase code fields (GSTIN, coupon, Shop ID…). */
export function UppercaseField(props: Omit<TextFieldProps, 'normalize'>) {
  return <TextField autoCapitalize="characters" spellCheck={false} {...props} normalize={(v) => v.toUpperCase()} />;
}
