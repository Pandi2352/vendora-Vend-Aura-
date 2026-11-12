import { cn } from '../cn';
import { TabBadge } from './TabBadge';
import { tabId, tabPanelId, type TabsBaseProps } from './types';
import { useSlidingIndicator } from './useSlidingIndicator';
import { useTabKeyboard } from './useTabKeyboard';

/**
 * Main-level tabs: each option is an icon tile with a label and an optional
 * second line (`description`). A light blue panel slides behind the open one
 * and its icon tile turns solid blue.
 */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  label,
  idPrefix = 'segmented',
  className,
}: TabsBaseProps<T>) {
  const { listRef, indicatorStyle } = useSlidingIndicator(value);
  const onKeyDown = useTabKeyboard(items, value, onChange, listRef);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className={cn(
        'relative inline-flex items-stretch gap-1 p-1 rounded-md bg-white border border-zinc-200',
        className,
      )}
    >
      <span
        aria-hidden="true"
        style={indicatorStyle}
        className="absolute left-0 top-1 bottom-1 rounded-md bg-primary-50 border border-primary-200 transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none"
      />
      {items.map((item) => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            id={tabId(idPrefix, item.value)}
            data-tab={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={tabPanelId(idPrefix, item.value)}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            onKeyDown={onKeyDown}
            className={cn(
              'group relative z-10 py-1.5 pl-1.5 pr-4 rounded-md inline-flex items-center gap-2.5 text-left whitespace-nowrap transition-colors cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50 disabled:cursor-not-allowed',
              !active && 'hover:bg-zinc-50',
            )}
          >
            {Icon && (
              <span
                className={cn(
                  'w-8 h-8 rounded-md border inline-flex items-center justify-center shrink-0 transition-colors',
                  active
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500 group-hover:text-zinc-700',
                )}
              >
                <Icon className={cn('text-[1.125rem]', active && 'ms-fill')} />
              </span>
            )}
            <span className="flex flex-col leading-tight">
              <span className={cn('text-sm font-bold', active ? 'text-primary-700' : 'text-zinc-700')}>
                {item.label}
              </span>
              {item.description && (
                <span className="text-[0.6875rem] font-medium text-zinc-500">{item.description}</span>
              )}
            </span>
            {item.badge !== undefined && (
              <TabBadge active={active} tone="segmented">
                {item.badge}
              </TabBadge>
            )}
          </button>
        );
      })}
    </div>
  );
}
