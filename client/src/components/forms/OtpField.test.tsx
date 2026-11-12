import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { otpRule } from '@/validations/otp';
import { Form } from './Form';
import { useAppForm } from './useAppForm';
import { OtpField } from './OtpField';

const schema = z.object({ code: otpRule(6) });

function TestForm({ onComplete, onSubmit = vi.fn() }: { onComplete?: (code: string) => void; onSubmit?: (v: { code: string }) => void }) {
  const form = useAppForm(schema, { defaultValues: { code: '' } });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <OtpField name="code" label="Verification code" required onComplete={onComplete} />
      <button type="submit">Verify</button>
    </Form>
  );
}

const box = (n: number) => screen.getByLabelText(`Digit ${n} of 6`) as HTMLInputElement;
const values = () => Array.from({ length: 6 }, (_, i) => box(i + 1).value).join('');

describe('OtpField', () => {
  it('renders a labelled group of numeric boxes', () => {
    render(<TestForm />);
    expect(screen.getByRole('group', { name: /Verification code/ })).toBeInTheDocument();
    expect(box(1)).toHaveAttribute('autocomplete', 'one-time-code');
    expect(box(1)).toHaveAttribute('inputmode', 'numeric');
    expect(box(2)).toHaveAttribute('autocomplete', 'off');
  });

  it('auto-advances while typing, ignores letters and calls onComplete', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<TestForm onComplete={onComplete} />);
    await user.click(box(1));
    await user.keyboard('12a3');
    expect(values()).toBe('123');
    expect(box(4)).toHaveFocus();
    await user.keyboard('456');
    expect(values()).toBe('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('fills every box when a full code is pasted, even with spaces / dashes', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<TestForm onComplete={onComplete} />);
    await user.click(box(3));
    await user.paste('12-34 56');
    expect(values()).toBe('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('Backspace on an empty box moves back and clears it; arrows move', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.click(box(1));
    await user.keyboard('12');
    expect(box(3)).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(box(2)).toHaveFocus();
    expect(values()).toBe('1');
    await user.keyboard('{ArrowLeft}');
    expect(box(1)).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(box(2)).toHaveFocus();
  });

  it('shows the error only after focus leaves the whole group', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.click(box(1));
    await user.keyboard('12');
    await user.click(box(5)); // moving between boxes is not a blur
    expect(screen.queryByText('Enter the 6-digit code')).not.toBeInTheDocument();
    await user.click(document.body);
    expect(await screen.findByText('Enter the 6-digit code')).toBeInTheDocument();
    expect(box(1)).toHaveAttribute('aria-invalid', 'true');
  });

  it('submits the code as a string', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    await user.click(box(1));
    await user.paste('654321');
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(onSubmit).toHaveBeenCalledWith({ code: '654321' });
  });
});
