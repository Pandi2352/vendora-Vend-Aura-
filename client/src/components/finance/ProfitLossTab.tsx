import { TrendUp, TrendDown } from '@phosphor-icons/react';
import type { ProfitLossData } from './types';

interface ProfitLossTabProps {
  data: ProfitLossData | null;
  loading: boolean;
}

export function ProfitLossTab({ data, loading }: ProfitLossTabProps) {
  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-zinc-200 rounded-md text-zinc-500 font-medium">
        Generating real-time Profit and Loss statement...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white border border-zinc-200 rounded-md text-zinc-500 font-medium">
        No financial data recorded yet.
      </div>
    );
  }

  const { revenue, expenses, netProfit } = data;
  const isProfitable = netProfit >= 0;
  const netMargin = revenue.total > 0 ? ((netProfit / revenue.total) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Bottom Line Summary Card */}
      <div
        className={`p-5 rounded-md border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isProfitable ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-md border flex items-center justify-center shrink-0 ${
              isProfitable ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-red-100 text-red-700 border-red-300'
            }`}
          >
            {isProfitable ? <TrendUp weight="bold" className="w-6 h-6" /> : <TrendDown weight="bold" className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">
              {isProfitable ? 'Net Operating Profit' : 'Net Operating Deficit'}
            </h3>
            <p className="text-xs opacity-80">
              Total Revenue (₹{revenue.total.toLocaleString('en-IN')}) less Operating Expenses (₹
              {expenses.total.toLocaleString('en-IN')})
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-mono block">
            ₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold opacity-85 block">Net Margin: {netMargin}%</span>
        </div>
      </div>

      {/* Two Column Financial Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Statement */}
        <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
          <div className="p-3.5 border-b border-zinc-200 bg-emerald-50/50 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">1. Operating Revenue</h4>
            <span className="font-mono font-bold text-sm text-emerald-700">₹{revenue.total.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-4 space-y-2 text-xs">
            {revenue.accounts.length === 0 ? (
              <p className="text-zinc-400 py-3 text-center">No sales revenue recorded in this period.</p>
            ) : (
              revenue.accounts.map((acc) => (
                <div key={acc.code} className="flex items-center justify-between py-1.5 border-b border-zinc-100">
                  <div>
                    <span className="font-semibold text-zinc-900">{acc.name}</span>
                    <span className="text-[11px] text-zinc-400 font-mono ml-2">({acc.code})</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-950">
                    ₹{(acc.totalCredit - acc.totalDebit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Operating Expenses Statement */}
        <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
          <div className="p-3.5 border-b border-zinc-200 bg-red-50/50 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-red-900">2. Operating Overheads & Costs</h4>
            <span className="font-mono font-bold text-sm text-red-700">₹{expenses.total.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-4 space-y-2 text-xs">
            {expenses.accounts.length === 0 ? (
              <p className="text-zinc-400 py-3 text-center">No expenses recorded yet.</p>
            ) : (
              expenses.accounts.map((acc) => (
                <div key={acc.code} className="flex items-center justify-between py-1.5 border-b border-zinc-100">
                  <div>
                    <span className="font-semibold text-zinc-900">{acc.name}</span>
                    <span className="text-[11px] text-zinc-400 font-mono ml-2">({acc.code})</span>
                  </div>
                  <span className="font-mono font-bold text-red-600">
                    ₹{(acc.totalDebit - acc.totalCredit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
