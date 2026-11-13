import { useMemo } from 'react';
import type { Column } from '@/components/tables';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { WarehouseFields } from './WarehouseFields';
import {
  WAREHOUSE_DEFAULTS,
  WAREHOUSE_RESOURCE,
  warehouseSchema,
  type Warehouse,
  type WarehouseInput,
} from './warehouse.schema';

const dash = (v?: string | null) => v || '—';

const COLUMNS: Column<Warehouse>[] = [
  {
    key: 'code',
    header: 'Code',
    sortValue: (r) => r.code,
    render: (r) => <span className="font-mono font-bold text-primary-700">{r.code}</span>,
  },
  {
    key: 'name',
    header: 'Name',
    sortValue: (r) => r.name.toLowerCase(),
    render: (r) => <span className="font-semibold text-zinc-900">{r.name}</span>,
  },
  { key: 'address1', header: 'Address 1', render: (r) => dash(r.address1) },
  { key: 'pincode', header: 'PIN', render: (r) => <span className="font-mono">{dash(r.pincode)}</span> },
  { key: 'phone', header: 'Phone', render: (r) => <span className="font-mono">{dash(r.phone)}</span> },
  {
    key: 'handling',
    header: 'Handling %',
    align: 'right',
    sortValue: (r) => r.handlingPercent,
    render: (r) => <span className="font-mono tabular-nums">{r.handlingPercent}%</span>,
  },
];

/** Master › General › Warehouse: stocking points locations can draw from. */
export function WarehouseTab() {
  const list = useLocalMaster<Warehouse>(WAREHOUSE_RESOURCE);
  const editor = useMasterEditor<Warehouse>();
  const schema = useMemo(() => warehouseSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  return (
    <>
      <MasterListView
        noun="warehouse"
        description="Stocking points that locations can draw stock from."
        rows={list.rows}
        columns={COLUMNS}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.name} ${r.address1 ?? ''} ${r.pincode ?? ''}`}
        searchPlaceholder="Search code, name or PIN"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
      />
      <MasterFormDialog
        open={editor.open}
        noun="warehouse"
        description="A stocking point locations can draw from"
        schema={schema}
        defaults={WAREHOUSE_DEFAULTS}
        initial={(editor.editing as WarehouseInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <WarehouseFields />
      </MasterFormDialog>
    </>
  );
}
