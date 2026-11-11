import { DataTable, type Column } from '@/components/tables';
import { Badge } from '@/components/ui';
import type { ShiftSummary } from '@/types/shift-return.types';
import { formatDate, formatInr } from '@/utils';

interface ShiftHistoryTabProps {
  historyList: ShiftSummary[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function VarianceBadge({ variance = 0 }: { variance?: number }) {
  if (variance === 0) return <Badge tone="success" dot>Balanced</Badge>;
  return variance > 0 ? (
    <Badge tone="success" dot>{`+${formatInr(variance)}`}</Badge>
  ) : (
    <Badge tone="danger" dot>{`-${formatInr(Math.abs(variance))}`}</Badge>
  );
}

const columns: Column<ShiftSummary>[] = [
  {
    key: 'shift',
    header: 'Shift',
    sortValue: (s) => s.shiftNumber,
    render: (s) => (
      <div>
        <span className="font-mono font-bold text-zinc-900">{s.shiftNumber}</span>
        <span className="block text-[11px] text-zinc-500">by {s.cashierName}</span>
      </div>
    ),
  },
  { key: 'opened', header: 'Opened', sortValue: (s) => new Date(s.openedAt), render: (s) => formatDate(s.openedAt) },
  { key: 'float', header: 'Float', align: 'right', sortValue: (s) => s.openingFloat, render: (s) => formatInr(s.openingFloat) },
  {
    key: 'sales',
    header: 'Cash sales',
    align: 'right',
    sortValue: (s) => s.cashSalesTotal,
    render: (s) => formatInr(s.cashSalesTotal),
  },
  {
    key: 'counted',
    header: 'Counted',
    align: 'right',
    sortValue: (s) => s.actualCashCounted ?? 0,
    render: (s) => <span className="font-mono font-bold">{formatInr(s.actualCashCounted)}</span>,
  },
  { key: 'variance', header: 'Variance', sortValue: (s) => s.variance ?? 0, render: (s) => <VarianceBadge variance={s.variance} /> },
];

export function ShiftHistoryTab({ historyList, loading, error, onRetry }: ShiftHistoryTabProps) {
  return (
    <DataTable
      compact
      rows={historyList}
      columns={columns}
      rowKey={(s) => s._id ?? s.id ?? s.shiftNumber}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No past shifts recorded yet"
    />
  );
}
