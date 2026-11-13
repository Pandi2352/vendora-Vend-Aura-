import { DataTable, type Column } from '@/components/tables';
import { Badge, type BadgeTone } from '@/components/ui';
import { formatDate, formatInr } from '@/utils';
import type { PurchaseItemRecord } from '@/types/pos.types';

interface InwardsTableProps {
  purchases: PurchaseItemRecord[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const STATUS_TONE: Record<string, BadgeTone> = { PAID: 'success', PARTIAL: 'info', UNPAID: 'warning' };

const columns: Column<PurchaseItemRecord>[] = [
  {
    key: 'grn',
    header: 'GRN #',
    sortValue: (p) => p.grnNumber,
    render: (p) => <span className="font-mono font-bold text-zinc-950">{p.grnNumber}</span>,
  },
  {
    key: 'date',
    header: 'Received date',
    sortValue: (p) => new Date(p.receivedDate),
    render: (p) => <span className="font-mono text-[0.6875rem] text-zinc-500">{formatDate(p.receivedDate)}</span>,
  },
  {
    key: 'supplier',
    header: 'Supplier',
    sortValue: (p) => p.supplierName.toLowerCase(),
    render: (p) => <span className="font-semibold">{p.supplierName}</span>,
  },
  {
    key: 'bill',
    header: 'Vendor bill #',
    render: (p) => <span className="font-mono text-zinc-600">{p.supplierInvoiceNumber || '—'}</span>,
  },
  {
    key: 'items',
    header: 'Items received',
    align: 'right',
    sortValue: (p) => p.itemsCount,
    render: (p) => (
      <span className="font-mono tabular-nums">
        {p.itemsCount} {p.itemsCount === 1 ? 'item' : 'items'}
      </span>
    ),
  },
  {
    key: 'total',
    header: 'Invoice value',
    align: 'right',
    sortValue: (p) => p.grandTotal,
    render: (p) => <span className="font-mono font-bold tabular-nums text-zinc-950">{formatInr(p.grandTotal)}</span>,
  },
  {
    key: 'status',
    header: 'Payment status',
    sortValue: (p) => p.paymentStatus,
    render: (p) => (
      <Badge dot tone={STATUS_TONE[p.paymentStatus] ?? 'neutral'}>
        {p.paymentStatus}
      </Badge>
    ),
  },
];

export function InwardsTable({ purchases, loading, error, onRetry }: InwardsTableProps) {
  return (
    <DataTable
      rows={purchases}
      columns={columns}
      rowKey={(p) => p.id ?? p._id ?? p.grnNumber}
      loading={loading}
      error={error}
      onRetry={onRetry}
      searchText={(p) => `${p.grnNumber} ${p.supplierName} ${p.supplierInvoiceNumber ?? ''}`}
      searchPlaceholder="Search GRN #, supplier, bill #…"
      emptyTitle="No inward shipments recorded"
      emptyDescription='Use "Inward Stock (GRN)" to log distributor deliveries.'
    />
  );
}
