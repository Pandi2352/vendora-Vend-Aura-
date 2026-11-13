import { useMemo } from 'react';
import type { Column } from '@/components/tables';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { StatusBadge } from '../../shared/StatusBadge';
import { TransporterFields } from './TransporterFields';
import {
  TRANSPORTER_DEFAULTS,
  TRANSPORTER_RESOURCE,
  transporterSchema,
  type Transporter,
  type TransporterInput,
} from './transporter.schema';

const dash = (v?: string | null) => v || '—';

const COLUMNS: Column<Transporter>[] = [
  {
    key: 'code',
    header: 'Code',
    sortValue: (r) => r.code,
    render: (r) => <span className="font-mono font-bold text-primary-700">{r.code}</span>,
  },
  {
    key: 'name',
    header: 'Transporter Name',
    sortValue: (r) => r.name.toLowerCase(),
    render: (r) => <span className="font-semibold text-zinc-900">{r.name}</span>,
  },
  {
    key: 'transporterId',
    header: 'Transporter ID',
    render: (r) => <span className="font-mono text-zinc-600">{dash(r.transporterId)}</span>,
  },
  {
    key: 'phone',
    header: 'Telephone',
    render: (r) => <span className="font-mono">{dash(r.phone)}</span>,
  },
  {
    key: 'address',
    header: 'Depot Address',
    render: (r) => <span className="truncate max-w-xs">{dash(r.address)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge active={r.active} />,
  },
];

/** Master › Operations › Transport: carriers and logistics partners. */
export function TransportTab() {
  const list = useLocalMaster<Transporter>(TRANSPORTER_RESOURCE);
  const editor = useMasterEditor<Transporter>();
  const schema = useMemo(() => transporterSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  return (
    <>
      <MasterListView
        noun="transporter"
        description="Carriers and logistics partners for dispatching stock and customer deliveries."
        rows={list.rows}
        columns={COLUMNS}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.name} ${r.transporterId ?? ''} ${r.phone ?? ''}`}
        searchPlaceholder="Search code, name or transporter ID"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
      />
      <MasterFormDialog
        open={editor.open}
        noun="transporter"
        description="A registered carrier or logistics partner for goods movement"
        schema={schema}
        defaults={TRANSPORTER_DEFAULTS}
        initial={(editor.editing as TransporterInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <TransporterFields />
      </MasterFormDialog>
    </>
  );
}

