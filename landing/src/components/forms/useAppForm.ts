import { useForm, type FieldValues, type Resolver, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

/**
 * Standard form setup for the whole app:
 * - zod schema validation
 * - errors appear as soon as a field is left (onTouched) and update while typing,
 *   so users see problems before pressing Submit
 * - Submit validates everything and focuses the first invalid field
 */
export function useAppForm<Schema extends z.ZodType<FieldValues, FieldValues>>(
  schema: Schema,
  options: Omit<UseFormProps<z.input<Schema>, unknown, z.output<Schema>>, 'resolver'> = {},
) {
  return useForm<z.input<Schema>, unknown, z.output<Schema>>({
    // zodResolver's generics cannot follow a generic Schema; the cast restores the exact input/output types.
    resolver: zodResolver(schema as never) as unknown as Resolver<z.input<Schema>, unknown, z.output<Schema>>,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    ...options,
  });
}
