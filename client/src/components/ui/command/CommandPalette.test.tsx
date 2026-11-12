import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette } from './CommandPalette';
import { useCommandPaletteHotkey } from './useCommandPaletteHotkey';
import { filterCommands, type CommandGroup } from './command-utils';

const spies = { dashboard: vi.fn(), reports: vi.fn(), gst: vi.fn(), logout: vi.fn(), theme: vi.fn() };

const groups: CommandGroup[] = [
  {
    heading: 'Go to',
    items: [
      { id: 'dash', label: 'Dashboard', onSelect: spies.dashboard },
      { id: 'overview', label: 'Executive Overview', keywords: ['reports'], onSelect: spies.reports },
      { id: 'gst', label: 'GST Reports', keywords: ['tax'], onSelect: spies.gst },
    ],
  },
  {
    heading: 'Actions',
    items: [
      { id: 'archive', label: 'Archive data', disabled: true, onSelect: vi.fn() },
      { id: 'theme', label: 'Switch theme', keywords: ['dark'], onSelect: spies.theme },
      { id: 'logout', label: 'Sign out', keywords: ['log out'], onSelect: spies.logout },
    ],
  },
];

function Harness() {
  const [open, setOpen] = useState(false);
  useCommandPaletteHotkey(setOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open palette
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} groups={groups} emptyMessage="Nothing here" />
    </>
  );
}

const setup = async () => {
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getByRole('button', { name: 'Open palette' }));
  return user;
};
const input = () => screen.getByRole('combobox');
const options = () => screen.queryAllByRole('option').map((o) => o.textContent);
const activeOption = () => document.getElementById(input().getAttribute('aria-activedescendant') ?? '');

describe('CommandPalette', () => {
  beforeEach(() => Object.values(spies).forEach((s) => s.mockClear()));

  it('opens as a modal combobox with grouped options and focuses the input', async () => {
    await setup();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(input()).toHaveFocus();
    expect(input()).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
    expect(screen.getByRole('group', { name: 'Go to' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Actions' })).toBeInTheDocument();
    expect(activeOption()).toHaveTextContent('Dashboard');
    expect(activeOption()).toHaveAttribute('aria-selected', 'true');
  });

  it('filters by label and keywords, ranks label-prefix first, hides empty groups and highlights', async () => {
    const user = await setup();
    await user.type(input(), 'REPORTS');
    // "GST Reports" matches the label; "Executive Overview" only by keyword.
    expect(options()).toEqual(['GST Reports', 'Executive Overview']);
    expect(screen.queryByRole('group', { name: 'Actions' })).not.toBeInTheDocument();
    expect(screen.getByText('Reports', { selector: 'mark' })).toBeInTheDocument();

    await user.clear(input());
    await user.type(input(), 's');
    expect(options()).toEqual(['Dashboard', 'GST Reports', 'Executive Overview', 'Switch theme', 'Sign out']);
  });

  it('ranks label-prefix, then label, then keyword matches within a group', () => {
    const noop = () => {};
    const { flat } = filterCommands(
      [
        {
          heading: 'G',
          items: [
            { id: 'a', label: 'Tax keyword', keywords: ['stock'], onSelect: noop },
            { id: 'b', label: 'Low stock', onSelect: noop },
            { id: 'c', label: 'Stock count', onSelect: noop },
            { id: 'd', label: 'Customers', onSelect: noop },
          ],
        },
      ],
      'STOCK',
    );
    expect(flat.map((m) => m.item.id)).toEqual(['c', 'b', 'a']);
    expect(flat.map((m) => m.range)).toEqual([[0, 5], [4, 9], null]);
  });

  it('shows the empty state', async () => {
    const user = await setup();
    await user.type(input(), 'zzz');
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input()).not.toHaveAttribute('aria-activedescendant');
  });

  it('moves with arrows (wrapping, skipping disabled), Home / End, and Enter selects and closes', async () => {
    const user = await setup();
    await user.keyboard('{ArrowUp}');
    expect(activeOption()).toHaveTextContent('Sign out');
    await user.keyboard('{ArrowDown}');
    expect(activeOption()).toHaveTextContent('Dashboard');
    await user.keyboard('{End}{ArrowUp}{ArrowUp}');
    expect(activeOption()).toHaveTextContent('GST Reports'); // skipped disabled "Archive data"
    await user.keyboard('{Home}');
    expect(activeOption()).toHaveTextContent('Dashboard');
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(spies.gst).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open palette' })).toHaveFocus();
  });

  it('hover sets the active option and click selects', async () => {
    const user = await setup();
    const option = screen.getByRole('option', { name: 'Sign out' });
    fireEvent.mouseMove(option);
    expect(activeOption()).toBe(option);
    await user.click(option);
    expect(spies.logout).toHaveBeenCalledTimes(1);
  });

  it('Escape closes, restores focus and clears the query', async () => {
    const user = await setup();
    await user.type(input(), 'gst');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Open palette' });
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    expect(input()).toHaveValue('');
  });

  it('toggles with Ctrl+K and Cmd+K', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('prevents the browser default for Ctrl+K', () => {
    render(<Harness />);
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
