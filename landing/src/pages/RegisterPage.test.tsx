import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterPage } from './RegisterPage';

type Handler = (url: string, body?: unknown) => Promise<unknown>;
let getImpl: Handler;
let postImpl: Handler;

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn((url: string, config?: { params?: unknown }) => getImpl(url, config?.params)),
      post: vi.fn((url: string, body?: unknown) => postImpl(url, body)),
    },
  };
});

const axios = (await import('axios')).default;

const available = (id: string) => ({ data: { success: true, data: { isAvailable: true, message: `"${id}" is available` } } });

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/register?plan=GROWTH']}>
      <RegisterPage />
    </MemoryRouter>,
  );
}

async function fillValidDetails(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/company \/ shop name/i), 'Apex Mart');
  await user.type(screen.getByLabelText(/^city/i), 'Coimbatore');
  await user.type(screen.getByLabelText(/^state/i), 'Tamil Nadu');
  await user.type(screen.getByLabelText(/pincode/i), '641001');
  await user.type(screen.getByLabelText(/contact person/i), 'Ramesh Kumar');
  await user.click(screen.getByLabelText(/mobile number/i));
  await user.paste('+91 98765 43210');
  await user.type(screen.getByLabelText(/^email/i), 'Owner@Apex.in');
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockClear();
    vi.mocked(axios.post).mockClear();
    getImpl = async (_url, params) => available((params as { shopId: string }).shopId);
    postImpl = async (url) => {
      if (url.endsWith('/request-otp')) return { data: { data: { sessionId: 'sess-1' } } };
      if (url.endsWith('/verify-otp')) return { data: { success: true } };
      return { data: { data: { shopId: 'apexma', username: 'apexma_admin', loginUrl: 'http://pos/login' } } };
    };
  });

  it('shows every problem on submit, including the missing verification code', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /create account/i }));

    const summary = await screen.findByRole('alert');
    expect(within(summary).getByText('There is a problem')).toBeInTheDocument();
    expect(screen.getAllByText('Customer ID is required').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mobile number is required').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Send the verification code to your email first').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/company \/ shop name/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('suggests a Customer ID from the shop name and checks it is available', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/company \/ shop name/i), 'Apex Mart!');

    expect(screen.getByLabelText(/customer id/i)).toHaveValue('apexma');
    expect(await screen.findByText(/"apexma" is available/, {}, { timeout: 2000 })).toBeInTheDocument();
    expect(axios.get).toHaveBeenLastCalledWith(expect.stringMatching(/check-subdomain$/), { params: { shopId: 'apexma' } });
  });

  it('marks a taken Customer ID as an error and stops suggesting once the user types an ID', async () => {
    getImpl = async () => ({ data: { data: { isAvailable: false, reason: 'This ID is already taken' } } });
    const user = userEvent.setup();
    renderPage();
    const idInput = screen.getByLabelText(/customer id/i);
    await user.type(idInput, 'K-Mart');
    expect(idInput).toHaveValue('kmart');

    expect(await screen.findByText('This ID is already taken', {}, { timeout: 2000 })).toBeInTheDocument();
    expect(idInput).toHaveAttribute('aria-invalid', 'true');

    await user.type(screen.getByLabelText(/company \/ shop name/i), 'Other Shop');
    expect(idInput).toHaveValue('kmart');
  });

  it('sends the code, then verifies it and creates the account', { timeout: 20000 }, async () => {
    const user = userEvent.setup();
    renderPage();
    await fillValidDetails(user);
    expect(screen.getByLabelText(/mobile number/i)).toHaveValue('9876543210');

    await user.click(screen.getByRole('button', { name: /send code/i }));
    expect(await screen.findByText(/code sent to owner@apex.in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend in \d+s/i })).toBeDisabled();

    await user.click(screen.getByLabelText('Digit 1 of 6'));
    await user.paste('123456');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/account is ready/i)).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/verify-otp$/), { sessionId: 'sess-1', otp: '123456' });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/complete-registration$/),
      expect.objectContaining({ preferredShopId: 'apexma', phone: '9876543210', selectedPlanCode: 'GROWTH' }),
    );
  });

  it('shows a wrong code under the code field', { timeout: 20000 }, async () => {
    postImpl = async (url) => {
      if (url.endsWith('/request-otp')) return { data: { data: { sessionId: 'sess-1' } } };
      throw Object.assign(new Error('bad'), {
        isAxiosError: true,
        response: { data: { message: 'Invalid or expired OTP' } },
      });
    };
    const user = userEvent.setup();
    renderPage();
    await fillValidDetails(user);
    await user.click(screen.getByRole('button', { name: /send code/i }));
    await screen.findByText(/code sent to/i);
    await user.click(screen.getByLabelText('Digit 1 of 6'));
    await user.paste('000000');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(screen.getAllByText('Invalid or expired OTP')).toHaveLength(2)); // field + error summary
  });

  it('asks for a new code when the email changes after sending', async () => {
    const user = userEvent.setup();
    renderPage();
    const email = screen.getByLabelText(/^email/i);
    await user.type(email, 'a@b.in');
    await user.click(screen.getByRole('button', { name: /send code/i }));
    await screen.findByText(/code sent to/i);

    await user.type(email, 'x');
    expect(screen.queryByText(/code sent to/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send code/i })).toBeEnabled();
    expect(screen.getByLabelText('Digit 1 of 6')).toBeDisabled();
  });
});
