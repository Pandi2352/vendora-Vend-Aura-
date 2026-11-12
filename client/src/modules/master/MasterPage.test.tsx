import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MasterPage } from './MasterPage';

vi.mock('./config/masterViews', () => ({
  MASTER_VIEWS: {
    general: { company: () => <p>Company screen</p> },
    operations: { transport: () => <p>Transport screen</p> },
  },
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <MasterPage />
    </MemoryRouter>,
  );

describe('MasterPage', () => {
  it('opens General › Company by default', () => {
    renderAt('/master');
    expect(screen.getByText('Company screen')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /General/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('switching area opens its first section', async () => {
    const user = userEvent.setup();
    renderAt('/master');
    await user.click(screen.getByRole('tab', { name: /Operations/ }));
    expect(screen.getByText('Transport screen')).toBeInTheDocument();
  });

  it('shows "coming soon" for sections without a screen', () => {
    renderAt('/master?macro=operations&tab=picker');
    expect(screen.getByText('This section is coming soon.')).toBeInTheDocument();
  });

  it('falls back to the first section for an unknown tab', () => {
    renderAt('/master?macro=general&tab=nope');
    expect(screen.getByText('Company screen')).toBeInTheDocument();
  });
});
