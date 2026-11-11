import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { z } from 'zod';
import { rules } from '@/validations/common';
import {
  AmountField,
  DropdownField,
  Form,
  FormActions,
  PasswordField,
  PhoneField,
  TextField,
  useAppForm,
} from './index';

const schema = z.object({
  name: rules.text('Name', { min: 2 }),
  phone: rules.phone(),
  amount: rules.amount('Amount', { min: 1 }),
  category: rules.select('Category'),
  password: rules.password(),
});

type Values = z.input<typeof schema>;

function TestForm({ onSubmit, defaults }: { onSubmit: (v: z.output<typeof schema>) => unknown; defaults?: Partial<Values> }) {
  const form = useAppForm(schema, {
    defaultValues: { name: '', phone: '', amount: undefined, category: null as unknown as string, password: '', ...defaults },
  });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField name="name" label="Name" required />
      <PhoneField name="phone" label="Phone" required />
      <AmountField name="amount" label="Amount" required />
      <DropdownField
        name="category"
        label="Category"
        required
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]}
      />
      <PasswordField name="password" label="Password" required />
      <FormActions submitLabel="Save" />
    </Form>
  );
}

describe('Form system', () => {
  it('shows a required error when leaving a field, before any submit', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    await user.click(screen.getByLabelText(/Name/));
    await user.tab();
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows other validation errors on blur and clears them while typing a valid value', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    const name = screen.getByLabelText(/Name/);
    await user.type(name, 'A');
    await user.tab();
    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    await user.type(name, 'B');
    await waitFor(() => expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument());
  });

  it('links the error to the input for screen readers', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    const name = screen.getByLabelText(/Name/);
    await user.click(name);
    await user.tab();
    await screen.findByText('Name is required');
    const describedBy = name.getAttribute('aria-describedby')!;
    expect(document.getElementById(describedBy)).toHaveTextContent('Name is required');
  });

  it('phone field keeps digits only (max 10) and validates the format', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    const phone = screen.getByLabelText(/Phone/);
    await user.type(phone, '98a-76 543210999');
    expect(phone).toHaveValue('9876543210');
    await user.clear(phone);
    await user.type(phone, '12345');
    await user.tab();
    expect(await screen.findByText(/valid 10-digit mobile number/)).toBeInTheDocument();
  });

  it('amount field ignores letters and limits decimals', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    const amount = screen.getByLabelText(/Amount/);
    await user.type(amount, '12ab.345');
    expect(amount).toHaveValue('12.34');
  });

  it('dropdown field shows "Select …" error when closed without choosing', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('combobox', { name: /Category/ }));
    await user.keyboard('{Escape}');
    expect(await screen.findByText('Select category')).toBeInTheDocument();
  });

  it('submit shows every error, focuses the first invalid field and does not call onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Mobile number is required')).toBeInTheDocument();
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
    expect(screen.getByText('Select category')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits parsed values when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/Name/), '  Ravi  ');
    await user.type(screen.getByLabelText(/Phone/), '9876543210');
    await user.type(screen.getByLabelText(/Amount/), '150.5');
    await user.click(screen.getByRole('combobox', { name: /Category/ }));
    await user.click(screen.getByRole('option', { name: 'Beta' }));
    await user.type(screen.getByLabelText(/^Password/), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      name: 'Ravi',
      phone: '9876543210',
      amount: 150.5,
      category: 'b',
      password: 'secret123',
    });
  });

  it('password field toggles visibility', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    const password = screen.getByLabelText(/^Password/);
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
  });

  it('maps server validation errors to fields and other errors to a form alert', async () => {
    const user = userEvent.setup();
    const serverError = new AxiosError('Bad Request', '400', undefined, undefined, {
      status: 400,
      data: { message: 'phone must be a valid 10-digit Indian mobile number', errors: ['phone must be a valid 10-digit Indian mobile number', 'Shop is suspended'] },
    } as AxiosResponse);
    const onSubmit = vi.fn().mockRejectedValue(serverError);

    render(
      <TestForm
        onSubmit={onSubmit}
        defaults={{ name: 'Ravi', phone: '9876543210', amount: 10, category: 'a', password: 'secret123' }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Must be a valid 10-digit Indian mobile number')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Shop is suspended');
  });

  it('shows a loading state and blocks double submit while saving', async () => {
    const user = userEvent.setup();
    let finish: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(
      <TestForm
        onSubmit={onSubmit}
        defaults={{ name: 'Ravi', phone: '9876543210', amount: 10, category: 'a', password: 'secret123' }}
      />,
    );
    const save = screen.getByRole('button', { name: 'Save' });
    await user.click(save);
    await waitFor(() => expect(save).toBeDisabled());
    expect(save).toHaveAttribute('aria-busy', 'true');
    await user.click(save);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    finish();
    await waitFor(() => expect(save).not.toBeDisabled());
  });
});
