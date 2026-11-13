import { useMemo } from 'react';
import type { Column } from '@/components/tables';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { StatusBadge } from '../../shared/StatusBadge';
import { BarcodeFields } from './BarcodeFields';
import {
  BARCODE_DEFAULTS,
  BARCODE_RESOURCE,
  barcodeSchema,
  type BarcodeRecord,
  type BarcodeInput,
} from './barcode.schema';

const COLUMNS: Column<BarcodeRecord>[] = [
  {
    key: 'code',
    header: 'Template Code',
    sortValue: (r) => r.code,
    render: (r) => <span className="font-mono font-bold text-primary-700">{r.code}</span>,
  },
  {
    key: 'name',
    header: 'Template Name',
    sortValue: (r) => r.name.toLowerCase(),
    render: (r) => <span className="font-semibold text-zinc-900">{r.name}</span>,
  },
  {
    key: 'dimensions',
    header: 'Size (W x H)',
    render: (r) => <span className="font-mono text-zinc-700">{r.paperWidthMm} × {r.paperHeightMm} mm</span>,
  },
  {
    key: 'columns',
    header: 'Columns',
    align: 'right',
    render: (r) => <span className="font-mono text-zinc-600">{r.columns} across</span>,
  },
  {
    key: 'printerType',
    header: 'Type',
    render: (r) => <span className="capitalize font-medium text-zinc-600">{r.printerType}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge active={r.active} />,
  },
];

/** Master › Operations › Barcode Printer: sticker dimensions and templates. */
export function BarcodeTab() {
  const list = useLocalMaster<BarcodeRecord>(BARCODE_RESOURCE);
  const editor = useMasterEditor<BarcodeRecord>();
  const schema = useMemo(() => barcodeSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  return (
    <>
      <MasterListView
        noun="barcode label template"
        description="Printer templates, sticker dimensions, and layouts for product barcode labels."
        rows={list.rows}
        columns={COLUMNS}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.name} ${r.printerType}`}
        searchPlaceholder="Search code, name or printer"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
      />
      <MasterFormDialog
        open={editor.open}
        noun="barcode label template"
        description="A label dimension profile for thermal or sheet barcode printing"
        schema={schema}
        defaults={BARCODE_DEFAULTS}
        initial={(editor.editing as BarcodeInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <BarcodeFields />
      </MasterFormDialog>
    </>
  );
}

