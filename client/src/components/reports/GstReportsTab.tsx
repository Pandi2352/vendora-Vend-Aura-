import { Files, Calculator } from '@phosphor-icons/react';
import type { Gstr1Data, Gstr3bData } from '../../types/reports.types';

interface GstReportsTabProps {
  gstr1: Gstr1Data | null;
  gstr3b: Gstr3bData | null;
  isLoading: boolean;
}

export function GstReportsTab({ gstr1, gstr3b, isLoading }: GstReportsTabProps) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-zinc-400 text-xs">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Calculating GST Tax liabilities & ITC...
      </div>
    );
  }

  if (!gstr1 || !gstr3b) {
    return <div className="py-16 text-center text-zinc-400 text-xs">No GST records found for this period.</div>;
  }

  return (
    <div className="space-y-4">
      {/* 1. GSTR-3B Net Tax Liability Strip */}
      <div className="p-4 bg-ink text-white rounded-md border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator weight="bold" className="w-5 h-5 text-red-500" />
            <h4 className="font-bold text-sm text-zinc-100">GSTR-3B Monthly Tax Computation</h4>
          </div>
          <p className="text-[0.6875rem] text-zinc-400 mt-0.5">
            Outward Sales Tax minus Eligible Purchase Input Tax Credit (ITC)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="p-2 bg-ink border border-zinc-800 rounded-md">
            <span className="text-[0.625rem] text-zinc-400 block">Outward Tax (3.1)</span>
            <span className="font-mono font-bold text-zinc-100">₹{gstr3b.outwardTaxableSupplies.totalTax.toLocaleString('en-IN')}</span>
          </div>

          <span className="text-zinc-500 font-bold">-</span>

          <div className="p-2 bg-ink border border-zinc-800 rounded-md">
            <span className="text-[0.625rem] text-zinc-400 block">Eligible ITC (Table 4)</span>
            <span className="font-mono font-bold text-emerald-400">₹{gstr3b.eligibleItcPurchases.totalItc.toLocaleString('en-IN')}</span>
          </div>

          <span className="text-zinc-500 font-bold">=</span>

          <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-md">
            <span className="text-[0.625rem] text-red-300 block font-bold">Net GST Payable</span>
            <span className="font-mono font-black text-sm text-white">₹{gstr3b.netGstPayable.netTotalPayable.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 2. B2B vs B2C Supplies Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 bg-white border border-zinc-200 rounded-md space-y-1">
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="font-bold text-zinc-900">B2B Registered Supplies</span>
            <span className="text-[0.625rem] px-1.5 py-0.5 bg-zinc-100 rounded-md font-mono font-bold">{gstr1.b2bSupplies.invoiceCount} invoices</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Taxable Supplies Value:</span>
            <span className="font-mono font-semibold">₹{gstr1.b2bSupplies.taxableValue.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>GST Tax (CGST + SGST):</span>
            <span className="font-mono font-bold text-red-600">₹{gstr1.b2bSupplies.totalTax.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-zinc-200 rounded-md space-y-1">
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="font-bold text-zinc-900">B2C Retail / Walk-in Supplies</span>
            <span className="text-[0.625rem] px-1.5 py-0.5 bg-zinc-100 rounded-md font-mono font-bold">{gstr1.b2cSupplies.invoiceCount} invoices</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Taxable Supplies Value:</span>
            <span className="font-mono font-semibold">₹{gstr1.b2cSupplies.taxableValue.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>GST Tax (CGST + SGST):</span>
            <span className="font-mono font-bold text-red-600">₹{gstr1.b2cSupplies.totalTax.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 3. GSTR-1 Tax Slab Breakdown Table */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Files weight="bold" className="w-4 h-4 text-primary-600" />
            <h4 className="font-bold text-xs text-zinc-950">GSTR-1 Outward Supplies by GST Slab</h4>
          </div>
          <span className="text-[0.625rem] text-zinc-500 font-mono">Government Slabs: 0%, 5%, 12%, 18%, 28%</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-zinc-100/60 border-b border-zinc-200 text-zinc-600 text-[0.6875rem]">
            <tr>
              <th className="p-2.5 text-left font-semibold">GST Rate Slab</th>
              <th className="p-2.5 text-right font-semibold">Taxable Supplies (₹)</th>
              <th className="p-2.5 text-right font-semibold">CGST (50%)</th>
              <th className="p-2.5 text-right font-semibold">SGST (50%)</th>
              <th className="p-2.5 text-right font-semibold">Total Tax Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {gstr1.taxSlabBreakup.map((row) => (
              <tr key={row.ratePercent} className="hover:bg-zinc-50">
                <td className="p-2.5 font-bold text-zinc-950 font-mono">
                  <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">
                    {row.ratePercent}% GST Slab
                  </span>
                </td>
                <td className="p-2.5 text-right font-mono text-zinc-800">₹{row.taxableValue.toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-right font-mono text-zinc-600">₹{row.cgst.toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-right font-mono text-zinc-600">₹{row.sgst.toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-right font-mono font-bold text-red-600">₹{row.totalTax.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-zinc-100 border-t border-zinc-200 font-bold">
            <tr>
              <td className="p-2.5 text-zinc-900">Total Outward Supplies ({gstr1.totalOutwardSupplies.invoicesCount} Invoices)</td>
              <td className="p-2.5 text-right font-mono text-zinc-900">₹{gstr1.totalOutwardSupplies.taxableValue.toLocaleString('en-IN')}</td>
              <td className="p-2.5 text-right font-mono text-zinc-900">₹{gstr1.totalOutwardSupplies.cgst.toLocaleString('en-IN')}</td>
              <td className="p-2.5 text-right font-mono text-zinc-900">₹{gstr1.totalOutwardSupplies.sgst.toLocaleString('en-IN')}</td>
              <td className="p-2.5 text-right font-mono font-black text-red-600">₹{gstr1.totalOutwardSupplies.totalTax.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
