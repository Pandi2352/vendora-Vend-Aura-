import { useMemo } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { DropdownField, Form, FormActions, FormGrid, TextField, useAppForm } from '@/components/forms';
import { api, unwrap } from '@/lib/api';
import { round2 } from '@/lib/totals';
import type { InvoiceReturnLookup, OrderReturnRecord } from '@/types/shift-return.types';
import {
  REFUND_MODES,
  REFUND_MODE_LABELS,
  makeSalesReturnSchema,
  type SalesReturnValues,
} from '@/validations/orders';
import { formatInr } from '@/utils';
import { ReturnItemsSelector, lineQty } from './ReturnItemsSelector';

interface ReturnFormProps {
  lookup: InvoiceReturnLookup;
  onCancel: () => void;
  onProcessed: (record: OrderReturnRecord) => void;
}

/** Return quantities, reasons and refund method for one looked-up bill. */
export function ReturnForm({ lookup, onCancel, onProcessed }: ReturnFormProps) {
  const { order, returnableItems } = lookup;
  const hasCustomer = !!order.customerId;

  const schema = useMemo(
    () => makeSalesReturnSchema(returnableItems.map((it) => Math.max(0, it.returnableQty)), hasCustomer),
    [returnableItems, hasCustomer],
  );
  const form = useAppForm(schema, {
    defaultValues: {
      lines: returnableItems.map((it) => ({ productId: it.productId, quantity: 0, reason: null })),
      refundMode: 'CASH',
      remarks: '',
    },
  });
  const { fields } = useFieldArray({ control: form.control, name: 'lines' });
  const lines = useWatch({ control: form.control, name: 'lines' }) ?? [];
  const totalRefund = round2(returnableItems.reduce((sum, it, i) => sum + it.unitRefund * lineQty(lines[i]?.quantity), 0));

  const refundOptions = REFUND_MODES.filter((m) => m !== 'CUSTOMER_KHATA' || hasCustomer).map((value) => ({
    value,
    label: REFUND_MODE_LABELS[value],
  }));

  const submit = async (values: SalesReturnValues) => {
    const res = await api.post('/orders/returns', {
      originalInvoiceNumber: order.invoiceNumber,
      items: values.lines
        .filter((l) => l.quantity > 0)
        .map((l) => ({ productId: l.productId, quantityReturned: l.quantity, reason: l.reason })),
      refundMode: values.refundMode,
      remarks: values.remarks,
    });
    onProcessed(unwrap<OrderReturnRecord>(res));
  };

  return (
    <Form form={form} onSubmit={submit} className="space-y-4">
      <ReturnItemsSelector items={returnableItems} fieldIds={fields.map((f) => f.id)} />

      <FormGrid>
        <DropdownField name="refundMode" label="Refund method" required options={refundOptions} />
        <TextField name="remarks" label="Return remarks" placeholder="Optional note / inspection remark" />
      </FormGrid>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-100 pt-3">
        <p className="text-xs" aria-live="polite">
          <span className="text-zinc-500">Refund (incl. GST): </span>
          <span className="font-mono font-black text-sm text-zinc-950">{formatInr(totalRefund)}</span>
        </p>
        <FormActions
          className="pt-0"
          onCancel={onCancel}
          submitLabel={`Confirm return (${formatInr(totalRefund)})`}
          submittingLabel="Processing…"
        />
      </div>
    </Form>
  );
}
