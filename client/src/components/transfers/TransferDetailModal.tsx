import { Button, Badge } from '@/components/ui';
import { X, Printer, ArrowsLeftRight } from '@phosphor-icons/react';
import type { StockTransferRecord, TransferStatus } from '@/types/stockTransfer.types';

interface TransferDetailModalProps {
  transfer: StockTransferRecord | null;
  onClose: () => void;
}

const STATUS_BADGES: Record<TransferStatus, { label: string; tone: 'warning' | 'info' | 'success' | 'danger' }> = {
  PENDING: { label: 'Pending Dispatch', tone: 'warning' },
  DISPATCHED: { label: 'In Transit (Dispatched)', tone: 'info' },
  RECEIVED: { label: 'Completed (Received)', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
};

export function TransferDetailModal({ transfer, onClose }: TransferDetailModalProps) {
  if (!transfer) return null;

  const badge = STATUS_BADGES[transfer.status] || { label: transfer.status, tone: 'warning' };
  const date = transfer.createdAt ? new Date(transfer.createdAt) : new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ArrowsLeftRight weight="bold" className="w-5 h-5 text-primary-600" />
            <div>
              <h3 className="font-bold text-sm text-zinc-950">Stock Transfer Note (STN)</h3>
              <p className="text-[0.6875rem] text-zinc-500 font-mono">{transfer.transferNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              icon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Challan
            </Button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Transfer Challan */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
            <div>
              <span className="text-[0.625rem] font-bold text-primary-700 uppercase tracking-widest block">Vendora Retail ERP</span>
              <h2 className="text-lg font-black text-zinc-950 mt-0.5">INTER-BRANCH STOCK TRANSFER NOTE</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">Challan Ref: {transfer.transferNumber}</p>
            </div>
            <div className="text-right">
              <Badge tone={badge.tone}>{badge.label}</Badge>
              <div className="text-xs text-zinc-600 font-mono mt-1">Date: {date.toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          {/* Transfer Origin & Destination Boxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200">
              <span className="text-[0.625rem] font-bold text-zinc-400 uppercase tracking-wider block">Dispatched From (Source)</span>
              <div className="font-bold text-sm text-zinc-950 mt-0.5">{transfer.sourceOutletName}</div>
              <div className="text-xs text-zinc-500 mt-1">Staff: {transfer.dispatchedBy || 'Store Manager'}</div>
              {transfer.dispatchedAt && (
                <div className="text-[0.6875rem] text-zinc-400 font-mono">
                  Time: {new Date(transfer.dispatchedAt).toLocaleTimeString('en-IN')}
                </div>
              )}
            </div>

            <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200">
              <span className="text-[0.625rem] font-bold text-zinc-400 uppercase tracking-wider block">Deliver To (Destination)</span>
              <div className="font-bold text-sm text-zinc-950 mt-0.5">{transfer.destinationOutletName}</div>
              <div className="text-xs text-zinc-500 mt-1">Receiver: {transfer.receivedBy || 'Awaiting Receipt'}</div>
              {transfer.receivedAt && (
                <div className="text-[0.6875rem] text-zinc-400 font-mono">
                  Time: {new Date(transfer.receivedAt).toLocaleTimeString('en-IN')}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-zinc-200 rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
                <tr>
                  <th className="p-2.5 text-left font-semibold">#</th>
                  <th className="p-2.5 text-left font-semibold">Product Description</th>
                  <th className="p-2.5 text-left font-semibold">Barcode</th>
                  <th className="p-2.5 text-right font-semibold">Transfer Qty</th>
                  <th className="p-2.5 text-right font-semibold">Unit Cost</th>
                  <th className="p-2.5 text-right font-semibold">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {transfer.items.map((it, i) => (
                  <tr key={i}>
                    <td className="p-2.5 text-zinc-400 font-mono">{i + 1}</td>
                    <td className="p-2.5 font-bold text-zinc-900">{it.productName}</td>
                    <td className="p-2.5 font-mono text-zinc-500">{it.barcode}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-zinc-950">{it.quantity}</td>
                    <td className="p-2.5 text-right font-mono text-zinc-600">₹{it.unitCost}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-zinc-950">₹{it.totalCost}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold">
                <tr>
                  <td colSpan={3} className="p-2.5 text-right text-zinc-700">Total Transferred:</td>
                  <td className="p-2.5 text-right font-mono text-zinc-950">{transfer.totalQuantity} units</td>
                  <td className="p-2.5 text-right text-zinc-700">Valuation:</td>
                  <td className="p-2.5 text-right font-mono text-primary-700">₹{transfer.totalValue}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {transfer.notes && (
            <div className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-md border border-zinc-200">
              <span className="font-bold text-zinc-800">Transfer Remarks: </span>
              {transfer.notes}
            </div>
          )}

          {/* Acknowledgments */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-zinc-500 border-t border-dashed border-zinc-300">
            <div>
              <div className="border-b border-zinc-300 pb-8 mb-1" />
              <span>Dispatched By / Store Signature</span>
            </div>
            <div>
              <div className="border-b border-zinc-300 pb-8 mb-1" />
              <span>Acknowledged & Received By</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end print:hidden">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

