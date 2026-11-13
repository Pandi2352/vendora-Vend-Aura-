import type { CommandMatch, FilteredGroup } from './command-utils';
import { cn } from '../cn';

interface CommandListProps {
  id: string;
  label: string;
  groups: FilteredGroup[];
  active: number;
  optionId: (index: number) => string;
  onHover: (index: number) => void;
  onSelect: (index: number) => void;
}

/** Grouped listbox of palette results; focus stays in the input (aria-activedescendant). */
export function CommandList({ id, label, groups, active, optionId, onHover, onSelect }: CommandListProps) {
  return (
    <div id={id} role="listbox" aria-label={label} className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5">
      {groups.map((group, g) => (
        <div key={group.heading} role="group" aria-labelledby={`${id}-group-${g}`} className={cn(g > 0 && 'mt-1.5')}>
          <div
            id={`${id}-group-${g}`}
            role="presentation"
            className="px-2.5 pt-1.5 pb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-zinc-400"
          >
            {group.heading}
          </div>
          {group.matches.map((match) => (
            <CommandOption
              key={match.item.id}
              match={match}
              id={optionId(match.index)}
              active={match.index === active}
              onHover={() => onHover(match.index)}
              onSelect={() => onSelect(match.index)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CommandOptionProps {
  match: CommandMatch;
  id: string;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}

function CommandOption({ match, id, active, onHover, onSelect }: CommandOptionProps) {
  const { item, range } = match;
  return (
    // Options are activated by pointer here; keyboard goes through the combobox input.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      id={id}
      role="option"
      tabIndex={-1}
      aria-selected={active}
      aria-disabled={item.disabled || undefined}
      onMouseMove={onHover}
      onMouseDown={(e) => e.preventDefault()} // keep focus in the input
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm select-none',
        item.disabled ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-800 cursor-pointer',
        active && 'bg-primary-50 text-primary-700',
      )}
    >
      {item.icon && <span className="shrink-0 text-zinc-500 [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block truncate">
          <HighlightedLabel label={item.label} range={range} />
        </span>
        {item.description && <span className="block text-xs text-zinc-500 truncate">{item.description}</span>}
      </span>
      {item.shortcut && (
        <kbd aria-hidden className="shrink-0 font-sans text-xs text-zinc-400">
          {item.shortcut}
        </kbd>
      )}
    </div>
  );
}

function HighlightedLabel({ label, range }: { label: string; range: [number, number] | null }) {
  if (!range) return <>{label}</>;
  const [start, end] = range;
  return (
    <>
      {label.slice(0, start)}
      <mark className="bg-transparent text-primary-700 font-semibold">{label.slice(start, end)}</mark>
      {label.slice(end)}
    </>
  );
}
