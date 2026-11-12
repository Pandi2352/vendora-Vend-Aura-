import { useController, useFormContext } from 'react-hook-form';
import { useFieldIds } from './FormField';
import type { FieldCommonProps } from './types';

/**
 * Wiring shared by every connected field. Give it the field's common props;
 * spread `shell` on <FormField> and `a11y` on the control.
 */
export function useFieldBinding(props: FieldCommonProps) {
  const { control } = useFormContext();
  const { field, fieldState, formState } = useController({
    name: props.name,
    control,
    rules: props.deps ? { deps: props.deps } : undefined,
  });
  const ids = useFieldIds(props.name, props.id, !!props.description);
  const error = props.error ?? fieldState.error?.message;
  const invalid = !!error;

  return {
    field,
    error,
    invalid,
    ids,
    disabled: !!(props.disabled || field.disabled),
    readOnly: !!props.readOnly,
    isTouched: fieldState.isTouched,
    isDirty: fieldState.isDirty,
    isSubmitting: formState.isSubmitting,
    /** Props for <FormField>. */
    shell: {
      label: props.label,
      hideLabel: props.hideLabel,
      required: props.required,
      optional: props.optional,
      tooltip: props.tooltip,
      labelAction: props.labelAction,
      description: props.description,
      hint: props.hint,
      warning: props.warning,
      success: props.success,
      layout: props.layout,
      className: props.className,
      error,
      ids,
    },
    /** Accessibility attributes for the focusable control. */
    a11y: {
      id: ids.id,
      'aria-describedby': ids.describedBy,
      'aria-invalid': invalid || undefined,
      'aria-required': props.required || undefined,
    },
  };
}

/** @deprecated Prefer useFieldBinding(props). Kept for existing feature components. */
export function useFormFieldController(name: string, id?: string) {
  const binding = useFieldBinding({ name, id });
  return { field: binding.field, error: binding.error, invalid: binding.invalid, ids: binding.ids, isSubmitting: binding.isSubmitting };
}
