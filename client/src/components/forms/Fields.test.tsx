import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { rules, withPasswordConfirmation } from '@/validations/common';
import {
  AmountField,
  EmailField,
  Form,
  NumberField,
  PasswordField,
  PercentField,
  PhoneField,
  RadioGroupField,
  TextareaField,
  TextField,
  useAppForm,
} from './index';

const schema = withPasswordConfirmation(
  z.object({
    code: rules.text('Code', { max: 10 }),
    email: rules.email(),
    phone: rules.phone(),
    qty: rules.number('Quantity', { min: 1, max: 5, integer: true }),
    price: rules.amount('Price'),
    discount: rules.number('Discount', { min: 0, max: 100 }),
    notes: rules.optionalText('Notes', { max: 20 }),
    mode: rules.selectOneOf('Mode', ['CASH', 'UPI'] as const),
    plan: rules.selectOneOf('Plan', ['BASIC', 'PRO'] as const),
    newPassword: rules.password(),
    confirmPassword: z.string(),
  }),
);

type Defaults = Partial<z.input<typeof schema>>;

function TestForm({ defaults = {}, errorSummary = false }: { defaults?: Defaults; errorSummary?: boolean }) {
  const form = useAppForm(schema, {
    defaultValues: {
      code: '',
      email: '',
      phone: '',
      qty: undefined,
      price: undefined,
      discount: undefined,
      notes: '',
      mode: undefined,
      plan: undefined,
      newPassword: '',
      confirmPassword: '',
      ...defaults,
    } as never,
  });
  return (
    <Form form={form} onSubmit={vi.fn()} errorSummary={errorSummary}>
      <TextField
        name="code"
        label="Code"
        required
        clearable
        showCount
        maxLength={10}
        tooltip="Printed on the label"
        labelAction={<a href="#help">Help</a>}
        description="Letters and digits"
      />
      <EmailField name="email" label="Email" required />
      <PhoneField name="phone" label="Phone" required />
      <NumberField name="qty" label="Quantity" required decimals={0} min={1} max={5} stepper />
      <AmountField name="price" label="Price" required />
      <PercentField name="discount" label="Discount" optional />
      <TextareaField name="notes" label="Notes" maxLength={20} autoResize />
      <RadioGroupField
        name="mode"
        label="Mode"
        variant="segmented"
        options={[
          { value: 'CASH', label: 'Cash' },
          { value: 'UPI', label: 'UPI' },
        ]}
      />
      <RadioGroupField
        name="plan"
        label="Plan"
        variant="cards"
        options={[
          { value: 'BASIC', label: 'Basic', description: '1 outlet' },
          { value: 'PRO', label: 'Pro', description: '5 outlets' },
        ]}
      />
      <PasswordField name="newPassword" label="New password" required showStrength deps={['confirmPassword']} />
      <PasswordField name="confirmPassword" label="Confirm password" required />
      <button type="submit">Save</button>
      <output data-testid="values">{JSON.stringify(form.watch())}</output>
    </Form>
  );
}

const values = () => JSON.parse(screen.getByTestId('values').textContent || '{}');

describe('field shell (common props)', () => {
  it('renders required asterisk, optional marker, description, tooltip and label action', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const code = screen.getByLabelText(/^Code/);
    expect(code).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('(optional)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Help' })).toBeInTheDocument();
    // description is announced with the control
    const describedBy = code.getAttribute('aria-describedby')!.split(' ');
    expect(describedBy.map((id) => document.getElementById(id)?.textContent).join(' ')).toContain('Letters and digits');
    // tooltip shows on keyboard focus
    await user.tab(); // the info button sits in the label row, before the input
    expect(screen.getByRole('button', { name: 'More information' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Printed on the label');
  });

  it('error summary lists every error with links that focus the field', async () => {
    const user = userEvent.setup();
    render(<TestForm errorSummary />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const summary = await screen.findByText('There is a problem');
    expect(summary).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Email is required' }));
    expect(screen.getByLabelText(/^Email/)).toHaveFocus();
  });
});

describe('TextField', () => {
  it('counts characters and clears', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const code = screen.getByLabelText(/^Code/);
    await user.type(code, 'ABC');
    const msgId = code.getAttribute('aria-describedby')!.split(' ').pop()!;
    expect(document.getElementById(msgId)).toHaveTextContent('3/10');
    expect(code).toHaveFocus(); // the clear button appearing must not remount the input
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(values().code).toBe('');
  });

  it('email lower-cases and strips spaces; phone accepts a pasted +91 number', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.type(screen.getByLabelText(/^Email/), 'Owner @Shop.IN');
    expect(values().email).toBe('owner@shop.in');
    const phone = screen.getByLabelText(/^Phone/);
    await user.click(phone);
    await user.paste('+91 98765 43210');
    expect(values().phone).toBe('9876543210');
  });
});

describe('NumberField', () => {
  it('steps with buttons and arrow keys within min / max', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const qty = screen.getByLabelText(/^Quantity/);
    await user.click(screen.getAllByRole('button', { name: 'Increase' })[0]);
    expect(values().qty).toBe(2); // starts at min (1) + step
    await user.click(qty);
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(values().qty).toBe(5); // clamped at max
    await user.keyboard('{ArrowDown}');
    expect(values().qty).toBe(4);
  });

  it('clamps typed values on blur and blocks decimals for integers', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const qty = screen.getByLabelText(/^Quantity/);
    await user.type(qty, '9.5');
    expect(qty).toHaveValue('95');
    await user.tab();
    expect(values().qty).toBe(5);
  });

  it('amount shows Indian grouping when not focused; percent clamps to 100', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const price = screen.getByLabelText(/^Price/);
    await user.type(price, '123456.5');
    expect(price).toHaveValue('123456.5');
    await user.tab();
    expect(price).toHaveValue('1,23,456.5');
    const discount = screen.getByLabelText(/^Discount/);
    await user.type(discount, '150');
    await user.tab();
    expect(values().discount).toBe(100);
  });
});

describe('TextareaField and RadioGroupField variants', () => {
  it('textarea counts characters', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.type(screen.getByLabelText(/^Notes/), 'hello');
    expect(screen.getByText('5/20')).toBeInTheDocument();
  });

  it('segmented and card radios select with click and arrow keys', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.click(screen.getByText('Cash'));
    expect(values().mode).toBe('CASH');
    await user.keyboard('{ArrowRight}');
    expect(values().mode).toBe('UPI');
    await user.click(screen.getByText('Pro'));
    expect(values().plan).toBe('PRO');
    expect(screen.getByRole('radio', { name: /Pro/ })).toBeChecked();
  });
});

describe('PasswordField', () => {
  it('shows strength + rule checklist and a Caps Lock warning', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const pwd = screen.getByLabelText(/^New password/);
    await user.type(pwd, 'abc');
    expect(screen.getByText('Too weak')).toBeInTheDocument();
    await user.type(pwd, 'defgh12!X');
    expect(screen.getByText(/Strong|Good/)).toBeInTheDocument();
    fireEvent.keyDown(pwd, { key: 'A', modifierCapsLock: true });
    expect(await screen.findByText('Caps Lock is on')).toBeInTheDocument();
  });

  it('re-checks "confirm" when the new password changes (deps)', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.type(screen.getByLabelText(/^New password/), 'secret123');
    await user.type(screen.getByLabelText(/^Confirm password/), 'secret123');
    await user.tab();
    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/^New password/), 'x');
    await waitFor(() => expect(screen.getByText('Passwords do not match')).toBeInTheDocument());
  });
});
