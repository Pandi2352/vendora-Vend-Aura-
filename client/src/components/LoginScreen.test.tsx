import type { ReactElement } from 'react';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { LoginScreen } from './LoginScreen';

// The screen links to /forgot-password, so it needs a router.
const render = (ui: ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

describe('LoginScreen', () => {
  it('shows a required error when leaving the Shop ID empty, before any submit', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={vi.fn()} />);
    await user.click(screen.getByLabelText(/Shop ID/));
    await user.tab();
    expect(await screen.findByText('Shop ID is required')).toBeInTheDocument();
  });

  it('keeps the Shop ID lowercase alphanumeric and checks its length', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={vi.fn()} />);
    const shop = screen.getByLabelText(/Shop ID/);
    await user.type(shop, 'Ab-c Defg');
    expect(shop).toHaveValue('abcdefg');
    await user.tab();
    expect(await screen.findByText('Shop ID must be 3-6 lowercase letters or digits')).toBeInTheDocument();
  });

  it('fills the owner username from the Shop ID', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={vi.fn()} />);
    await user.type(screen.getByLabelText(/Shop ID/), 'srm01');
    expect(screen.getByLabelText(/Username/)).toHaveValue('srm01_admin');
  });

  it('prefills from the welcome-email link and submits the credentials', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue('ok');
    render(<LoginScreen initialShopId="srm01" onLogin={onLogin} />);
    expect(screen.getByLabelText(/Username/)).toHaveValue('srm01_admin');
    await user.type(screen.getByLabelText(/^Password/), 'secret123');
    await user.click(screen.getByRole('button', { name: /Sign In/ }));
    await waitFor(() =>
      expect(onLogin).toHaveBeenCalledWith({ shopId: 'srm01', username: 'srm01_admin', password: 'secret123' }),
    );
  });

  it('shows every required error on submit without calling login', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(<LoginScreen onLogin={onLogin} />);
    await user.click(screen.getByRole('button', { name: /Sign In/ }));
    expect(await screen.findByText('Shop ID is required')).toBeInTheDocument();
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('shows the server error message', async () => {
    const user = userEvent.setup();
    const error = new AxiosError('Unauthorized', '401', undefined, undefined, {
      status: 401,
      data: { message: 'Invalid Shop ID, username or password' },
    } as AxiosResponse);
    render(<LoginScreen initialShopId="srm01" onLogin={vi.fn().mockRejectedValue(error)} />);
    await user.type(screen.getByLabelText(/^Password/), 'wrong');
    await user.click(screen.getByRole('button', { name: /Sign In/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid Shop ID, username or password');
  });

  it('links to forgot password with the typed Shop ID', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/forgot-password');
    await user.type(screen.getByLabelText(/Shop ID/), 'srm01');
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/forgot-password?shopId=srm01');
  });
});
