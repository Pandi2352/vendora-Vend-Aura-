import { Truck, HandCoins, Package } from '@phosphor-icons/react';

interface SuppliersKpiStripProps {
  totalPayablesDue: number;
  totalInwardedValue: number;
  inwardsCount: number;
  suppliersCount: number;
}

export function SuppliersKpiStrip({
  totalPayablesDue,
  totalInwardedValue,
  inwardsCount,
  suppliersCount,
}: SuppliersKpiStripProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
          <span>Outstanding Supplier Payables</span>
          <HandCoins className="w-4 h-4 text-primary-600" />
        </div>
        <div className="text-xl font-black font-mono text-red-600">₹{totalPayablesDue.toLocaleString('en-IN')}</div>
        <div className="text-[10px] text-zinc-400 mt-0.5">Pending distributor dues to be settled</div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
          <span>Total Goods Procured (GRN)</span>
          <Package className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl font-black font-mono text-zinc-950">₹{totalInwardedValue.toLocaleString('en-IN')}</div>
        <div className="text-[10px] text-zinc-400 mt-0.5">{inwardsCount} inward shipments received</div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
          <span>Active Suppliers</span>
          <Truck className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="text-xl font-black font-mono text-zinc-950">{suppliersCount}</div>
        <div className="text-[10px] text-zinc-400 mt-0.5">Wholesalers & direct brand distributors</div>
      </div>
    </div>
  );
}
