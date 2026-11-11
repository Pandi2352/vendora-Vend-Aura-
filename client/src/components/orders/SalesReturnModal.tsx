import { useState } from 'react';
import { X, ArrowUDownLeft, MagnifyingGlass, WarningCircle } from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '../../lib/api';
import { round2 } from '../../lib/totals';
import type {
  InvoiceReturnLookup,
  OrderReturnRecord,
  RefundMode,
  ReturnReason,
} from '../../types/shift-return.types';
import { ReturnItemsSelector } from './returns/ReturnItemsSelector';
import type { ReturnItemState } from './returns/ReturnItemsSelector';
import { ReturnSuccessCard } from './returns/ReturnSuccessCard';

interface SalesReturnModalProps {
  onClose: () => void;
  onReturnSuccess?: () => void;
}

/** Mounted only while open, so every opening starts with a clean form. */
export function SalesReturnModal({ onClose, onReturnSuccess }: SalesReturnModalProps) {
  const [searchInvoice, setSearchInvoice] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookup, setLookup] = useState<InvoiceReturnLookup | null>(null);
  const [searchError, setSearchError] = useState('');

  const [returnItems, setReturnItems] = useState<Record<string, ReturnItemState>>({});
  const [refundMode, setRefundMode] = useState<RefundMode>('CASH');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [completedReturn, setCompletedReturn] = useState<OrderReturnRecord | null>(null);

  const foundOrder = lookup?.order ?? null;
  const returnableItems = lookup?.returnableItems ?? [];

  const handleSearch = async () => {
    const invoiceNumber = searchInvoice.trim().toUpperCase();
    if (!invoiceNumber) return;
    setIsSearching(true);
    setSearchError('');
    setSubmitError('');
    setLookup(null);
    setReturnItems({});
    setCompletedReturn(null);

    try {
      const res = await api.get(`/orders/returns/invoice/${encodeURIComponent(invoiceNumber)}`);
      const data = unwrap<InvoiceReturnLookup>(res);
      setLookup(data);
      const initItems: Record<string, ReturnItemState> = {};
      data.returnableItems.forEach((it) => {
        initItems[it.productId] = { qty: 0, reason: 'CUSTOMER_REQUEST' };
      });
      setReturnItems(initItems);
      setRefundMode('CASH');
      if (data.returnableItems.every((it) => it.returnableQty <= 0)) {
        setSearchError('All items on this bill have already been returned.');
      }
    } catch (err) {
      setSearchError(getErrorMessage(err, `No bill found with invoice number "${invoiceNumber}".`));
    } finally {
      setIsSearching(false);
    }
  };

  const updateItemQty = (productId: string, maxQty: number, qty: number) => {
    const clamped = Math.max(0, Math.min(maxQty, qty));
    setReturnItems((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], qty: clamped },
    }));
  };

  const updateItemReason = (productId: string, reason: ReturnReason) => {
    setReturnItems((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], reason },
    }));
  };

  const activeReturnList = returnableItems.filter((it) => (returnItems[it.productId]?.qty || 0) > 0);
  const totalRefundAmount = round2(
    activeReturnList.reduce((sum, it) => sum + it.unitRefund * (returnItems[it.productId]?.qty || 0), 0)
  );

  const handleSubmitReturn = async () => {
    if (!foundOrder || activeReturnList.length === 0) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await api.post('/orders/returns', {
        originalInvoiceNumber: foundOrder.invoiceNumber,
        items: activeReturnList.map((it) => ({
          productId: it.productId,
          quantityReturned: returnItems[it.productId].qty,
          reason: returnItems[it.productId].reason,
        })),
        refundMode,
        remarks: remarks.trim() || undefined,
      });
      setCompletedReturn(unwrap<OrderReturnRecord>(res));
      onReturnSuccess?.();
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to process return.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-md max-w-2xl w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUDownLeft weight="bold" className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-bold text-sm text-zinc-950">Sales Return & Exchange</h3>
              <p className="text-[11px] text-zinc-500">Restore inventory stock and issue customer refund</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {completedReturn ? (
            <ReturnSuccessCard returnRecord={completedReturn} originalInvoiceNumber={foundOrder?.invoiceNumber} />
          ) : (
            <>
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlass className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Enter Invoice Number (e.g. INV-2026-00001)..."
                    value={searchInvoice}
                    onChange={(e) => setSearchInvoice(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-zinc-300 focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono uppercase"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchInvoice.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-md cursor-pointer transition-colors"
                >
                  {isSearching ? 'Finding...' : 'Find Bill'}
                </button>
              </div>

              {searchError && (
                <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Found Order Details */}
              {foundOrder && (
                <div className="space-y-4">
                  <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 flex flex-wrap justify-between items-center text-xs gap-2">
                    <div>
                      <span className="font-bold text-zinc-900 font-mono">{foundOrder.invoiceNumber}</span>
                      <span className="text-zinc-500 ml-2">({new Date(foundOrder.createdAt).toLocaleDateString('en-IN')})</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Customer: </span>
                      <span className="font-semibold text-zinc-900">{foundOrder.customerName || 'Walk-in'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Paid: </span>
                      <span className="font-mono font-bold text-zinc-900">₹{foundOrder.grandTotal}</span>
                      <span className="text-zinc-400 text-[10px] ml-1">({foundOrder.paymentMode})</span>
                    </div>
                  </div>

                  <ReturnItemsSelector
                    items={returnableItems}
                    returnItems={returnItems}
                    onUpdateQty={updateItemQty}
                    onUpdateReason={updateItemReason}
                  />

                  {/* Refund Tender & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Refund Method</label>
                      <select
                        value={refundMode}
                        onChange={(e) => setRefundMode(e.target.value as RefundMode)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-white font-semibold"
                      >
                        <option value="CASH">Cash Refund</option>
                        <option value="UPI">UPI / Net Banking</option>
                        <option value="CREDIT_NOTE">Credit Note Voucher</option>
                        {foundOrder.customerId && <option value="CUSTOMER_KHATA">Credit Customer Khata Balance</option>}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Return Remarks</label>
                      <input
                        type="text"
                        placeholder="Optional note / inspection remark..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 focus:border-red-600"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div>
            {totalRefundAmount > 0 && !completedReturn && (
              <div className="text-xs">
                <span className="text-zinc-500">Refund (incl. GST): </span>
                <span className="font-mono font-black text-sm text-red-600">₹{totalRefundAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer"
            >
              {completedReturn ? 'Done' : 'Cancel'}
            </button>

            {!completedReturn && foundOrder && (
              <button
                onClick={handleSubmitReturn}
                disabled={isSubmitting || activeReturnList.length === 0}
                className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                {isSubmitting ? 'Processing...' : `Confirm Return (₹${totalRefundAmount.toFixed(2)})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
