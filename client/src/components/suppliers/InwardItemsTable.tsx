import { useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash, WarningCircle } from '@phosphor-icons/react';
import { AmountField, DropdownField, NumberField } from '@/components/forms';
import { Button } from '@/components/ui';
import { formatInr } from '@/utils';
import { EMPTY_INWARD_LINE, lineTotal, type InwardInput } from '@/validations/supplier';
import type { ProductItem } from '@/types/pos.types';

/** Default purchase cost for a product: its cost price, else 75% of the selling price. */
const defaultCost = (p: ProductItem) => p.costPrice || Math.round(p.unitPrice * 0.75);

/** Product lines of an inward shipment (GRN). Must be rendered inside the inward <Form>. */
export function InwardItemsTable({ products }: { products: ProductItem[] }) {
  const { control, watch, setValue, formState } = useFormContext<InwardInput>();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' }) ?? [];

  // Picking a product fills its usual cost and GST rate.
  useEffect(() => {
    const sub = watch((values, { name }) => {
      const match = name?.match(/^items\.(\d+)\.productId$/);
      if (!match) return;
      const index = Number(match[1]);
      const product = products.find((p) => p.id === values.items?.[index]?.productId);
      if (!product) return;
      setValue(`items.${index}.unitCostPrice`, defaultCost(product), { shouldValidate: formState.isSubmitted });
      setValue(`items.${index}.taxRatePercent`, product.taxRatePercent || 0, { shouldValidate: formState.isSubmitted });
    });
    return () => sub.unsubscribe();
  }, [watch, setValue, products, formState.isSubmitted]);

  const selectedIds = items.map((it) => it?.productId).filter(Boolean);
  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: p.name,
        description: `${p.barcode} · Stock: ${p.stock ?? 0}`,
      })),
    [products],
  );

  const itemsError = formState.errors.items?.root?.message ?? formState.errors.items?.message;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-zinc-900">Products received</p>
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus weight="bold" className="w-3.5 h-3.5" />}
          onClick={() => append(EMPTY_INWARD_LINE)}
        >
          Add line
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="py-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-md">
          No items added to this inward shipment yet.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_6rem_8rem_5.5rem_6rem_2rem] gap-x-3 items-start p-3 sm:pb-0 border border-zinc-200 rounded-md"
        >
          <DropdownField
            name={`items.${index}.productId`}
            label="Product"
            required
            searchable
            placeholder="Choose product"
            emptyMessage="No matching products"
            className="col-span-2 sm:col-span-1"
            options={productOptions.map((o) => ({
              ...o,
              disabled: o.value !== items[index]?.productId && selectedIds.includes(o.value),
            }))}
          />
          <NumberField name={`items.${index}.quantityReceived`} label="Qty" required decimals={0} />
          <AmountField name={`items.${index}.unitCostPrice`} label="Cost / unit" required />
          <NumberField name={`items.${index}.taxRatePercent`} label="GST %" required suffix="%" min={0} max={28} />
          <div className="min-h-10 sm:text-right">
            <p className="text-xs font-semibold text-zinc-700 mb-1.5">Line total</p>
            <p className="h-10 flex items-center sm:justify-end font-mono font-bold text-zinc-950 tabular-nums">
              {formatInr(lineTotal(items[index] ?? {}))}
            </p>
          </div>
          <div className="flex items-end justify-end sm:pt-7">
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove line ${index + 1}`}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {itemsError && (
        <p role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
          <WarningCircle aria-hidden weight="fill" className="w-3.5 h-3.5" />
          {itemsError}
        </p>
      )}
    </div>
  );
}
