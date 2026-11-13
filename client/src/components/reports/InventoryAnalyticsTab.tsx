import { Warehouse, Warning, WarningOctagon, Archive } from '@phosphor-icons/react';
import type { InventoryValuationData } from '../../types/reports.types';

interface InventoryAnalyticsTabProps {
  data: InventoryValuationData | null;
  isLoading: boolean;
}

export function InventoryAnalyticsTab({ data, isLoading }: InventoryAnalyticsTabProps) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-zinc-400 text-xs">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Valuating inventory & detecting slow-moving stock...
      </div>
    );
  }

  if (!data) {
    return <div className="py-16 text-center text-zinc-400 text-xs">No inventory records available.</div>;
  }

  const s = data.summary;

  return (
    <div className="space-y-4">
      {/* 1. Valuation Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold">Total Stock Units</span>
            <Warehouse weight="bold" className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-base font-black font-mono text-zinc-950">{s.totalStockUnits.toLocaleString('en-IN')} units</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">{s.totalProducts} unique SKUs</div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold">Valuation at Cost</span>
            <span className="text-[0.625rem] font-bold text-zinc-500">Purchased</span>
          </div>
          <div className="text-base font-black font-mono text-zinc-950">₹{s.valuationAtCost.toLocaleString('en-IN')}</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">Capital Locked in Stock</div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold">Valuation at Retail</span>
            <span className="text-[0.625rem] font-bold text-red-600">Selling</span>
          </div>
          <div className="text-base font-black font-mono text-zinc-950">₹{s.valuationAtRetail.toLocaleString('en-IN')}</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">Expected Gross Value</div>
        </div>

        <div className="p-3 bg-ink border border-zinc-900 rounded-md text-white">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[0.6875rem] font-bold">Potential Gross Profit</span>
            <span className="text-[0.625rem] font-bold text-emerald-400">Warehouse</span>
          </div>
          <div className="text-base font-black font-mono text-emerald-400">₹{s.potentialGrossProfit.toLocaleString('en-IN')}</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">Upon 100% Stock Turn</div>
        </div>
      </div>

      {/* 2. Low Stock & Reorder Warnings Table */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Warning weight="bold" className="w-4 h-4 text-amber-500" />
            <h4 className="font-bold text-xs text-zinc-950">Low Stock & Out-of-Stock Warnings</h4>
          </div>
          <div className="flex gap-2 text-[0.625rem] font-mono">
            <span className="text-red-600 font-bold">{s.outOfStockCount} Out of Stock</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{s.lowStockCount} Low Stock (≤ 10)</span>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-zinc-100/60 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
            <tr>
              <th className="p-2.5 text-left font-semibold">Product Name</th>
              <th className="p-2.5 text-left font-semibold">Category</th>
              <th className="p-2.5 text-left font-semibold">Barcode</th>
              <th className="p-2.5 text-center font-semibold">Available Qty</th>
              <th className="p-2.5 text-right font-semibold">Unit Price</th>
              <th className="p-2.5 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {data.lowStockItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-zinc-400">All products have healthy inventory levels</td>
              </tr>
            ) : (
              data.lowStockItems.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="p-2.5 font-bold text-zinc-950">{item.name}</td>
                  <td className="p-2.5 text-zinc-500">{item.category}</td>
                  <td className="p-2.5 font-mono text-zinc-500">{item.barcode}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-zinc-900">{item.stock}</td>
                  <td className="p-2.5 text-right font-mono text-zinc-800">₹{item.unitPrice}</td>
                  <td className="p-2.5 text-center">
                    {item.stock <= 0 ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[0.625rem] rounded-md border border-red-200 inline-flex items-center gap-1">
                        <WarningOctagon className="w-3 h-3" /> Out of Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[0.625rem] rounded-md border border-amber-200">
                        Low Stock ({item.stock})
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Dead Stock / Slow Moving Items Table */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive weight="bold" className="w-4 h-4 text-zinc-500" />
            <h4 className="font-bold text-xs text-zinc-950">Slow Moving / Dead Stock (0 Sales in Past 30 Days)</h4>
          </div>
          <span className="text-[0.625rem] text-zinc-500 font-mono">Recommend Discounting or Clearance</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-zinc-100/60 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
            <tr>
              <th className="p-2.5 text-left font-semibold">Product Name</th>
              <th className="p-2.5 text-left font-semibold">Category</th>
              <th className="p-2.5 text-center font-semibold">Unsold Inventory</th>
              <th className="p-2.5 text-right font-semibold">Locked Capital at Cost (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {data.deadStockItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-zinc-400">No stagnant or dead inventory detected</td>
              </tr>
            ) : (
              data.deadStockItems.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="p-2.5 font-bold text-zinc-950">{item.name}</td>
                  <td className="p-2.5 text-zinc-500">{item.category}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-zinc-800">{item.stock} units</td>
                  <td className="p-2.5 text-right font-mono font-black text-amber-700">₹{item.valuationAtCost.toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

