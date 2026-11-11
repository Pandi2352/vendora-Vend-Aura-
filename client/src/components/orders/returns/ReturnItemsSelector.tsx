import type { ReturnableItem, ReturnReason } from '../../../types/shift-return.types';

export type { ReturnReason };

export interface ReturnItemState {
  qty: number;
  reason: ReturnReason;
}

interface ReturnItemsSelectorProps {
  items: ReturnableItem[];
  returnItems: Record<string, ReturnItemState>;
  onUpdateQty: (productId: string, maxQty: number, qty: number) => void;
  onUpdateReason: (productId: string, reason: ReturnReason) => void;
}

export function ReturnItemsSelector({
  items,
  returnItems,
  onUpdateQty,
  onUpdateReason,
}: ReturnItemsSelectorProps) {
  return (
    <div className="border border-zinc-200 rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 text-[11px]">
          <tr>
            <th className="p-2 text-left font-semibold">Item</th>
            <th className="p-2 text-center font-semibold">Sold</th>
            <th className="p-2 text-center font-semibold">Returned</th>
            <th className="p-2 text-center font-semibold">Return Qty</th>
            <th className="p-2 text-left font-semibold">Reason</th>
            <th className="p-2 text-right font-semibold">Refund (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {items.map((it) => {
            const state = returnItems[it.productId] || { qty: 0, reason: 'CUSTOMER_REQUEST' };
            const isFullyReturned = it.returnableQty <= 0;
            const lineRefund = it.unitRefund * state.qty;
            return (
              <tr
                key={it.productId}
                className={isFullyReturned ? 'opacity-50' : state.qty > 0 ? 'bg-red-50/40' : ''}
              >
                <td className="p-2">
                  <div className="font-semibold text-zinc-900">{it.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    ₹{it.unitRefund.toFixed(2)} each incl. {it.taxRatePercent}% GST
                  </div>
                </td>
                <td className="p-2 text-center font-mono">{it.soldQty}</td>
                <td className="p-2 text-center font-mono text-zinc-500">{it.returnedQty}</td>
                <td className="p-2 text-center">
                  {isFullyReturned ? (
                    <span className="text-[10px] font-semibold text-zinc-500">Fully returned</span>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      max={it.returnableQty}
                      value={state.qty}
                      onChange={(e) => onUpdateQty(it.productId, it.returnableQty, parseInt(e.target.value) || 0)}
                      className="w-14 px-1.5 py-1 text-center font-mono font-bold text-xs rounded-md border border-zinc-300 focus:border-primary-600"
                    />
                  )}
                </td>
                <td className="p-2">
                  <select
                    value={state.reason}
                    disabled={isFullyReturned}
                    onChange={(e) => onUpdateReason(it.productId, e.target.value as ReturnReason)}
                    className="px-2 py-1 text-[11px] rounded-md border border-zinc-300 bg-white disabled:bg-zinc-100"
                  >
                    <option value="CUSTOMER_REQUEST">Customer Request</option>
                    <option value="DEFECTIVE">Defective / Damaged</option>
                    <option value="EXCHANGE">Exchange</option>
                    <option value="WRONG_ITEM">Wrong Item</option>
                  </select>
                </td>
                <td className="p-2 text-right font-mono font-bold text-zinc-950">₹{lineRefund.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
