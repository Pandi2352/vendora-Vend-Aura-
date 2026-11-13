import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { fullName: 'Selvam', username: 'tst02_admin', email: 'a@b.com', role: 'OWNER' },
    logout: vi.fn(),
  }),
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar collapsed={false} mobileOpen={false} onCloseMobile={vi.fn()} />
    </MemoryRouter>,
  );

const section = (name: RegExp) => screen.getByRole('button', { name });

describe('Sidebar sections', () => {
  it('opens the section of the current page', () => {
    renderAt('/reports/gst');
    expect(section(/^Reports/)).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps only one section open: opening one closes the other', async () => {
    const user = userEvent.setup();
    renderAt('/dashboard');

    await user.click(section(/^Reports/));
    expect(section(/^Reports/)).toHaveAttribute('aria-expanded', 'true');

    await user.click(section(/^Purchase/));
    expect(section(/^Purchase/)).toHaveAttribute('aria-expanded', 'true');
    expect(section(/^Reports/)).toHaveAttribute('aria-expanded', 'false');

    await user.click(section(/^Purchase/));
    expect(section(/^Purchase/)).toHaveAttribute('aria-expanded', 'false');
  });
});
