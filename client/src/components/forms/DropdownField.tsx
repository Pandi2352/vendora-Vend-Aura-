import type { ReactNode } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import type { DropdownOption, DropdownValue } from '../ui/dropdown/dropdown-utils';
import { FormField } from './FormField';
import { useFieldBinding } from './useFormFieldController';
import { splitFieldProps, type FieldCommonProps } from './types';

export interface DropdownFieldProps<V extends DropdownValue> extends FieldCommonProps {
  options: DropdownOption<V>[];
  placeholder?: string;
  /** Search box (auto when more than 7 options). */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Server-side search: called with the typed query (pair with `loading`). */
  onSearch?: (query: string) => void;
  loading?: boolean;
  clearable?: boolean;
  emptyMessage?: string;
  leftIcon?: ReactNode;
  /** Side effect after the user picks a value (e.g. fill price from the chosen product). */
  onValueChange?: (value: V | null) => void;
}

/** Custom dropdown connected to the form; empty value is null. */
export function DropdownField<V extends DropdownValue = string>(props: DropdownFieldProps<V>) {
  const [common, own] = splitFieldProps(props);
  const { onValueChange, ...dropdownProps } = own;
  const { field, invalid, disabled, readOnly, shell, ids } = useFieldBinding(common);
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
        readOnly={readOnly}
        invalid={invalid}
        aria-labelledby={common.label ? labelId : undefined}
        aria-label={common.label ? undefined : dropdownProps.placeholder}
        aria-describedby={ids.describedBy}
        aria-required={common.required || undefined}
      />
    </FormField>
  );
}
