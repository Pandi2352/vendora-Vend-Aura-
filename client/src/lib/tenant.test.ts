import { shopIdFromOrigin, tenantHost, tenantHostSuffix, tenantUrl } from './tenant';

const LOCAL = 'http://{shopId}.localhost:4001';
const PROD = 'https://{shopId}.vendora.com';

describe('store addresses', () => {
  it('builds a store URL from the template', () => {
    expect(tenantUrl('kmart', '/login', LOCAL)).toBe('http://kmart.localhost:4001/login');
    expect(tenantUrl('KMart', 'reset-password?token=x', PROD)).toBe('https://kmart.vendora.com/reset-password?token=x');
  });

  it('shows the host people should bookmark', () => {
    expect(tenantHost('kmart', PROD)).toBe('kmart.vendora.com');
    expect(tenantHostSuffix(PROD)).toBe('.vendora.com');
    expect(tenantHostSuffix(LOCAL)).toBe('.localhost:4001');
  });

  it('reads the Shop ID from a store origin', () => {
    expect(shopIdFromOrigin('http://kmart.localhost:4001', LOCAL)).toBe('kmart');
    expect(shopIdFromOrigin('https://abc12.vendora.com', PROD)).toBe('abc12');
    expect(shopIdFromOrigin('https://ABC12.vendora.com', PROD)).toBe('abc12');
  });

  it('is null for the store finder, other ports, look-alike hosts and reserved names', () => {
    expect(shopIdFromOrigin('http://localhost:4001', LOCAL)).toBeNull();
    expect(shopIdFromOrigin('http://kmart.localhost:5173', LOCAL)).toBeNull();
    expect(shopIdFromOrigin('https://kmart.vendora.com.evil.io', PROD)).toBeNull();
    expect(shopIdFromOrigin('https://kmartxx1.vendora.com', PROD)).toBeNull(); // longer than 6
    expect(shopIdFromOrigin('https://a.b.vendora.com', PROD)).toBeNull();
    expect(shopIdFromOrigin('https://www.vendora.com', PROD)).toBeNull();
    expect(shopIdFromOrigin('https://app.vendora.com', PROD)).toBeNull();
  });
});
