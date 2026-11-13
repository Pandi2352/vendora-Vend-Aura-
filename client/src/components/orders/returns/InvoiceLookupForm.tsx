import { MagnifyingGlass } from '@phosphor-icons/react';
import { Form, UppercaseField, useAppForm } from '@/components/forms';
import { Button } from '@/components/ui';
import { api, unwrap } from '@/lib/api';
import type { InvoiceReturnLookup } from '@/types/shift-return.types';
import { invoiceLookupSchema } from '@/validations/orders';

interface InvoiceLookupFormProps {
  onFound: (lookup: InvoiceReturnLookup) => void;
  /** Called before each lookup so the previous bill is cleared. */
  onSearchStart?: () => void;
}

/** Finds a bill by invoice number; lookup failures show as the form error. */
export function InvoiceLookupForm({ onFound, onSearchStart }: InvoiceLookupFormProps) {
  const form = useAppForm(invoiceLookupSchema, { defaultValues: { invoiceNumber: '' } });

  const search = async ({ invoiceNumber }: { invoiceNumber: string }) => {
    onSearchStart?.();
    const res = await api.get(`/orders/returns/invoice/${encodeURIComponent(invoiceNumber.toUpperCase())}`);
    onFound(unwrap<InvoiceReturnLookup>(res));
  };

  return (
    <Form form={form} onSubmit={search}>
      <div className="flex items-start gap-2">
        <UppercaseField
          name="invoiceNumber"
          label="Invoice number"
          required
          placeholder="e.g. INV-2026-00001"
          autoComplete="off"
          className="flex-1"
          leftAddon={<MagnifyingGlass className="w-4 h-4" />}
        />
        <Button type="submit" loading={form.formState.isSubmitting} className="mt-[1.375rem] shrink-0">
          Find bill
        </Button>
      </div>
    </Form>
  );
}
