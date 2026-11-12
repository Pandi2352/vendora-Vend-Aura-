import { useId, type ReactNode } from 'react';
import { Checkbox } from '../ui/Checkbox';
import { Switch } from '../ui/Switch';
import { cn } from '../ui/cn';
import { FormField } from './FormField';
import { useFieldBinding } from './useFormFieldController';
import { splitFieldProps, type FieldCommonProps } from './types';

interface ToggleFieldProps extends FieldCommonProps {
  /** Second line under the label. */
  checkboxDescription?: ReactNode;
  onValueChange?: (checked: boolean) => void;
}

interface SwitchFieldProps extends ToggleFieldProps {
  /** row: plain label + switch (settings lists). card: bordered tile, click anywhere, tinted when on (form grids). */
  variant?: 'row' | 'card';
}

/** Single checkbox (boolean). The label sits next to the box. */
export function CheckboxField(props: ToggleFieldProps) {
  const [common, own] = splitFieldProps(props);
  const { field, invalid, disabled, readOnly, shell, a11y } = useFieldBinding(common);
  const { label, ...shellWithoutLabel } = shell;

  return (
    <FormField {...shellWithoutLabel}>
      <Checkbox
        {...a11y}
        ref={field.ref}
        name={field.name}
        checked={!!field.value}
        onChange={(e) => {
          if (readOnly) return;
          field.onChange(e.target.checked);
          own.onValueChange?.(e.target.checked);
        }}
        onBlur={field.onBlur}
        disabled={disabled}
        aria-readonly={readOnly || undefined}
        invalid={invalid}
        label={
          <>
            {label}
            {common.required && (
              <span className="text-red-600 ml-0.5" aria-hidden>
                *
              </span>
            )}
          </>
        }
        description={own.checkboxDescription}
      />
    </FormField>
  );
}

/** On/off setting row: label + description on the left, switch on the right. */
export function SwitchField(props: SwitchFieldProps) {
  const [common, own] = splitFieldProps(props);
  const { field, disabled, readOnly, shell, ids } = useFieldBinding(common);
  const labelId = useId();
  const { label, ...shellWithoutLabel } = shell;
  const checked = !!field.value;
  const card = own.variant === 'card';

  return (
    <FormField {...shellWithoutLabel}>
      <label
        htmlFor={ids.id}
        className={cn(
          'flex items-center justify-between gap-3 min-h-10',
          card && 'px-3 py-1.5 rounded-md border transition-colors',
          card && !disabled && 'cursor-pointer',
          card && (checked ? 'bg-primary-50 border-primary-200' : 'bg-white border-zinc-200 hover:border-zinc-300'),
        )}
      >
        <span className="min-w-0">
          <span id={labelId} className="block text-sm font-semibold text-zinc-900 leading-tight">
            {label}
          </span>
          {own.checkboxDescription && (
            <span className="block text-xs text-zinc-500 mt-0.5 leading-tight">{own.checkboxDescription}</span>
          )}
        </span>
        <Switch
          id={ids.id}
          ref={field.ref}
          checked={checked}
          onChange={(next) => {
            if (readOnly) return;
            field.onChange(next);
            own.onValueChange?.(next);
          }}
          onBlur={field.onBlur}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={ids.describedBy}
        />
      </label>
    </FormField>
  );
}
