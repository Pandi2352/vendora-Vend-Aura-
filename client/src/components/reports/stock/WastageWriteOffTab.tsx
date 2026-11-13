import { useState, useEffect, useCallback } from 'react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Badge, Button, type BadgeTone } from '@/components/ui';
import {
  ArrowClockwise,
  Plus,
  Trash,
  WarningOctagon,
} from '@phosphor-icons/react';
import type { StockWastageResponse, WastageReason } from '@/types/stockControl.types';
import { LogWastageModal } from './LogWastageModal';

const REASON_BADGES: Record<WastageReason, { label: string; tone: BadgeTone }> = {
  EXPIRED: { label: 'Expired', tone: 'danger' },
  DAMAGED_IN_TRANSIT: { label: 'Damaged in Transit', tone: 'warning' },
  HANDLING_SPOILAGE: { label: 'Handling Spoilage', tone: 'warning' },
  THEFT_SHRINKAGE: { label: 'Theft / Shrinkage', tone: 'danger' },
  CUSTOMER_RETURN_DEFECTIVE: { label: 'Defective Return', tone: 'neutral' },
  OTHER: { label: 'Other', tone: 'neutral' },
};

export function WastageWriteOffTab() {
  const [wastageData, setWastageData] = useState<StockWastageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWastage = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/inventory/wastage');
      const data = unwrap<StockWastageResponse>(res);
      setWastageData(data ?? { summary: { totalLoss: 0, totalQty: 0, count: 0 }, items: [] });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch stock wastage records'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWastage();
  }, [fetchWastage]);

  const summary = wastageData?.summary || { totalLoss: 0, totalQty: 0, count: 0 };
  const items = wastageData?.items || [];

  return (
    <div className="space-y-4">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider">Total Loss Value</span>
            <Trash weight="bold" className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-black font-mono text-red-700">₹{summary.totalLoss.toLocaleString('en-IN')}</div>
          <div className="text-[0.625rem] text-red-600/80 font-mono mt-0.5">Written-off Capital</div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider">Total Quantity Lost</span>
            <WarningOctagon weight="bold" className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">{summary.totalQty} units</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">Damaged, Spoiled or Expired</div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider">Loss Incidents</span>
            <span className="text-[0.625rem] font-bold text-zinc-400">Total</span>
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">{summary.count} Records</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">Audited Write-Offs</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-md border border-zinc-200 flex items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-xs text-zinc-950">Wastage & Damage Write-Off Ledger</h4>
          <p className="text-[0.6875rem] text-zinc-500">Inventory decrements due to expiry, pilferage, or handling spoilage</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchWastage}
            disabled={isLoading}
            icon={<ArrowClockwise className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus weight="bold" className="w-3.5 h-3.5" />}
          >
            Record Wastage
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
              <tr>
                <th className="p-2.5 text-left font-semibold">Date</th>
                <th className="p-2.5 text-left font-semibold">Product Name</th>
                <th className="p-2.5 text-left font-semibold">Barcode</th>
                <th className="p-2.5 text-left font-semibold">Loss Reason</th>
                <th className="p-2.5 text-right font-semibold">Qty</th>
                <th className="p-2.5 text-right font-semibold">Unit Cost</th>
                <th className="p-2.5 text-right font-semibold">Total Loss</th>
                <th className="p-2.5 text-left font-semibold">Reported By</th>
                <th className="p-2.5 text-left font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-zinc-400">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                    Loading wastage write-offs…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-zinc-400">
                    No wastage or damage write-offs logged yet.
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const b = REASON_BADGES[it.reason] || { label: it.reason, tone: 'neutral' };
                  const date = it.createdAt ? new Date(it.createdAt) : null;
                  return (
                    <tr key={it.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-2.5 font-mono text-[0.6875rem] text-zinc-600 whitespace-nowrap">
                        {date ? date.toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="p-2.5 font-bold text-zinc-950">{it.productName}</td>
                      <td className="p-2.5 font-mono text-zinc-500 text-[0.6875rem]">{it.barcode}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <Badge tone={b.tone}>{b.label}</Badge>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-red-600">
                        -{it.quantity}
                      </td>
                      <td className="p-2.5 text-right font-mono text-zinc-600">₹{it.unitCost}</td>
                      <td className="p-2.5 text-right font-mono font-black text-red-700">₹{it.totalLoss}</td>
                      <td className="p-2.5 text-zinc-700">{it.reportedBy}</td>
                      <td className="p-2.5 text-zinc-500 max-w-xs truncate text-[0.6875rem]">{it.remarks || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LogWastageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchWastage}
      />
    </div>
  );
}
