import { useMemo } from 'react';
import type { Column } from '@/components/tables';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { StatusBadge } from '../../shared/StatusBadge';
import { FreightFields } from './FreightFields';
import {
  FREIGHT_DEFAULTS,
  FREIGHT_RESOURCE,
  freightSchema,
  type FreightRecord,
  type FreightInput,
} from './freight.schema';

const formatRate = (r: FreightRecord) => {
  if (r.rateType === 'percentage') return `${r.rate}%`;
  if (r.rateType === 'per-kg') return `₹${r.rate} / kg`;
  return `₹${r.rate}`;
};

const COLUMNS: Column<FreightRecord>[] = [
  {
    key: 'code',
    header: 'Code',
    sortValue: (r) => r.code,
    render: (r) => <span className="font-mono font-bold text-primary-700">{r.code}</span>,
  },
  {
    key: 'name',
    header: 'Rule Name',
    sortValue: (r) => r.name.toLowerCase(),
    render: (r) => <span className="font-semibold text-zinc-900">{r.name}</span>,
  },
  {
    key: 'rate',
    header: 'Charge Rate',
    align: 'right',
    sortValue: (r) => r.rate,
    render: (r) => <span className="font-mono font-bold text-emerald-700">{formatRate(r)}</span>,
  },
  {
    key: 'minAmount',
    header: 'Min Charge',
    align: 'right',
    render: (r) => <span className="font-mono text-zinc-600">₹{r.minAmount ?? 0}</span>,
  },
  {
    key: 'applicableOn',
    header: 'Scope',
    render: (r) => <span className="capitalize font-medium text-zinc-600">{r.applicableOn}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge active={r.active} />,
  },
];

/** Master › Operations › Freight: transport surcharge and delivery rates. */
export function FreightTab() {
  const list = useLocalMaster<FreightRecord>(FREIGHT_RESOURCE);
  const editor = useMasterEditor<FreightRecord>();
  const schema = useMemo(() => freightSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  return (
    <>
      <MasterListView
        noun="freight charge rule"
        description="Delivery slabs and freight surcharges applied during dispatch or stock transfer."
        rows={list.rows}
        columns={COLUMNS}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.name} ${r.applicableOn}`}
        searchPlaceholder="Search code, name or scope"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
      />
      <MasterFormDialog
        open={editor.open}
        noun="freight charge rule"
        description="A freight calculation slab or surcharge rule"
        schema={schema}
        defaults={FREIGHT_DEFAULTS}
        initial={(editor.editing as FreightInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <FreightFields />
      </MasterFormDialog>
    </>
  );
}
