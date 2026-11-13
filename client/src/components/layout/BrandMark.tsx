import { cn } from '../ui/cn';

interface BrandMarkProps {
  /** Second line under the product name (the store's business name). */
  subtitle?: string;
  compact?: boolean;
}

/** RetailPOS swirl mark + wordmark, for the app shell (light, or navy in dark theme). */
export function BrandMark({ subtitle, compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-2.5 min-w-0 select-none">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary-600 shrink-0">
        <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden>
          <path
            d="M17.5 4.5C10.5 4.5 5 10 5 17C5 21.2 7 24.8 10.2 27.2C9.5 24 10.2 20.5 12.5 18C11.5 16.5 11 14.8 11 13C11 9.5 13.5 7 17 7C19.2 7 21 8.2 22 10C24 8.5 26.2 7.2 28.5 6.2C25.5 5.2 21.5 4.5 17.5 4.5Z"
            fill="#ffffff"
          />
          <path
            d="M14.5 27.5C21.5 27.5 27 22 27 15C27 10.8 25 7.2 21.8 4.8C22.5 8 21.8 11.5 19.5 14C20.5 15.5 21 17.2 21 19C21 22.5 18.5 25 15 25C12.8 25 11 23.8 10 22C8 23.5 5.8 24.8 3.5 25.8C6.5 26.8 10.5 27.5 14.5 27.5Z"
            fill="#ef4444"
          />
        </svg>
      </span>
      {!compact && (
        <span className="min-w-0 leading-tight">
          <span className="block text-[0.6875rem] font-bold text-shell-muted">
            Retail<span className="text-red-600">POS</span>
          </span>
          <span className={cn('block text-[0.9375rem] font-extrabold text-shell-text truncate max-w-[10rem]')}>
            {subtitle || 'Vendora'}
          </span>
        </span>
      )}
    </div>
  );
}
