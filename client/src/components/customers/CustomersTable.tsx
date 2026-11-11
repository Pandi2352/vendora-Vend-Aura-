import { Phone, CurrencyInr, BookOpen, WhatsappLogo, UsersThree } from '@phosphor-icons/react';
import type { CustomerItem } from '../../types/pos.types';

interface CustomersTableProps {
  customers: CustomerItem[];
  loading: boolean;
  shopName: string;
  onRepay: (customer: CustomerItem) => void;
  onOpenStatement: (customer: CustomerItem) => void;
}

export function CustomersTable({
  customers,
  loading,
  shopName,
  onRepay,
  onOpenStatement,
}: CustomersTableProps) {
  return (
    <table className="w-full text-left border-collapse text-xs font-sans">
      <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
        <tr>
          <th className="py-2.5 px-4">Customer Name</th>
          <th className="py-2.5 px-4">Mobile / Contact</th>
          <th className="py-2.5 px-4">Credit Limit</th>
          <th className="py-2.5 px-4">Khata Balance</th>
          <th className="py-2.5 px-4">Lifetime Spent</th>
          <th className="py-2.5 px-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-200">
        {customers.map((c) => {
          const limitPct = Math.min(100, Math.round((c.currentCreditBalance / (c.creditLimit || 1)) * 100));
          const waMessage = encodeURIComponent(
            `Namaste ${c.name}, this is a gentle reminder from ${shopName}. Your outstanding Khata balance is Rs. ${c.currentCreditBalance.toLocaleString('en-IN')}. Please settle at your convenience. Thank you!`
          );

          return (
            <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
              <td className="py-3 px-4">
                <div className="font-bold text-zinc-950">{c.name}</div>
                {c.gstin && (
                  <div className="font-mono text-[10px] text-zinc-400">GST: {c.gstin}</div>
                )}
              </td>
              <td className="py-3 px-4 font-mono font-medium text-zinc-700">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{c.phone}</span>
                </div>
              </td>
              <td className="py-3 px-4 font-mono text-zinc-700">
                ₹{c.creditLimit.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-black ${
                      c.currentCreditBalance > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    ₹{c.currentCreditBalance.toLocaleString('en-IN')}
                  </span>
                  {c.currentCreditBalance > 0 && (
                    <span className="text-[10px] text-zinc-400 font-mono">({limitPct}%)</span>
                  )}
                </div>
                {c.currentCreditBalance > 0 && (
                  <div className="w-24 h-1.5 bg-zinc-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full ${limitPct > 80 ? 'bg-red-600' : 'bg-amber-500'}`}
                      style={{ width: `${limitPct}%` }}
                    />
                  </div>
                )}
              </td>
              <td className="py-3 px-4 font-mono text-zinc-900">
                <div>₹{c.totalSpent.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-zinc-400">{c.totalPurchasesCount} orders</div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onRepay(c)}
                    className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-emerald-600 hover:text-white text-zinc-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    title="Record Khata Payment"
                  >
                    <CurrencyInr weight="bold" className="w-3 h-3" />
                    <span>Repay</span>
                  </button>

                  <button
                    onClick={() => onOpenStatement(c)}
                    className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-800 hover:text-white text-zinc-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    title="View Statement Ledger"
                  >
                    <BookOpen weight="bold" className="w-3 h-3" />
                    <span>Passbook</span>
                  </button>

                  {c.currentCreditBalance > 0 && (
                    <a
                      href={`https://wa.me/91${c.phone}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                      title="Send WhatsApp Reminder"
                    >
                      <WhatsappLogo weight="fill" className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </td>
            </tr>
          );
        })}

        {customers.length === 0 && !loading && (
          <tr>
            <td colSpan={6} className="py-12 text-center text-zinc-400 text-xs">
              <UsersThree className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="font-semibold text-zinc-600">No customers found.</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Click "New Customer" above to add customer profiles.</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

