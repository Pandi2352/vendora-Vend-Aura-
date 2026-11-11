import { Truck, Phone, CurrencyInr } from '@phosphor-icons/react';
import type { SupplierItem } from '../../types/pos.types';

interface SuppliersTableProps {
  suppliers: SupplierItem[];
  loading: boolean;
  onPayDues: (supplier: SupplierItem) => void;
}

export function SuppliersTable({ suppliers, loading, onPayDues }: SuppliersTableProps) {
  return (
    <table className="w-full text-left border-collapse text-xs">
      <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
        <tr>
          <th className="py-2.5 px-4">Supplier / Firm Name</th>
          <th className="py-2.5 px-4">Contact Person</th>
          <th className="py-2.5 px-4">Phone / Email</th>
          <th className="py-2.5 px-4">Category</th>
          <th className="py-2.5 px-4">Credit Terms</th>
          <th className="py-2.5 px-4 text-right">Balance Due</th>
          <th className="py-2.5 px-4 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-200">
        {suppliers.map((s) => (
          <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
            <td className="py-3 px-4 font-bold text-zinc-950">
              <div>{s.name}</div>
              {s.gstin && (
                <div className="font-mono text-[10px] text-zinc-400">GST: {s.gstin}</div>
              )}
            </td>
            <td className="py-3 px-4 text-zinc-700">{s.contactPerson || '—'}</td>
            <td className="py-3 px-4 font-mono text-zinc-700">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>{s.phone}</span>
              </div>
              {s.email && <div className="text-[10px] text-zinc-400">{s.email}</div>}
            </td>
            <td className="py-3 px-4 text-zinc-600 text-[11px] font-medium">{s.category}</td>
            <td className="py-3 px-4 font-mono text-zinc-600">{s.creditDays} days</td>
            <td className="py-3 px-4 font-mono font-bold text-right">
              <span className={s.balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}>
                ₹{s.balanceDue.toLocaleString('en-IN')}
              </span>
            </td>
            <td className="py-3 px-4 text-center">
              <button
                onClick={() => onPayDues(s)}
                className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-emerald-600 hover:text-white text-zinc-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Record Payment Settlement"
              >
                <CurrencyInr weight="bold" className="w-3 h-3" />
                <span>Pay Dues</span>
              </button>
            </td>
          </tr>
        ))}

        {suppliers.length === 0 && !loading && (
          <tr>
            <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs">
              <Truck className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="font-semibold text-zinc-600">No suppliers registered yet.</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Click "New Supplier" to register distributor profiles.</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

