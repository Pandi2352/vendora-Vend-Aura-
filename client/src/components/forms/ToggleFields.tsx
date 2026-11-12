import { useId, type ReactNode } from 'react';
import { Checkbox } from '../ui/Checkbox';
import { Switch } from '../ui/Switch';
import { FormField } from './FormField';
import { useFieldBinding } from './useFormFieldController';
import { splitFieldProps, type FieldCommonProps } from './types';

interface ToggleFieldProps extends FieldCommonProps {
  /** Second line under the label. */
  checkboxDescription?: ReactNode;
  onValueChange?: (checked: boolean) => void;
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
export function SwitchField(props: ToggleFieldProps) {
  const [common, own] = splitFieldProps(props);
  const { field, disabled, readOnly, shell, ids } = useFieldBinding(common);
  const labelId = useId();
  const { label, ...shellWithoutLabel } = shell;

  return (
    <FormField {...shellWithoutLabel}>
      <div className="flex items-center justify-between gap-4 min-h-10">
        <div className="min-w-0">
          <p id={labelId} className="text-sm font-semibold text-zinc-900">
            {label}
          </p>
          {own.checkboxDescription && <p className="text-xs text-zinc-500 mt-0.5">{own.checkboxDescription}</p>}
        </div>
        <Switch
          id={ids.id}
          ref={field.ref}
          checked={!!field.value}
          onChange={(checked) => {
            if (readOnly) return;
            field.onChange(checked);
            own.onValueChange?.(checked);
          }}
          onBlur={field.onBlur}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={ids.describedBy}
        />
      </div>
    </FormField>
  );
}
