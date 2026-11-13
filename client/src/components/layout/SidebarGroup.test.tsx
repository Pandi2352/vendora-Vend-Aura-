import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ms } from '../ui/ms';
import type { NavItem } from '../../config/navigation';
import { SidebarGroup } from './SidebarGroup';

const GROUP: NavItem = {
  label: 'Reports',
  icon: ms('bar_chart'),
  children: [
    { label: 'Executive Overview', path: '/reports/overview', icon: ms('insights') },
    { label: 'GST Tax Reports', path: '/reports/gst', icon: ms('account_balance') },
  ],
};

const renderAt = (path: string, open: boolean, onToggle = vi.fn()) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <SidebarGroup item={GROUP} open={open} onToggle={onToggle} onNavigate={vi.fn()} />
    </MemoryRouter>,
  );

describe('SidebarGroup', () => {
  it('shows its pages only when open and asks the sidebar to toggle', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    renderAt('/dashboard', false, onToggle);
    const heading = screen.getByRole('button', { name: /Reports/ });
    expect(heading).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'GST Tax Reports' })).not.toBeInTheDocument();

    await user.click(heading);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('marks the current page inside an open section', () => {
    renderAt('/reports/gst', true);
    expect(screen.getByRole('button', { name: /Reports/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'GST Tax Reports' })).toHaveAttribute('aria-current', 'page');
  });
});
