import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/feedback';
import { api } from '@/lib/api';
import { AddSupplierModal } from './AddSupplierModal';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  api: { post: vi.fn(), get: vi.fn() },
}));

function setup() {
  const onClose = vi.fn();
  const onSupplierAdded = vi.fn();
  render(
    <ToastProvider>
      <AddSupplierModal isOpen onClose={onClose} onSupplierAdded={onSupplierAdded} />
    </ToastProvider>,
  );
  return { user: userEvent.setup(), onClose, onSupplierAdded };
}

describe('AddSupplierModal', () => {
  beforeEach(() => vi.mocked(api.post).mockReset());

  it('shows a required error when leaving the firm name empty', async () => {
    const { user } = setup();
    await user.click(screen.getByLabelText(/Company \/ firm name/));
    await user.tab();
    expect(await screen.findByText('Supplier name is required')).toBeInTheDocument();
  });

  it('validates email, credit days and PIN code', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/^Email/), 'orders@');
    await user.tab();
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();

    const days = screen.getByLabelText(/Credit days/);
    await user.clear(days);
    await user.type(days, '400');
    await user.tab();
    // The field clamps to its max when left, so an out-of-range value can't be submitted.
    expect(days).toHaveValue('365');
    expect(screen.queryByText('Credit days must be at most 365')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/PIN code/), '0123');
    await user.tab();
    expect(await screen.findByText('Enter a valid 6-digit PIN code')).toBeInTheDocument();
  });

  it('registers the supplier with category and without an empty address', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    const { user, onClose, onSupplierAdded } = setup();
    await user.type(screen.getByLabelText(/Company \/ firm name/), 'Sri Meenakshi Traders');
    await user.type(screen.getByLabelText(/Phone number/), '9840122334');
    await user.click(screen.getByRole('combobox', { name: /Category/ }));
    await user.click(screen.getByRole('option', { name: 'Dairy' }));
    await user.click(screen.getByRole('button', { name: 'Register supplier' }));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/suppliers', {
        name: 'Sri Meenakshi Traders',
        contactPerson: undefined,
        phone: '9840122334',
        email: undefined,
        gstin: undefined,
        category: 'Dairy',
        creditDays: 30,
        address: undefined,
      }),
    );
    expect(onSupplierAdded).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
