import { useMemo } from 'react';
import type { Column } from '@/components/tables';
import { Badge } from '@/components/ui/Badge';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { labelOf } from '../../shared/options';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { ParamFields } from './ParamFields';
import {
  PARAM_DEFAULTS,
  PARAM_MODULES,
  PARAM_RESOURCE,
  paramSchema,
  type Param,
  type ParamInput,
} from './param.schema';

function ParamValue({ param }: { param: Param }) {
  if (param.valueType === 'yesno') {
    return <Badge tone={param.value === 'YES' ? 'success' : 'neutral'}>{param.value === 'YES' ? 'Yes' : 'No'}</Badge>;
  }
  return <span className="font-mono">{param.value || '—'}</span>;
}

const COLUMNS: Column<Param>[] = [
  {
    key: 'module',
    header: 'Module',
    sortValue: (r) => r.module,
    render: (r) => <Badge tone="primary">{labelOf(PARAM_MODULES, r.module)}</Badge>,
  },
  {
    key: 'code',
    header: 'Key',
    sortValue: (r) => r.code,
    render: (r) => <span className="font-mono font-bold text-primary-700">{r.code}</span>,
  },
  {
    key: 'description',
    header: 'Description',
    render: (r) => <span className="font-semibold text-zinc-900">{r.description}</span>,
  },
  { key: 'value', header: 'Value', align: 'center', render: (r) => <ParamValue param={r} /> },
];

/** Master › General › Param: store-wide settings as key / value pairs. */
export function ParamTab() {
  const list = useLocalMaster<Param>(PARAM_RESOURCE);
  const editor = useMasterEditor<Param>();
  const schema = useMemo(() => paramSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  return (
    <>
      <MasterListView
        noun="parameter"
        description="Store-wide settings as key / value pairs, grouped by module."
        rows={list.rows}
        columns={COLUMNS}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.description} ${labelOf(PARAM_MODULES, r.module)}`}
        searchPlaceholder="Search key, description or module"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
      />
      <MasterFormDialog
        open={editor.open}
        noun="parameter"
        description="A store-wide setting"
        schema={schema}
        defaults={PARAM_DEFAULTS}
        initial={(editor.editing as ParamInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <ParamFields />
      </MasterFormDialog>
    </>
  );
}
