import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from './DropdownMenu';
import { RowActionsMenu } from '../../tables/RowActionsMenu';
import type { MenuEntry } from './menu-utils';

const setup = () => {
  const spies = { edit: vi.fn(), duplicate: vi.fn(), archive: vi.fn(), del: vi.fn() };
  const items: MenuEntry[] = [
    { type: 'label', label: 'Invoice' },
    { label: 'Edit', onSelect: spies.edit, shortcut: 'E' },
    { label: 'Duplicate', onSelect: spies.duplicate },
    { label: 'Print', disabled: true },
    { label: 'Archive', onSelect: spies.archive },
    { type: 'separator' },
    { label: 'Delete', onSelect: spies.del, danger: true },
  ];
  render(
    <>
      <DropdownMenu label="Invoice actions" items={items} />
      <button type="button">outside</button>
    </>,
  );
  return spies;
};

const trigger = () => screen.getByRole('button', { name: 'Invoice actions' });
const item = (name: string) => screen.getByRole('menuitem', { name });

describe('DropdownMenu', () => {
  it('exposes the menu button pattern', async () => {
    const user = userEvent.setup();
    setup();
    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Invoice' })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(item('Edit')).toHaveFocus();
  });

  it('opens with ArrowDown, moves focus, and Enter activates', async () => {
    const user = userEvent.setup();
    const spies = setup();
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    expect(item('Edit')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Duplicate')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(spies.duplicate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('skips disabled items, wraps, and supports Home / End', async () => {
    const user = userEvent.setup();
    setup();
    trigger().focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(item('Archive')).toHaveFocus(); // Print is disabled
    expect(item('Print')).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(item('Edit')).toHaveFocus(); // wrapped past Delete
    await user.keyboard('{End}');
    expect(item('Delete')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(item('Edit')).toHaveFocus();
  });

  it('opens on the last item with ArrowUp and activates with Space', async () => {
    const user = userEvent.setup();
    const spies = setup();
    trigger().focus();
    await user.keyboard('{ArrowUp}');
    expect(item('Delete')).toHaveFocus();
    await user.keyboard(' ');
    expect(spies.del).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const spies = setup();
    trigger().focus();
    await user.keyboard('{Enter}');
    expect(item('Edit')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    expect(spies.edit).not.toHaveBeenCalled();
  });

  it('moves focus with type-ahead', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(trigger());
    await user.keyboard('a');
    expect(item('Archive')).toHaveFocus();
    await user.keyboard('{Escape}');
    await user.click(trigger());
    await user.keyboard('de'); // multi-character prefix skips "Duplicate"
    expect(item('Delete')).toHaveFocus();
  });

  it('closes on Tab and on outside click', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(trigger());
    await user.keyboard('{Tab}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not activate a disabled item on click', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(trigger());
    await user.click(item('Print'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});

describe('RowActionsMenu', () => {
  it('opens the menu without triggering the row click', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onSelect = vi.fn();
    render(
      // Test harness: stands in for a clickable table row.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div onClick={onRowClick}>
        <RowActionsMenu items={[{ label: 'Refund', onSelect }]} />
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'More actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Refund' }));
    expect(onSelect).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
