import { CurrencyInr, Phone } from '@phosphor-icons/react';
import { DataTable, RowActions, type Column } from '@/components/tables';
import { cn } from '@/components/ui';
import { formatInr } from '@/utils';
import type { SupplierItem } from '@/types/pos.types';

interface SuppliersTableProps {
  suppliers: SupplierItem[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onPayDues: (supplier: SupplierItem) => void;
}

export function SuppliersTable({ suppliers, loading, error, onRetry, onPayDues }: SuppliersTableProps) {
  const columns: Column<SupplierItem>[] = [
    {
      key: 'name',
      header: 'Supplier / firm',
      sortValue: (s) => s.name.toLowerCase(),
      render: (s) => (
        <div>
          <div className="font-bold text-zinc-950">{s.name}</div>
          {s.gstin && <div className="font-mono text-[11px] text-zinc-400">GST: {s.gstin}</div>}
        </div>
      ),
    },
    { key: 'contact', header: 'Contact person', render: (s) => s.contactPerson || '—' },
    {
      key: 'phone',
      header: 'Phone / email',
      render: (s) => (
        <div className="font-mono text-zinc-700">
          <span className="inline-flex items-center gap-1.5">
            <Phone aria-hidden className="w-3.5 h-3.5 text-zinc-400" />
            {s.phone}
          </span>
          {s.email && <div className="text-[11px] text-zinc-400">{s.email}</div>}
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortValue: (s) => s.category, render: (s) => s.category || '—' },
    {
      key: 'creditDays',
      header: 'Credit terms',
      align: 'right',
      sortValue: (s) => s.creditDays,
      render: (s) => <span className="font-mono tabular-nums">{s.creditDays} days</span>,
    },
    {
      key: 'balanceDue',
      header: 'Balance due',
      align: 'right',
      sortValue: (s) => s.balanceDue,
      render: (s) => (
        <span className={cn('font-mono font-bold tabular-nums', s.balanceDue > 0 ? 'text-red-600' : 'text-emerald-600')}>
          {formatInr(s.balanceDue)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (s) => (
        <RowActions
          actions={[{ label: `Pay dues to ${s.name}`, icon: <CurrencyInr weight="bold" />, tone: 'success', onClick: () => onPayDues(s) }]}
        />
      ),
    },
  ];

  return (
    <DataTable
      rows={suppliers}
      columns={columns}
      rowKey={(s) => s.id}
      loading={loading}
      error={error}
      onRetry={onRetry}
      searchText={(s) => `${s.name} ${s.phone} ${s.contactPerson ?? ''} ${s.gstin ?? ''}`}
      searchPlaceholder="Search suppliers by name, phone…"
      emptyTitle="No suppliers registered yet"
      emptyDescription='Click "New Supplier" to register distributor profiles.'
    />
  );
}
