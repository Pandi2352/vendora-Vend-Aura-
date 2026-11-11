import { CalendarBlank, Printer, Receipt } from '@phosphor-icons/react';
import type { OrderItemRecord } from '../../types/pos.types';

interface OrdersTableProps {
  orders: OrderItemRecord[];
  loading: boolean;
  onReprint: (order: OrderItemRecord) => void;
}

export function OrdersTable({ orders, loading, onReprint }: OrdersTableProps) {
  return (
    <table className="w-full text-left border-collapse text-xs font-sans">
      <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
        <tr>
          <th className="py-2.5 px-4">Invoice #</th>
          <th className="py-2.5 px-4">Date & Time</th>
          <th className="py-2.5 px-4">Customer</th>
          <th className="py-2.5 px-4">Items</th>
          <th className="py-2.5 px-4">Tender Mode</th>
          <th className="py-2.5 px-4 text-right">Grand Total</th>
          <th className="py-2.5 px-4">Cashier</th>
          <th className="py-2.5 px-4 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-200">
        {orders.map((o) => (
          <tr key={o.id ?? o._id ?? o.invoiceNumber} className="hover:bg-zinc-50 transition-colors">
            <td className="py-2.5 px-4 font-mono font-bold text-zinc-900">{o.invoiceNumber}</td>
            <td className="py-2.5 px-4 text-zinc-500 font-mono text-[11px]">
              <div className="flex items-center gap-1">
                <CalendarBlank className="w-3.5 h-3.5 text-zinc-400" />
                <span>{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                <span className="text-zinc-400 ml-1">
                  {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </td>
            <td className="py-2.5 px-4">
              {o.customerName ? (
                <div>
                  <span className="font-semibold text-zinc-900">{o.customerName}</span>
                  {o.customerPhone && (
                    <span className="block font-mono text-[10px] text-zinc-400">{o.customerPhone}</span>
                  )}
                </div>
              ) : (
                <span className="text-zinc-400 text-[11px] italic">Walk-in Customer</span>
              )}
            </td>
            <td className="py-2.5 px-4 font-mono text-zinc-600">
              {o.itemsCount} {o.itemsCount === 1 ? 'item' : 'items'}
            </td>
            <td className="py-2.5 px-4">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                  o.paymentMode === 'CASH'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : o.paymentMode === 'UPI'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : o.paymentMode === 'CARD'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                }`}
              >
                {o.paymentMode}
              </span>
            </td>
            <td className="py-2.5 px-4 font-mono font-bold text-zinc-950 text-right">
              ₹{o.grandTotal.toLocaleString('en-IN')}
            </td>
            <td className="py-2.5 px-4 text-zinc-600 text-[11px]">{o.cashierName || 'Cashier'}</td>
            <td className="py-2.5 px-4 text-center">
              <button
                onClick={() => onReprint(o)}
                className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-primary-600 hover:text-white border border-zinc-200 text-zinc-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Reprint 80mm Receipt"
              >
                <Printer weight="bold" className="w-3.5 h-3.5" />
                <span>Receipt</span>
              </button>
            </td>
          </tr>
        ))}

        {orders.length === 0 && !loading && (
          <tr>
            <td colSpan={8} className="py-12 text-center text-zinc-400 text-xs">
              <Receipt className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="font-semibold text-zinc-600">No invoices match your filter.</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Bills completed in the POS register will appear here automatically.</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

