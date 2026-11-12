import { MultiSelect } from '../ui/dropdown/MultiSelect';
import type { DropdownOption, DropdownValue } from '../ui/dropdown/dropdown-utils';
import { FormField } from './FormField';
import { useFieldBinding } from './useFormFieldController';
import type { FieldCommonProps } from './types';

export interface MultiSelectFieldProps<V extends DropdownValue = string> extends FieldCommonProps {
  options: DropdownOption<V>[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Server-side search (async options). */
  onSearch?: (query: string) => void;
  loading?: boolean;
  /** UI limit; pair it with `multiSelectRule(label, { max })` in the schema. */
  maxSelected?: number;
  maxVisibleChips?: number;
  emptyMessage?: string;
  /** Side effect after the user changes the selection. */
  onValueChange?: (value: V[]) => void;
}

/** Multi-select connected to the form; the value is an array (empty array when nothing is picked). */
export function MultiSelectField<V extends DropdownValue = string>(props: MultiSelectFieldProps<V>) {
  const {
    options,
    placeholder,
    searchable,
    searchPlaceholder,
    onSearch,
    loading,
    maxSelected,
    maxVisibleChips,
    emptyMessage,
    onValueChange,
  } = props;
  const { field, invalid, ids, disabled, readOnly, shell, a11y } = useFieldBinding(props);
  const labelId = `${ids.id}-label`;
  const value = (field.value as V[] | null | undefined) ?? [];

  return (
    <FormField {...shell} labelId={labelId}>
      <MultiSelect<V>
        options={options}
        placeholder={placeholder}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        onSearch={onSearch}
        loading={loading}
        maxSelected={maxSelected}
        maxVisibleChips={maxVisibleChips}
        emptyMessage={emptyMessage}
        autoFocus={props.autoFocus}
        id={a11y.id}
        ref={field.ref}
        name={field.name}
        value={value}
        onChange={(next) => {
          field.onChange(next);
          onValueChange?.(next);
        }}
        onBlur={field.onBlur}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        aria-labelledby={props.label ? labelId : undefined}
        aria-describedby={a11y['aria-describedby']}
        aria-required={a11y['aria-required']}
      />
    </FormField>
  );
}
