import { useMemo, useState } from 'react';
import { Plus, MagnifyingGlass, SquaresFour, List as ListIcon, PencilSimple, Trash } from '@phosphor-icons/react';
import { ms } from '@/components/ui/ms';
import { Spinner, Alert } from '@/components/ui';
import { useConfirm } from '@/hooks/useConfirm';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { StatusBadge } from '../../shared/StatusBadge';
import {
  TRANSPORTER_DEFAULTS,
  TRANSPORTER_RESOURCE,
  transporterSchema,
  type Transporter,
  type TransporterInput,
} from './transporter.schema';
import { TransporterFields } from './TransporterFields';

/**
 * TransportManagementCard renders Operations › Transport with live database data
 * from /master/transporters, real-time search, add/edit form, and delete support.
 */
export function TransportManagementCard() {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const confirm = useConfirm();

  const list = useLocalMaster<Transporter>(TRANSPORTER_RESOURCE);
  const editor = useMasterEditor<Transporter>();
  const schema = useMemo(() => transporterSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  const TransportIcon = ms('local_shipping');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list.rows;
    return list.rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        (r.transporterId && r.transporterId.toLowerCase().includes(q)),
    );
  }, [list.rows, search]);

  const paged = useMemo(() => filtered.slice(0, pageSize), [filtered, pageSize]);

  const handleDelete = async (r: Transporter) => {
    const ok = await confirm({
      title: `Delete ${r.name}?`,
      message: `Are you sure you want to remove transporter ${r.code}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok && list.remove) {
      await list.remove(r.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 space-y-6 shadow-none">
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Entries Count Selector */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-8 px-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
          <span className="text-slate-400 font-normal ml-1">{list.rows.length} records</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={editor.openAdd}
            className="h-9 px-4 rounded-lg bg-[#005bbf] hover:bg-[#004fa8] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>Add transporter</span>
          </button>

          <div className="inline-flex items-center p-0.5 rounded-lg border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400'}`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400'}`}
              title="Grid view"
            >
              <SquaresFour className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, code or transporter ID"
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005bbf] focus:ring-2 focus:ring-blue-500/15 transition-all"
        />
      </div>

      {list.error && (
        <Alert tone="error">
          Failed to load transporters from database.
          <button type="button" onClick={list.reload} className="ml-2 font-bold underline cursor-pointer">
            Retry
          </button>
        </Alert>
      )}

      {list.loading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Spinner size="md" />
          <p className="text-xs text-slate-400">Loading transporters from database…</p>
        </div>
      )}

      {/* Empty State matching Image 3 */}
      {!list.loading && filtered.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-2 select-none">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mb-1">
            <TransportIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-400">
            {search ? 'No transporters match your search query.' : 'No transporters yet — add one.'}
          </p>
        </div>
      )}

      {/* Records Table / Grid */}
      {!list.loading && filtered.length > 0 && viewMode === 'list' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Transporter Name</th>
                <th className="py-3 px-4">Transporter ID</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paged.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary-700">{r.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{r.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{r.transporterId || '—'}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{r.phone || '—'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge active={r.active} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editor.openEdit(r)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title={`Edit ${r.name}`}
                      >
                        <PencilSimple className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title={`Delete ${r.name}`}
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid Mode */}
      {!list.loading && filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 p-4 space-y-3 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-primary-700">{r.code}</span>
                  <h4 className="font-bold text-sm text-slate-900">{r.name}</h4>
                </div>
                <StatusBadge active={r.active} />
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                {r.transporterId && <p>ID: <span className="font-mono text-slate-700">{r.transporterId}</span></p>}
                {r.phone && <p>Phone: <span className="font-mono text-slate-700">{r.phone}</span></p>}
                {r.address && <p className="truncate text-slate-500">{r.address}</p>}
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => editor.openEdit(r)}
                  className="px-2.5 py-1 text-xs rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
                  className="px-2.5 py-1 text-xs rounded-md border border-slate-200 hover:bg-rose-50 text-rose-600 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
