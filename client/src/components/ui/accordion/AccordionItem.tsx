import type { KeyboardEvent, ReactNode } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { cn } from '../cn';

export interface AccordionItemData {
  id: string;
  title: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  /** Smaller line under the title. */
  description?: ReactNode;
  disabled?: boolean;
}

export type AccordionVariant = 'bordered' | 'flush';
export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

interface AccordionItemProps {
  item: AccordionItemData;
  open: boolean;
  baseId: string;
  variant: AccordionVariant;
  headingLevel: HeadingLevel;
  headerRef: (node: HTMLButtonElement | null) => void;
  onToggle: () => void;
  onHeaderKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
}

/** One section: a heading wrapping the toggle button, then the animated region. */
export function AccordionItem({ item, open, baseId, variant, headingLevel, headerRef, onToggle, onHeaderKeyDown }: AccordionItemProps) {
  const Heading = `h${headingLevel}` as const;
  const headerId = `${baseId}-header-${item.id}`;
  const panelId = `${baseId}-panel-${item.id}`;

  return (
    <div className={cn(variant === 'bordered' && 'border border-zinc-200 rounded-md bg-white')}>
      <Heading className="m-0">
        <button
          ref={headerRef}
          id={headerId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          disabled={item.disabled}
          onClick={onToggle}
          onKeyDown={onHeaderKeyDown}
          className={cn(
            'flex w-full items-center gap-3 py-3 text-left rounded-md outline-none',
            'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
            variant === 'bordered' ? 'px-4' : 'px-1',
            item.disabled ? 'text-zinc-400 cursor-not-allowed' : 'text-zinc-900 cursor-pointer hover:text-primary-700',
          )}
        >
          {item.icon && <span className="shrink-0 text-zinc-500 [&>svg]:w-5 [&>svg]:h-5">{item.icon}</span>}
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold">{item.title}</span>
            {item.description && <span className="block text-xs font-normal text-zinc-500 mt-0.5">{item.description}</span>}
          </span>
          <CaretDown
            aria-hidden
            className={cn(
              'w-4 h-4 shrink-0 text-zinc-500 transition-transform duration-200 motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
        </button>
      </Heading>
      {/* grid-rows 0fr -> 1fr animates to the content's natural height. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        inert={!open}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className={cn('text-sm text-zinc-600 pb-4', variant === 'bordered' ? 'px-4' : 'px-1')}>{item.content}</div>
        </div>
      </div>
    </div>
  );
}
