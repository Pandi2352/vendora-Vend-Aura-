import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/feedback';
import { api } from '@/lib/api';
import type { ProductItem, SupplierItem } from '@/types/pos.types';
import { InwardStockModal } from './InwardStockModal';
import { SettleDuesModal } from './SettleDuesModal';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  api: { post: vi.fn(), get: vi.fn() },
}));

const supplier: SupplierItem = {
  id: 's1',
  name: 'Sri Meenakshi Traders',
  phone: '9840122334',
  creditDays: 30,
  category: 'Dairy',
  balanceDue: 2000,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const products: ProductItem[] = [
  {
    id: 'p1',
    name: 'Ponni Rice 5kg',
    category: 'Staples',
    barcode: '8901',
    unitPrice: 400,
    mrp: 420,
    costPrice: 300,
    taxRatePercent: 5,
    stock: 4,
  },
];

function renderInward(onInwardSuccess = vi.fn()) {
  render(
    <ToastProvider>
      <InwardStockModal
        isOpen
        suppliers={[supplier]}
        products={products}
        onClose={vi.fn()}
        onInwardSuccess={onInwardSuccess}
      />
    </ToastProvider>,
  );
  return userEvent.setup();
}

describe('InwardStockModal', () => {
  beforeEach(() => vi.mocked(api.post).mockReset());

  it('requires a supplier and a product on submit', async () => {
    const user = renderInward();
    await user.click(screen.getByRole('button', { name: /Confirm inward/ }));
    expect(await screen.findByText('Select supplier')).toBeInTheDocument();
    expect(screen.getByText('Select product')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('asks for at least one line after removing all lines', async () => {
    const user = renderInward();
    await user.click(screen.getByRole('button', { name: 'Remove line 1' }));
    await user.click(screen.getByRole('combobox', { name: /Supplier/ }));
    await user.click(screen.getByRole('option', { name: /Sri Meenakshi/ }));
    await user.click(screen.getByRole('button', { name: /Confirm inward/ }));
    expect(await screen.findByText('Add at least one product line')).toBeInTheDocument();
  });

  it('prefills cost and GST from the product and posts the GRN payload', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    const onInwardSuccess = vi.fn();
    const user = renderInward(onInwardSuccess);
    await user.click(screen.getByRole('combobox', { name: /Supplier/ }));
    await user.click(screen.getByRole('option', { name: /Sri Meenakshi/ }));
    await user.click(screen.getByRole('combobox', { name: /Product/ }));
    await user.click(screen.getByRole('option', { name: /Ponni Rice/ }));
    expect(screen.getByLabelText(/Cost \/ unit/)).toHaveValue('300');
    await user.click(screen.getByRole('radio', { name: 'Partial' }));
    await user.type(screen.getByLabelText(/Amount paid now/), '9999');
    await user.click(screen.getByRole('button', { name: /Confirm inward/ }));
    expect(await screen.findByText(/cannot be more than the bill total/)).toBeInTheDocument();

    const paid = screen.getByLabelText(/Amount paid now/);
    await user.clear(paid);
    await user.type(paid, '1000');
    await user.click(screen.getByRole('button', { name: /Confirm inward/ }));
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(vi.mocked(api.post).mock.calls[0]).toEqual([
      '/suppliers/inward',
      {
        supplierId: 's1',
        supplierInvoiceNumber: undefined,
        items: [
          {
            productId: 'p1',
            name: 'Ponni Rice 5kg',
            barcode: '8901',
            quantityReceived: 10,
            unitCostPrice: 300,
            taxRatePercent: 5,
            taxAmount: 150,
            total: 3150,
          },
        ],
        subTotal: 3000,
        taxTotal: 150,
        grandTotal: 3150,
        paymentStatus: 'PARTIAL',
        amountPaid: 1000,
        notes: undefined,
      },
    ]);
    expect(onInwardSuccess).toHaveBeenCalled();
  });
});

describe('SettleDuesModal', () => {
  it('rejects paying more than the balance due', async () => {
    vi.mocked(api.post).mockReset();
    render(
      <ToastProvider>
        <SettleDuesModal supplier={supplier} onClose={vi.fn()} onPaymentSuccess={vi.fn()} />
      </ToastProvider>,
    );
    const user = userEvent.setup();
    const amount = screen.getByLabelText(/Amount to pay/);
    await user.clear(amount);
    await user.type(amount, '2500');
    await user.click(screen.getByRole('button', { name: 'Confirm payment' }));
    expect(await screen.findByText(/cannot be more than the balance due/)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });
});
