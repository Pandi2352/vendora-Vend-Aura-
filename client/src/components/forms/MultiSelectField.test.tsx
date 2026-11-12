import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { multiSelectRule, pluralize } from '@/validations/selection';
import { Form } from './Form';
import { FormActions } from './FormLayout';
import { useAppForm } from './useAppForm';
import { MultiSelectField } from './MultiSelectField';

const schema = z.object({
  categories: multiSelectRule('Category', { min: 1, max: 2 }),
});

const OPTIONS = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'bakery', label: 'Bakery' },
];

function TestForm({ onSubmit }: { onSubmit: (v: z.output<typeof schema>) => unknown }) {
  const form = useAppForm(schema, { defaultValues: { categories: [] } });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <MultiSelectField name="categories" label="Categories" required options={OPTIONS} />
      <FormActions submitLabel="Save" />
    </Form>
  );
}

const trigger = () => screen.getByRole('combobox', { name: /Categories/ });

describe('multiSelectRule', () => {
  it('builds readable messages', () => {
    expect(schema.safeParse({ categories: [] }).error?.issues[0].message).toBe('Select at least 1 category');
    expect(schema.safeParse({ categories: ['a', 'b', 'c'] }).error?.issues[0].message).toBe('Select up to 2 categories');
    expect(schema.safeParse({ categories: ['a'] }).success).toBe(true);
    expect(pluralize('Tax')).toBe('Taxes');
    expect(pluralize('Brand')).toBe('Brands');
  });
});

describe('MultiSelectField', () => {
  it('shows the required error after the list closes with Escape (touched)', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    await user.click(trigger());
    await user.keyboard('{Escape}');
    expect(await screen.findByText('Select at least 1 category')).toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-invalid', 'true');
  });

  it('submits the selected array', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    await user.click(trigger());
    await user.click(screen.getByRole('option', { name: 'Grocery' }));
    await user.click(screen.getByRole('option', { name: 'Bakery' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ categories: ['grocery', 'bakery'] });
  });

  it('focuses the control when submit fails', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Select at least 1 category')).toBeInTheDocument();
    await waitFor(() => expect(trigger()).toHaveFocus());
  });
});
