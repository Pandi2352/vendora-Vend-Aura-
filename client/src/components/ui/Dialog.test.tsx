import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from './Dialog';

function Stacked() {
  const [outer, setOuter] = useState(true);
  const [inner, setInner] = useState(false);
  return (
    <>
      <Dialog open={outer} onClose={() => setOuter(false)} title="Held bills">
        <button type="button" onClick={() => setInner(true)}>
          Discard
        </button>
      </Dialog>
      <Dialog open={inner} onClose={() => setInner(false)} title="Discard bill?">
        <button type="button">Yes</button>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('Escape closes only the topmost of stacked dialogs', async () => {
    const user = userEvent.setup();
    render(<Stacked />);
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(screen.getByRole('dialog', { name: 'Discard bill?' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Discard bill?' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Held bills' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Held bills' })).not.toBeInTheDocument();
  });

  it('moves focus inside and restores it on close', async () => {
    const user = userEvent.setup();
    function Opener() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Edit">
            <input aria-label="Name" />
          </Dialog>
        </>
      );
    }
    render(<Opener />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });
});
