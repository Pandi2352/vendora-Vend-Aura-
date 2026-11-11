import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from './Dropdown';
import type { DropdownOption } from './dropdown-utils';

const FRUITS: DropdownOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

function Harness(props: Partial<React.ComponentProps<typeof Dropdown>> & { onBlurSpy?: () => void }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <>
      <Dropdown
        aria-label="Fruit"
        options={FRUITS}
        value={value}
        onChange={(v) => setValue(v === null ? null : String(v))}
        onBlur={props.onBlurSpy}
        {...props}
      />
      <output data-testid="value">{value ?? 'none'}</output>
    </>
  );
}

describe('Dropdown', () => {
  it('renders a combobox with the placeholder and no native select', () => {
    const { container } = render(<Harness placeholder="Pick a fruit" />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Pick a fruit');
    expect(container.querySelector('select')).toBeNull();
  });

  it('opens on click and selects an option', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(screen.getByTestId('value')).toHaveTextContent('cherry');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveFocus();
  });

  it('supports keyboard selection and skips disabled options', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole('combobox', { name: 'Fruit' }).focus();
    await user.keyboard('{ArrowDown}'); // opens, Apple active
    await user.keyboard('{ArrowDown}'); // Banana is disabled -> Cherry
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('value')).toHaveTextContent('cherry');
  });

  it('does not select a disabled option on click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(screen.getByTestId('value')).toHaveTextContent('none');
  });

  it('closes on Escape and returns focus, calling onBlur', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<Harness onBlurSpy={onBlur} />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveFocus();
    expect(onBlur).toHaveBeenCalled();
  });

  it('closes on outside click and calls onBlur (marks a form field touched)', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(
      <>
        <Harness onBlurSpy={onBlur} />
        <button type="button">outside</button>
      </>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await user.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onBlur).toHaveBeenCalled();
  });

  it('filters with the search box and shows an empty message', async () => {
    const user = userEvent.setup();
    render(<Harness searchable emptyMessage="No fruit" />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await user.type(screen.getByRole('combobox', { name: 'Search…' }), 'da');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('value')).toHaveTextContent('date');

    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await user.type(screen.getByRole('combobox', { name: 'Search…' }), 'zzz');
    expect(screen.getByText('No fruit')).toBeInTheDocument();
  });

  it('jumps by typing the first letter (type-ahead)', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole('combobox', { name: 'Fruit' }).focus();
    await user.keyboard('d');
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('value')).toHaveTextContent('date');
  });

  it('clears the selection when clearable', async () => {
    const user = userEvent.setup();
    render(<Harness clearable />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.getByTestId('value')).toHaveTextContent('none');
  });

  it('marks the selected option and exposes invalid state', async () => {
    const user = userEvent.setup();
    render(<Harness invalid />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    await user.click(trigger);
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(<Harness disabled />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
