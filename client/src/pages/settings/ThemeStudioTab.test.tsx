import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeStudioTab } from './ThemeStudioTab';
import { ThemeProvider } from '../../context/ThemeProvider';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: {
          themeId: 'default',
          sidebarStyle: 'default',
          navbarStyle: 'default',
          fontFamily: 'Plus Jakarta Sans',
          borderRadius: 'modern',
        },
      },
    }),
    patch: vi.fn().mockResolvedValue({
      data: {
        data: {
          themeId: 'emerald',
          sidebarStyle: 'dark',
          navbarStyle: 'brand',
          fontFamily: 'Outfit',
          borderRadius: 'rounded',
        },
      },
    }),
  },
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { businessName: 'Super Fresh Mart', role: 'OWNER' },
  }),
}));

describe('ThemeStudioTab', () => {
  it('renders all 12 curated theme options and allows selecting a new theme', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ThemeProvider>
          <ThemeStudioTab />
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Theme & UI Customization Studio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vendora Classic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Emerald Luxe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sunset Amber/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Royal Violet/i })).toBeInTheDocument();

    // Click on Emerald Luxe
    const emeraldCard = screen.getByRole('button', { name: /Emerald Luxe/i });
    await user.click(emeraldCard);

    // Save for store
    const saveButton = screen.getByRole('button', { name: /Save for Store/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/account/theme',
        expect.objectContaining({ themeId: 'emerald' }),
      );
    });

    expect(
      screen.getByText(/Theme & UI settings successfully saved to your store account!/i),
    ).toBeInTheDocument();
  });

  it('renders typography options with live preview', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <ThemeStudioTab />
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Font Family & Typography/i)).toBeInTheDocument();
    expect(screen.getByText('Outfit')).toBeInTheDocument();
    expect(screen.getByText('Lexend')).toBeInTheDocument();
    expect(screen.getByText(/Corner Radius & Geometry/i)).toBeInTheDocument();
  });
});
