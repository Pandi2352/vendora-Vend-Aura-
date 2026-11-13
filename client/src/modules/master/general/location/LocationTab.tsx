import { useMemo } from 'react';
import type { Column } from '@/components/tables';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { useMasterCollection } from '../../shared/data/useMasterCollection';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { WAREHOUSE_RESOURCE, type Warehouse } from '../warehouse/warehouse.schema';
import { LocationFields } from './LocationFields';
import { LOCATION_DEFAULTS, locationSchema, type Location, type LocationInput } from './location.schema';
import { outletAdapter } from './outletAdapter';

const dash = (v?: string | null) => v || '—';

/** Master › General › Location: the store's branches / outlets. */
export function LocationTab() {
  const adapter = useMemo(() => outletAdapter(), []);
  const list = useMasterCollection(adapter);
  const warehouses = useLocalMaster<Warehouse>(WAREHOUSE_RESOURCE);
  const editor = useMasterEditor<Location>();
  const schema = useMemo(() => locationSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  const warehouseName = useMemo(
    () => new Map(warehouses.rows.map((w) => [w.id, `${w.code} · ${w.name}`])),
    [warehouses.rows],
  );
  const warehouseOptions = useMemo(
    () => warehouses.rows.filter((w) => w.active).map((w) => ({ value: w.id, label: w.name, description: w.code })),
    [warehouses.rows],
  );

  const columns: Column<Location>[] = [
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
    { key: 'incharge', header: 'Person in charge', render: (r) => dash(r.incharge) },
    { key: 'phone', header: 'Telephone', render: (r) => <span className="font-mono">{dash(r.phone)}</span> },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (r) =>
        r.isWarehouse ? (
          <span className="font-semibold text-emerald-700">Self</span>
        ) : (
          dash(r.warehouseId && warehouseName.get(r.warehouseId))
        ),
    },
    { key: 'sortCode', header: 'Sort code', render: (r) => <span className="font-mono">{dash(r.sortCode)}</span> },
  ];

  return (
    <>
      <MasterListView
        noun="location"
        description="Branches and outlets of this company. Bills are numbered per location."
        rows={list.rows}
        columns={columns}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.name} ${r.city ?? ''} ${r.incharge ?? ''}`}
        searchPlaceholder="Search code, name or city"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
      />
      <MasterFormDialog
        open={editor.open}
        noun="location"
        description="A branch or outlet of this company"
        schema={schema}
        defaults={LOCATION_DEFAULTS}
        initial={(editor.editing as LocationInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <LocationFields warehouses={warehouseOptions} />
      </MasterFormDialog>
    </>
  );
}
