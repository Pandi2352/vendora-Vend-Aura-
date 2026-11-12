import { DotsThree } from '@phosphor-icons/react';
import { cn } from '../ui/cn';
import { DropdownMenu } from '../ui/menu/DropdownMenu';
import type { Placement } from '../ui/overlay/useAnchoredPosition';
import type { MenuEntry } from '../ui/menu/menu-utils';

interface RowActionsMenuProps {
  items: MenuEntry[];
  /** Accessible name of the button (default "More actions"). */
  label?: string;
  placement?: Placement;
}

/**
 * "More actions" button for table rows with many actions: same tinted h-8 square
 * as RowActions, opening a DropdownMenu. Clicks never reach the row's onRowClick.
 */
export function RowActionsMenu({ items, label = 'More actions', placement = 'bottom-end' }: RowActionsMenuProps) {
  return (
    // Not a control: stops clicks on the trigger and the (portalled) menu from reaching the row's onRowClick.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="inline-flex" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu
        items={items}
        label={label}
        placement={placement}
        trigger={(props, { open }) => (
          <button
            type="button"
            {...props}
            aria-label={label}
            title={label}
            className={cn(
              'inline-flex items-center justify-center w-8 h-8 rounded-md border transition-colors cursor-pointer [&>svg]:w-4 [&>svg]:h-4',
              open ? 'bg-zinc-100 border-zinc-300 text-zinc-800' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100',
            )}
          >
            <DotsThree weight="bold" />
          </button>
        )}
      />
    </div>
  );
}
