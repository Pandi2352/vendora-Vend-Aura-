import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '@/lib/api';
import { ToastProvider } from '@/components/feedback';
import type { InvoiceReturnLookup } from '@/types/shift-return.types';
import { SalesReturnModal } from './SalesReturnModal';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  api: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(api.get);
const post = vi.mocked(api.post);
const envelope = (data: unknown) => ({ data: { data } }) as never;

const lookup = (customerId?: string): InvoiceReturnLookup => ({
  order: {
    id: 'o1',
    invoiceNumber: 'INV-2026-00012',
    customerId,
    customerName: customerId ? 'Meena' : undefined,
    subTotal: 200,
    taxTotal: 10,
    cgst: 5,
    sgst: 5,
    grandTotal: 210,
    paymentMode: 'CASH',
    cashTendered: 210,
    changeDue: 0,
    cashierName: 'Ravi',
    itemsCount: 2,
    createdAt: '2026-11-10T10:00:00.000Z',
  },
  returns: [],
  returnableItems: [
    { productId: 'p1', name: 'Rice 1kg', barcode: '1', soldQty: 3, returnedQty: 1, returnableQty: 2, unitPrice: 50, taxRatePercent: 5, unitRefund: 52.5 },
    { productId: 'p2', name: 'Soap', barcode: '2', soldQty: 1, returnedQty: 0, returnableQty: 1, unitPrice: 100, taxRatePercent: 5, unitRefund: 105 },
  ],
});

async function findBill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Invoice number/), 'inv-2026-00012');
  await user.click(screen.getByRole('button', { name: 'Find bill' }));
  await screen.findByText('Rice 1kg');
}

function setup(customerId?: string) {
  get.mockResolvedValue(envelope(lookup(customerId)));
  const onReturnSuccess = vi.fn();
  render(
    <ToastProvider>
      <SalesReturnModal onClose={vi.fn()} onReturnSuccess={onReturnSuccess} />
    </ToastProvider>,
  );
  return { user: userEvent.setup(), onReturnSuccess };
}

describe('SalesReturnModal', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('requires an invoice number before searching', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Find bill' }));
    expect(await screen.findByText('Invoice number is required')).toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  });

  it('looks the bill up by uppercase invoice number', async () => {
    const { user } = setup();
    await findBill(user);
    expect(get).toHaveBeenCalledWith('/orders/returns/invoice/INV-2026-00012');
  });

  it('requires a reason when a quantity is entered, and limits the quantity to what is returnable', async () => {
    const { user } = setup();
    await findBill(user);

    const [riceQty] = screen.getAllByLabelText(/Return qty/);
    await user.clear(riceQty);
    await user.type(riceQty, '3');
    await user.tab();
    expect(await screen.findByText('Only 2 can be returned')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Confirm return/ }));
    expect(await screen.findByText('Select a reason')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('asks for at least one item', async () => {
    const { user } = setup();
    await findBill(user);
    await user.click(screen.getByRole('button', { name: /Confirm return/ }));
    expect(await screen.findByText('Enter a return quantity for at least one item')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('hides the khata refund option for walk-in bills', async () => {
    const { user } = setup();
    await findBill(user);
    await user.click(screen.getByRole('combobox', { name: /Refund method/ }));
    expect(screen.queryByRole('option', { name: /khata/i })).not.toBeInTheDocument();
  });

  it('submits only the returned lines with refund preview', async () => {
    const { user, onReturnSuccess } = setup('c1');
    post.mockResolvedValue(
      envelope({
        returnNumber: 'RET-0001',
        originalInvoiceNumber: 'INV-2026-00012',
        items: [],
        totalRefundAmount: 105,
        refundMode: 'CUSTOMER_KHATA',
        cashierName: 'Ravi',
        createdAt: '2026-11-11T10:00:00.000Z',
      }),
    );
    await findBill(user);

    const [riceQty] = screen.getAllByLabelText(/Return qty/);
    await user.clear(riceQty);
    await user.type(riceQty, '2');
    const [riceReason] = screen.getAllByRole('combobox', { name: /Reason/ });
    await user.click(riceReason);
    await user.click(screen.getByRole('option', { name: 'Defective / damaged' }));
    expect(screen.getByRole('button', { name: /Confirm return \(₹105/ })).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: /Refund method/ }));
    await user.click(screen.getByRole('option', { name: 'Credit to customer khata' }));
    await user.type(screen.getByLabelText(/Return remarks/), 'Torn pack');
    await user.click(screen.getByRole('button', { name: /Confirm return/ }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/orders/returns', {
        originalInvoiceNumber: 'INV-2026-00012',
        items: [{ productId: 'p1', quantityReturned: 2, reason: 'DEFECTIVE' }],
        refundMode: 'CUSTOMER_KHATA',
        remarks: 'Torn pack',
      }),
    );
    expect(await screen.findByText('Return processed', { selector: 'h4' })).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByText('RET-0001')).toBeInTheDocument();
    expect(onReturnSuccess).toHaveBeenCalled();
  });
});
