import { useState } from 'react';
import { Tag, MagnifyingGlass } from '@phosphor-icons/react';
import type { ExpenseItem } from './types';
import { formatDate } from '@/utils';

interface ExpensesTableProps {
  expenses: ExpenseItem[];
  loading: boolean;
  onRefresh: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  RENT: 'Store Rent',
  UTILITIES: 'Utilities',
  SALARIES: 'Salaries',
  PACKAGING: 'Packaging',
  FREIGHT: 'Transport',
  MAINTENANCE: 'Maintenance',
  MARKETING: 'Marketing',
  SOFTWARE: 'Software',
  BANK_FEES: 'Bank Fees',
  OTHER: 'General',
};

export function ExpensesTable({ expenses, loading }: ExpensesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      (e.expenseNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesMode = selectedMode === 'ALL' || e.paymentMode === selectedMode;
    return matchesSearch && matchesCategory && matchesMode;
  });

  return (
    <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
      {/* Filters Toolbar */}
      <div className="p-3.5 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by expense #, payee, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-zinc-300 rounded-md text-xs bg-white text-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-zinc-300 rounded-md text-xs bg-white font-medium text-zinc-800 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-2.5 py-1.5 border border-zinc-300 rounded-md text-xs bg-white font-medium text-zinc-800 cursor-pointer"
          >
            <option value="ALL">All Modes</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK">Bank</option>
            <option value="CARD">Card</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-100/75 border-b border-zinc-200 text-zinc-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4">Expense #</th>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Payee / Vendor</th>
              <th className="py-2.5 px-4">Narration</th>
              <th className="py-2.5 px-4">Mode</th>
              <th className="py-2.5 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-zinc-500 font-medium">
                  Loading expenses...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-zinc-500 font-medium">
                  No expense records found. Click "+ Record Expense" to log overheads.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item._id} className="hover:bg-zinc-50/75 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-zinc-600">{formatDate(item.expenseDate)}</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-zinc-950">{item.expenseNumber}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-semibold border border-zinc-200 text-[11px] inline-flex items-center gap-1">
                      <Tag className="w-3 h-3 text-zinc-500" />
                      {CATEGORY_NAMES[item.category] || item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-zinc-900">{item.vendorName || '—'}</td>
                  <td className="py-2.5 px-4 text-zinc-600 max-w-xs truncate">{item.description || '—'}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-zinc-700">{item.paymentMode}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-red-600 text-sm">
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
