import type { FieldErrors } from 'react-hook-form';
import { ROOT_SERVER_ERROR } from './server-errors';

export interface ErrorEntry {
  path: string;
  message: string;
}

/** Flattens RHF's nested error object into [{ path: 'items.0.qty', message }]. */
export function flattenErrors(errors: FieldErrors, prefix = ''): ErrorEntry[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    if (!value || typeof value !== 'object') return [];
    const path = prefix ? `${prefix}.${key}` : key;
    if (path === ROOT_SERVER_ERROR || key === 'ref') return [];
    const own =
      typeof (value as { message?: unknown }).message === 'string'
        ? [{ path, message: (value as { message: string }).message }]
        : [];
    const nested = Object.entries(value).filter(([k]) => !['message', 'type', 'ref', 'types'].includes(k));
    return [...own, ...flattenErrors(Object.fromEntries(nested) as FieldErrors, path)];
  });
}
