import { Wallet, Money, Bank, TrendUp, TrendDown } from '@phosphor-icons/react';

interface FinanceKpiStripProps {
  totalSpent: number;
  expensesCount: number;
  cashSpent: number;
  digitalSpent: number;
  netProfit?: number;
}

export function FinanceKpiStrip({
  totalSpent,
  expensesCount,
  cashSpent,
  digitalSpent,
  netProfit,
}: FinanceKpiStripProps) {
  const isProfitable = (netProfit ?? 0) >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="p-4 rounded-md bg-white border border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
            <Wallet weight="bold" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Total Expenses</p>
            <p className="text-xl font-black text-zinc-950 mt-0.5">₹{totalSpent.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-zinc-400">{expensesCount} recorded items</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-md bg-white border border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Money weight="bold" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Cash Outflow</p>
            <p className="text-xl font-black text-zinc-950 mt-0.5">₹{cashSpent.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-zinc-400">Till cash drawer</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-md bg-white border border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Bank weight="bold" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Bank & Digital</p>
            <p className="text-xl font-black text-zinc-950 mt-0.5">₹{digitalSpent.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-zinc-400">UPI / Card / NEFT</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-md bg-white border border-zinc-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 ${
              isProfitable ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            {isProfitable ? <TrendUp weight="bold" className="w-5 h-5" /> : <TrendDown weight="bold" className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Net Profit / Loss</p>
            <p className={`text-xl font-black mt-0.5 ${isProfitable ? 'text-emerald-700' : 'text-red-700'}`}>
              ₹{(netProfit ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-400">{isProfitable ? 'Net Surplus' : 'Operating Deficit'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

