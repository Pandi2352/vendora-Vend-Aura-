import { useEffect } from 'react';

/** The open listbox an event came from: inside the list, or its expanded combobox trigger. */
function listboxOf(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const list = target.closest<HTMLElement>('[role="listbox"]');
  if (list) return list;
  const combo = target.closest<HTMLElement>('[role="combobox"][aria-expanded="true"]');
  const listId = combo?.getAttribute('aria-controls');
  return listId ? document.getElementById(listId) : null;
}

/**
 * The calendar's month / year Dropdowns render their lists in their own portal,
 * outside the Popover panel. While `active`, this keeps the Popover from
 * treating a click in such a list as an outside click, and makes Escape close
 * only the list (not the whole popover).
 */
export function useNestedListGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest('[role="listbox"]')) e.stopPropagation();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const list = listboxOf(e.target);
      if (!list) return;
      e.stopPropagation();
      e.preventDefault();
      // The Dropdown trigger toggles its list on click and takes focus back.
      const triggers = document.querySelectorAll<HTMLElement>('[role="combobox"][aria-controls]');
      Array.from(triggers)
        .find((t) => t.getAttribute('aria-controls') === list.id)
        ?.click();
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [active]);
}
