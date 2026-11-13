import { Printer } from '@phosphor-icons/react';
import { Card, CardHeader, OptionTile, Toggle } from '../../components/ui';
import { usePreferences } from '../../hooks/usePreferences';
import type { ReceiptWidth } from '../../lib/preferences';

const RECEIPT_WIDTHS: { value: ReceiptWidth; label: string; subtitle: string }[] = [
  { value: '58mm', label: '58 mm', subtitle: '2-inch printer' },
  { value: '80mm', label: '80 mm', subtitle: '3-inch printer' },
];

/** Per-device till preferences used by the receipt and cash drawer. */
export function PosPreferencesCard() {
  const prefs = usePreferences();

  return (
    <Card>
      <CardHeader icon={<Printer />} title="Billing counter" description="Saved on this device." />

      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-zinc-500 mb-2">Receipt paper</p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {RECEIPT_WIDTHS.map((w) => (
          <OptionTile
            key={w.value}
            title={w.label}
            subtitle={w.subtitle}
            selected={prefs.receiptWidth === w.value}
            onSelect={() => prefs.update({ receiptWidth: w.value })}
          />
        ))}
      </div>

      <div className="space-y-5">
        <Toggle
          label="Print receipt automatically"
          description="Opens the print dialog as soon as a bill is saved."
          checked={prefs.autoPrintReceipt}
          onChange={(autoPrintReceipt) => prefs.update({ autoPrintReceipt })}
        />

        <div className="flex items-center justify-between gap-4">
          <div>
            <label htmlFor="default-float" className="block text-sm font-semibold text-zinc-900">
              Default opening float
            </label>
            <p className="text-xs text-zinc-500 mt-0.5">Pre-filled when opening the cash drawer.</p>
          </div>
          <div className="flex items-center rounded-md border border-zinc-200 bg-white focus-within:border-primary-600">
            <span className="pl-3 text-sm text-zinc-400">₹</span>
            <input
              id="default-float"
              type="number"
              min={0}
              step={100}
              value={prefs.defaultOpeningFloat}
              onChange={(e) => prefs.update({ defaultOpeningFloat: Math.max(0, Number(e.target.value) || 0) })}
              className="w-28 h-9 px-2 text-sm font-semibold text-zinc-900 bg-transparent outline-none"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
