import { SearchInput } from '../ui/SearchInput';
import { FormField } from './FormField';
import type { FieldCommonProps } from './types';
import { useFieldBinding } from './useFormFieldController';

export interface SearchFieldProps extends FieldCommonProps {
  /** Debounced search with the current text ('' after clearing). */
  onSearch?: (value: string) => void;
  /** Debounce for onSearch in ms (default 300). */
  debounceMs?: number;
  loading?: boolean;
  placeholder?: string;
  clearLabel?: string;
}

/** Search box connected to the form (value is a string). Outside forms use <SearchInput>. */
export function SearchField({ onSearch, debounceMs, loading, placeholder, clearLabel, autoFocus, ...props }: SearchFieldProps) {
  const { field, invalid, disabled, readOnly, shell, a11y } = useFieldBinding(props);

  return (
    <FormField {...shell}>
      <SearchInput
        {...a11y}
        ref={field.ref}
        name={field.name}
        value={(field.value as string | undefined) ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
        onSearch={onSearch}
        debounceMs={debounceMs}
        loading={loading}
        placeholder={placeholder}
        clearLabel={clearLabel}
        invalid={invalid}
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
      />
    </FormField>
  );
}
