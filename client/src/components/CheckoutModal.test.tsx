import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutModal } from './CheckoutModal';

function setup() {
  const onFinalize = vi.fn();
  render(
    <CheckoutModal
      grandTotal={450}
      customers={[]}
      selectedCustomer={null}
      onSelectCustomer={vi.fn()}
      onClose={vi.fn()}
      onFinalize={onFinalize}
    />,
  );
  return { user: userEvent.setup(), onFinalize };
}

describe('CheckoutModal cash tender', () => {
  it('completes immediately with the default exact cash', async () => {
    const { user, onFinalize } = setup();
    await user.click(screen.getByRole('button', { name: /Complete & print bill/ }));
    expect(onFinalize).toHaveBeenCalledWith('CASH', 450, null, null, null);
  });

  it('shows the short-cash error under the field when it is left, and blocks completion', async () => {
    const { user, onFinalize } = setup();
    const cash = screen.getByLabelText(/Cash tendered/);
    await user.clear(cash);
    await user.type(cash, '400');
    await user.tab();
    expect(await screen.findByText(/Cash tendered must be at least ₹450/)).toBeInTheDocument();
    expect(cash).toHaveAttribute('aria-invalid', 'true');

    await user.click(screen.getByRole('button', { name: /Complete & print bill/ }));
    expect(onFinalize).not.toHaveBeenCalled();
    expect(cash).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '+₹100' }));
    expect(screen.queryByText(/Cash tendered must be at least ₹450/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Complete & print bill/ }));
    expect(onFinalize).toHaveBeenCalledWith('CASH', 500, null, null, null);
  });
});
