import { useId } from 'react';
import { cn } from '../cn';
import { AccordionItem, type AccordionItemData, type AccordionVariant, type HeadingLevel } from './AccordionItem';
import { useAccordion, type AccordionType } from './useAccordion';

export interface AccordionProps {
  items: AccordionItemData[];
  /** `single`: one section open at a time; `multiple`: any number. */
  type?: AccordionType;
  /** Single mode: whether the open section can be closed again (default true). */
  collapsible?: boolean;
  /** Controlled open ids (single mode uses at most one). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** `bordered`: separate cards; `flush`: divider lines only. */
  variant?: AccordionVariant;
  /** Heading element wrapping each header button (default h3). */
  headingLevel?: HeadingLevel;
  className?: string;
}

/**
 * WAI-ARIA APG accordion: each header is a heading wrapping a button with
 * `aria-expanded` / `aria-controls`; panels are labelled regions. Enter / Space
 * toggle, ArrowUp / ArrowDown move between headers (wrapping), Home / End jump.
 * Collapsed panels are `inert`, so their content is not reachable by Tab.
 */
export function Accordion({
  items,
  type = 'single',
  collapsible = true,
  value,
  defaultValue,
  onValueChange,
  variant = 'bordered',
  headingLevel = 3,
  className,
}: AccordionProps) {
  const baseId = useId();
  const { openIds, toggle, registerHeader, onHeaderKeyDown } = useAccordion({ type, collapsible, value, defaultValue, onValueChange });

  return (
    <div className={cn(variant === 'bordered' ? 'space-y-2' : 'divide-y divide-zinc-200 border-y border-zinc-200', className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          open={openIds.includes(item.id)}
          baseId={baseId}
          variant={variant}
          headingLevel={headingLevel}
          headerRef={(node) => registerHeader(item.id, node)}
          onToggle={() => toggle(item.id)}
          onHeaderKeyDown={onHeaderKeyDown}
        />
      ))}
    </div>
  );
}
