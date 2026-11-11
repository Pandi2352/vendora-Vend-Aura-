import { useId, type ReactNode } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import type { DropdownOption, DropdownValue } from '../ui/dropdown/dropdown-utils';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Switch } from '../ui/Switch';
import { RadioGroup, type RadioOption } from '../ui/RadioGroup';
import { FormField } from './FormField';
import { useFormFieldController } from './useFormFieldController';

interface BaseFieldProps {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/* ----------------------------- Dropdown ----------------------------- */

export interface DropdownFieldProps<V extends DropdownValue> extends BaseFieldProps {
  options: DropdownOption<V>[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  emptyMessage?: string;
  /** Side effect after the user picks a value (e.g. fill price from the chosen product). */
  onValueChange?: (value: V | null) => void;
  hideLabel?: boolean;
}

/** Custom dropdown connected to the form; empty value is null. */
export function DropdownField<V extends DropdownValue = string>({
  name,
  label,
  hint,
  required,
  disabled,
  id,
  className,
  onValueChange,
  hideLabel,
  ...dropdownProps
}: DropdownFieldProps<V>) {
  const { field, error, invalid, ids } = useFormFieldController(name, id);
  const labelId = `${ids.id}-label`;

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      ids={ids}
      className={className}
      labelId={labelId}
      hideLabel={hideLabel}
    >
      <Dropdown<V>
        {...dropdownProps}
        id={ids.id}
        ref={field.ref}
        name={field.name}
        value={field.value as V | null}
        onChange={(value) => {
          field.onChange(value);
          onValueChange?.(value);
        }}
        onBlur={field.onBlur}
        disabled={disabled || field.disabled}
        invalid={invalid}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={ids.describedBy}
        aria-required={required || undefined}
      />
    </FormField>
  );
}

/* ----------------------------- Textarea ----------------------------- */

export function TextareaField({
  name,
  label,
  hint,
  required,
  disabled,
  id,
  className,
  rows,
  placeholder,
  maxLength,
}: BaseFieldProps & { rows?: number; placeholder?: string; maxLength?: number }) {
  const { field, error, invalid, ids } = useFormFieldController(name, id);
  const length = String(field.value ?? '').length;

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      ids={ids}
      className={className}
      hint={maxLength ? <span className="ml-auto tabular-nums">{`${length}/${maxLength}`}</span> : hint}
    >
      <Textarea
        id={ids.id}
        ref={field.ref}
        name={field.name}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        value={(field.value as string | undefined) ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
        disabled={disabled || field.disabled}
        invalid={invalid}
        aria-required={required || undefined}
        aria-describedby={ids.describedBy}
      />
    </FormField>
  );
}

/* ----------------------------- Checkbox ----------------------------- */

export function CheckboxField({
  name,
  label,
  hint,
  disabled,
  id,
  className,
  description,
}: Omit<BaseFieldProps, 'required'> & { description?: ReactNode }) {
  const { field, error, invalid, ids } = useFormFieldController(name, id);
  return (
    <FormField error={error} hint={hint} ids={ids} className={className}>
      <Checkbox
        id={ids.id}
        ref={field.ref}
        name={field.name}
        checked={!!field.value}
        onChange={(e) => field.onChange(e.target.checked)}
        onBlur={field.onBlur}
        disabled={disabled || field.disabled}
        invalid={invalid}
        label={label}
        description={description}
        aria-describedby={ids.describedBy}
      />
    </FormField>
  );
}

/* ------------------------------ Switch ------------------------------ */

export function SwitchField({
  name,
  label,
  hint,
  disabled,
  id,
  className,
  description,
}: Omit<BaseFieldProps, 'required'> & { description?: ReactNode }) {
  const { field, error, ids } = useFormFieldController(name, id);
  const labelId = useId();
  return (
    <FormField error={error} hint={hint} ids={ids} className={className}>
      <div className="flex items-center justify-between gap-4 min-h-10">
        <div className="min-w-0">
          <p id={labelId} className="text-sm font-semibold text-zinc-900">
            {label}
          </p>
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
        <Switch
          id={ids.id}
          ref={field.ref}
          checked={!!field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled || field.disabled}
          aria-labelledby={labelId}
          aria-describedby={ids.describedBy}
        />
      </div>
    </FormField>
  );
}

/* ---------------------------- Radio group ---------------------------- */

export function RadioGroupField<V extends string>({
  name,
  label,
  hint,
  required,
  disabled,
  id,
  className,
  options,
  inline,
}: BaseFieldProps & { options: RadioOption<V>[]; inline?: boolean }) {
  const { field, error, invalid, ids } = useFormFieldController(name, id);
  const labelId = `${ids.id}-label`;
  return (
    <FormField label={label} required={required} hint={hint} error={error} ids={ids} className={className} labelId={labelId}>
      <RadioGroup<V>
        name={field.name}
        options={options}
        value={field.value as V | null}
        onChange={field.onChange}
        onBlur={field.onBlur}
        disabled={disabled || field.disabled}
        invalid={invalid}
        inline={inline}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={ids.describedBy}
      />
    </FormField>
  );
}
