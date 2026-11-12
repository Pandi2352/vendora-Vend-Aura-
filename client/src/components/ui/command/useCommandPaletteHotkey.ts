import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';

/** Toggles the command palette on Ctrl+K / Cmd+K anywhere in the page. */
export function useCommandPaletteHotkey(setOpen: Dispatch<SetStateAction<boolean>>) {
  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    setOpenRef.current = setOpen;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'k') return;
      e.preventDefault();
      setOpenRef.current((open) => !open);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}
