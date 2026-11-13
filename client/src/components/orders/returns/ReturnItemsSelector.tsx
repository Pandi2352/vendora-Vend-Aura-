import { useFormContext, useWatch } from 'react-hook-form';
import { WarningCircle } from '@phosphor-icons/react';
import { DropdownField, NumberField } from '@/components/forms';
import { Badge, cn } from '@/components/ui';
import type { ReturnableItem } from '@/types/shift-return.types';
import { RETURN_REASONS, RETURN_REASON_LABELS, type SalesReturnInput } from '@/validations/orders';
import { formatInr } from '@/utils';
import { lineQty } from './lineQty';

const REASON_OPTIONS = RETURN_REASONS.map((value) => ({ value, label: RETURN_REASON_LABELS[value] }));

interface ReturnItemsSelectorProps {
  /** Same order as the form's `lines` field array. */
  items: ReturnableItem[];
  /** useFieldArray ids, used as React keys. */
  fieldIds: string[];
}

/** One row per bill line: return quantity (0..returnable) and a reason when returning. */
export function ReturnItemsSelector({ items, fieldIds }: ReturnItemsSelectorProps) {
  const { control, formState } = useFormContext<SalesReturnInput>();
  const lines = useWatch({ control, name: 'lines' }) ?? [];
  const errors = formState.errors.lines as { root?: { message?: string }; message?: string } | undefined;
  const listError = errors?.root?.message ?? errors?.message;

  return (
    <div>
      <div className="border border-zinc-200 rounded-md divide-y divide-zinc-200">
        {items.map((it, i) => {
          const qty = lineQty(lines[i]?.quantity);
          const fullyReturned = it.returnableQty <= 0;
          return (
            <div
              key={fieldIds[i] ?? it.productId}
              className={cn('p-3', fullyReturned && 'opacity-60', qty > 0 && 'bg-primary-50/40')}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{it.name}</p>
                  <p className="text-[0.6875rem] text-zinc-500 font-mono">
                    {formatInr(it.unitRefund)} each incl. {it.taxRatePercent}% GST · sold {it.soldQty} · returned{' '}
                    {it.returnedQty}
                  </p>
                </div>
                {fullyReturned ? (
                  <Badge>Fully returned</Badge>
                ) : (
                  <span className="text-sm font-mono font-bold text-zinc-950 shrink-0">
                    {formatInr(it.unitRefund * qty)}
                  </span>
                )}
              </div>
              {!fullyReturned && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
                  <NumberField
                    name={`lines.${i}.quantity`}
                    label="Return qty"
                    decimals={0}
                    placeholder="0"
                    hint={`Up to ${it.returnableQty}`}
                  />
                  <DropdownField
                    name={`lines.${i}.reason`}
                    label="Reason"
                    required={qty > 0}
                    placeholder="Select reason"
                    options={REASON_OPTIONS}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {listError && (
        <p role="alert" className="flex items-center gap-1 pt-1.5 text-xs font-medium text-red-600">
          <WarningCircle aria-hidden weight="fill" className="w-3.5 h-3.5" />
          {listError}
        </p>
      )}
    </div>
  );
}
