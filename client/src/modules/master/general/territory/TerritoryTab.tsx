import { useMemo } from 'react';
import { CaretRight, FolderSimple, MapPin } from '@phosphor-icons/react';
import type { Column } from '@/components/tables';
import { Badge } from '@/components/ui/Badge';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { TerritoryFields } from './TerritoryFields';
import {
  TERRITORY_DEFAULTS,
  TERRITORY_RESOURCE,
  subtreeIds,
  territorySchema,
  territoryTree,
  type Territory,
  type TerritoryInput,
  type TerritoryRow,
} from './territory.schema';

/** Master › General › Territory: sales areas as a tree of groups and territories. */
export function TerritoryTab() {
  const list = useLocalMaster<Territory>(TERRITORY_RESOURCE);
  const editor = useMasterEditor<Territory>();
  const schema = useMemo(() => territorySchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);
  const tree = useMemo(() => territoryTree(list.rows), [list.rows]);
  const nameOf = useMemo(() => new Map(list.rows.map((r) => [r.id, r.name])), [list.rows]);

  const groupOptions = useMemo(() => {
    const blocked = editor.editing ? subtreeIds(list.rows, editor.editing.id) : new Set<string>();
    return tree
      .filter((r) => r.isGroup && r.active && !blocked.has(r.id))
      .map((r) => ({ value: r.id, label: `${'— '.repeat(r.depth)}${r.name}`, description: r.code }));
  }, [tree, list.rows, editor.editing]);

  const columns: Column<TerritoryRow>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (r) => <span className="font-mono font-bold text-primary-700">{r.code}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5" style={{ paddingLeft: `${r.depth * 1.25}rem` }}>
          {r.depth > 0 && <CaretRight aria-hidden className="w-3 h-3 text-zinc-300" />}
          {r.isGroup ? (
            <FolderSimple aria-hidden weight="duotone" className="w-4 h-4 text-amber-600" />
          ) : (
            <MapPin aria-hidden weight="duotone" className="w-4 h-4 text-primary-600" />
          )}
          <span className="font-semibold text-zinc-900">{r.name}</span>
        </span>
      ),
    },
    { key: 'parent', header: 'Under group', render: (r) => (r.parentId && nameOf.get(r.parentId)) || 'Top level' },
    {
      key: 'type',
      header: 'Type',
      align: 'center',
      render: (r) => <Badge tone={r.isGroup ? 'warning' : 'primary'}>{r.isGroup ? 'Group' : 'Territory'}</Badge>,
    },
  ];

  return (
    <>
      <MasterListView<TerritoryRow>
        noun="territory"
        description="Sales areas. Groups (e.g. South Zone) hold territories (e.g. Chennai)."
        rows={tree}
        columns={columns}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.name}`}
        searchPlaceholder="Search code or name"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
        canDelete={(r) =>
          list.rows.some((t) => t.parentId === r.id) ? 'Move or delete the territories under it first.' : null
        }
      />
      <MasterFormDialog
        open={editor.open}
        noun="territory"
        description="A sales area, optionally under a group"
        schema={schema}
        defaults={TERRITORY_DEFAULTS}
        initial={(editor.editing as TerritoryInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <TerritoryFields groups={groupOptions} />
      </MasterFormDialog>
    </>
  );
}
