import { useEffect, useId, type ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { z } from 'zod';
import { ArrowCounterClockwise, Check } from '@phosphor-icons/react';
import { Form, FormSection, SwitchField, useAppForm } from '@/components/forms';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/api';

interface MasterFormDialogProps<Schema extends z.ZodType<FieldValues, FieldValues>> {
  open: boolean;
  /** Singular name, e.g. "warehouse". */
  noun: string;
  description: string;
  schema: Schema;
  /** Values for a new record. */
  defaults: z.input<Schema>;
  /** Values of the record being edited; null when adding. */
  initial: z.input<Schema> | null;
  onClose: () => void;
  /** Throw to keep the dialog open and show the error on the form. */
  onSubmit: (values: z.output<Schema>) => Promise<unknown>;
  /** The record's fields (FormSection / FormGrid / *Field). */
  children: ReactNode;
}

/**
 * Add / edit dialog shared by the Master lists: the screen's fields, a Status
 * switch, and Clear (back to the starting values) · Cancel · Save.
 */
export function MasterFormDialog<Schema extends z.ZodType<FieldValues, FieldValues>>({
  open,
  noun,
  description,
  schema,
  defaults,
  initial,
  onClose,
  onSubmit,
  children,
}: MasterFormDialogProps<Schema>) {
  const formId = useId();
  const toast = useToast();
  const form = useAppForm(schema, { defaultValues: (initial ?? defaults) as never });
  const editing = initial !== null;

  // Load the right values each time the dialog opens (add vs edit another row).
  useEffect(() => {
    if (open) form.reset((initial ?? defaults) as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when opening or switching records
  }, [open, initial]);

  const submit = async (values: z.output<Schema>) => {
    try {
      await onSubmit(values);
      toast.success(`${capital(noun)} ${editing ? 'updated' : 'added'}`);
      onClose();
    } catch (err) {
      toast.error(`Could not save ${noun}`, getErrorMessage(err));
      throw err;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={`${editing ? 'Edit' : 'Add'} ${noun}`}
      description={description}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowCounterClockwise className="w-3.5 h-3.5" />}
            onClick={() => form.reset((initial ?? defaults) as never)}
          >
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            size="sm"
            loading={form.formState.isSubmitting}
            icon={<Check weight="bold" className="w-3.5 h-3.5" />}
          >
            Save
          </Button>
        </div>
      }
    >
      <Form form={form} onSubmit={submit} id={formId} className="space-y-4">
        {children}
        <FormSection title="Status">
          <div className="max-w-xs">
            <SwitchField
              name="active"
              label="Active"
              checkboxDescription="Inactive records stay listed but cannot be picked"
              variant="card"
            />
          </div>
        </FormSection>
      </Form>
    </Dialog>
  );
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
