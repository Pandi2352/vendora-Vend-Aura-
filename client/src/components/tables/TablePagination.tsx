import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from '../ui/cn';
import { pageWindow } from './pageWindow';

const btn =
  'min-w-8 h-8 px-2 inline-flex items-center justify-center rounded-md border text-xs font-semibold transition-colors';

export function TablePagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(
          btn,
          'border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        )}
      >
        <CaretLeft className="w-3.5 h-3.5" />
      </button>
      {pageWindow(page, pageCount).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-zinc-400" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
            className={cn(
              btn,
              'cursor-pointer',
              p === page
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        className={cn(
          btn,
          'border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        )}
      >
        <CaretRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
}
