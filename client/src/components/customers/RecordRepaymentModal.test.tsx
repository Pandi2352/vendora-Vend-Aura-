import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/feedback';
import { api } from '@/lib/api';
import type { CustomerItem } from '@/types/pos.types';
import { RecordRepaymentModal } from './RecordRepaymentModal';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  api: { post: vi.fn(), get: vi.fn() },
}));

const customer: CustomerItem = {
  id: 'c1',
  name: 'Arun Kumar',
  phone: '9840123456',
  creditLimit: 5000,
  currentCreditBalance: 1200,
  totalPurchasesCount: 3,
  totalSpent: 4000,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function setup() {
  const onClose = vi.fn();
  const onRepaymentSuccess = vi.fn();
  render(
    <ToastProvider>
      <RecordRepaymentModal customer={customer} onClose={onClose} onRepaymentSuccess={onRepaymentSuccess} />
    </ToastProvider>,
  );
  return { user: userEvent.setup(), onClose, onRepaymentSuccess };
}

describe('RecordRepaymentModal', () => {
  beforeEach(() => vi.mocked(api.post).mockReset());

  it('prefills the outstanding balance and requires an amount', async () => {
    const { user } = setup();
    const amount = screen.getByLabelText(/Repayment amount/);
    expect(amount).toHaveValue('1200');
    await user.clear(amount);
    await user.tab();
    expect(await screen.findByText('Amount is required')).toBeInTheDocument();
  });

  it('rejects an amount above the outstanding balance', async () => {
    const { user } = setup();
    const amount = screen.getByLabelText(/Repayment amount/);
    await user.clear(amount);
    await user.type(amount, '1500');
    await user.click(screen.getByRole('button', { name: 'Confirm repayment' }));
    expect(await screen.findByText(/cannot be more than the outstanding balance/)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('records the repayment with mode and reference', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    const { user, onClose, onRepaymentSuccess } = setup();
    const amount = screen.getByLabelText(/Repayment amount/);
    await user.clear(amount);
    await user.type(amount, '500');
    await user.click(screen.getByRole('radio', { name: 'Cash' }));
    await user.type(screen.getByLabelText(/Payment reference/), 'RCPT-9');
    await user.click(screen.getByRole('button', { name: 'Confirm repayment' }));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/customers/c1/payment', {
        amount: 500,
        paymentMode: 'CASH',
        referenceNumber: 'RCPT-9',
        remarks: undefined,
      }),
    );
    expect(onRepaymentSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
