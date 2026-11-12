import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { Form } from './Form';
import { useAppForm } from './useAppForm';
import { SliderField } from './SliderField';

const schema = z.object({ discount: z.number().min(10, 'Discount must be at least 10%') });

function TestForm({ onSubmit = vi.fn(), disabled }: { onSubmit?: (v: { discount: number }) => void; disabled?: boolean }) {
  const form = useAppForm(schema, { defaultValues: { discount: 20 } });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <SliderField name="discount" label="Discount" min={0} max={50} step={5} formatValue={(v) => `${v}%`} disabled={disabled} />
      <button type="submit">Save</button>
    </Form>
  );
}

describe('SliderField', () => {
  it('exposes slider ARIA values with the formatted text', () => {
    render(<TestForm />);
    const slider = screen.getByRole('slider', { name: 'Discount' });
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '50');
    expect(slider).toHaveAttribute('aria-valuenow', '20');
    expect(slider).toHaveAttribute('aria-valuetext', '20%');
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('moves by step with arrows, 10 steps with PageUp/PageDown, and to the ends with Home/End', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const slider = screen.getByRole('slider');
    await user.tab();
    expect(slider).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '25');
    await user.keyboard('{ArrowDown}{ArrowLeft}');
    expect(slider).toHaveAttribute('aria-valuenow', '15');
    await user.keyboard('{PageUp}');
    expect(slider).toHaveAttribute('aria-valuenow', '50'); // clamped to max
    await user.keyboard('{PageDown}');
    expect(slider).toHaveAttribute('aria-valuenow', '0');
    await user.keyboard('{End}');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    await user.keyboard('{Home}');
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows the validation error after leaving and submits the number', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    await user.tab();
    await user.keyboard('{Home}');
    await user.tab();
    expect(await screen.findByText('Discount must be at least 10%')).toBeInTheDocument();
    screen.getByRole('slider').focus();
    await user.keyboard('{End}');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith({ discount: 50 });
  });

  it('follows the pointer on the track, snapped to the step', () => {
    render(<TestForm />);
    const slider = screen.getByRole('slider');
    const track = slider.parentElement as HTMLElement;
    track.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 40, right: 200, bottom: 40, x: 0, y: 0, toJSON: () => ({}) });
    fireEvent.pointerDown(track, { button: 0, clientX: 122, pointerId: 1 });
    expect(slider).toHaveAttribute('aria-valuenow', '30');
    expect(slider).toHaveFocus();
  });

  it('ignores keys when disabled', async () => {
    render(<TestForm disabled />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'true');
    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider).toHaveAttribute('aria-valuenow', '20');
  });
});
