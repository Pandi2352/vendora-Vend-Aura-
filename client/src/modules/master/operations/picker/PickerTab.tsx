import { useMemo } from 'react';
import type { Column } from '@/components/tables';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { StatusBadge } from '../../shared/StatusBadge';
import { PickerFields } from './PickerFields';
import {
  PICKER_DEFAULTS,
  PICKER_RESOURCE,
  pickerSchema,
  type PickerRecord,
  type PickerInput,
} from './picker.schema';

const dash = (v?: string | null) => v || '—';

const COLUMNS: Column<PickerRecord>[] = [
  {
    key: 'code',
    header: 'Badge Code',
    sortValue: (r) => r.code,
    render: (r) => <span className="font-mono font-bold text-primary-700">{r.code}</span>,
  },
  {
    key: 'name',
    header: 'Picker Name',
    sortValue: (r) => r.name.toLowerCase(),
    render: (r) => <span className="font-semibold text-zinc-900">{r.name}</span>,
  },
  {
    key: 'assignedZone',
    header: 'Assigned Aisle / Zone',
    render: (r) => <span className="text-zinc-700">{dash(r.assignedZone)}</span>,
  },
  {
    key: 'phone',
    header: 'Mobile Phone',
    render: (r) => <span className="font-mono">{dash(r.phone)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge active={r.active} />,
  },
];

/** Master › Operations › Picker: floor picking and order fulfillment staff. */
export function PickerTab() {
  const list = useLocalMaster<PickerRecord>(PICKER_RESOURCE);
  const editor = useMasterEditor<PickerRecord>();
  const schema = useMemo(() => pickerSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  return (
    <>
      <MasterListView
        noun="picker"
        description="Warehouse and store floor staff assigned to order picking, packing, and dispatch."
        rows={list.rows}
        columns={COLUMNS}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.name} ${r.assignedZone ?? ''} ${r.phone ?? ''}`}
        searchPlaceholder="Search code, name, zone or phone"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
      />
      <MasterFormDialog
        open={editor.open}
        noun="picker"
        description="A store picker or fulfillment staff member"
        schema={schema}
        defaults={PICKER_DEFAULTS}
        initial={(editor.editing as PickerInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <PickerFields />
      </MasterFormDialog>
    </>
  );
}
