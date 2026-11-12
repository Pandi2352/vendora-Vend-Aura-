import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AxiosError, type AxiosResponse } from 'axios';
import { ToastProvider } from '@/components/feedback';
import { api } from '@/lib/api';
import { ResetPasswordPage } from './ResetPasswordPage';

// Each test sets `postImpl`. vi.fn only records calls: Vitest 4 reports rejected
// promises from reset vi.fn implementations as extra test errors even when handled.
let postImpl: (...args: unknown[]) => Promise<unknown> = async () => ({ data: {} });
vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  api: { post: vi.fn((...args: unknown[]) => postImpl(...args)), get: vi.fn() },
}));

function LoginStub() {
  const location = useLocation();
  return <p>Login page {location.search}</p>;
}

function setup(url = '/reset-password?token=abc123&shopId=srm01') {
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/login" element={<LoginStub />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
  return userEvent.setup();
}

const invalidLinkError = () =>
  new AxiosError('Bad Request', '400', undefined, undefined, {
    status: 400,
    data: { message: 'This reset link is invalid or has expired.' },
  } as AxiosResponse);

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockClear();
    postImpl = async () => ({ data: {} });
  });

  it('shows a mismatch error when the passwords differ', async () => {
    const user = setup();
    await user.type(screen.getByLabelText(/^New password/), 'Secret123');
    await user.type(screen.getByLabelText(/^Confirm new password/), 'Secret124');
    await user.click(screen.getByRole('button', { name: /Set new password/ }));
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('enforces the password rules', async () => {
    const user = setup();
    await user.type(screen.getByLabelText(/^New password/), 'onlyletters');
    await user.tab();
    expect(await screen.findByText('New password must contain a number')).toBeInTheDocument();
  });

  it('shows the invalid-link message when the server rejects the token', async () => {
    postImpl = async () => {
      throw invalidLinkError();
    };
    const user = setup();
    await user.type(screen.getByLabelText(/^New password/), 'Secret123');
    await user.type(screen.getByLabelText(/^Confirm new password/), 'Secret123');
    await user.click(screen.getByRole('button', { name: /Set new password/ }));
    expect(await screen.findByText(/This reset link is invalid or has expired/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Request a new link/ })).toHaveAttribute('href', '/forgot-password?shopId=srm01');
  });

  it('shows the invalid-link message when the token is missing', () => {
    setup('/reset-password?shopId=srm01');
    expect(screen.getByText(/This reset link is invalid or has expired/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^New password/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Request a new link/ })).toHaveAttribute('href', '/forgot-password?shopId=srm01');
  });

  it('resets the password and goes to sign in with the Shop ID', async () => {
    postImpl = async () => ({ data: { message: 'ok' } });
    const user = setup();
    await user.type(screen.getByLabelText(/^New password/), 'Secret123');
    await user.type(screen.getByLabelText(/^Confirm new password/), 'Secret123');
    await user.click(screen.getByRole('button', { name: /Set new password/ }));

    expect(await screen.findByText('Login page ?shopId=srm01')).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', { token: 'abc123', newPassword: 'Secret123' });
    expect(screen.getByText('Password reset')).toBeInTheDocument();
  });
});
