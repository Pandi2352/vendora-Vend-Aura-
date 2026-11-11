import type { ReactNode } from 'react';
import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { Alert } from '../ui/Alert';
import { cn } from '../ui/cn';
import { applyServerErrors, fieldPaths, ROOT_SERVER_ERROR } from './server-errors';

interface FormProps<TFieldValues extends FieldValues, TTransformed> {
  form: UseFormReturn<TFieldValues, unknown, TTransformed>;
  /** Receives validated (schema-transformed) values. Throw / reject to show server errors. */
  onSubmit: (values: TTransformed) => unknown | Promise<unknown>;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Show the form-level server error above the fields (default true). */
  showServerError?: boolean;
}

/**
 * Wraps a react-hook-form instance: provides context to fields, validates on
 * submit, prevents double submits, and maps API validation errors onto fields
 * (or a form-level alert).
 */
export function Form<TFieldValues extends FieldValues, TTransformed>({
  form,
  onSubmit,
  children,
  className,
  id,
  showServerError = true,
}: FormProps<TFieldValues, TTransformed>) {
  const serverError = (form.formState.errors.root as Record<string, { message?: string }> | undefined)?.server?.message;

  const submit = form.handleSubmit(async (values) => {
    form.clearErrors(ROOT_SERVER_ERROR as never);
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, form.setError, fieldPaths(form.getValues()));
    }
  });

  return (
    <FormProvider {...form}>
      <form
        id={id}
        noValidate
        className={cn('w-full', className)}
        onSubmit={(e) => {
          e.stopPropagation(); // nested forms in portals must not submit the parent
          if (!form.formState.isSubmitting) void submit(e);
          else e.preventDefault();
        }}
      >
        {showServerError && serverError && (
          <Alert tone="error" className="mb-4">
            {serverError}
          </Alert>
        )}
        {children}
      </form>
    </FormProvider>
  );
}
