import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmProvider } from '@/components/feedback';
import type { HeldCart } from '@/types/shift-return.types';
import { HeldCartsModal } from './HeldCartsModal';

const held: HeldCart = {
  id: 'h1',
  heldAt: '2026-11-11T05:00:00.000Z',
  items: [{ name: 'Rice 1kg', quantity: 2 } as HeldCart['items'][number]],
  subTotal: 100,
  taxTotal: 5,
  grandTotal: 105,
};

function setup() {
  const onDiscardCart = vi.fn();
  render(
    <ConfirmProvider>
      <HeldCartsModal isOpen onClose={vi.fn()} heldCarts={[held]} onResumeCart={vi.fn()} onDiscardCart={onDiscardCart} />
    </ConfirmProvider>,
  );
  return { user: userEvent.setup(), onDiscardCart };
}

describe('HeldCartsModal', () => {
  it('asks before discarding a held bill and keeps it when cancelled', async () => {
    const { user, onDiscardCart } = setup();
    await user.click(screen.getByRole('button', { name: 'Discard Cart #1' }));
    expect(await screen.findByText('Discard Cart #1?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDiscardCart).not.toHaveBeenCalled();
  });

  it('discards after confirming', async () => {
    const { user, onDiscardCart } = setup();
    await user.click(screen.getByRole('button', { name: 'Discard Cart #1' }));
    await user.click(await screen.findByRole('button', { name: 'Discard bill' }));
    expect(onDiscardCart).toHaveBeenCalledWith('h1');
  });
});
