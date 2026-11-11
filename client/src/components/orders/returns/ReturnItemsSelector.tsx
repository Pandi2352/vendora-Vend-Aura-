import type { OrderItemRecord } from '../../../types/pos.types';

export type ReturnReason = 'CUSTOMER_REQUEST' | 'DEFECTIVE' | 'EXCHANGE' | 'WRONG_ITEM';

export interface ReturnItemState {
  qty: number;
  reason: ReturnReason;
}

interface ReturnItemsSelectorProps {
  order: OrderItemRecord;
  returnItems: Record<string, ReturnItemState>;
  onUpdateQty: (productId: string, maxQty: number, qty: number) => void;
  onUpdateReason: (productId: string, reason: ReturnReason) => void;
}

export function ReturnItemsSelector({
  order,
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
            <th className="p-2 text-center font-semibold">Purchased</th>
            <th className="p-2 text-center font-semibold">Return Qty</th>
            <th className="p-2 text-left font-semibold">Reason</th>
            <th className="p-2 text-right font-semibold">Refund (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {order.items?.map((it) => {
            const state = returnItems[it.productId] || { qty: 0, reason: 'CUSTOMER_REQUEST' };
            const lineRefund = it.unitPrice * state.qty;
            return (
              <tr key={it.productId} className={state.qty > 0 ? 'bg-red-50/40' : ''}>
                <td className="p-2">
                  <div className="font-semibold text-zinc-900">{it.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">₹{it.unitPrice} each</div>
                </td>
                <td className="p-2 text-center font-mono">{it.quantity}</td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    min={0}
                    max={it.quantity}
                    value={state.qty}
                    onChange={(e) => onUpdateQty(it.productId, it.quantity, parseInt(e.target.value) || 0)}
                    className="w-14 px-1.5 py-1 text-center font-mono font-bold text-xs rounded border border-zinc-300 focus:border-red-600"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={state.reason}
                    onChange={(e) => onUpdateReason(it.productId, e.target.value as ReturnReason)}
                    className="px-2 py-1 text-[11px] rounded border border-zinc-300 bg-white"
                  >
                    <option value="CUSTOMER_REQUEST">Customer Request</option>
                    <option value="DEFECTIVE">Defective / Damaged</option>
                    <option value="EXCHANGE">Exchange</option>
                    <option value="WRONG_ITEM">Wrong Item</option>
                  </select>
                </td>
                <td className="p-2 text-right font-mono font-bold text-zinc-950">
                  ₹{lineRefund}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

