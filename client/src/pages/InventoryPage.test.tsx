import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { InventoryPage } from './InventoryPage';

vi.mock('@/modules/inventory/ItemCatalogTab', () => ({
  ItemCatalogTab: () => <div data-testid="catalog-tab">Item Catalog Content</div>,
}));

vi.mock('@/modules/inventory/CategoriesTab', () => ({
  CategoriesTab: () => <div data-testid="categories-tab">Categories Content</div>,
}));

vi.mock('@/modules/inventory/OpeningStockTab', () => ({
  OpeningStockTab: () => <div data-testid="stock-tab">Opening Stock Content</div>,
}));

const renderPage = (path = '/inventory') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <InventoryPage />
    </MemoryRouter>,
  );

describe('InventoryPage', () => {
  it('renders page title and opens Item Catalog by default', () => {
    renderPage('/inventory');
    expect(screen.getByText('Inventory Master & Catalog')).toBeInTheDocument();
    expect(screen.getByTestId('catalog-tab')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Item Catalog' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to Categories & Brands tab via search param', () => {
    renderPage('/inventory?tab=categories');
    expect(screen.getByTestId('categories-tab')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Categories & Brands' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to Opening Stock tab via search param', () => {
    renderPage('/inventory?tab=stock');
    expect(screen.getByTestId('stock-tab')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Opening Stock' })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches tabs on user click', async () => {
    const user = userEvent.setup();
    renderPage('/inventory');
    expect(screen.getByTestId('catalog-tab')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Categories & Brands' }));
    expect(screen.getByTestId('categories-tab')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Opening Stock' }));
    expect(screen.getByTestId('stock-tab')).toBeInTheDocument();
  });
});

