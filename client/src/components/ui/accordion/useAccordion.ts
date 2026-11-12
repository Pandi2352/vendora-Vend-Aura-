import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

export type AccordionType = 'single' | 'multiple';

interface UseAccordionOptions {
  type: AccordionType;
  collapsible: boolean;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

/**
 * Open-state and header keyboard handling for `Accordion`. Works controlled
 * (`value`) or uncontrolled (`defaultValue`); in single mode at most one id is open.
 */
export function useAccordion({ type, collapsible, value, defaultValue, onValueChange }: UseAccordionOptions) {
  const [internal, setInternal] = useState<string[]>(() => {
    const initial = defaultValue ?? [];
    return type === 'single' ? initial.slice(0, 1) : initial;
  });
  const openIds = value ?? internal;
  const headerRefs = useRef(new Map<string, HTMLButtonElement>());

  const setOpenIds = (next: string[]) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const toggle = (id: string) => {
    const isOpen = openIds.includes(id);
    if (type === 'multiple') {
      setOpenIds(isOpen ? openIds.filter((v) => v !== id) : [...openIds, id]);
    } else if (!isOpen) {
      setOpenIds([id]);
    } else if (collapsible) {
      setOpenIds([]);
    }
  };

  const registerHeader = useCallback((id: string, node: HTMLButtonElement | null) => {
    if (node) headerRefs.current.set(id, node);
    else headerRefs.current.delete(id);
  }, []);

  /** ArrowUp / ArrowDown (wrapping), Home / End between enabled headers, in DOM order. */
  const onHeaderKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const headers = Array.from(headerRefs.current.values())
      .filter((el) => !el.disabled)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const current = headers.indexOf(e.currentTarget);
    const n = headers.length;
    let next: number;
    switch (e.key) {
      case 'ArrowDown':
        next = (current + 1) % n;
        break;
      case 'ArrowUp':
        next = (current - 1 + n) % n;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = n - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    headers[next]?.focus();
  };

  return { openIds, toggle, registerHeader, onHeaderKeyDown };
}
