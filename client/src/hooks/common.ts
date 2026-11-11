/**
 * General-purpose hooks (no app/business knowledge). Each one cleans up its
 * listeners / timers on unmount.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { localStore, sessionStore, copyToClipboard } from '@/utils/browser';

/** Value that only updates after `delayMs` without changes (search boxes). */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** Debounced function; the latest callback is always used. */
export function useDebouncedCallback<Args extends unknown[]>(callback: (...args: Args) => void, delayMs = 300) {
  const callbackRef = useRef(callback);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    callbackRef.current = callback;
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return useCallback(
    (...args: Args) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  );
}

function useStoredState<T>(store: typeof localStore, key: string, initial: T) {
  const [value, setValue] = useState<T>(() => store.get(key, initial));
  useEffect(() => store.set(key, value), [store, key, value]);
  return [value, setValue] as const;
}

/** useState persisted to localStorage (per device). */
export const useLocalStorage = <T,>(key: string, initial: T) => useStoredState(localStore, key, initial);

/** useState persisted to sessionStorage (per tab). */
export const useSessionStorage = <T,>(key: string, initial: T) => useStoredState(sessionStore, key, initial);

/** Calls `handler` on pointer down outside every given element. */
export function useClickOutside(refs: Array<RefObject<HTMLElement | null>>, handler: () => void, enabled = true) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (e: PointerEvent) => {
      if (refs.every((r) => !r.current?.contains(e.target as Node))) handlerRef.current();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [refs, enabled]);
}

/** `useMediaQuery('(min-width: 1024px)')` */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Viewport size, updated on resize. */
export function useWindowSize() {
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

/** Sets the browser tab title while the component is shown. */
export function useDocumentTitle(title: string, appName = 'Vendora POS') {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${appName}` : appName;
    return () => {
      document.title = previous;
    };
  }, [title, appName]);
}

/** True while the browser reports a network connection. */
export function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue] as const;
}

/** `const [copied, copy] = useCopyToClipboard(); copy(text)` — `copied` resets after 2s. */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), resetMs);
    return () => window.clearTimeout(timer);
  }, [copied, resetMs]);
  const copy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    setCopied(ok);
    return ok;
  }, []);
  return [copied, copy] as const;
}

/** Client-side paging over an in-memory list. */
export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageItems = useMemo(() => items.slice((current - 1) * pageSize, current * pageSize), [items, current, pageSize]);
  return {
    page: current,
    pageSize,
    pageCount,
    pageItems,
    total: items.length,
    startIndex: (current - 1) * pageSize,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };
}

/** False until after the first render (guards effects against StrictMode double runs). */
export function useMounted() {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return useCallback(() => mounted.current, []);
}
