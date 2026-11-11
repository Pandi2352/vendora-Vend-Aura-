import { Trash } from '@phosphor-icons/react';

export interface InwardLineItem {
  productId: string;
  name: string;
  barcode: string;
  quantityReceived: number;
  unitCostPrice: number;
  taxRatePercent: number;
}

interface InwardItemsTableProps {
  items: InwardLineItem[];
  onUpdateItem: (index: number, field: keyof InwardLineItem, val: number) => void;
  onRemoveItem: (index: number) => void;
}

export function InwardItemsTable({
  items,
  onUpdateItem,
  onRemoveItem,
}: InwardItemsTableProps) {
  return (
    <div className="border border-zinc-200 rounded-md overflow-hidden font-sans">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-zinc-100 border-b border-zinc-200 font-bold uppercase text-[10px] text-zinc-600">
          <tr>
            <th className="py-2 px-3">Product Name</th>
            <th className="py-2 px-3 w-24">Inward Qty</th>
            <th className="py-2 px-3 w-28">Cost / Unit (₹)</th>
            <th className="py-2 px-3 w-20">GST %</th>
            <th className="py-2 px-3 text-right">Line Total</th>
            <th className="py-2 px-2 text-center w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {items.map((it, idx) => (
            <tr key={it.productId} className="hover:bg-zinc-50">
              <td className="py-2 px-3 font-semibold text-zinc-950">
                <div>{it.name}</div>
                <div className="font-mono text-[10px] text-zinc-400">{it.barcode}</div>
              </td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  min="1"
                  value={it.quantityReceived}
                  onChange={(e) => onUpdateItem(idx, 'quantityReceived', Number(e.target.value))}
                  className="w-full px-2 py-1 rounded-md border border-zinc-300 font-mono text-center outline-none"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  min="0"
                  value={it.unitCostPrice}
                  onChange={(e) => onUpdateItem(idx, 'unitCostPrice', Number(e.target.value))}
                  className="w-full px-2 py-1 rounded-md border border-zinc-300 font-mono text-center outline-none"
                />
              </td>
              <td className="py-2 px-3 font-mono text-zinc-600 text-center">{it.taxRatePercent}%</td>
              <td className="py-2 px-3 font-mono font-bold text-zinc-950 text-right">
                ₹{Math.round(it.unitCostPrice * it.quantityReceived * (1 + it.taxRatePercent / 100)).toLocaleString('en-IN')}
              </td>
              <td className="py-2 px-2 text-center">
                <button
                  type="button"
                  onClick={() => onRemoveItem(idx)}
                  className="text-zinc-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-zinc-400 text-xs">
                No items added to this inward shipment yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

