import { useState, useEffect, useCallback } from 'react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Badge, Button, type BadgeTone } from '@/components/ui';
import {
  ArrowClockwise,
  CheckCircle,
  FileText,
  MagnifyingGlass,
  Plus,
  Truck,
  WarningCircle,
} from '@phosphor-icons/react';
import type {
  StockTransferRecord,
  StockTransferResponse,
  TransferStatus,
} from '@/types/stockTransfer.types';
import { CreateTransferModal } from './CreateTransferModal';
import { TransferDetailModal } from './TransferDetailModal';

const STATUS_BADGES: Record<TransferStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Pending Dispatch', tone: 'warning' },
  DISPATCHED: { label: 'In Transit', tone: 'info' },
  RECEIVED: { label: 'Received', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
};

export function StockTransfersTab() {
  const [transfers, setTransfers] = useState<StockTransferRecord[]>([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, dispatched: 0, received: 0, cancelled: 0 });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingTransfer, setViewingTransfer] = useState<StockTransferRecord | null>(null);

  const fetchTransfers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 25 };
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/inventory/transfers', { params });
      const data = unwrap<StockTransferResponse>(res);
      setTransfers(data?.data || []);
      setTotalPages(data?.totalPages || 1);
      if (data?.summary) setSummary(data.summary);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch stock transfers'));
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleDispatch = async (t: StockTransferRecord) => {
    setActionLoadingId(t.id);
    setError('');
    setSuccessMsg('');
    try {
      await api.post(`/inventory/transfers/${t.id}/dispatch`);
      setSuccessMsg(`Transfer ${t.transferNumber} dispatched and stock deducted from ${t.sourceOutletName}`);
      fetchTransfers();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to dispatch stock transfer'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReceive = async (t: StockTransferRecord) => {
    setActionLoadingId(t.id);
    setError('');
    setSuccessMsg('');
    try {
      await api.post(`/inventory/transfers/${t.id}/receive`);
      setSuccessMsg(`Transfer ${t.transferNumber} received and stock updated at ${t.destinationOutletName}`);
      fetchTransfers();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to receive stock transfer'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (t: StockTransferRecord) => {
    if (!window.confirm(`Are you sure you want to cancel transfer ${t.transferNumber}?`)) return;
    setActionLoadingId(t.id);
    setError('');
    try {
      await api.post(`/inventory/transfers/${t.id}/cancel`);
      fetchTransfers();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to cancel stock transfer'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.transferNumber.toLowerCase().includes(q) ||
      t.sourceOutletName.toLowerCase().includes(q) ||
      t.destinationOutletName.toLowerCase().includes(q) ||
      t.items.some((it) => it.productName.toLowerCase().includes(q) || it.barcode.includes(search))
    );
  });

  return (
    <div className="space-y-4">
      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <span className="text-[0.6875rem] font-bold text-zinc-500 uppercase tracking-wider block">Total STN Requests</span>
          <span className="text-xl font-black font-mono text-zinc-950 mt-0.5 block">{summary.total}</span>
          <span className="text-[0.625rem] text-zinc-400 font-mono">All Time Movements</span>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <span className="text-[0.6875rem] font-bold text-amber-700 uppercase tracking-wider block">Pending Dispatch</span>
          <span className="text-xl font-black font-mono text-amber-800 mt-0.5 block">{summary.pending}</span>
          <span className="text-[0.625rem] text-amber-600 font-mono">Awaiting Source Exit</span>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-[0.6875rem] font-bold text-blue-700 uppercase tracking-wider block">In Transit</span>
          <span className="text-xl font-black font-mono text-blue-800 mt-0.5 block">{summary.dispatched}</span>
          <span className="text-[0.625rem] text-blue-600 font-mono">Dispatched on Road</span>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
          <span className="text-[0.6875rem] font-bold text-emerald-700 uppercase tracking-wider block">Completed</span>
          <span className="text-xl font-black font-mono text-emerald-800 mt-0.5 block">{summary.received}</span>
          <span className="text-[0.625rem] text-emerald-600 font-mono">Acknowledged & Stocked</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-md border border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by STN number, branch, or product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter transfers by status"
            className="px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-zinc-50 font-medium text-zinc-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Dispatch</option>
            <option value="DISPATCHED">In Transit (Dispatched)</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchTransfers}
            disabled={isLoading}
            icon={<ArrowClockwise className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus weight="bold" className="w-3.5 h-3.5" />}
          >
            New Transfer Note
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <WarningCircle weight="bold" className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Transfers Data Table */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
              <tr>
                <th className="p-2.5 text-left font-semibold">STN #</th>
                <th className="p-2.5 text-left font-semibold">Date</th>
                <th className="p-2.5 text-left font-semibold">Source Outlet</th>
                <th className="p-2.5 text-left font-semibold">Destination</th>
                <th className="p-2.5 text-right font-semibold">Quantity</th>
                <th className="p-2.5 text-right font-semibold">Valuation</th>
                <th className="p-2.5 text-center font-semibold">Status</th>
                <th className="p-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                    Loading stock transfers…
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    No stock transfers found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((t) => {
                  const badge = STATUS_BADGES[t.status] || { label: t.status, tone: 'warning' };
                  const isActionBusy = actionLoadingId === t.id;

                  return (
                    <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-2.5 font-mono font-bold text-primary-700 whitespace-nowrap">
                        {t.transferNumber}
                      </td>
                      <td className="p-2.5 text-zinc-600 font-mono text-[0.6875rem] whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-2.5 font-bold text-zinc-900">{t.sourceOutletName}</td>
                      <td className="p-2.5 font-bold text-zinc-900">{t.destinationOutletName}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-zinc-950">
                        {t.totalQuantity} units
                        <span className="block text-[0.625rem] text-zinc-400 font-normal">
                          {t.items.length} SKUs
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-zinc-900">
                        ₹{t.totalValue}
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setViewingTransfer(t)}
                            icon={<FileText className="w-3.5 h-3.5" />}
                          >
                            Challan
                          </Button>

                          {t.status === 'PENDING' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={isActionBusy}
                                loading={isActionBusy}
                                onClick={() => handleDispatch(t)}
                                icon={<Truck className="w-3.5 h-3.5" />}
                              >
                                Dispatch
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                disabled={isActionBusy}
                                onClick={() => handleCancel(t)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}

                          {t.status === 'DISPATCHED' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={isActionBusy}
                                loading={isActionBusy}
                                onClick={() => handleReceive(t)}
                                icon={<CheckCircle weight="bold" className="w-3.5 h-3.5" />}
                              >
                                Receive
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                disabled={isActionBusy}
                                onClick={() => handleCancel(t)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-2.5 border-t border-zinc-200 bg-zinc-50/70 flex items-center justify-between text-xs text-zinc-600">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTransferModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTransfers}
      />

      <TransferDetailModal
        transfer={viewingTransfer}
        onClose={() => setViewingTransfer(null)}
      />
    </div>
  );
}
