import { useCallback, useEffect, useRef, useState } from 'react';

export interface FlyoutPosition {
  top: number;
  left: number;
}

const OPEN_INTENT_MS = 110;
const CLOSE_DELAY_MS = 140;

/**
 * Hover-intent / click flyout next to a trigger element (sidebar sub-menus).
 * Debounces hover opening to prevent popups when scrolling or scanning across items,
 * closes immediately on scroll, and supports Escape or click outside.
 */
export function useFlyout<T extends HTMLElement = HTMLElement>() {
  const triggerRef = useRef<T | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const [position, setPosition] = useState<FlyoutPosition | null>(null);

  const cancelOpen = useCallback(() => {
    if (openTimer.current !== undefined) {
      window.clearTimeout(openTimer.current);
      openTimer.current = undefined;
    }
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== undefined) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
    }
  }, []);

  const openImmediately = useCallback(() => {
    cancelOpen();
    cancelClose();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const aside = triggerRef.current?.closest('aside');
      const baseLeft = aside ? aside.getBoundingClientRect().right + 3 : rect.right + 3;
      setPosition({ top: Math.max(8, rect.top - 2), left: baseLeft });
    }
  }, [cancelOpen, cancelClose]);

  const scheduleOpen = useCallback(() => {
    cancelClose();
    cancelOpen();
    openTimer.current = window.setTimeout(openImmediately, OPEN_INTENT_MS);
  }, [cancelClose, cancelOpen, openImmediately]);

  const close = useCallback(() => {
    cancelOpen();
    cancelClose();
    setPosition(null);
  }, [cancelOpen, cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelOpen();
    cancelClose();
    closeTimer.current = window.setTimeout(() => setPosition(null), CLOSE_DELAY_MS);
  }, [cancelOpen, cancelClose]);

  const toggle = useCallback(() => (position ? close() : openImmediately()), [position, openImmediately, close]);

  useEffect(() => {
    // Capture scroll events anywhere in the DOM (including sidebar nav) to dismiss flyouts immediately.
    const onScroll = () => {
      cancelOpen();
      if (position) close();
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [position, close, cancelOpen]);

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

  useEffect(() => () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

  return {
    triggerRef,
    panelRef,
    position,
    isOpen: !!position,
    open: scheduleOpen,
    openImmediately,
    close,
    toggle,
    scheduleClose,
    cancelClose,
  };
}
