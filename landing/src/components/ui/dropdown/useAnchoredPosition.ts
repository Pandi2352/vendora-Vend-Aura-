import { useLayoutEffect, useState, type RefObject } from 'react';

export interface AnchoredPosition {
  left: number;
  width: number;
  /** Set when the panel opens downward. */
  top?: number;
  /** Set when the panel opens upward (distance from viewport bottom). */
  bottom?: number;
  maxHeight: number;
}

const GAP = 4;
const PREFERRED_HEIGHT = 300;
const VIEWPORT_MARGIN = 8;

/**
 * Fixed-position coordinates for a floating panel under (or above, when there
 * is no room) an anchor element. Recomputes on scroll / resize so it follows
 * the anchor inside scrolling pages and dialogs.
 */
export function useAnchoredPosition(anchorRef: RefObject<HTMLElement | null>, open: boolean) {
  const [position, setPosition] = useState<AnchoredPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN;
      const spaceAbove = rect.top - GAP - VIEWPORT_MARGIN;
      const openUp = spaceBelow < Math.min(PREFERRED_HEIGHT, 200) && spaceAbove > spaceBelow;
      const width = rect.width;
      const left = Math.min(Math.max(VIEWPORT_MARGIN, rect.left), window.innerWidth - width - VIEWPORT_MARGIN);

      setPosition(
        openUp
          ? { left, width, bottom: window.innerHeight - rect.top + GAP, maxHeight: Math.min(PREFERRED_HEIGHT, spaceAbove) }
          : { left, width, top: rect.bottom + GAP, maxHeight: Math.min(PREFERRED_HEIGHT, spaceBelow) },
      );
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef, open]);

  return open ? position : null;
}
