import type { StockAuditRecord } from '@/types/stockControl.types';
import { formatDate } from '@/utils';

interface AuditHistoryViewProps {
  history: StockAuditRecord[];
}

export function AuditHistoryView({ history }: AuditHistoryViewProps) {
  return (
    <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
      <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
        <span className="font-bold text-xs text-zinc-900">Historical Reconciliations Log</span>
        <span className="text-xs text-zinc-500 font-mono">{history.length} records</span>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
          <tr>
            <th className="p-2.5 text-left font-semibold">Audit #</th>
            <th className="p-2.5 text-left font-semibold">Date</th>
            <th className="p-2.5 text-left font-semibold">Audited By</th>
            <th className="p-2.5 text-right font-semibold">Variance Units</th>
            <th className="p-2.5 text-right font-semibold">Variance Value</th>
            <th className="p-2.5 text-left font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {history.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-zinc-400">
                No past audit reconciliations logged yet.
              </td>
            </tr>
          ) : (
            history.map((h) => (
              <tr key={h.id} className="hover:bg-zinc-50">
                <td className="p-2.5 font-mono font-bold text-primary-700">{h.auditNumber}</td>
                <td className="p-2.5 font-mono text-zinc-600">
                  {formatDate(h.reconciledAt || h.createdAt)}
                </td>
                <td className="p-2.5 text-zinc-800">{h.auditedBy}</td>
                <td
                  className={`p-2.5 text-right font-mono font-bold ${
                    h.totalVarianceQty === 0
                      ? 'text-zinc-600'
                      : h.totalVarianceQty > 0
                        ? 'text-emerald-700'
                        : 'text-red-600'
                  }`}
                >
                  {h.totalVarianceQty > 0 ? `+${h.totalVarianceQty}` : h.totalVarianceQty}
                </td>
                <td
                  className={`p-2.5 text-right font-mono font-bold ${
                    h.totalVarianceValue === 0
                      ? 'text-zinc-600'
                      : h.totalVarianceValue > 0
                        ? 'text-emerald-700'
                        : 'text-red-600'
                  }`}
                >
                  ₹{h.totalVarianceValue}
                </td>
                <td className="p-2.5 text-zinc-500 truncate max-w-xs">{h.notes || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

