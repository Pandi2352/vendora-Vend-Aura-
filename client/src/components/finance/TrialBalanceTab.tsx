import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import type { TrialBalanceData } from './types';

interface TrialBalanceTabProps {
  data: TrialBalanceData | null;
  loading: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-blue-50 text-blue-700 border-blue-200',
  LIABILITY: 'bg-amber-50 text-amber-700 border-amber-200',
  EQUITY: 'bg-purple-50 text-purple-700 border-purple-200',
  REVENUE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  EXPENSE: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function TrialBalanceTab({ data, loading }: TrialBalanceTabProps) {
  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-zinc-200 rounded-md text-zinc-500 font-medium">
        Calculating real-time double-entry trial balance...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white border border-zinc-200 rounded-md text-zinc-500 font-medium">
        No ledger accounts found.
      </div>
    );
  }

  const { accounts, totalDebit, totalCredit, isBalanced } = data;

  return (
    <div className="space-y-4">
      {/* Ledger Balance Verification Alert */}
      <div
        className={`p-4 rounded-md border flex items-center justify-between ${
          isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isBalanced ? (
            <CheckCircle weight="fill" className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <WarningCircle weight="fill" className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider">
              {isBalanced ? 'General Ledger is Perfectly Balanced' : 'Unbalanced Ledger Warning'}
            </h4>
            <p className="text-xs opacity-90">
              Total Debits match Total Credits according to standard double-entry bookkeeping rules.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">Variance</span>
          <span className="font-mono font-bold text-xs">₹{Math.abs(totalDebit - totalCredit).toFixed(2)}</span>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100/75 border-b border-zinc-200 text-zinc-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Account Code</th>
                <th className="py-2.5 px-4">Account Head Name</th>
                <th className="py-2.5 px-4">Classification</th>
                <th className="py-2.5 px-4 text-right">Debit (₹)</th>
                <th className="py-2.5 px-4 text-right">Credit (₹)</th>
                <th className="py-2.5 px-4 text-right">Net Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {accounts.map((acc) => (
                <tr key={acc.code} className="hover:bg-zinc-50/75 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-zinc-950">{acc.code}</td>
                  <td className="py-2.5 px-4 font-semibold text-zinc-900">{acc.name}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        TYPE_COLORS[acc.type] || 'bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {acc.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-zinc-800">
                    {acc.totalDebit > 0 ? `₹${acc.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-zinc-800">
                    {acc.totalCredit > 0 ? `₹${acc.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-zinc-950">
                    ₹{acc.netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Grand Totals Footer */}
            <tfoot className="bg-zinc-100 border-t-2 border-zinc-300 font-bold text-xs text-zinc-950">
              <tr>
                <td colSpan={3} className="py-3 px-4 uppercase tracking-wider text-[11px]">
                  Total Ledger Sums:
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-blue-700">
                  ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-emerald-700">
                  ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-zinc-950">₹0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
