import { useState, useEffect, useCallback } from 'react';
import {
  CurrencyInr,
  ArrowsClockwise,
  ArrowUUpLeft,
  ShoppingCartSimple,
  MagnifyingGlass,
  CheckCircle,
  Printer,
} from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui';
import { formatInr, formatDate } from '@/utils';
import { usePosSession } from '@/hooks/usePosSession';
import { useAuth } from '@/hooks/useAuth';
import { orderToInvoice } from '@/lib/invoice';
import type { OrderReturnRecord } from '@/types/shift-return.types';
import type { OrderItemRecord } from '@/types/pos.types';

export function PosUtilitiesTab() {
  const { user } = useAuth();
  const pos = usePosSession();
  const [recentReturns, setRecentReturns] = useState<OrderReturnRecord[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnSearch, setReturnSearch] = useState('');
  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');
  const [isSearchingInvoice, setIsSearchingInvoice] = useState(false);
  const [invoiceSearchError, setInvoiceSearchError] = useState('');

  const fetchReturns = useCallback(async (queryOverride?: string) => {
    setLoadingReturns(true);
    try {
      const q = (queryOverride !== undefined ? queryOverride : returnSearch).trim();
      const params: Record<string, string | number> = { limit: 15 };
      if (q) params.search = q;
      const res = await api.get('/orders/returns', { params });
      const data = unwrap<{ items: OrderReturnRecord[] } | OrderReturnRecord[]>(res);
      const items = Array.isArray(data) ? data : data?.items || [];
      setRecentReturns(items);
    } catch {
      // Handled silently
    } finally {
      setLoadingReturns(false);
    }
  }, [returnSearch]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleLookupAndPrint = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInvoiceNo.trim();
    if (!query) return;
    setIsSearchingInvoice(true);
    setInvoiceSearchError('');
    try {
      const res = await api.get('/orders', { params: { search: query, limit: 1 } });
      const data = unwrap<{ items: OrderItemRecord[] } | OrderItemRecord[]>(res);
      const orders = Array.isArray(data) ? data : data?.items || [];
      const match = orders.find((o) => o.invoiceNumber.toLowerCase() === query.toLowerCase()) || orders[0];
      if (match) {
        pos.checkout.showInvoice(orderToInvoice(match, user));
      } else {
        setInvoiceSearchError(`Invoice "${query}" not found.`);
      }
    } catch (err: unknown) {
      setInvoiceSearchError(getErrorMessage(err, 'Failed to look up invoice.'));
    } finally {
      setIsSearchingInvoice(false);
    }
  };

  const isShiftOpen = pos.activeShift?.status === 'OPEN';

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-zinc-50 flex-1 flex flex-col font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-zinc-200">
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">POS Terminal Utilities & Register Desk</h2>
          <p className="text-xs text-zinc-500">
            Cash drawer audit, fast returns & exchanges, parked bills management, and thermal invoice reprint.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            pos.refreshShift();
            fetchReturns();
          }}
          icon={<ArrowsClockwise className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Grid of Utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Cash Drawer Shift Status */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cash Drawer Till</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isShiftOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {isShiftOpen ? 'Active Shift' : 'Drawer Closed'}
              </span>
            </div>
            {isShiftOpen ? (
              <div className="space-y-1.5 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Shift Number:</span>
                  <span className="font-mono font-bold text-zinc-900">{pos.activeShift?.shiftNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Opening Float:</span>
                  <span className="font-mono text-zinc-800">{formatInr(pos.activeShift?.openingFloat || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cash in Till:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatInr(pos.activeShift?.expectedCash ?? pos.activeShift?.openingFloat ?? 0)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 mb-4">
                No shift is currently open on this terminal. Open the drawer to begin cashier billing.
              </p>
            )}
          </div>
          <Button
            variant={isShiftOpen ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => pos.setOpenModal('drawer')}
            icon={<CurrencyInr className="w-4 h-4" />}
          >
            {isShiftOpen ? 'Reconcile & Close Shift' : 'Open Cash Drawer'}
          </Button>
        </div>

        {/* 2. Parked & Held Bills */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Parked / Held Bills</span>
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                {pos.heldCarts.length}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Park bills when customers forget an item and resume them instantly without losing cart progress.
            </p>
            {pos.heldCarts.length > 0 ? (
              <div className="text-xs text-zinc-700 mb-3 font-semibold">
                {pos.heldCarts.length} parked cart{pos.heldCarts.length > 1 ? 's' : ''} waiting in memory.
              </div>
            ) : (
              <div className="text-xs text-zinc-400 italic mb-3">No bills currently parked.</div>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={pos.heldCarts.length === 0}
            onClick={() => pos.setOpenModal('heldCarts')}
            icon={<ShoppingCartSimple className="w-4 h-4" />}
          >
            Manage Parked Bills
          </Button>
        </div>

        {/* 3. Fast Thermal Invoice Reprint */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Invoice Lookup & Reprint</span>
              <Printer className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-xs text-zinc-500 mb-2">
              Enter any invoice number to view or reprint the thermal receipt slip.
            </p>
            <form onSubmit={handleLookupAndPrint} className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. INV-2026-00001"
                  value={searchInvoiceNo}
                  onChange={(e) => setSearchInvoiceNo(e.target.value)}
                  className="flex-1 h-8 px-2.5 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  loading={isSearchingInvoice}
                  icon={<MagnifyingGlass className="w-3.5 h-3.5" />}
                >
                  Reprint
                </Button>
              </div>
              {invoiceSearchError && (
                <p className="text-[11px] text-red-600 font-medium">{invoiceSearchError}</p>
              )}
            </form>
          </div>
          <div className="pt-2 text-[11px] text-zinc-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Supports 80mm & 58mm POS thermal printers
          </div>
        </div>
      </div>

      {/* Sales Return & Refund Desk */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
              <ArrowUUpLeft weight="bold" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Sales Returns & Customer Exchanges</h3>
              <p className="text-xs text-zinc-500">Restock returned goods, issue cash refunds, or adjust Khata balances.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search return # or invoice..."
                value={returnSearch}
                onChange={(e) => setReturnSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void fetchReturns(returnSearch);
                }}
                className="w-48 sm:w-60 h-8 px-2.5 pl-8 text-xs rounded-md border border-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
              />
              <MagnifyingGlass className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => pos.setOpenModal('returns')}
              icon={<ArrowUUpLeft weight="bold" className="w-4 h-4" />}
            >
              Process New Return
            </Button>
          </div>
        </div>

        {/* Recent returns table */}
        {loadingReturns && recentReturns.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">Loading processed returns...</div>
        ) : recentReturns.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No sales returns have been recorded yet. Click &quot;Process New Return&quot; to issue a refund.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Return #</th>
                  <th className="py-2.5 px-3">Original Invoice</th>
                  <th className="py-2.5 px-3">Items Returned</th>
                  <th className="py-2.5 px-3">Refund Amount</th>
                  <th className="py-2.5 px-3">Settlement</th>
                  <th className="py-2.5 px-3">Processed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {recentReturns.map((r) => (
                  <tr key={r.id || r.returnNumber} className="hover:bg-zinc-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{r.returnNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-600">{r.originalInvoiceNumber}</td>
                    <td className="py-2.5 px-3">{r.items?.length || 1} line items</td>
                    <td className="py-2.5 px-3 font-bold text-red-700">{formatInr(r.totalRefundAmount)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                        {r.refundMode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
