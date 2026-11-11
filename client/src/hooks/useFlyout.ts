import { useCallback, useEffect, useRef, useState } from 'react';

export interface FlyoutPosition {
  top: number;
  left: number;
}

const CLOSE_DELAY_MS = 150;

/**
 * Hover / click flyout next to a trigger element (sidebar sub-menus).
 * Opens on hover or click, closes on leave (with a short grace period so the
 * pointer can travel into the panel), Escape, or click outside.
 */
export function useFlyout<T extends HTMLElement = HTMLElement>() {
  const triggerRef = useRef<T | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const [position, setPosition] = useState<FlyoutPosition | null>(null);

  const cancelClose = useCallback(() => window.clearTimeout(closeTimer.current), []);

  const open = useCallback(() => {
    cancelClose();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.top, left: rect.right + 6 });
  }, [cancelClose]);

  const close = useCallback(() => {
    cancelClose();
    setPosition(null);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setPosition(null), CLOSE_DELAY_MS);
  }, [cancelClose]);

  const toggle = useCallback(() => (position ? close() : open()), [position, open, close]);

  useEffect(() => {
    if (!position) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [position, close]);

  // Keep the panel inside the viewport vertically.
  useEffect(() => {
    if (!position || !panelRef.current) return;
    const height = panelRef.current.offsetHeight;
    const maxTop = window.innerHeight - height - 8;
    if (position.top > maxTop) setPosition((p) => (p ? { ...p, top: Math.max(8, maxTop) } : p));
  }, [position]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return { triggerRef, panelRef, position, isOpen: !!position, open, close, toggle, scheduleClose, cancelClose };
}
