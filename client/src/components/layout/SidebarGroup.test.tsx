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

  it('marks ONLY the matching tab sub-item active and leaves sibling tabs inactive', () => {
    const inventoryGroup: NavItem = {
      label: 'Inventory Master',
      icon: ms('inventory_2'),
      children: [
        { label: 'Item Catalog', path: '/inventory', icon: ms('inventory_2') },
        { label: 'Categories & Brands', path: '/inventory?tab=categories', icon: ms('category') },
        { label: 'Opening Stock', path: '/inventory?tab=stock', icon: ms('assignment') },
        { label: 'Barcode Generator', path: '/inventory?tab=barcodes', icon: ms('qr_code_2') },
      ],
    };

    const { unmount } = render(
      <MemoryRouter initialEntries={['/inventory?tab=categories']}>
        <SidebarGroup item={inventoryGroup} open={true} onToggle={vi.fn()} onNavigate={vi.fn()} />
      </MemoryRouter>,
    );

    // Only Categories & Brands must be active with aria-current="page"
    expect(screen.getByRole('link', { name: 'Categories & Brands' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Item Catalog' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Opening Stock' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Barcode Generator' })).not.toHaveAttribute('aria-current');

    unmount();

    // When on base catalog /inventory, only Item Catalog must be active
    render(
      <MemoryRouter initialEntries={['/inventory']}>
        <SidebarGroup item={inventoryGroup} open={true} onToggle={vi.fn()} onNavigate={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Item Catalog' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Categories & Brands' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Opening Stock' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Barcode Generator' })).not.toHaveAttribute('aria-current');
  });
});
