import { useId, useMemo, useState, type ReactNode } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Pagination } from './Pagination';
import { Dropdown, type DropdownOption } from '../../ui/dropdown';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  /** Tailwind width class, e.g. 'w-40' */
  width?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Text searched by the search box; omit to hide the search box. */
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  /** Extra filter controls shown between the page-size selector and the search box. */
  filters?: ReactNode;
  emptyMessage?: string;
  pageSizeOptions?: number[];
  /** Show the S.No column (default true). */
  showIndex?: boolean;
  /** Hide toolbar and footer for small embedded tables. */
  compact?: boolean;
}

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

/**
 * Admin data table: "Show N entries", search, slate header band, S.No column,
 * "N records · page x of y" footer and pagination. Rounded-md, no shadows.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = 'Search…',
  filters,
  emptyMessage = 'No records found.',
  pageSizeOptions = [10, 25, 50, 100],
  showIndex = true,
  compact = false,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [page, setPage] = useState(1);
  const pageSizeLabelId = useId();
  const pageSizeItems = useMemo<DropdownOption<number>[]>(
    () => pageSizeOptions.map((n) => ({ value: n, label: String(n) })),
    [pageSizeOptions],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : rows;
  }, [rows, query, searchText]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visible = compact ? filtered : filtered.slice(start, start + pageSize);

  const headerCell =
    'relative px-4 py-3 text-[13px] font-bold text-table-head-text whitespace-nowrap after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-px after:bg-slate-500/25 last:after:hidden';

  return (
    <div className={compact ? '' : 'bg-white border border-zinc-200 rounded-md p-3 sm:p-4'}>
      {!compact && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <span id={pageSizeLabelId}>Show</span>
              <Dropdown
                aria-labelledby={pageSizeLabelId}
                options={pageSizeItems}
                value={pageSize}
                onChange={(v) => {
                  if (v === null) return;
                  setPageSize(v);
                  setPage(1);
                }}
                searchable={false}
                wrapperClassName="w-20"
                className="font-semibold"
              />
              <span>entries</span>
            </div>
            <span className="text-xs text-zinc-400">
              {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
            </span>
            {filters}
          </div>

          {searchText && (
            <div className="relative w-full lg:w-80">
              <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-zinc-200 bg-zinc-50 text-sm outline-none focus:border-red-600 focus:bg-white"
              />
            </div>
          )}
        </div>
      )}

      <div className="border border-table-line rounded-md overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-table-head">
            <tr>
              {showIndex && <th className={`${headerCell} w-16 text-center`}>S.No</th>}
              {columns.map((col) => (
                <th key={col.key} scope="col" className={`${headerCell} ${ALIGN[col.align ?? 'left']} ${col.width ?? ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showIndex ? 1 : 0)} className="px-4 py-10 text-center text-sm text-zinc-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visible.map((row, i) => (
                <tr key={rowKey(row)} className="border-t border-zinc-100 hover:bg-slate-50 transition-colors">
                  {showIndex && <td className="px-4 py-3 text-center text-zinc-400 tabular-nums">{start + i + 1}</td>}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-zinc-800 align-middle ${ALIGN[col.align ?? 'left']}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
          <p className="text-xs text-zinc-400">
            {filtered.length} records · page {currentPage} of {pageCount}
          </p>
          <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
