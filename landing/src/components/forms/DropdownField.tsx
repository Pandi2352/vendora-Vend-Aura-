import { Dropdown } from '../ui/dropdown/Dropdown';
import type { DropdownOption, DropdownValue } from '../ui/dropdown/dropdown-utils';
import { FormField } from './FormField';
import { useFieldBinding } from './useFieldBinding';
import { splitFieldProps, type FieldCommonProps } from './types';

export interface DropdownFieldProps<V extends DropdownValue> extends Omit<FieldCommonProps, 'readOnly'> {
  options: DropdownOption<V>[];
  placeholder?: string;
  /** Search box (auto when more than 7 options). */
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  emptyMessage?: string;
  /** Side effect after the user picks a value. */
  onValueChange?: (value: V | null) => void;
}

/** Custom dropdown connected to the form; empty value is null. */
export function DropdownField<V extends DropdownValue = string>(props: DropdownFieldProps<V>) {
  const [common, own] = splitFieldProps(props);
  const { onValueChange, ...dropdownProps } = own;
  const { field, invalid, disabled, shell, ids } = useFieldBinding(common);
  const labelId = `${ids.id}-label`;

  return (
    <FormField {...shell} labelId={labelId}>
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
        disabled={disabled}
        invalid={invalid}
        aria-labelledby={common.label ? labelId : undefined}
        aria-label={common.label ? undefined : dropdownProps.placeholder}
        aria-describedby={ids.describedBy}
        aria-required={common.required || undefined}
      />
    </FormField>
  );
}
