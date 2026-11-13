import { CurrencyInr, Receipt, ShoppingCart, TrendUp, Clock, CreditCard } from '@phosphor-icons/react';
import type { ExecutiveOverviewData } from '../../types/reports.types';

interface ExecutiveOverviewTabProps {
  data: ExecutiveOverviewData | null;
  isLoading: boolean;
}

export function ExecutiveOverviewTab({ data, isLoading }: ExecutiveOverviewTabProps) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-zinc-400 text-xs">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading executive summary...
      </div>
    );
  }

  if (!data) {
    return <div className="py-16 text-center text-zinc-400 text-xs">No analytics data available for this period.</div>;
  }

  const s = data.summary;

  return (
    <div className="space-y-4">
      {/* 1. Main KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold">Gross Revenue</span>
            <CurrencyInr weight="bold" className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-base font-black font-mono text-zinc-950">₹{s.grossSales.toLocaleString('en-IN')}</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">Taxable: ₹{s.taxableAmount.toLocaleString('en-IN')}</div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold">Returns Refunded</span>
            <span className="text-[0.625rem] font-bold text-red-600">Refund</span>
          </div>
          <div className="text-base font-black font-mono text-red-600">-₹{s.returnsTotal.toLocaleString('en-IN')}</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">Net: ₹{s.netSales.toLocaleString('en-IN')}</div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold">GST Tax Collected</span>
            <span className="text-[0.625rem] font-bold text-emerald-600">GST</span>
          </div>
          <div className="text-base font-black font-mono text-emerald-600">+₹{s.taxCollected.toLocaleString('en-IN')}</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">CGST + SGST Split</div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold">Total Orders</span>
            <Receipt weight="bold" className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-base font-black font-mono text-zinc-950">{s.ordersCount}</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">Invoices Billed</div>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[0.6875rem] font-bold">Average Bill Value</span>
            <ShoppingCart weight="bold" className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-base font-black font-mono text-zinc-950">₹{s.avgOrderValue.toLocaleString('en-IN')}</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">Basket Size</div>
        </div>

        <div className="p-3 bg-ink border border-zinc-900 rounded-md text-white">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[0.6875rem] font-bold">Est. Gross Profit</span>
            <TrendUp weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-black font-mono text-emerald-400">₹{s.estimatedGrossProfit.toLocaleString('en-IN')}</div>
          <div className="text-[0.625rem] text-zinc-400 font-mono mt-0.5">{s.grossMarginPercent}% Margin on COGS</div>
        </div>
      </div>

      {/* 2. Tender Mode Distribution & Time Slot Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Tender Breakdown */}
        <div className="p-4 bg-white border border-zinc-200 rounded-md space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
            <CreditCard weight="bold" className="w-4 h-4 text-primary-600" />
            <h4 className="font-bold text-xs text-zinc-950">Payment Tender Distribution</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.tenderBreakdown.map((t) => (
              <div key={t.mode} className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200 text-center">
                <span className="text-[0.625rem] font-bold text-zinc-500 block uppercase">{t.mode}</span>
                <span className="font-mono font-black text-xs text-zinc-950 block mt-0.5">₹{t.amount.toLocaleString('en-IN')}</span>
                <span className="text-[0.625rem] font-mono text-zinc-400">{t.count} bills • {t.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Slot Trend */}
        <div className="p-4 bg-white border border-zinc-200 rounded-md space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
            <Clock weight="bold" className="w-4 h-4 text-primary-600" />
            <h4 className="font-bold text-xs text-zinc-950">Store Rush & Time-Slot Trends</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.hourlyTrends.map((h) => (
              <div key={h.label} className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200 text-center">
                <span className="text-[0.625rem] font-bold text-zinc-500 block truncate">{h.label.split(' ')[0]}</span>
                <span className="font-mono font-black text-xs text-zinc-950 block mt-0.5">₹{h.revenue.toLocaleString('en-IN')}</span>
                <span className="text-[0.625rem] font-mono text-zinc-400">{h.ordersCount} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Top Selling Products */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <h4 className="font-bold text-xs text-zinc-950">Top Selling Products by Revenue</h4>
          <span className="text-[0.625rem] text-zinc-500 font-mono">Ranked by Sales Value</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-zinc-100/60 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
            <tr>
              <th className="p-2.5 text-left font-semibold">#</th>
              <th className="p-2.5 text-left font-semibold">Product Name</th>
              <th className="p-2.5 text-left font-semibold">Barcode</th>
              <th className="p-2.5 text-center font-semibold">Units Sold</th>
              <th className="p-2.5 text-right font-semibold">Total Revenue (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {data.topProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-zinc-400">No items sold in this period</td>
              </tr>
            ) : (
              data.topProducts.map((p, idx) => (
                <tr key={p.productId} className="hover:bg-zinc-50">
                  <td className="p-2.5 font-mono text-zinc-400">{idx + 1}</td>
                  <td className="p-2.5 font-bold text-zinc-950">{p.name}</td>
                  <td className="p-2.5 font-mono text-zinc-500">{p.barcode}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-zinc-800">{p.quantitySold}</td>
                  <td className="p-2.5 text-right font-mono font-black text-red-600">₹{p.totalRevenue.toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

