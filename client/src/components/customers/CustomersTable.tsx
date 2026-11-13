import { BookOpen, CurrencyInr, Phone, WhatsappLogo } from '@phosphor-icons/react';
import { DataTable, RowActions, type Column, type RowAction } from '@/components/tables';
import { cn } from '@/components/ui';
import { formatInr } from '@/utils';
import type { CustomerItem } from '@/types/pos.types';

interface CustomersTableProps {
  customers: CustomerItem[];
  loading: boolean;
  shopName: string;
  onRepay: (customer: CustomerItem) => void;
  onOpenStatement: (customer: CustomerItem) => void;
}

const usedPercent = (c: CustomerItem) =>
  Math.min(100, Math.round((c.currentCreditBalance / (c.creditLimit || 1)) * 100));

function whatsappReminder(c: CustomerItem, shopName: string) {
  const text = encodeURIComponent(
    `Namaste ${c.name}, this is a gentle reminder from ${shopName}. Your outstanding Khata balance is Rs. ${c.currentCreditBalance.toLocaleString('en-IN')}. Please settle at your convenience. Thank you!`,
  );
  return `https://wa.me/91${c.phone}?text=${text}`;
}

export function CustomersTable({ customers, loading, shopName, onRepay, onOpenStatement }: CustomersTableProps) {
  const columns: Column<CustomerItem>[] = [
    {
      key: 'name',
      header: 'Customer',
      sortValue: (c) => c.name.toLowerCase(),
      render: (c) => (
        <div>
          <div className="font-bold text-zinc-950">{c.name}</div>
          {c.gstin && <div className="font-mono text-[0.6875rem] text-zinc-400">GST: {c.gstin}</div>}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Mobile',
      render: (c) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-zinc-700">
          <Phone aria-hidden className="w-3.5 h-3.5 text-zinc-400" />
          {c.phone}
        </span>
      ),
    },
    {
      key: 'creditLimit',
      header: 'Credit limit',
      align: 'right',
      sortValue: (c) => c.creditLimit,
      render: (c) => <span className="font-mono tabular-nums">{formatInr(c.creditLimit)}</span>,
    },
    {
      key: 'balance',
      header: 'Khata balance',
      align: 'right',
      sortValue: (c) => c.currentCreditBalance,
      render: (c) => <KhataBalance customer={c} />,
    },
    {
      key: 'spent',
      header: 'Lifetime spent',
      align: 'right',
      sortValue: (c) => c.totalSpent,
      render: (c) => (
        <div className="font-mono tabular-nums">
          <div>{formatInr(c.totalSpent)}</div>
          <div className="text-[0.6875rem] text-zinc-400">{c.totalPurchasesCount} orders</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (c) => {
        const actions: RowAction[] = [
          {
            label: `Record Khata payment for ${c.name}`,
            icon: <CurrencyInr weight="bold" />,
            tone: 'success',
            onClick: () => onRepay(c),
          },
          {
            label: `View passbook of ${c.name}`,
            icon: <BookOpen weight="bold" />,
            tone: 'primary',
            onClick: () => onOpenStatement(c),
          },
        ];
        if (c.currentCreditBalance > 0) {
          actions.push({
            label: `Send WhatsApp reminder to ${c.name}`,
            icon: <WhatsappLogo weight="fill" />,
            href: whatsappReminder(c, shopName),
            tone: 'success',
          });
        }
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <DataTable
      rows={customers}
      columns={columns}
      rowKey={(c) => c.id}
      loading={loading}
      searchText={(c) => `${c.name} ${c.phone} ${c.gstin ?? ''}`}
      searchPlaceholder="Search by name, phone or GSTIN…"
      emptyTitle="No customers yet"
      emptyDescription='Click "New Customer" above to add customer profiles.'
    />
  );
}

function KhataBalance({ customer: c }: { customer: CustomerItem }) {
  const due = c.currentCreditBalance > 0;
  const pct = usedPercent(c);
  return (
    <div className="inline-flex flex-col items-end">
      <span className="flex items-center gap-2">
        {due && <span className="text-[0.6875rem] text-zinc-400 font-mono">({pct}%)</span>}
        <span className={cn('font-mono font-black tabular-nums', due ? 'text-red-600' : 'text-emerald-600')}>
          {formatInr(c.currentCreditBalance)}
        </span>
      </span>
      {due && (
        <span className="w-24 h-1.5 bg-zinc-200 rounded-md mt-1 overflow-hidden" aria-hidden>
          <span className={cn('block h-full', pct > 80 ? 'bg-red-600' : 'bg-amber-500')} style={{ width: `${pct}%` }} />
        </span>
      )}
    </div>
  );
}
