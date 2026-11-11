import { Package, CalendarBlank } from '@phosphor-icons/react';
import type { PurchaseItemRecord } from '../../types/pos.types';

interface InwardsTableProps {
  purchases: PurchaseItemRecord[];
  loading: boolean;
}

export function InwardsTable({ purchases, loading }: InwardsTableProps) {
  return (
    <table className="w-full text-left border-collapse text-xs">
      <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
        <tr>
          <th className="py-2.5 px-4">GRN #</th>
          <th className="py-2.5 px-4">Received Date</th>
          <th className="py-2.5 px-4">Supplier</th>
          <th className="py-2.5 px-4">Vendor Bill #</th>
          <th className="py-2.5 px-4">Items Received</th>
          <th className="py-2.5 px-4 text-right">Invoice Value</th>
          <th className="py-2.5 px-4">Payment Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-200">
        {purchases.map((p) => (
          <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
            <td className="py-3 px-4 font-mono font-bold text-zinc-950">
              {p.grnNumber}
            </td>
            <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
              <div className="flex items-center gap-1">
                <CalendarBlank className="w-3.5 h-3.5 text-zinc-400" />
                <span>{new Date(p.receivedDate).toLocaleDateString('en-IN')}</span>
              </div>
            </td>
            <td className="py-3 px-4 font-semibold text-zinc-900">
              {p.supplierName}
            </td>
            <td className="py-3 px-4 font-mono text-zinc-600">
              {p.supplierInvoiceNumber || '—'}
            </td>
            <td className="py-3 px-4 font-mono text-zinc-600">
              {p.itemsCount} {p.itemsCount === 1 ? 'item' : 'items'}
            </td>
            <td className="py-3 px-4 font-mono font-bold text-zinc-950 text-right">
              ₹{p.grandTotal.toLocaleString('en-IN')}
            </td>
            <td className="py-3 px-4">
              <span
                className={`inline-block px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                  p.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : p.paymentStatus === 'PARTIAL'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                }`}
              >
                {p.paymentStatus}
              </span>
            </td>
          </tr>
        ))}

        {purchases.length === 0 && !loading && (
          <tr>
            <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs">
              <Package className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="font-semibold text-zinc-600">No inward shipments recorded.</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Use "Inward Stock (GRN)" to log distributor deliveries.</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

