import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { Form } from '../Form';
import { useAppForm } from '../useAppForm';
import { DateField, DateRangeField, TimeField } from '../DateFields';
import { dateRangeRule, dateRule, timeRule } from '@/validations/dates';

const schema = z.object({
  billDate: dateRule('Bill date', { min: '2026-01-01', max: '2026-12-31' }),
  period: dateRangeRule('Period'),
  opensAt: timeRule('Opening time'),
});

function TestForm({ onSubmit = vi.fn() }: { onSubmit?: (v: unknown) => void }) {
  const form = useAppForm(schema, {
    defaultValues: { billDate: null, period: { start: null, end: null }, opensAt: null } as never,
  });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <DateField name="billDate" label="Bill date" required min="2026-01-01" max="2026-12-31" clearable />
      <DateRangeField name="period" label="Period" required />
      <TimeField name="opensAt" label="Opening time" required />
      <button type="submit">Save</button>
      <output data-testid="values">{JSON.stringify(form.watch())}</output>
    </Form>
  );
}

const values = () => JSON.parse(screen.getByTestId('values').textContent || '{}');

describe('DateField', () => {
  it('typing digits adds slashes and stores YYYY-MM-DD', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByLabelText(/^Bill date/);
    await user.type(input, '31122026');
    expect(input).toHaveValue('31/12/2026');
    expect(values().billDate).toBe('2026-12-31');
  });

  it('shows a format error after leaving an impossible date', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.type(screen.getByLabelText(/^Bill date/), '31022026');
    await user.tab();
    expect(await screen.findByText('Enter a date like 31/12/2026')).toBeInTheDocument();
  });

  it('shows a required error after leaving it empty and a range error outside min/max', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByLabelText(/^Bill date/);
    await user.click(input);
    await user.tab(); // to the calendar button (same field)
    await user.tab(); // out of the field
    expect(await screen.findByText('Enter bill date')).toBeInTheDocument();
    await user.type(input, '01012025');
    await user.tab();
    expect(await screen.findByText(/on or after 01\/01\/2026/)).toBeInTheDocument();
  });

  it('picks a date from the calendar with the keyboard and returns focus', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.type(screen.getByLabelText(/^Bill date/), '10062026');
    const open = screen.getByRole('button', { name: /Change date, 10\/06\/2026/ });
    await user.click(open);
    expect(await screen.findByRole('grid')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}{Enter}');
    await waitFor(() => expect(values().billDate).toBe('2026-06-11'));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('clears with the clear button', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.type(screen.getByLabelText(/^Bill date/), '10062026');
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(values().billDate).toBeNull();
  });
});

describe('DateRangeField', () => {
  it('applies a preset range', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.click(screen.getByRole('button', { name: /Period/ }));
    await user.click(await screen.findByRole('button', { name: 'Today' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => {
      const { start, end } = values().period;
      expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(end).toBe(start);
    });
  });
});

describe('TimeField', () => {
  it('adds the colon and stores HH:mm, rejects impossible times', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByLabelText(/^Opening time/);
    await user.type(input, '0930');
    expect(input).toHaveValue('09:30');
    expect(values().opensAt).toBe('09:30');
    await user.clear(input);
    await user.type(input, '2575');
    await user.tab();
    expect(await screen.findByText('Enter a time like 14:30')).toBeInTheDocument();
  });
});
