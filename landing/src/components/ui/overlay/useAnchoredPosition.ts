import { useLayoutEffect, useState, type RefObject } from 'react';

export type Placement = 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top' | 'right-start' | 'left-start';

export interface AnchoredPosition {
  left: number;
  top?: number;
  /** Set instead of `top` when the panel opens upward (distance from viewport bottom). */
  bottom?: number;
  /** Panel width when `matchWidth` is on. */
  width?: number;
  maxHeight: number;
  /** Placement actually used after flipping. */
  placement: Placement;
}

export interface AnchorOptions {
  placement?: Placement;
  /** Panel width = anchor width (dropdown lists). */
  matchWidth?: boolean;
  gap?: number;
  preferredHeight?: number;
  /** Measured panel size, used for centring and edge clamping (optional). */
  panelRef?: RefObject<HTMLElement | null>;
}

const MARGIN = 8;

/**
 * Fixed-position coordinates for a floating panel next to an anchor element.
 * Flips vertically / horizontally when there is no room, clamps to the
 * viewport, and follows the anchor on scroll and resize.
 */
export function useAnchoredPosition(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
  { placement = 'bottom-start', matchWidth = false, gap = 4, preferredHeight = 300, panelRef }: AnchorOptions = {},
) {
  const [position, setPosition] = useState<AnchoredPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const panelWidth = matchWidth ? rect.width : panelRef?.current?.offsetWidth ?? 0;
      const panelHeight = panelRef?.current?.offsetHeight ?? 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const clampLeft = (x: number) => Math.min(Math.max(MARGIN, x), Math.max(MARGIN, vw - panelWidth - MARGIN));

      // Side placements (sub-menus).
      if (placement === 'right-start' || placement === 'left-start') {
        const fitsRight = rect.right + gap + panelWidth + MARGIN <= vw;
        const useRight = placement === 'right-start' ? fitsRight || rect.left < panelWidth : !(rect.left - gap - panelWidth >= MARGIN);
        const left = useRight ? rect.right + gap : rect.left - gap - panelWidth;
        const top = Math.min(Math.max(MARGIN, rect.top), Math.max(MARGIN, vh - panelHeight - MARGIN));
        setPosition({ left: clampLeft(left), top, maxHeight: vh - 2 * MARGIN, placement: useRight ? 'right-start' : 'left-start' });
        return;
      }

      const spaceBelow = vh - rect.bottom - gap - MARGIN;
      const spaceAbove = rect.top - gap - MARGIN;
      const wantsTop = placement.startsWith('top');
      const needed = Math.min(preferredHeight, panelHeight || 200);
      const openUp = wantsTop ? !(spaceAbove < needed && spaceBelow > spaceAbove) : spaceBelow < needed && spaceAbove > spaceBelow;

      const align = placement.endsWith('-end') ? 'end' : placement === 'top' || placement === 'bottom' ? 'center' : 'start';
      const rawLeft =
        align === 'start' ? rect.left : align === 'end' ? rect.right - panelWidth : rect.left + rect.width / 2 - panelWidth / 2;
      const left = clampLeft(rawLeft);
      const base = {
        left,
        width: matchWidth ? rect.width : undefined,
        placement: ((openUp ? 'top' : 'bottom') + (align === 'center' ? '' : `-${align}`)) as Placement,
      };

      setPosition(
        openUp
          ? { ...base, bottom: vh - rect.top + gap, maxHeight: Math.min(preferredHeight, spaceAbove) }
          : { ...base, top: rect.bottom + gap, maxHeight: Math.min(preferredHeight, spaceBelow) },
      );
    };

    update();
    // Re-measure once the panel has rendered (its size is needed for centring / flipping).
    const frame = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef, open, placement, matchWidth, gap, preferredHeight, panelRef]);

  return open ? position : null;
}

/** Inline style for a panel from a computed position. */
export const positionStyle = (p: AnchoredPosition) => ({
  left: p.left,
  top: p.top,
  bottom: p.bottom,
  width: p.width,
});
