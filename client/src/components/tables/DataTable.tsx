import { useMemo, useState, type ReactNode } from 'react';
import { CaretDown, CaretUp, CaretUpDown, MagnifyingGlass } from '@phosphor-icons/react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../ui/cn';
import { EmptyState, ErrorState } from '../feedback/StateViews';
import { TablePagination } from './TablePagination';
import { useDebouncedValue } from '@/hooks/common';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Enables header click sorting by this value. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  align?: 'left' | 'center' | 'right';
  /** Tailwind width class, e.g. 'w-40'. */
  width?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Text searched by the search box; omit to hide it. */
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  /** Extra filter controls in the toolbar. */
  toolbar?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  pageSizeOptions?: number[];
  showIndex?: boolean;
  /** No toolbar / footer (small embedded tables). */
  compact?: boolean;
  onRowClick?: (row: T) => void;
  /** Sort applied on first render, e.g. { key: 'date', direction: 'desc' }. */
  initialSort?: { key: string; direction: 'asc' | 'desc' };
}

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

/**
 * Data table: "Show N entries", debounced search, sortable headers, S.No,
 * loading skeleton, empty / error states, "N records · page x of y" + pagination.
 * Wide tables scroll horizontally on small screens.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = 'Search…',
  toolbar,
  loading = false,
  error,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription,
  pageSizeOptions = [10, 25, 50, 100],
  showIndex = true,
  compact = false,
  onRowClick,
  initialSort,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 200);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(initialSort ?? null);

  const processed = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let list = q && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : rows;
    const column = sort && columns.find((c) => c.key === sort.key);
    if (sort && column?.sortValue) {
      const dir = sort.direction === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        const va = column.sortValue!(a);
        const vb = column.sortValue!(b);
        if (va === vb) return 0;
        if (va === null || va === undefined) return 1;
        if (vb === null || vb === undefined) return -1;
        if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir;
        return (Number(va) - Number(vb)) * dir;
      });
    }
    return list;
  }, [rows, debouncedQuery, searchText, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const current = Math.min(page, pageCount);
  const start = compact ? 0 : (current - 1) * pageSize;
  const visible = compact ? processed : processed.slice(start, start + pageSize);
  const colSpan = columns.length + (showIndex ? 1 : 0);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, direction: 'asc' } : s.direction === 'asc' ? { key, direction: 'desc' } : null));

  const headerCell =
    'relative px-4 py-3 text-[13px] font-bold text-slate-800 whitespace-nowrap after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-px after:bg-slate-500/25 last:after:hidden';

  return (
    <div className={compact ? '' : 'bg-white border border-zinc-200 rounded-md p-3 sm:p-4'}>
      {!compact && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            <span>Show</span>
            <div className="w-20">
              <Dropdown<number>
                aria-label="Rows per page"
                options={pageSizeOptions.map((n) => ({ value: n, label: String(n) }))}
                value={pageSize}
                onChange={(v) => {
                  if (v) setPageSize(v);
                  setPage(1);
                }}
              />
            </div>
            <span>entries</span>
            <span className="text-xs text-zinc-400" aria-live="polite">
              {processed.length} {processed.length === 1 ? 'record' : 'records'}
            </span>
            {toolbar}
          </div>
          {searchText && (
            <div className="relative w-full lg:w-80">
              <MagnifyingGlass aria-hidden className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-zinc-300 bg-white text-sm outline-none hover:border-zinc-400 focus:border-primary-600 focus:outline-2 focus:outline-primary-100"
              />
            </div>
          )}
        </div>
      )}

      <div className="border border-slate-200 rounded-md overflow-x-auto">
        <table className="w-full border-collapse text-sm" aria-busy={loading || undefined}>
          <thead className="bg-[#c4cfdf] dark:bg-zinc-200">
            <tr>
              {showIndex && (
                <th scope="col" className={cn(headerCell, 'w-16 text-center')}>
                  S.No
                </th>
              )}
              {columns.map((col) => {
                const sorted = sort?.key === col.key ? sort.direction : null;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                    className={cn(headerCell, ALIGN[col.align ?? 'left'], col.width)}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn('inline-flex items-center gap-1 cursor-pointer hover:text-primary-700', col.align === 'right' && 'flex-row-reverse')}
                      >
                        {col.header}
                        {sorted === 'asc' ? (
                          <CaretUp className="w-3 h-3" />
                        ) : sorted === 'desc' ? (
                          <CaretDown className="w-3 h-3" />
                        ) : (
                          <CaretUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={`sk-${i}`} className="border-t border-zinc-100">
                  {Array.from({ length: colSpan }, (__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-40" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={colSpan}>
                  <ErrorState description={error} onRetry={onRetry} />
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
                  <EmptyState title={debouncedQuery ? 'No matching records' : emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              visible.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn('border-t border-zinc-100 hover:bg-slate-50 transition-colors', onRowClick && 'cursor-pointer')}
                >
                  {showIndex && <td className="px-4 py-3 text-center text-zinc-400 tabular-nums">{start + i + 1}</td>}
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-zinc-800 align-middle', ALIGN[col.align ?? 'left'])}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!compact && !error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
          <p className="text-xs text-zinc-400">
            {processed.length} records · page {current} of {pageCount}
          </p>
          <TablePagination page={current} pageCount={pageCount} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
