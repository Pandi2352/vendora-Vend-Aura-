import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/feedback';
import { api } from '@/lib/api';
import { AddCustomerModal } from './AddCustomerModal';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  api: { post: vi.fn(), get: vi.fn() },
}));

function setup() {
  const onClose = vi.fn();
  const onCustomerAdded = vi.fn();
  render(
    <ToastProvider>
      <AddCustomerModal isOpen onClose={onClose} onCustomerAdded={onCustomerAdded} />
    </ToastProvider>,
  );
  return { user: userEvent.setup(), onClose, onCustomerAdded };
}

describe('AddCustomerModal', () => {
  beforeEach(() => vi.mocked(api.post).mockReset());

  it('shows a required error when leaving the name empty', async () => {
    const { user } = setup();
    await user.click(screen.getByLabelText(/Customer full name/));
    await user.tab();
    expect(await screen.findByText('Customer name is required')).toBeInTheDocument();
  });

  it('validates phone and GSTIN formats', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/Mobile number/), '12345');
    await user.tab();
    expect(await screen.findByText(/valid 10-digit mobile number/)).toBeInTheDocument();
    const gstin = screen.getByLabelText(/GSTIN/);
    await user.type(gstin, '33abc');
    expect(gstin).toHaveValue('33ABC');
    await user.tab();
    expect(await screen.findByText(/valid 15-character GSTIN/)).toBeInTheDocument();
  });

  it('creates the customer with the default credit limit and closes', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    const { user, onClose, onCustomerAdded } = setup();
    await user.type(screen.getByLabelText(/Customer full name/), ' Arun Kumar ');
    await user.type(screen.getByLabelText(/Mobile number/), '9840123456');
    await user.click(screen.getByRole('button', { name: 'Save customer' }));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/customers', {
        name: 'Arun Kumar',
        phone: '9840123456',
        email: undefined,
        gstin: undefined,
        creditLimit: 5000,
        notes: undefined,
      }),
    );
    expect(onCustomerAdded).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByText('Customer added')).toBeInTheDocument();
  });
});
