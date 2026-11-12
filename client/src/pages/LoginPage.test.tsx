import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

type Handler = (url: string, config?: unknown) => Promise<unknown>;
let getImpl: Handler;
let shopOfAddress: string | null = null;
const goToStore = vi.fn();
const replace = vi.fn();

vi.mock('@/lib/api', () => ({ api: { get: vi.fn((url: string, config?: unknown) => getImpl(url, config)) } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ login: vi.fn() }) }));
vi.mock('@/lib/tenant', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/tenant')>()),
  currentShopId: () => shopOfAddress,
  goToStore: (...args: unknown[]) => goToStore(...args),
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LoginPage />
    </MemoryRouter>,
  );

describe('LoginPage store addresses', () => {
  beforeEach(() => {
    shopOfAddress = null;
    goToStore.mockClear();
    replace.mockClear();
    getImpl = async () => ({ data: { data: { exists: true } } });
    Object.defineProperty(window, 'location', { configurable: true, value: { ...window.location, replace } });
  });

  it('on a store address, signs in to that store only', () => {
    shopOfAddress = 'kmart';
    renderAt('/login');
    const shop = screen.getByLabelText(/Shop ID/);
    expect(shop).toHaveValue('kmart');
    expect(shop).toHaveAttribute('readonly');
    expect(screen.getByLabelText(/Username/)).toHaveValue('kmart_admin');
    expect(screen.getByRole('link', { name: 'Not your store?' })).toHaveAttribute('href', 'http://localhost:4001/login');
  });

  it('without a store address, finds the store and opens its own address', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    expect(screen.getByRole('heading', { name: 'Find your store' })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Shop ID/), 'kmart');
    await user.click(screen.getByRole('button', { name: /continue to my store/i }));
    await waitFor(() => expect(goToStore).toHaveBeenCalledWith('kmart', '/login'));
  });

  it('says so when no store uses the Shop ID', async () => {
    getImpl = async () => ({ data: { data: { exists: false } } });
    const user = userEvent.setup();
    renderAt('/login');
    await user.type(screen.getByLabelText(/Shop ID/), 'nope1');
    await user.click(screen.getByRole('button', { name: /continue to my store/i }));
    expect(await screen.findByText(/No store uses the Shop ID "nope1"/)).toBeInTheDocument();
    expect(goToStore).not.toHaveBeenCalled();
  });

  it('forwards old ?shopId= links to the store address', async () => {
    renderAt('/login?shopId=KMart');
    expect(screen.getByText('Opening your store…')).toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('http://kmart.localhost:4001/login'));
  });
});
