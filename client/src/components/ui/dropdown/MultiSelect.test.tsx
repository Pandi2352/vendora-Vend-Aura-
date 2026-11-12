import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelect, type MultiSelectProps } from './MultiSelect';
import type { DropdownOption } from './dropdown-utils';

const FRUITS: DropdownOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'fig', label: 'Fig' },
];

function Harness(props: Partial<MultiSelectProps> & { initial?: string[] }) {
  const { initial = [], ...rest } = props;
  const [value, setValue] = useState<string[]>(initial);
  return (
    <>
      <MultiSelect aria-label="Fruits" options={FRUITS} value={value} onChange={setValue} {...rest} />
      <output data-testid="value">{value.join(',') || 'none'}</output>
      <button type="button">outside</button>
    </>
  );
}

const trigger = () => screen.getByRole('combobox', { name: 'Fruits' });
const value = () => screen.getByTestId('value').textContent;

describe('MultiSelect', () => {
  it('selects several options, keeps the list open and renders chips', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    expect(container.querySelector('select')).toBeNull();
    await user.click(trigger());
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    expect(value()).toBe('apple,cherry');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Cherry' })).toBeInTheDocument();
  });

  it('removes a chip with its button and the last chip with Backspace', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['apple', 'cherry', 'date']} />);
    await user.click(screen.getByRole('button', { name: 'Remove Cherry' }));
    expect(value()).toBe('apple,date');
    expect(trigger()).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(value()).toBe('apple');
  });

  it('shows "+N more" when chips overflow', () => {
    render(<Harness initial={['apple', 'cherry', 'date', 'fig']} maxVisibleChips={2} />);
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(trigger()).toHaveTextContent('Apple, Cherry, Date, Fig');
  });

  it('selects all enabled options and clears them', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    expect(value()).toBe('apple,cherry,date,fig');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(value()).toBe('none');
  });

  it('disables other options once maxSelected is reached', async () => {
    const user = userEvent.setup();
    render(<Harness maxSelected={2} />);
    await user.click(trigger());
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(screen.getByRole('option', { name: 'Date' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(/Limit of 2 reached/)).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Date' }));
    expect(value()).toBe('apple,cherry');
    expect(screen.getByRole('button', { name: 'Select all' })).toBeDisabled();
    // Unselecting frees a slot again.
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    expect(screen.getByRole('option', { name: 'Date' })).not.toHaveAttribute('aria-disabled');
  });

  it('toggles with Space from the keyboard and skips disabled options', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    trigger().focus();
    await user.keyboard('{ArrowDown}'); // open, Apple active
    await user.keyboard(' '); // Apple on
    await user.keyboard('{ArrowDown}'); // Banana disabled -> Cherry
    await user.keyboard(' ');
    expect(value()).toBe('apple,cherry');
    await user.keyboard(' '); // Cherry off
    expect(value()).toBe('apple');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes on Escape, returns focus and calls onBlur', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<Harness onBlur={onBlur} />);
    await user.click(trigger());
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    expect(onBlur).toHaveBeenCalled();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<Harness onBlur={onBlur} />);
    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onBlur).toHaveBeenCalled();
  });

  it('read-only shows chips without remove buttons and does not open', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['apple']} readOnly />);
    expect(screen.queryByRole('button', { name: 'Remove Apple' })).not.toBeInTheDocument();
    await user.click(trigger());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('filters with search and select all only adds the matches', async () => {
    const user = userEvent.setup();
    render(<Harness searchable />);
    await user.click(trigger());
    const listbox = screen.getByRole('listbox');
    await user.type(screen.getByRole('combobox', { name: 'Search…' }), 'e');
    expect(within(listbox).getAllByRole('option').map((o) => o.textContent)).toEqual(['Apple', 'Cherry', 'Date']);
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    expect(value()).toBe('apple,cherry,date');
  });
});
