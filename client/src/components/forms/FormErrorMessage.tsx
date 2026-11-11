import { useFormContext, type FieldError } from 'react-hook-form';
import { WarningCircle } from '@phosphor-icons/react';

/**
 * Error for a whole group / array field (e.g. "Add at least one item").
 * RHF stores array-level errors either on `errors[name]` or `errors[name].root`;
 * this reads both so screens don't have to.
 */
export function FormErrorMessage({ name }: { name: string }) {
  const { formState } = useFormContext();
  const entry = name.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], formState.errors) as
    | (FieldError & { root?: FieldError })
    | undefined;
  const message = entry?.message ?? entry?.root?.message;
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-1 pt-1 text-xs font-medium text-red-600">
      <WarningCircle aria-hidden weight="fill" className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
