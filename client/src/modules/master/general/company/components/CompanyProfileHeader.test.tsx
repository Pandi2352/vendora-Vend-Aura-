import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanyProfileHeader } from './CompanyProfileHeader';

const base = {
  companyName: 'Test shop 2',
  shopId: 'tst02',
  updatedOn: '2026-11-12',
  updatedBy: 'signup',
  facts: { gstin: null, location: 'Sivakasi, Tamil Nadu', currency: 'INR · ₹' },
};

describe('CompanyProfileHeader', () => {
  it('shows identity, facts, "Add" for missing ones and a saved status', async () => {
    const onFactSelect = vi.fn();
    const user = userEvent.setup();
    render(<CompanyProfileHeader {...base} unsavedCount={0} onReset={vi.fn()} onFactSelect={onFactSelect} />);

    expect(screen.getByText('TS')).toBeInTheDocument();
    expect(screen.getByText('@tst02')).toBeInTheDocument();
    expect(screen.getByText('Sivakasi, Tamil Nadu')).toBeInTheDocument();
    expect(screen.getAllByText('Add')).toHaveLength(3); // GSTIN, Tax, Max discount
    expect(screen.getByRole('status')).toHaveTextContent('All changes saved');
    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /GSTIN: not set/ }));
    expect(onFactSelect).toHaveBeenCalledWith('gstin');
  });

  it('shows how many changes are unsaved and enables Reset', async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();
    render(<CompanyProfileHeader {...base} unsavedCount={3} onReset={onReset} />);

    expect(screen.getByRole('status')).toHaveTextContent('3 unsaved changes');
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
