import type { ReactNode } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmProvider, ToastProvider } from '@/components/feedback';
import { WarehouseTab } from './warehouse/WarehouseTab';
import { TerritoryTab } from './territory/TerritoryTab';
import { ParamTab } from './param/ParamTab';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { shopId: 'tst02' } }) }));

const wrap = (ui: ReactNode) =>
  render(
    <ToastProvider>
      <ConfirmProvider>{ui}</ConfirmProvider>
    </ToastProvider>,
  );

const dialog = () => within(screen.getByRole('dialog'));

beforeEach(() => localStorage.clear());

describe('Warehouse list', () => {
  it('adds a warehouse, rejects a duplicate code, edits and deletes', async () => {
    const user = userEvent.setup();
    wrap(<WarehouseTab />);
    expect(await screen.findByText('No warehouses yet')).toBeInTheDocument();

    // Required fields
    await user.click(screen.getByRole('button', { name: /add warehouse/i }));
    await user.click(dialog().getByRole('button', { name: 'Save' }));
    expect(await dialog().findByText('Code is required')).toBeInTheDocument();

    // Add
    await user.type(dialog().getByLabelText(/^Code/), 'wh01');
    await user.type(dialog().getByLabelText(/^Name/), 'Main godown');
    await user.click(dialog().getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('WH01')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('vendora.master.tst02.warehouses')!)).toHaveLength(1);

    // Duplicate code
    await user.click(screen.getByRole('button', { name: /add warehouse/i }));
    await user.type(dialog().getByLabelText(/^Code/), 'WH01');
    await user.tab();
    expect(await dialog().findByText('Code WH01 is already used')).toBeInTheDocument();
    await user.click(dialog().getByRole('button', { name: 'Cancel' }));

    // Edit
    await user.click(screen.getByRole('button', { name: 'Edit WH01' }));
    const name = dialog().getByLabelText(/^Name/);
    expect(name).toHaveValue('Main godown');
    await user.clear(name);
    await user.type(name, 'North godown');
    await user.click(dialog().getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('North godown')).toBeInTheDocument();

    // Delete
    await user.click(screen.getByRole('button', { name: 'Delete WH01' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('No warehouses yet')).toBeInTheDocument();
  });
});

describe('Territory list', () => {
  it('nests territories under a group and blocks deleting a group that has children', async () => {
    localStorage.setItem(
      'vendora.master.tst02.territories',
      JSON.stringify([
        { id: 'g', code: 'S1', name: 'South Zone', parentId: null, isGroup: true, active: true },
        { id: 't', code: 'CHN', name: 'Chennai', parentId: 'g', isGroup: false, active: true },
      ]),
    );
    const user = userEvent.setup();
    wrap(<TerritoryTab />);

    await screen.findByText('Chennai');
    const rows = screen.getAllByRole('row');
    const names = rows.slice(1).map((r) => r.textContent ?? '');
    expect(names[0]).toContain('South Zone');
    expect(names[1]).toContain('Chennai');
    expect(names[1]).toContain('South Zone'); // "Under group" column

    await user.click(screen.getByRole('button', { name: 'Delete S1' }));
    expect(await screen.findByText('Move or delete the territories under it first.')).toBeInTheDocument();
    expect(screen.getByText('South Zone', { selector: 'span' })).toBeInTheDocument();
  });
});

describe('Param list', () => {
  it('checks the value against its type', async () => {
    const user = userEvent.setup();
    wrap(<ParamTab />);
    await user.click(await screen.findByRole('button', { name: /add parameter/i }));
    await user.type(dialog().getByLabelText(/^Parameter key/), 'bill_copies');
    await user.type(dialog().getByLabelText(/^Description/), 'Copies printed per bill');

    await user.click(dialog().getByRole('combobox', { name: /Value type/ }));
    await user.click(await screen.findByRole('option', { name: /Number/ }));
    await user.type(dialog().getByRole('textbox', { name: /^Value/ }), 'two');
    await user.click(dialog().getByRole('button', { name: 'Save' }));
    expect(await dialog().findByText('Enter a number')).toBeInTheDocument();

    await user.clear(dialog().getByRole('textbox', { name: /^Value/ }));
    await user.type(dialog().getByRole('textbox', { name: /^Value/ }), '2');
    await user.click(dialog().getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('BILL_COPIES')).toBeInTheDocument();
  });
});
