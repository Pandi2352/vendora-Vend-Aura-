import { BookOpen, X } from '@phosphor-icons/react';
import type { CustomerItem, CustomerStatementItem } from '../../types/pos.types';

interface PassbookModalProps {
  customer: CustomerItem | null;
  statement: CustomerStatementItem[];
  loadingStatement: boolean;
  onClose: () => void;
}

export function PassbookModal({
  customer,
  statement,
  loadingStatement,
  onClose,
}: PassbookModalProps) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-zinc-200 w-full max-w-xl p-5 space-y-4 max-h-[85vh] flex flex-col font-sans">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-600" />
              <span>Khata Passbook: {customer.name}</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Mobile: {customer.phone} | Outstanding Dues: ₹{customer.currentCreditBalance.toLocaleString('en-IN')}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto border border-zinc-200 rounded-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-[10px] font-bold uppercase text-zinc-600">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Transaction</th>
                <th className="py-2 px-3">Ref ID</th>
                <th className="py-2 px-3 text-right">Debit (+)</th>
                <th className="py-2 px-3 text-right">Credit (-)</th>
                <th className="py-2 px-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
              {statement.map((st) => (
                <tr key={st.id} className="hover:bg-zinc-50">
                  <td className="py-2 px-3 text-zinc-500">
                    {new Date(st.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-2 px-3 font-sans font-semibold">
                    {st.transactionType === 'DEBIT_SALE' ? (
                      <span className="text-red-600">Khata Purchase</span>
                    ) : (
                      <span className="text-emerald-600">Repayment ({st.paymentMode || 'Cash'})</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-zinc-500">{st.referenceId}</td>
                  <td className="py-2 px-3 text-right font-bold text-red-600">
                    {st.transactionType === 'DEBIT_SALE' ? `₹${st.amount.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600">
                    {st.transactionType === 'CREDIT_PAYMENT' ? `₹${st.amount.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-zinc-950">
                    ₹{st.balanceAfter.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {statement.length === 0 && !loadingStatement && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs font-sans">
                    No transactions recorded in passbook yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-zinc-900 text-white font-semibold text-xs cursor-pointer"
          >
            Close Passbook
          </button>
        </div>
      </div>
    </div>
  );
}

