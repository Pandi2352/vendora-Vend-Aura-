import { isAxiosError } from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { getErrorMessage } from '@/lib/api';

export const ROOT_SERVER_ERROR = 'root.server' as const;

/**
 * Maps an API error onto form fields.
 * Server validation messages look like "phone must be a valid 10-digit…" or
 * "address.pincode must be…": when the first word is a field in this form, the
 * message is shown under that field; everything else goes to the form-level
 * error. Returns the number of field errors that were set.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldNames: readonly string[],
): number {
  const raw = isAxiosError(error) ? (error.response?.data as { message?: unknown; errors?: unknown } | undefined) : undefined;
  const messages: string[] = Array.isArray(raw?.errors)
    ? (raw.errors as unknown[]).map(String)
    : Array.isArray(raw?.message)
      ? (raw.message as unknown[]).map(String)
      : [];

  const unmatched: string[] = [];
  let mapped = 0;

  for (const message of messages) {
    const [path, ...rest] = message.split(' ');
    if (fieldNames.includes(path) && rest.length > 0) {
      const text = rest.join(' ');
      setError(path as Path<T>, { type: 'server', message: text.charAt(0).toUpperCase() + text.slice(1) });
      mapped++;
    } else {
      unmatched.push(message);
    }
  }

  if (mapped === 0 || unmatched.length > 0) {
    setError(ROOT_SERVER_ERROR as Path<T>, {
      type: 'server',
      message: unmatched.length > 0 ? unmatched.join(' ') : getErrorMessage(error),
    });
  }
  return mapped;
}

/**
 * All field paths of the form values ("name", "address.city", "items.0.quantity"),
 * used to recognise which server messages belong to a field.
 */
export function fieldPaths(values: unknown, prefix = ''): string[] {
  if (!values || typeof values !== 'object' || values instanceof Date) return prefix ? [prefix] : [];
  const entries = Array.isArray(values)
    ? values.map((v, i) => [String(i), v] as const)
    : Object.entries(values as Record<string, unknown>);
  return entries.flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' && !(value instanceof Date) ? [path, ...fieldPaths(value, path)] : [path];
  });
}
