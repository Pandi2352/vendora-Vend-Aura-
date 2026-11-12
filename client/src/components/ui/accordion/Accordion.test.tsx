import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, type AccordionProps } from './Accordion';
import type { AccordionItemData } from './AccordionItem';

const items: AccordionItemData[] = [
  { id: 'billing', title: 'Billing', content: <a href="#billing">Billing link</a> },
  { id: 'stock', title: 'Stock', description: 'Inventory rules', content: 'Stock content' },
  { id: 'tax', title: 'Tax', content: 'Tax content', disabled: true },
  { id: 'users', title: 'Users', content: 'Users content' },
];

const setup = (props: Partial<AccordionProps> = {}) => render(<Accordion items={items} {...props} />);
const header = (name: string | RegExp) => screen.getByRole('button', { name });
const panelOf = (name: string | RegExp) => document.getElementById(header(name).getAttribute('aria-controls')!)!;
const isOpen = (name: string | RegExp) => header(name).getAttribute('aria-expanded') === 'true';

describe('Accordion', () => {
  it('wires headings, buttons and regions', () => {
    setup({ headingLevel: 4, defaultValue: ['billing'] });
    const button = header('Billing');
    expect(button.parentElement?.tagName).toBe('H4');
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(4);
    const panel = panelOf('Billing');
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-labelledby', button.id);
    expect(screen.getByRole('region', { name: 'Billing' })).toBe(panel);
    expect(isOpen('Billing')).toBe(true);
    // Collapsed panels are inert (not tabbable, hidden from assistive tech).
    expect(panelOf(/Stock/)).toHaveAttribute('inert');
    expect(panel).not.toHaveAttribute('inert');
  });

  it('single mode keeps one section open and is collapsible by default', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(header('Billing'));
    expect(isOpen('Billing')).toBe(true);
    await user.click(header(/Stock/));
    expect(isOpen(/Stock/)).toBe(true);
    expect(isOpen('Billing')).toBe(false);
    await user.click(header(/Stock/));
    expect(isOpen(/Stock/)).toBe(false);
  });

  it('single mode with collapsible=false keeps the open section open', async () => {
    const user = userEvent.setup();
    setup({ collapsible: false, defaultValue: ['billing'] });
    await user.click(header('Billing'));
    expect(isOpen('Billing')).toBe(true);
  });

  it('multiple mode opens sections independently', async () => {
    const user = userEvent.setup();
    setup({ type: 'multiple' });
    await user.click(header('Billing'));
    await user.click(header('Users'));
    expect(isOpen('Billing')).toBe(true);
    expect(isOpen('Users')).toBe(true);
    await user.click(header('Billing'));
    expect(isOpen('Billing')).toBe(false);
    expect(isOpen('Users')).toBe(true);
  });

  it('supports controlled value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState<string[]>(['users']);
      return (
        <Accordion
          items={items}
          value={value}
          onValueChange={(v) => {
            onValueChange(v);
            setValue(v);
          }}
        />
      );
    }
    render(<Controlled />);
    expect(isOpen('Users')).toBe(true);
    await user.click(header('Billing'));
    expect(onValueChange).toHaveBeenCalledWith(['billing']);
    expect(isOpen('Billing')).toBe(true);
    expect(isOpen('Users')).toBe(false);
  });

  it('toggles with Enter and Space', async () => {
    const user = userEvent.setup();
    setup();
    header('Billing').focus();
    await user.keyboard('{Enter}');
    expect(isOpen('Billing')).toBe(true);
    await user.keyboard(' ');
    expect(isOpen('Billing')).toBe(false);
  });

  it('moves between enabled headers with arrows (wrapping), Home and End', async () => {
    const user = userEvent.setup();
    setup();
    header('Billing').focus();
    await user.keyboard('{ArrowDown}');
    expect(header(/Stock/)).toHaveFocus();
    await user.keyboard('{ArrowDown}'); // skips disabled "Tax"
    expect(header('Users')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(header('Billing')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(header('Users')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(header('Billing')).toHaveFocus();
    await user.keyboard('{End}');
    expect(header('Users')).toHaveFocus();
  });

  it('does not toggle disabled sections', async () => {
    const user = userEvent.setup();
    setup();
    expect(header('Tax')).toBeDisabled();
    await user.click(header('Tax'));
    expect(isOpen('Tax')).toBe(false);
  });

  it('renders the flush variant without cards', () => {
    const { container } = setup({ variant: 'flush' });
    expect(container.firstElementChild).toHaveClass('divide-y');
  });
});
