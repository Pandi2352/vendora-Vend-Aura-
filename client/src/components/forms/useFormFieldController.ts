import { useController, useFormContext } from 'react-hook-form';
import { useFieldIds } from './FormField';

/** Shared wiring for every connected field: value, error, touched handling and ids. */
export function useFormFieldController(name: string, id?: string) {
  const { control } = useFormContext();
  const { field, fieldState, formState } = useController({ name, control });
  const ids = useFieldIds(name, id);
  const error = fieldState.error?.message;
  return { field, error, invalid: !!error, ids, isSubmitting: formState.isSubmitting };
}
