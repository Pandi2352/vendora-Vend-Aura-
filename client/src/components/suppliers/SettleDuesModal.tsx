import { useMemo } from 'react';
import type { z } from 'zod';
import { api } from '@/lib/api';
import { Dialog } from '@/components/ui';
import {
  AmountField,
  Form,
  FormActions,
  RadioGroupField,
  TextareaField,
  TextField,
  useAppForm,
} from '@/components/forms';
import { useToast } from '@/hooks/useToast';
import { formatInr } from '@/utils';
import { makeSupplierPaymentSchema } from '@/validations/supplier';
import type { SupplierItem } from '@/types/pos.types';

interface SettleDuesModalProps {
  supplier: SupplierItem | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const MODE_OPTIONS = [
  { value: 'BANK_TRANSFER' as const, label: 'Bank transfer' },
  { value: 'UPI' as const, label: 'UPI' },
  { value: 'CASH' as const, label: 'Cash' },
  { value: 'CHEQUE' as const, label: 'Cheque' },
];

export function SettleDuesModal({ supplier, onClose, onPaymentSuccess }: SettleDuesModalProps) {
  return (
    <Dialog open={!!supplier} onClose={onClose} title="Pay supplier dues" size="sm">
      {supplier && <SettleDuesForm supplier={supplier} onClose={onClose} onPaymentSuccess={onPaymentSuccess} />}
    </Dialog>
  );
}

function SettleDuesForm({ supplier, onClose, onPaymentSuccess }: SettleDuesModalProps & { supplier: SupplierItem }) {
  const toast = useToast();
  const due = supplier.balanceDue;
  const schema = useMemo(() => makeSupplierPaymentSchema(due), [due]);
  const form = useAppForm(schema, {
    defaultValues: { amount: due > 0 ? due : undefined, paymentMode: 'BANK_TRANSFER', referenceNumber: '', notes: '' },
  });

  const handleSubmit = async (values: z.output<typeof schema>) => {
    await api.post(`/suppliers/${supplier.id}/pay`, values);
    toast.success('Payment recorded', `${formatInr(values.amount)} paid to ${supplier.name}.`);
    onPaymentSuccess();
    onClose();
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <div className="p-3 mb-4 bg-zinc-50 rounded-md border border-zinc-200 text-xs">
        <div className="font-bold text-zinc-900">{supplier.name}</div>
        <div className="text-zinc-500 font-mono text-[0.6875rem]">{supplier.phone}</div>
        <div className="mt-1.5 pt-1.5 border-t border-zinc-200 flex justify-between items-center">
          <span className="text-zinc-500">Balance owed</span>
          <span className="font-mono font-black text-red-600">{formatInr(due)}</span>
        </div>
      </div>
      <AmountField name="amount" label="Amount to pay" required />
      <RadioGroupField name="paymentMode" label="Payment method" required variant="segmented" options={MODE_OPTIONS} />
      <TextField
        name="referenceNumber"
        label="UTR / reference #"
        optional
        placeholder="e.g. UTR #, cheque #, IMPS ref"
        autoComplete="off"
      />
      <TextareaField
        name="notes"
        label="Notes"
        optional
        autoResize
        rows={2}
        maxLength={300}
        placeholder="e.g. Settlement for invoice INV/2026/894"
      />
      <FormActions submitLabel="Confirm payment" submittingLabel="Processing…" onCancel={onClose} />
    </Form>
  );
}
