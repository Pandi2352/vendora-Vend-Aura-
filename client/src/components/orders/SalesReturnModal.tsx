import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Alert, Button, Dialog } from '@/components/ui';
import type { InvoiceReturnLookup, OrderReturnRecord } from '@/types/shift-return.types';
import { formatDate, formatInr } from '@/utils';
import { InvoiceLookupForm } from './returns/InvoiceLookupForm';
import { ReturnForm } from './returns/ReturnForm';
import { ReturnSuccessCard } from './returns/ReturnSuccessCard';

interface SalesReturnModalProps {
  onClose: () => void;
  onReturnSuccess?: () => void;
}

/** Mounted only while open, so every opening starts with a clean form. */
export function SalesReturnModal({ onClose, onReturnSuccess }: SalesReturnModalProps) {
  const toast = useToast();
  const [lookup, setLookup] = useState<InvoiceReturnLookup | null>(null);
  // Bumped on every lookup so the return form remounts with fresh defaults.
  const [lookupId, setLookupId] = useState(0);
  const [completedReturn, setCompletedReturn] = useState<OrderReturnRecord | null>(null);

  const order = lookup?.order ?? null;
  const nothingReturnable = !!lookup && lookup.returnableItems.every((it) => it.returnableQty <= 0);

  const handleFound = (data: InvoiceReturnLookup) => {
    setLookup(data);
    setLookupId((n) => n + 1);
  };

  const handleProcessed = (record: OrderReturnRecord) => {
    setCompletedReturn(record);
    toast.success('Return processed', `${record.returnNumber} · refund ${formatInr(record.totalRefundAmount)}`);
    onReturnSuccess?.();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title="Sales return & exchange"
      description="Restore stock and refund the customer"
      footer={
        completedReturn ? (
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        ) : undefined
      }
    >
      {completedReturn ? (
        <ReturnSuccessCard returnRecord={completedReturn} originalInvoiceNumber={order?.invoiceNumber} />
      ) : (
        <div className="space-y-4">
          <InvoiceLookupForm onFound={handleFound} onSearchStart={() => setLookup(null)} />

          {order && (
            <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 flex flex-wrap justify-between items-center text-xs gap-2">
              <div>
                <span className="font-bold text-zinc-900 font-mono">{order.invoiceNumber}</span>
                <span className="text-zinc-500 ml-2">({formatDate(order.createdAt)})</span>
              </div>
              <div>
                <span className="text-zinc-500">Customer: </span>
                <span className="font-semibold text-zinc-900">{order.customerName || 'Walk-in'}</span>
              </div>
              <div>
                <span className="text-zinc-500">Paid: </span>
                <span className="font-mono font-bold text-zinc-900">{formatInr(order.grandTotal)}</span>
                <span className="text-zinc-400 text-[10px] ml-1">({order.paymentMode})</span>
              </div>
            </div>
          )}

          {nothingReturnable && <Alert tone="warning">All items on this bill have already been returned.</Alert>}

          {lookup && !nothingReturnable && (
            <ReturnForm key={lookupId} lookup={lookup} onCancel={onClose} onProcessed={handleProcessed} />
          )}
        </div>
      )}
    </Dialog>
  );
}
