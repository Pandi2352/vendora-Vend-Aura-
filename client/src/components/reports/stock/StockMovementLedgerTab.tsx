import { useState, useEffect, useCallback } from 'react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Badge, Button, type BadgeTone } from '@/components/ui';
import {
  ArrowClockwise,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowsDownUp,
  FileText,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import type { MovementType, StockLedgerItem, StockLedgerResponse } from '@/types/stockControl.types';

const MOVEMENT_BADGES: Record<string, { label: string; tone: BadgeTone }> = {
  OPENING_BALANCE: { label: 'Opening Stock', tone: 'info' },
  INWARD_PURCHASE: { label: 'Inward (GRN)', tone: 'success' },
  OUTWARD_SALE: { label: 'POS Sale', tone: 'primary' },
  RETURN: { label: 'Sales Return', tone: 'warning' },
  ADJUSTMENT: { label: 'Adjustment', tone: 'neutral' },
  PHYSICAL_AUDIT: { label: 'Physical Audit', tone: 'warning' },
  WASTAGE_WRITE_OFF: { label: 'Wastage Write-Off', tone: 'danger' },
};

export function StockMovementLedgerTab() {
  const [ledger, setLedger] = useState<StockLedgerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [movementType, setMovementType] = useState<MovementType>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLedger = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 25 };
      if (movementType !== 'ALL') params.movementType = movementType;

      const res = await api.get('/inventory/ledger', { params });
      const unwrapped = unwrap<StockLedgerResponse>(res);
      setLedger(unwrapped?.data || []);
      setTotal(unwrapped?.total || 0);
      setTotalPages(unwrapped?.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch stock movement ledger'));
    } finally {
      setIsLoading(false);
    }
  }, [page, movementType]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const filteredItems = ledger.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const prodName = typeof item.productId === 'object' ? item.productId?.name || '' : '';
    const barcode = typeof item.productId === 'object' ? item.productId?.barcode || '' : '';
    const ref = item.referenceId || '';
    return (
      prodName.toLowerCase().includes(q) ||
      barcode.toLowerCase().includes(q) ||
      ref.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-3 rounded-md border border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, barcode, or ref ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <select
            value={movementType}
            onChange={(e) => {
              setMovementType(e.target.value as MovementType);
              setPage(1);
            }}
            aria-label="Filter by movement type"
            className="px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-zinc-50 font-medium text-zinc-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Movements</option>
            <option value="INWARD_PURCHASE">Inward (GRN / Purchase)</option>
            <option value="OUTWARD_SALE">Outward (POS Sales)</option>
            <option value="RETURN">Sales Returns</option>
            <option value="PHYSICAL_AUDIT">Physical Audit Adjustments</option>
            <option value="WASTAGE_WRITE_OFF">Wastage / Damage Write-Offs</option>
            <option value="OPENING_BALANCE">Opening Balance</option>
            <option value="ADJUSTMENT">Manual Adjustments</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLedger}
            disabled={isLoading}
            icon={<ArrowClockwise className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Movement Ledger Table */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-3 border-b border-zinc-200 bg-zinc-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowsDownUp weight="bold" className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-xs text-zinc-950">Stock Movement Audit Ledger</span>
            <span className="text-[0.6875rem] text-zinc-500 font-mono">({total} total records)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
              <tr>
                <th className="p-2.5 text-left font-semibold">Timestamp</th>
                <th className="p-2.5 text-left font-semibold">Movement Type</th>
                <th className="p-2.5 text-left font-semibold">Product & Barcode</th>
                <th className="p-2.5 text-right font-semibold">In (+)</th>
                <th className="p-2.5 text-right font-semibold">Out (-)</th>
                <th className="p-2.5 text-right font-semibold">Stock Balance</th>
                <th className="p-2.5 text-left font-semibold">Ref / Document</th>
                <th className="p-2.5 text-left font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                    Loading stock ledger movements…
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    No stock movement records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const badge = MOVEMENT_BADGES[item.movementType] || {
                    label: item.movementType,
                    tone: 'neutral',
                  };
                  const prod = typeof item.productId === 'object' ? item.productId : null;
                  const date = item.createdAt ? new Date(item.createdAt) : null;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-2.5 whitespace-nowrap text-zinc-600 font-mono text-[0.6875rem]">
                        {date ? `${date.toLocaleDateString('en-IN')} ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : '—'}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-zinc-900">{prod?.name || 'Item'}</div>
                        <div className="text-[0.625rem] font-mono text-zinc-500">{prod?.barcode || '—'}</div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                        {item.quantityCredit > 0 ? (
                          <span className="flex items-center justify-end gap-0.5">
                            <ArrowDownLeft weight="bold" className="w-3 h-3" />
                            +{item.quantityCredit}
                          </span>
                        ) : (
                          <span className="text-zinc-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-red-600">
                        {item.quantityDebit > 0 ? (
                          <span className="flex items-center justify-end gap-0.5">
                            <ArrowUpRight weight="bold" className="w-3 h-3" />
                            -{item.quantityDebit}
                          </span>
                        ) : (
                          <span className="text-zinc-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-zinc-900">
                        {item.balanceAfter}
                      </td>
                      <td className="p-2.5 font-mono text-[0.6875rem] text-zinc-700">
                        {item.referenceId ? (
                          <span className="inline-flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                            <FileText className="w-3 h-3 text-zinc-400" />
                            {item.referenceId}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-2.5 text-zinc-500 max-w-xs truncate text-[0.6875rem]">
                        {item.remarks || '—'}
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
    </div>
  );
}
