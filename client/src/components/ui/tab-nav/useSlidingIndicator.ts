import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { findTab } from './types';

/**
 * Measures the active tab inside a tab list and returns a style that moves an
 * absolutely positioned indicator to it. Re-measures when the list resizes.
 */
export function useSlidingIndicator(active: string) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({ opacity: 0 });

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const tab = findTab(list, active);
      setIndicatorStyle(
        tab ? { opacity: 1, width: tab.offsetWidth, transform: `translateX(${tab.offsetLeft}px)` } : { opacity: 0 },
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active]);

  return { listRef, indicatorStyle };
}
