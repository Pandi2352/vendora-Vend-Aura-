import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import type { CommandGroup } from './command-utils';
import { CommandList } from './CommandList';
import { Kbd } from './Kbd';
import { useCommandPalette } from './useCommandPalette';

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string;
  emptyMessage?: string;
  /** Accessible name of the dialog. */
  label?: string;
}

/**
 * Ctrl+K style command palette: a modal dialog holding an APG combobox (the
 * search input) that drives a grouped listbox through `aria-activedescendant`.
 * Arrows (wrapping), Home / End, Enter selects, Escape / backdrop close; focus
 * returns to the element that was focused before opening.
 */
export function CommandPalette({ open, ...rest }: CommandPaletteProps) {
  if (!open) return null;
  return createPortal(<PaletteDialog {...rest} />, document.body);
}

function PaletteDialog({
  onOpenChange,
  groups,
  placeholder = 'Type a command or search…',
  emptyMessage = 'No results found.',
  label = 'Command palette',
}: Omit<CommandPaletteProps, 'open'>) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });
  const close = () => onOpenChangeRef.current(false);
  const palette = useCommandPalette(groups, listId, close);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  const hasResults = palette.flat.length > 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-zinc-950/40 dark:bg-black/60" aria-hidden onClick={close} />
      <div role="dialog" aria-modal="true" aria-label={label} className="relative w-full max-w-xl bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 border-b border-zinc-200">
          <MagnifyingGlass aria-hidden className="w-[18px] h-[18px] shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label={label}
            aria-expanded={hasResults}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={palette.active >= 0 ? palette.optionId(palette.active) : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            value={palette.query}
            onChange={(e) => palette.changeQuery(e.target.value)}
            onKeyDown={palette.onInputKeyDown}
            className="flex-1 min-w-0 h-12 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
          />
          <Kbd>Esc</Kbd>
        </div>
        {hasResults ? (
          <CommandList
            id={listId}
            label={label}
            groups={palette.visible}
            active={palette.active}
            optionId={palette.optionId}
            onHover={palette.hover}
            onSelect={palette.select}
          />
        ) : (
          <p id={listId} role="status" className="px-4 py-8 text-center text-sm text-zinc-500">
            {emptyMessage}
          </p>
        )}
      </div>
    </div>
  );
}
