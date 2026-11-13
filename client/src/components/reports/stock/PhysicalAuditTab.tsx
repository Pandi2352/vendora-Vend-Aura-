import { useState, useEffect, useCallback, useMemo } from 'react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Badge, Button } from '@/components/ui';
import {
  ArrowClockwise,
  CheckCircle,
  ClipboardText,
  ClockCounterClockwise,
  MagnifyingGlass,
  WarningCircle,
} from '@phosphor-icons/react';
import type { AuditCountSheetItem, StockAuditRecord } from '@/types/stockControl.types';
import { AuditHistoryView } from './AuditHistoryView';

export function PhysicalAuditTab() {
  const [sheet, setSheet] = useState<AuditCountSheetItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<StockAuditRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [notes, setNotes] = useState('');

  const fetchSheet = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [sheetRes, histRes] = await Promise.all([
        api.get('/inventory/audit/sheet'),
        api.get('/inventory/audit/history'),
      ]);
      const sheetData = unwrap<AuditCountSheetItem[]>(sheetRes) || [];
      const histData = unwrap<StockAuditRecord[]>(histRes) || [];
      setSheet(sheetData);
      setHistory(histData);

      const initialCounts: Record<string, number> = {};
      sheetData.forEach((p) => {
        initialCounts[p.productId] = p.systemStock;
      });
      setCounts(initialCounts);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch audit count sheet'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  const handleCountChange = (productId: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setCounts((prev) => ({ ...prev, [productId]: num }));
  };

  const filteredSheet = useMemo(() => {
    if (!search.trim()) return sheet;
    const q = search.toLowerCase();
    return sheet.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [sheet, search]);

  const summary = useMemo(() => {
    let sysTotal = 0;
    let physTotal = 0;
    let varQty = 0;
    let varVal = 0;

    sheet.forEach((p) => {
      const phys = counts[p.productId] ?? p.systemStock;
      const v = phys - p.systemStock;
      sysTotal += p.systemStock;
      physTotal += phys;
      varQty += v;
      varVal += v * p.costPrice;
    });

    return {
      sysTotal,
      physTotal,
      varQty,
      varVal: Math.round(varVal * 100) / 100,
    };
  }, [sheet, counts]);

  const handleReconcile = async () => {
    if (sheet.length === 0) return;
    setIsReconciling(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        notes: notes.trim() || undefined,
        items: sheet.map((p) => ({
          productId: p.productId,
          physicalCount: counts[p.productId] ?? p.systemStock,
        })),
      };
      const res = await api.post('/inventory/audit/reconcile', payload);
      const data = unwrap<StockAuditRecord>(res);
      setSuccessMsg(`Physical inventory reconciled (${data?.auditNumber || 'Completed'}). Stock ledger updated.`);
      setNotes('');
      fetchSheet();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reconcile physical audit'));
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <span className="text-[0.6875rem] font-bold text-zinc-500 uppercase tracking-wider block">System Expected Stock</span>
          <span className="text-base font-black font-mono text-zinc-950 mt-0.5 block">{summary.sysTotal} units</span>
          <span className="text-[0.625rem] text-zinc-400 font-mono">{sheet.length} Products</span>
        </div>
        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <span className="text-[0.6875rem] font-bold text-zinc-500 uppercase tracking-wider block">Physical Count Total</span>
          <span className="text-base font-black font-mono text-zinc-950 mt-0.5 block">{summary.physTotal} units</span>
          <span className="text-[0.625rem] text-zinc-400 font-mono">Floor Inventory</span>
        </div>
        <div className={`p-3 border rounded-md ${summary.varQty === 0 ? 'bg-zinc-50 border-zinc-200' : summary.varQty > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <span className="text-[0.6875rem] font-bold text-zinc-600 uppercase tracking-wider block">Variance Quantity</span>
          <span className={`text-base font-black font-mono mt-0.5 block ${summary.varQty === 0 ? 'text-zinc-700' : summary.varQty > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {summary.varQty > 0 ? `+${summary.varQty}` : summary.varQty} units
          </span>
          <span className="text-[0.625rem] text-zinc-500 font-mono">{summary.varQty === 0 ? 'Zero Discrepancy' : 'Discrepancy Detected'}</span>
        </div>
        <div className={`p-3 border rounded-md ${summary.varVal === 0 ? 'bg-zinc-50 border-zinc-200' : summary.varVal > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <span className="text-[0.6875rem] font-bold text-zinc-600 uppercase tracking-wider block">Variance Net Value</span>
          <span className={`text-base font-black font-mono mt-0.5 block ${summary.varVal === 0 ? 'text-zinc-700' : summary.varVal > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {summary.varVal > 0 ? `+₹${summary.varVal}` : `-₹${Math.abs(summary.varVal)}`}
          </span>
          <span className="text-[0.625rem] text-zinc-500 font-mono">Cost Valuation</span>
        </div>
      </div>

      {/* Control Actions & Toolbar */}
      <div className="bg-white p-3 rounded-md border border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit items by name, barcode or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            icon={<ClockCounterClockwise className="w-3.5 h-3.5" />}
          >
            {showHistory ? 'Hide History' : `Past Audits (${history.length})`}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchSheet}
            disabled={isLoading}
            icon={<ArrowClockwise className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleReconcile}
            disabled={isReconciling || sheet.length === 0}
            loading={isReconciling}
            icon={<CheckCircle weight="bold" className="w-3.5 h-3.5" />}
          >
            Reconcile Stock
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

      {/* Optional Audit Notes input */}
      <div className="bg-white p-3 rounded-md border border-zinc-200">
        <label htmlFor="audit-notes-input" className="text-[0.6875rem] font-bold text-zinc-700 block mb-1">
          Audit Notes / Reconciliation Reference:
        </label>
        <input
          id="audit-notes-input"
          type="text"
          placeholder="e.g. End of Month Full Store Physical Count (Counter A & B)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Past Audits History Drawer/List */}
      {showHistory && <AuditHistoryView history={history} />}

      {/* Active Count Sheet Table */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-3 border-b border-zinc-200 bg-zinc-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardText weight="bold" className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-xs text-zinc-950">Active Catalog Count Sheet</span>
          </div>
          <span className="text-[0.6875rem] text-zinc-500 font-mono">
            Showing {filteredSheet.length} of {sheet.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
              <tr>
                <th className="p-2.5 text-left font-semibold">Product Name</th>
                <th className="p-2.5 text-left font-semibold">Barcode</th>
                <th className="p-2.5 text-left font-semibold">Category</th>
                <th className="p-2.5 text-right font-semibold">System Stock</th>
                <th className="p-2.5 text-center font-semibold w-32">Physical Count</th>
                <th className="p-2.5 text-right font-semibold">Variance Qty</th>
                <th className="p-2.5 text-right font-semibold">Unit Cost</th>
                <th className="p-2.5 text-right font-semibold">Variance Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                    Loading physical count sheet…
                  </td>
                </tr>
              ) : filteredSheet.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    No products found matching search.
                  </td>
                </tr>
              ) : (
                filteredSheet.map((p) => {
                  const phys = counts[p.productId] ?? p.systemStock;
                  const variance = phys - p.systemStock;
                  const varianceVal = Math.round(variance * p.costPrice * 100) / 100;

                  return (
                    <tr key={p.productId} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-2.5 font-bold text-zinc-950">{p.name}</td>
                      <td className="p-2.5 font-mono text-zinc-500 text-[0.6875rem]">{p.barcode}</td>
                      <td className="p-2.5 text-zinc-600">{p.category}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-zinc-700">{p.systemStock}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={counts[p.productId] ?? p.systemStock}
                          onChange={(e) => handleCountChange(p.productId, e.target.value)}
                          aria-label={`Physical count for ${p.name}`}
                          className="w-20 px-2 py-1 text-center font-mono font-bold text-xs rounded-md border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <Badge tone={variance === 0 ? 'neutral' : variance > 0 ? 'success' : 'danger'}>
                          {variance > 0 ? `+${variance}` : variance}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-right font-mono text-zinc-600">₹{p.costPrice}</td>
                      <td className={`p-2.5 text-right font-mono font-bold ${varianceVal === 0 ? 'text-zinc-400' : varianceVal > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {varianceVal > 0 ? `+₹${varianceVal}` : varianceVal < 0 ? `-₹${Math.abs(varianceVal)}` : '₹0'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
