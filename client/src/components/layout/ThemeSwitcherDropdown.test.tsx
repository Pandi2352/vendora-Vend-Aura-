import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeSwitcherDropdown } from './ThemeSwitcherDropdown';
import { ThemeProvider } from '../../context/ThemeProvider';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { data: {} } }),
    patch: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
}));

describe('ThemeSwitcherDropdown', () => {
  it('toggles open on click and shows theme presets', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ThemeProvider>
          <ThemeSwitcherDropdown />
        </ThemeProvider>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /Theme options/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    expect(screen.getByRole('dialog', { name: /Theme switcher/i })).toBeInTheDocument();
    expect(screen.getByText(/Color Palette \(\d+ Themes\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Emerald Luxe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sunset Amber/i })).toBeInTheDocument();

    // Link to full studio
    expect(screen.getByText(/Fonts, Radius & Full Studio/i)).toBeInTheDocument();
  });
});

