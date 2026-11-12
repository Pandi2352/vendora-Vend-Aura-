import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AxiosError, type AxiosResponse } from 'axios';
import { api } from '@/lib/api';
import { ForgotPasswordPage } from './ForgotPasswordPage';

// Each test sets `postImpl`. vi.fn only records calls: Vitest 4 reports rejected
// promises from reset vi.fn implementations as extra test errors even when handled.
let postImpl: (...args: unknown[]) => Promise<unknown> = async () => ({ data: {} });
vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  api: { post: vi.fn((...args: unknown[]) => postImpl(...args)), get: vi.fn() },
}));

function setup(url = '/forgot-password') {
  render(
    <MemoryRouter initialEntries={[url]}>
      <ForgotPasswordPage />
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockClear();
    postImpl = async () => ({ data: {} });
  });

  it('shows required errors when leaving the fields empty', async () => {
    const user = setup();
    await user.click(screen.getByLabelText(/Shop ID/));
    await user.tab();
    expect(await screen.findByText('Shop ID is required')).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Username or email/));
    await user.tab();
    expect(await screen.findByText('Username or email is required')).toBeInTheDocument();
  });

  it('prefills the Shop ID from the link', () => {
    setup('/forgot-password?shopId=SRM01');
    expect(screen.getByLabelText(/Shop ID/)).toHaveValue('srm01');
  });

  it('sends the request and shows the neutral confirmation', async () => {
    postImpl = async () => ({ data: { message: 'ok' } });
    const user = setup('/forgot-password?shopId=srm01');
    await user.type(screen.getByLabelText(/Username or email/), 'cashier@shop.in');
    await user.click(screen.getByRole('button', { name: /Email me a reset link/ }));

    expect(await screen.findByText(/If the details match an account, we've emailed a reset link/)).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { shopId: 'srm01', identifier: 'cashier@shop.in' });
    expect(screen.getByRole('link', { name: /Back to sign in/ })).toHaveAttribute('href', '/login?shopId=srm01');
  });

  it('does not call the API when the form is invalid', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: /Email me a reset link/ }));
    expect(await screen.findByText('Shop ID is required')).toBeInTheDocument();
    expect(screen.getByText('Username or email is required')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows a rate-limit error instead of the confirmation', async () => {
    postImpl = async () => {
      throw new AxiosError('Too Many Requests', '429', undefined, undefined, {
        status: 429,
        data: { message: 'Too many requests. Please wait a minute and try again.' },
      } as AxiosResponse);
    };
    const user = setup('/forgot-password?shopId=srm01');
    await user.type(screen.getByLabelText(/Username or email/), 'srm01_admin');
    await user.click(screen.getByRole('button', { name: /Email me a reset link/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests');
    await waitFor(() => expect(screen.queryByText(/emailed a reset link/)).not.toBeInTheDocument());
  });
});
