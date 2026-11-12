import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import { PreferencesProvider } from '@/app/providers/PreferencesProvider';
import { ToastProvider } from '@/components/feedback';
import type { ShiftSummary } from '@/types/shift-return.types';
import { CashDrawerModal } from './CashDrawerModal';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  api: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(api.get);
const post = vi.mocked(api.post);

const openShift: ShiftSummary = {
  _id: '665f00000000000000000001',
  shiftNumber: 'SH-0001',
  cashierName: 'Ravi',
  openedAt: '2026-11-11T04:30:00.000Z',
  openingFloat: 2000,
  expectedCash: 5400,
  cashSalesTotal: 3400,
  upiSalesTotal: 1200,
  cardSalesTotal: 0,
  creditSalesTotal: 0,
  refundsTotal: 0,
  cashRefundsTotal: 0,
  billsCount: 12,
  status: 'OPEN',
};

const envelope = (data: unknown) => ({ data: { data } }) as never;

function wrap(ui: ReactNode) {
  return render(
    <PreferencesProvider>
      <ToastProvider>{ui}</ToastProvider>
    </PreferencesProvider>,
  );
}

describe('CashDrawerModal', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('close-shift form shows a required error when counted cash is left empty', async () => {
    get.mockResolvedValue(envelope(openShift));
    const user = userEvent.setup();
    wrap(<CashDrawerModal isOpen onClose={vi.fn()} />);

    const counted = await screen.findByLabelText(/Cash counted/);
    await user.click(counted);
    await user.tab();
    expect(await screen.findByText('Counted cash is required')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('closes the shift with the counted cash and shows the variance', async () => {
    get.mockResolvedValue(envelope(openShift));
    post.mockResolvedValue(envelope({ ...openShift, status: 'CLOSED' }));
    const onShiftChange = vi.fn();
    const user = userEvent.setup();
    wrap(<CashDrawerModal isOpen onClose={vi.fn()} onShiftChange={onShiftChange} />);

    await user.type(await screen.findByLabelText(/Cash counted/), '5300');
    expect(screen.getByText(/\(shortage\)/)).toBeInTheDocument();
    // After closing, the server has no current shift.
    get.mockImplementation(async (url: string) => envelope(url.includes('history') ? [] : null));
    await user.click(screen.getByRole('button', { name: /Reconcile & close shift/ }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/orders/shifts/close', {
        shiftId: openShift._id,
        actualCashCounted: 5300,
        notes: undefined,
      }),
    );
    expect(await screen.findByText('Shift closed')).toBeInTheDocument();
    expect(onShiftChange).toHaveBeenLastCalledWith(null);
  });

  it('opens a shift with the default float from preferences', async () => {
    get.mockImplementation(async (url: string) => envelope(url.includes('history') ? [] : null));
    post.mockResolvedValue(envelope(openShift));
    const user = userEvent.setup();
    wrap(<CashDrawerModal isOpen onClose={vi.fn()} />);

    const float = await screen.findByLabelText(/Opening cash float/);
    expect(float).toHaveValue('2,000'); // AmountField shows grouped digits when not focused
    await user.clear(float);
    await user.tab();
    expect(await screen.findByText('Opening float is required')).toBeInTheDocument();

    await user.type(float, '1500');
    await user.type(screen.getByLabelText(/Opening notes/), 'Morning');
    await user.click(screen.getByRole('button', { name: /Open shift with/ }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/orders/shifts/open', { openingFloat: 1500, notes: 'Morning' }),
    );
    expect(await screen.findByText('Shift opened')).toBeInTheDocument();
  });
});
