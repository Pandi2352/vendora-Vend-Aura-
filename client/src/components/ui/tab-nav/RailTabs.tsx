import { useEffect } from 'react';
import { cn } from '../cn';
import { TabBadge } from './TabBadge';
import { findTab, tabId, tabPanelId, type TabsBaseProps } from './types';
import { useSlidingIndicator } from './useSlidingIndicator';
import { useTabKeyboard } from './useTabKeyboard';

/**
 * Horizontal section rail: an icon tile and label per tab, with a bar that
 * slides under the active one. Scrolls sideways (scrollbar hidden) when the
 * tabs do not fit, keeping the active tab in view.
 */
const SIZES = {
  md: { button: 'pt-2 pb-2.5', pill: 'h-9 pl-1.5 pr-3 text-sm', tile: 'w-6 h-6', icon: 'text-[1.0625rem]' },
  sm: { button: 'pt-1.5 pb-2', pill: 'h-8 pl-1 pr-2.5 text-[0.8125rem]', tile: 'w-5 h-5', icon: 'text-[0.9375rem]' },
};

export function RailTabs<T extends string>({
  size = 'md',
  items,
  value,
  onChange,
  label,
  idPrefix = 'rail',
  className,
}: TabsBaseProps<T> & { size?: keyof typeof SIZES }) {
  const sz = SIZES[size];
  const { listRef, indicatorStyle } = useSlidingIndicator(value);
  const onKeyDown = useTabKeyboard(items, value, onChange, listRef);

  useEffect(() => {
    findTab(listRef.current, value)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [value, listRef]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className={cn('relative flex items-stretch gap-1 overflow-x-auto scrollbar-none', className)}
    >
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
              'group shrink-0 inline-flex items-center cursor-pointer focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
              sz.button,
            )}
          >
            <span
              className={cn(
                'rounded-md inline-flex items-center gap-2 whitespace-nowrap transition-colors',
                sz.pill,
                'group-focus-visible:outline-2 group-focus-visible:outline-primary-500',
                active
                  ? 'text-primary-700 font-semibold'
                  : 'text-zinc-500 font-medium group-hover:bg-zinc-100 group-hover:text-zinc-900',
              )}
            >
              {Icon && (
                <span
                  className={cn(
                    'rounded-md inline-flex items-center justify-center shrink-0 transition-colors',
                    sz.tile,
                    active ? 'text-primary-600' : 'text-zinc-400 group-hover:text-zinc-600',
                  )}
                >
                  <Icon className={cn(sz.icon, active && 'ms-fill')} />
                </span>
              )}
              <span>{item.label}</span>
              {item.badge !== undefined && <TabBadge active={active}>{item.badge}</TabBadge>}
            </span>
          </button>
        );
      })}
      <span
        aria-hidden="true"
        style={indicatorStyle}
        className="absolute left-0 bottom-0 h-[2px] rounded-md bg-primary-600 transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none"
      />
    </div>
  );
}
