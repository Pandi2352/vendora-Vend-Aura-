import { useWatch } from 'react-hook-form';
import { AmountField, RadioGroupField } from '@/components/forms';
import { formatInr } from '@/utils';
import { inwardTotals, type InwardInput } from '@/validations/supplier';

const STATUS_OPTIONS = [
  { value: 'UNPAID' as const, label: 'Unpaid' },
  { value: 'PARTIAL' as const, label: 'Partial' },
  { value: 'PAID' as const, label: 'Paid' },
];

/** Payment status (+ amount paid now when partial) and the bill totals. Inside the inward <Form>. */
export function InwardPaymentSection() {
  const items = (useWatch<InwardInput>({ name: 'items' }) as InwardInput['items'] | undefined) ?? [];
  const status = useWatch<InwardInput>({ name: 'paymentStatus' });
  const { subTotal, taxTotal, grandTotal } = inwardTotals(items);

  return (
    <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 flex flex-col sm:flex-row justify-between items-start gap-3">
      <div className="w-full sm:max-w-xs">
        <RadioGroupField
          name="paymentStatus"
          label="Payment status"
          required
          variant="segmented"
          options={STATUS_OPTIONS}
        />
        {status === 'PARTIAL' && (
          <AmountField
            name="amountPaid"
            label="Amount paid now"
            required
            hint={`Bill total ${formatInr(grandTotal)}`}
          />
        )}
      </div>

      <dl className="text-right text-xs text-zinc-500 space-y-0.5 sm:min-w-48">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd className="font-mono tabular-nums">{formatInr(subTotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>GST tax</dt>
          <dd className="font-mono tabular-nums">{formatInr(taxTotal)}</dd>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-zinc-200 text-base font-black text-zinc-950">
          <dt>Total</dt>
          <dd className="font-mono tabular-nums">{formatInr(grandTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
