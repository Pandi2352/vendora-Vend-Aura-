import { cn } from './cn';

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Segmented tab strip (Settings, Reports). */
export function Tabs<T extends string>({ items, value, onChange, className }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex flex-wrap items-center gap-1 p-1 bg-zinc-100 border border-zinc-200 rounded-md', className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'px-4 h-8 rounded-md text-sm font-semibold transition-colors cursor-pointer border',
              active ? 'bg-white text-primary-600 border-zinc-200' : 'text-zinc-600 hover:text-zinc-900 border-transparent',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
