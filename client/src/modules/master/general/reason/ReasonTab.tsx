import { useMemo } from 'react';
import type { Column } from '@/components/tables';
import { Badge } from '@/components/ui/Badge';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { labelOf } from '../../shared/options';
import { ReasonFields } from './ReasonFields';
import {
  EFFECTS,
  REASON_DEFAULTS,
  REASON_RESOURCE,
  TRANSACTION_TYPES,
  reasonSchema,
  type Reason,
  type ReasonInput,
} from './reason.schema';

const COLUMNS: Column<Reason>[] = [
  {
    key: 'code',
    header: 'Code',
    sortValue: (r) => r.code,
    render: (r) => <span className="font-mono font-bold text-primary-700">{r.code}</span>,
  },
  {
    key: 'description',
    header: 'Description',
    sortValue: (r) => r.description.toLowerCase(),
    render: (r) => <span className="font-semibold text-zinc-900">{r.description}</span>,
  },
  { key: 'reasonFor', header: 'Reason for', render: (r) => r.reasonFor || '—' },
  {
    key: 'type',
    header: 'Transaction type',
    sortValue: (r) => r.transactionType,
    render: (r) => labelOf(TRANSACTION_TYPES, r.transactionType),
  },
  {
    key: 'effect',
    header: 'Addition / deduction',
    align: 'center',
    render: (r) => <Badge tone={r.effect === 'addition' ? 'success' : 'danger'}>{labelOf(EFFECTS, r.effect)}</Badge>,
  },
];

/** Master › General › Reason: why a return, adjustment or transfer was raised. */
export function ReasonTab() {
  const list = useLocalMaster<Reason>(REASON_RESOURCE);
  const editor = useMasterEditor<Reason>();
  const schema = useMemo(() => reasonSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  return (
    <>
      <MasterListView
        noun="reason"
        description="Reasons picked on returns, stock adjustments and transfers."
        rows={list.rows}
        columns={COLUMNS}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.description} ${labelOf(TRANSACTION_TYPES, r.transactionType)}`}
        searchPlaceholder="Search reason, transaction type or code"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
      />
      <MasterFormDialog
        open={editor.open}
        noun="reason"
        description="Why a document or adjustment was raised"
        schema={schema}
        defaults={REASON_DEFAULTS}
        initial={(editor.editing as ReasonInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <ReasonFields />
      </MasterFormDialog>
    </>
  );
}
