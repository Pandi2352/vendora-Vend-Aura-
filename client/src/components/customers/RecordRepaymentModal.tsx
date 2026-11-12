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
import { makeRepaymentSchema, type RepaymentSchema } from '@/validations/customer';
import type { CustomerItem } from '@/types/pos.types';

interface RecordRepaymentModalProps {
  customer: CustomerItem | null;
  onClose: () => void;
  onRepaymentSuccess: () => void;
}

const MODE_OPTIONS = [
  { value: 'UPI' as const, label: 'UPI' },
  { value: 'CASH' as const, label: 'Cash' },
  { value: 'CARD' as const, label: 'Card' },
  { value: 'BANK_TRANSFER' as const, label: 'Bank transfer' },
];

export function RecordRepaymentModal({ customer, onClose, onRepaymentSuccess }: RecordRepaymentModalProps) {
  return (
    <Dialog open={!!customer} onClose={onClose} title="Record Khata repayment" size="sm">
      {customer && <RepaymentForm customer={customer} onClose={onClose} onRepaymentSuccess={onRepaymentSuccess} />}
    </Dialog>
  );
}

function RepaymentForm({
  customer,
  onClose,
  onRepaymentSuccess,
}: RecordRepaymentModalProps & { customer: CustomerItem }) {
  const toast = useToast();
  const outstanding = customer.currentCreditBalance;
  const schema = useMemo(() => makeRepaymentSchema(outstanding), [outstanding]);
  const form = useAppForm(schema, {
    defaultValues: {
      amount: outstanding > 0 ? outstanding : undefined,
      paymentMode: 'UPI',
      referenceNumber: '',
      remarks: '',
    },
  });

  const handleSubmit = async (values: z.output<RepaymentSchema>) => {
    await api.post(`/customers/${customer.id}/payment`, values);
    toast.success('Repayment recorded', `${formatInr(values.amount)} received from ${customer.name}.`);
    onRepaymentSuccess();
    onClose();
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <div className="p-3 mb-4 bg-zinc-50 rounded-md border border-zinc-200 text-xs">
        <div className="font-bold text-zinc-900">{customer.name}</div>
        <div className="text-zinc-500 font-mono text-[11px]">{customer.phone}</div>
        <div className="mt-1.5 pt-1.5 border-t border-zinc-200 flex justify-between items-center">
          <span className="text-zinc-500">Current outstanding</span>
          <span className="font-mono font-black text-red-600">{formatInr(outstanding)}</span>
        </div>
      </div>
      <AmountField name="amount" label="Repayment amount" required />
      <RadioGroupField name="paymentMode" label="Payment mode" required variant="segmented" options={MODE_OPTIONS} />
      <TextField
        name="referenceNumber"
        label="Payment reference"
        optional
        placeholder="UPI UTR, receipt # or note"
        autoComplete="off"
      />
      <TextareaField
        name="remarks"
        label="Remarks"
        optional
        autoResize
        rows={2}
        maxLength={300}
        placeholder="e.g. Partial clearance of weekly bill"
      />
      <FormActions submitLabel="Confirm repayment" submittingLabel="Processing…" onCancel={onClose} />
    </Form>
  );
}
