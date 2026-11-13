import { useState } from 'react';
import { Plus, MagnifyingGlass, SquaresFour, List } from '@phosphor-icons/react';
import { ms } from '@/components/ui/ms';

/**
 * TransportManagementCard renders the Operations > Transport view matching Image 3:
 * show entries selector, add transporter action, search input, and empty state.
 */
export function TransportManagementCard() {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const TransportIcon = ms('local_shipping');

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
          <span className="text-slate-400 font-normal ml-1">0 records</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
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
              <List className="w-4 h-4" />
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

      {/* Empty State matching Image 3 */}
      <div className="py-20 text-center flex flex-col items-center justify-center gap-2 select-none">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mb-1">
          <TransportIcon className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-400">No transporters yet — add one.</p>
      </div>
    </div>
  );
}
