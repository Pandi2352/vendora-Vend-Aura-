import type { ReactNode } from 'react';
import { Printer } from '@phosphor-icons/react';
import { DataTable, RowActions, type Column } from '@/components/tables';
import { Badge, type BadgeTone } from '@/components/ui';
import type { OrderItemRecord, PaymentMode } from '@/types/pos.types';
import { formatDate, formatInr, formatTime } from '@/utils';

const MODE_TONES: Record<PaymentMode, BadgeTone> = {
  CASH: 'success',
  UPI: 'info',
  CARD: 'primary',
  CREDIT: 'warning',
};

interface OrdersTableProps {
  orders: OrderItemRecord[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onReprint: (order: OrderItemRecord) => void;
  /** Extra filters shown in the table toolbar. */
  toolbar?: ReactNode;
}

const searchText = (o: OrderItemRecord) => [o.invoiceNumber, o.customerName, o.customerPhone].filter(Boolean).join(' ');

export function OrdersTable({ orders, loading, error, onRetry, onReprint, toolbar }: OrdersTableProps) {
  const columns: Column<OrderItemRecord>[] = [
    {
      key: 'invoice',
      header: 'Invoice #',
      sortValue: (o) => o.invoiceNumber,
      render: (o) => <span className="font-mono font-bold text-zinc-900">{o.invoiceNumber}</span>,
    },
    {
      key: 'date',
      header: 'Date & time',
      sortValue: (o) => new Date(o.createdAt),
      render: (o) => (
        <span className="font-mono text-xs text-zinc-600 whitespace-nowrap">
          {formatDate(o.createdAt)} <span className="text-zinc-400">{formatTime(o.createdAt)}</span>
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortValue: (o) => o.customerName ?? '',
      render: (o) =>
        o.customerName ? (
          <div>
            <span className="font-semibold text-zinc-900">{o.customerName}</span>
            {o.customerPhone && <span className="block font-mono text-[0.6875rem] text-zinc-400">{o.customerPhone}</span>}
          </div>
        ) : (
          <span className="text-zinc-400 text-xs italic">Walk-in customer</span>
        ),
    },
    {
      key: 'items',
      header: 'Items',
      sortValue: (o) => o.itemsCount,
      render: (o) => `${o.itemsCount} ${o.itemsCount === 1 ? 'item' : 'items'}`,
    },
    {
      key: 'mode',
      header: 'Tender mode',
      sortValue: (o) => o.paymentMode,
      render: (o) => (
        <Badge tone={MODE_TONES[o.paymentMode] ?? 'neutral'} dot>
          {o.paymentMode}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: 'Grand total',
      align: 'right',
      sortValue: (o) => o.grandTotal,
      render: (o) => <span className="font-mono font-bold text-zinc-950">{formatInr(o.grandTotal)}</span>,
    },
    { key: 'cashier', header: 'Cashier', sortValue: (o) => o.cashierName ?? '', render: (o) => o.cashierName || 'Cashier' },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (o) => (
        <RowActions
          actions={[{ label: `Reprint receipt ${o.invoiceNumber}`, icon: <Printer />, tone: 'primary', onClick: () => onReprint(o) }]}
        />
      ),
    },
  ];

  return (
    <DataTable
      rows={orders}
      columns={columns}
      rowKey={(o) => o.id ?? o._id ?? o.invoiceNumber}
      searchText={searchText}
      searchPlaceholder="Search invoice, customer name or mobile"
      toolbar={toolbar}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No invoices match your filter"
      emptyDescription="Bills completed in the POS register will appear here automatically."
    />
  );
}
