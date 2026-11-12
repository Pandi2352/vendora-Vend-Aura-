import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { checkboxGroupRule } from '@/validations/selection-checkbox';
import { Form } from './Form';
import { useAppForm } from './useAppForm';
import { CheckboxGroupField } from './CheckboxGroupField';

const OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI', description: 'GPay, PhonePe, Paytm' },
  { value: 'card', label: 'Card' },
  { value: 'credit', label: 'Store credit', disabled: true },
];

function TestForm({ max, showSelectAll, onSubmit = vi.fn() }: { max?: number; showSelectAll?: boolean; onSubmit?: (v: { methods: string[] }) => void }) {
  const form = useAppForm(z.object({ methods: checkboxGroupRule('Payment methods', { min: 2, max }) }), {
    defaultValues: { methods: [] as string[] },
  });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <CheckboxGroupField name="methods" label="Payment methods" required options={OPTIONS} min={2} max={max} showSelectAll={showSelectAll} />
      <button type="submit">Save</button>
    </Form>
  );
}

describe('CheckboxGroupField', () => {
  it('is a labelled group with a default hint', () => {
    render(<TestForm />);
    expect(screen.getByRole('group', { name: /Payment methods/ })).toBeInTheDocument();
    expect(screen.getByText('Choose at least 2.')).toBeInTheDocument();
  });

  it('shows the min error after leaving the group, not while moving inside it', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.click(screen.getByLabelText('Cash'));
    await user.tab(); // to UPI, still inside the group
    expect(screen.queryByText('Choose at least 2 payment methods')).not.toBeInTheDocument();
    await user.click(document.body);
    expect(await screen.findByText('Choose at least 2 payment methods')).toBeInTheDocument();
  });

  it('disables unchecked boxes once max is reached and submits values in option order', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm max={2} onSubmit={onSubmit} />);
    await user.click(screen.getByLabelText('Card'));
    await user.click(screen.getByLabelText('Cash'));
    expect(screen.getByLabelText(/UPI/)).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith({ methods: ['cash', 'card'] });
    await user.click(screen.getByLabelText('Card'));
    expect(screen.getByLabelText(/UPI/)).toBeEnabled();
  });

  it('select all toggles every enabled option and shows a mixed state', async () => {
    const user = userEvent.setup();
    render(<TestForm showSelectAll />);
    const all = screen.getByLabelText('Select all');
    await user.click(screen.getByLabelText('Cash'));
    expect(all).toBePartiallyChecked();
    await user.click(all);
    expect(all).toBeChecked();
    expect(screen.getByLabelText(/UPI/)).toBeChecked();
    expect(screen.getByLabelText('Store credit')).not.toBeChecked();
    await user.click(all);
    expect(screen.getByLabelText('Cash')).not.toBeChecked();
    expect(all).not.toBeChecked();
  });
});
