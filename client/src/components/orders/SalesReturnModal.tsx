import { useState } from 'react';
import axios from 'axios';
import { X, ArrowUDownLeft, MagnifyingGlass, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import type { OrderItemRecord } from '../../types/pos.types';

const API_BASE = 'http://localhost:5000/api/v1';

interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  cashierName: string;
  onReturnSuccess?: () => void;
}

export function SalesReturnModal({
  isOpen,
  onClose,
  tenantId,
  cashierName,
  onReturnSuccess,
}: SalesReturnModalProps) {
  const [searchInvoice, setSearchInvoice] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundOrder, setFoundOrder] = useState<OrderItemRecord | null>(null);
  const [searchError, setSearchError] = useState('');

  // Return item rows: Record<productId, { quantity: number; reason: string }>
  const [returnItems, setReturnItems] = useState<Record<string, { qty: number; reason: 'CUSTOMER_REQUEST' | 'DEFECTIVE' | 'EXCHANGE' | 'WRONG_ITEM' }>>({});
  const [refundMode, setRefundMode] = useState<'CASH' | 'UPI' | 'CREDIT_NOTE' | 'CUSTOMER_KHATA'>('CASH');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReturnNumber, setSuccessReturnNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchInvoice.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setFoundOrder(null);
    setReturnItems({});
    setSuccessReturnNumber(null);

    try {
      const res = await axios.get(`${API_BASE}/orders?tenantId=${tenantId}`);
      const orders: OrderItemRecord[] = res.data?.data || [];
      const match = orders.find(
        (o) => o.invoiceNumber.toLowerCase() === searchInvoice.trim().toLowerCase()
      );

      if (!match) {
        setSearchError(`No bill found with invoice number "${searchInvoice.trim()}".`);
      } else {
        setFoundOrder(match);
        const initItems: Record<string, { qty: number; reason: 'CUSTOMER_REQUEST' | 'DEFECTIVE' | 'EXCHANGE' | 'WRONG_ITEM' }> = {};
        match.items?.forEach((it) => {
          initItems[it.productId] = { qty: 0, reason: 'CUSTOMER_REQUEST' };
        });
        setReturnItems(initItems);
      }
    } catch {
      setSearchError('Failed to fetch invoice. Please verify backend connection.');
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

  const updateItemReason = (productId: string, reason: any) => {
    setReturnItems((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], reason },
    }));
  };

  const activeReturnList = foundOrder?.items?.filter((it) => (returnItems[it.productId]?.qty || 0) > 0) || [];
  const totalRefundAmount = activeReturnList.reduce((sum, it) => {
    const q = returnItems[it.productId]?.qty || 0;
    return sum + it.unitPrice * q;
  }, 0);

  const handleSubmitReturn = async () => {
    if (!foundOrder || totalRefundAmount <= 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        tenantId,
        originalInvoiceNumber: foundOrder.invoiceNumber,
        customerId: foundOrder.customerId,
        customerName: foundOrder.customerName,
        customerPhone: foundOrder.customerPhone,
        cashierName,
        refundMode,
        remarks,
        totalRefundAmount,
        items: activeReturnList.map((it) => ({
          productId: it.productId,
          name: it.name,
          barcode: it.barcode,
          quantityReturned: returnItems[it.productId].qty,
          unitPrice: it.unitPrice,
          taxRatePercent: it.taxRatePercent || 0,
          refundAmount: it.unitPrice * returnItems[it.productId].qty,
          reason: returnItems[it.productId].reason,
        })),
      };

      const res = await axios.post(`${API_BASE}/orders/returns`, payload);
      const retNum = res.data?.data?.returnNumber || res.data?.return?.returnNumber || 'RET-SUCCESS';
      setSuccessReturnNumber(retNum);
      if (onReturnSuccess) onReturnSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process return.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDialog = () => {
    setSearchInvoice('');
    setFoundOrder(null);
    setReturnItems({});
    setSuccessReturnNumber(null);
    setSearchError('');
    onClose();
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
          <button onClick={resetDialog} className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {successReturnNumber ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle weight="fill" className="w-14 h-14 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-base text-zinc-900">Return Processed Successfully</h4>
              <p className="text-xs text-zinc-600">
                Return Voucher Reference: <span className="font-mono font-bold text-red-600">{successReturnNumber}</span>
              </p>
              <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 inline-block text-left text-xs space-y-1">
                <div>Original Bill: <span className="font-mono font-semibold">{foundOrder?.invoiceNumber}</span></div>
                <div>Refund Amount: <span className="font-mono font-bold text-red-600">₹{totalRefundAmount}</span></div>
                <div>Refund Tender: <span className="font-semibold">{refundMode}</span></div>
              </div>
            </div>
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

                  {/* Return Items Selector */}
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
                        {foundOrder.items?.map((it) => {
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
                                  onChange={(e) => updateItemQty(it.productId, it.quantity, parseInt(e.target.value) || 0)}
                                  className="w-14 px-1.5 py-1 text-center font-mono font-bold text-xs rounded border border-zinc-300 focus:border-red-600"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={state.reason}
                                  onChange={(e) => updateItemReason(it.productId, e.target.value)}
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

                  {/* Refund Tender & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Refund Method</label>
                      <select
                        value={refundMode}
                        onChange={(e: any) => setRefundMode(e.target.value)}
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
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div>
            {totalRefundAmount > 0 && !successReturnNumber && (
              <div className="text-xs">
                <span className="text-zinc-500">Refund Amount: </span>
                <span className="font-mono font-black text-sm text-red-600">₹{totalRefundAmount}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetDialog}
              className="px-4 py-1.5 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer"
            >
              {successReturnNumber ? 'Done' : 'Cancel'}
            </button>

            {!successReturnNumber && foundOrder && (
              <button
                onClick={handleSubmitReturn}
                disabled={isSubmitting || totalRefundAmount <= 0}
                className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                {isSubmitting ? 'Processing...' : `Confirm Return (₹${totalRefundAmount})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

