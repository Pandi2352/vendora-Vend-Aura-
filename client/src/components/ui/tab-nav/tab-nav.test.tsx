import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RailTabs } from './RailTabs';
import { SegmentedTabs } from './SegmentedTabs';
import type { TabOption } from './types';

const ITEMS: TabOption[] = [
  { value: 'company', label: 'Company' },
  { value: 'location', label: 'Location', badge: 3 },
  { value: 'reason', label: 'Reason', disabled: true },
  { value: 'param', label: 'Param' },
];

function Harness({ kind }: { kind: 'rail' | 'segmented' }) {
  const [value, setValue] = useState('company');
  const Comp = kind === 'rail' ? RailTabs : SegmentedTabs;
  return <Comp label="Sections" idPrefix="t" items={ITEMS} value={value} onChange={setValue} />;
}

describe.each(['rail', 'segmented'] as const)('%s tabs', (kind) => {
  it('marks the active tab and links it to its panel', () => {
    render(<Harness kind={kind} />);
    const tab = screen.getByRole('tab', { name: 'Company' });
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeInTheDocument();
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls', 't-panel-company');
    expect(tab).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: /Location/ })).toHaveAttribute('tabindex', '-1');
  });

  it('selects on click and shows badges', async () => {
    const user = userEvent.setup();
    render(<Harness kind={kind} />);
    await user.click(screen.getByRole('tab', { name: /Location/ }));
    expect(screen.getByRole('tab', { name: /Location/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('moves with arrow keys, skips disabled tabs and wraps around', async () => {
    const user = userEvent.setup();
    render(<Harness kind={kind} />);
    await user.click(screen.getByRole('tab', { name: 'Company' }));
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Param' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Param' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Company' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Param' })).toHaveAttribute('aria-selected', 'true');
  });
});
