import { useWatch } from 'react-hook-form';
import { AmountField, Form, FormActions, FormGrid, TextField, useAppForm } from '@/components/forms';
import { cn } from '@/components/ui';
import { closeShiftSchema, openShiftSchema, type CloseShiftValues, type OpenShiftValues } from '@/validations/orders';
import { formatInr } from '@/utils';

interface OpenShiftFormProps {
  defaultOpeningFloat: number;
  onSubmit: (values: OpenShiftValues) => Promise<unknown>;
}

/** Opening float + notes. Errors thrown by onSubmit are shown by <Form>. */
export function OpenShiftForm({ defaultOpeningFloat, onSubmit }: OpenShiftFormProps) {
  const form = useAppForm(openShiftSchema, { defaultValues: { openingFloat: defaultOpeningFloat, notes: '' } });
  const float = useWatch({ control: form.control, name: 'openingFloat' });

  return (
    <Form form={form} onSubmit={onSubmit}>
      <AmountField name="openingFloat" label="Opening cash float" required hint="Physical cash in the till right now" />
      <TextField name="notes" label="Opening notes" placeholder="e.g. Morning shift, clean till" />
      <FormActions
        fullWidth
        submitLabel={`Open shift with ${formatInr(typeof float === 'number' ? float : 0)} float`}
        submittingLabel="Opening shift…"
      />
    </Form>
  );
}

interface CloseShiftFormProps {
  expectedCash: number;
  onSubmit: (values: CloseShiftValues) => Promise<unknown>;
}

/** Counted cash + notes, with a live variance against the expected drawer cash. */
export function CloseShiftForm({ expectedCash, onSubmit }: CloseShiftFormProps) {
  const form = useAppForm(closeShiftSchema, { defaultValues: { actualCashCounted: undefined, notes: '' } });
  const counted = useWatch({ control: form.control, name: 'actualCashCounted' });

  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormGrid>
        <AmountField name="actualCashCounted" label="Cash counted" required placeholder={String(expectedCash)} />
        <VarianceBox counted={typeof counted === 'number' ? counted : undefined} expected={expectedCash} />
      </FormGrid>
      <TextField name="notes" label="Closing notes" placeholder="Reconciliation notes" />
      <FormActions fullWidth submitLabel="Reconcile & close shift" submittingLabel="Closing shift…" />
    </Form>
  );
}

function VarianceBox({ counted, expected }: { counted: number | undefined; expected: number }) {
  const variance = counted === undefined ? 0 : Math.round((counted - expected) * 100) / 100;
  const text =
    counted === undefined
      ? 'Enter counted cash'
      : variance === 0
        ? `${formatInr(0)} (balanced)`
        : variance > 0
          ? `+${formatInr(variance)} (overage)`
          : `-${formatInr(Math.abs(variance))} (shortage)`;

  return (
    <div className="min-w-0">
      <p className="block text-xs font-semibold text-zinc-700 mb-1.5">Closing variance</p>
      <div
        aria-live="polite"
        className={cn(
          'h-10 flex items-center px-3 rounded-md border text-sm font-mono font-bold',
          counted === undefined
            ? 'bg-zinc-50 text-zinc-400 border-zinc-200'
            : variance >= 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-red-50 text-red-700 border-red-300',
        )}
      >
        {text}
      </div>
    </div>
  );
}
