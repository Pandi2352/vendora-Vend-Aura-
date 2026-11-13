import { Receipt, Money, QrCode, HandCoins } from '@phosphor-icons/react';

interface OrdersKpiStripProps {
  totalRevenue: number;
  ordersCount: number;
  cashTotal: number;
  digitalTotal: number;
  creditTotal: number;
}

export function OrdersKpiStrip({
  totalRevenue,
  ordersCount,
  cashTotal,
  digitalTotal,
  creditTotal,
}: OrdersKpiStripProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 font-sans">
      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[0.6875rem] font-semibold mb-1">
          <span>Total Sales Volume</span>
          <Receipt className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="text-xl font-black font-mono text-zinc-950">
          ₹{totalRevenue.toLocaleString('en-IN')}
        </div>
        <div className="text-[0.625rem] text-zinc-400 mt-0.5">{ordersCount} completed bills</div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[0.6875rem] font-semibold mb-1">
          <span>Cash Collected</span>
          <Money className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl font-black font-mono text-emerald-600">
          ₹{cashTotal.toLocaleString('en-IN')}
        </div>
        <div className="text-[0.625rem] text-zinc-400 mt-0.5">Physical currency drawer</div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[0.6875rem] font-semibold mb-1">
          <span>Digital (UPI / Card)</span>
          <QrCode className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-black font-mono text-blue-600">
          ₹{digitalTotal.toLocaleString('en-IN')}
        </div>
        <div className="text-[0.625rem] text-zinc-400 mt-0.5">Instant bank credit</div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[0.6875rem] font-semibold mb-1">
          <span>Khata / Credit Sales</span>
          <HandCoins className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xl font-black font-mono text-amber-600">
          ₹{creditTotal.toLocaleString('en-IN')}
        </div>
        <div className="text-[0.625rem] text-zinc-400 mt-0.5">Customer ledger receivables</div>
      </div>
    </div>
  );
}

