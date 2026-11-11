import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSelect } from './FilterSelect';
import { DataTable } from './DataTable';

function Harness() {
  const [value, setValue] = useState('ALL');
  return (
    <FilterSelect
      label="Status"
      value={value}
      onChange={setValue}
      options={[
        { value: 'ACTIVE', label: 'Active' },
        { value: 'SUSPENDED', label: 'Suspended' },
      ]}
      allLabel="All statuses"
    />
  );
}

describe('FilterSelect', () => {
  it('tints when filtered and lets the user go back to ALL', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const trigger = screen.getByRole('combobox', { name: 'Status' });
    expect(container.querySelector('select')).toBeNull();
    expect(trigger).toHaveTextContent('All statuses');
    expect(trigger.className).not.toContain('bg-red-50');

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Suspended' }));
    expect(trigger).toHaveTextContent('Suspended');
    expect(trigger.className).toContain('bg-red-50');

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'All statuses' }));
    expect(trigger).toHaveTextContent('All statuses');
    expect(trigger.className).not.toContain('bg-red-50');
  });
});

describe('DataTable page size', () => {
  it('changes the page size through the dropdown', async () => {
    const user = userEvent.setup();
    const rows = Array.from({ length: 30 }, (_, i) => ({ id: String(i + 1) }));
    const { container } = render(
      <DataTable rows={rows} rowKey={(r) => r.id} columns={[{ key: 'id', header: 'Id', render: (r) => r.id }]} />,
    );
    expect(container.querySelector('select')).toBeNull();
    expect(screen.getByText('30 records · page 1 of 3')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Show' }));
    await user.click(screen.getByRole('option', { name: '25' }));
    expect(screen.getByText('30 records · page 1 of 2')).toBeInTheDocument();
  });
});
