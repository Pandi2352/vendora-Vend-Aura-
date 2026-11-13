import { HandCoins, Receipt, UsersThree } from '@phosphor-icons/react';

interface CustomersKpiStripProps {
  totalOutstandingKhata: number;
  totalLifetimeSpent: number;
  customersWithDues: number;
  customersCount: number;
}

export function CustomersKpiStrip({
  totalOutstandingKhata,
  totalLifetimeSpent,
  customersWithDues,
  customersCount,
}: CustomersKpiStripProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 font-sans">
      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[0.6875rem] font-semibold mb-1">
          <span>Total Outstanding Khata</span>
          <HandCoins className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xl font-black font-mono text-red-600">
          ₹{totalOutstandingKhata.toLocaleString('en-IN')}
        </div>
        <div className="text-[0.625rem] text-zinc-400 mt-0.5">
          {customersWithDues} {customersWithDues === 1 ? 'customer has' : 'customers have'} pending dues
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[0.6875rem] font-semibold mb-1">
          <span>Customer Lifetime Purchases</span>
          <Receipt className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl font-black font-mono text-zinc-950">₹{totalLifetimeSpent.toLocaleString('en-IN')}</div>
        <div className="text-[0.625rem] text-zinc-400 mt-0.5">Across {customersCount} registered customers</div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-zinc-200">
        <div className="flex items-center justify-between text-zinc-500 text-[0.6875rem] font-semibold mb-1">
          <span>Registered Customers</span>
          <UsersThree className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="text-xl font-black font-mono text-zinc-950">{customersCount}</div>
        <div className="text-[0.625rem] text-zinc-400 mt-0.5">Active retail loyalty & Khata accounts</div>
      </div>
    </div>
  );
}
