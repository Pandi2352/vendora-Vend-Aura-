// End-to-end onboarding flow against a test server started WITHOUT SMTP
// (SMTP_USER= SMTP_PASS=), so OTP and credentials are read from the server log:
//   request OTP -> verify OTP -> complete registration -> login with temp password
//   -> forced password change -> account overview (dashboard/settings data).
// Usage: node test/smoke/registration-flow.js <path-to-server-log>
const fs = require('fs');
const B = process.env.SMOKE_API_URL || 'http://localhost:5055/api/v1';
const logPath = process.argv[2];
// Must match the server's TENANT_APP_URL (default below).
const TENANT_APP_URL = process.env.TENANT_APP_URL || 'http://{shopId}.localhost:4001';
const storeUrl = (shopId, path = '') => TENANT_APP_URL.replace('{shopId}', shopId) + path;
const storeOrigin = (shopId) => new URL(storeUrl(shopId)).origin;

async function call(method, path, body, token, origin) {
  const res = await fetch(B + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(origin ? { origin } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => null), headers: res.headers };
}
/** CORS preflight as a browser on `origin` would send it; returns the allowed origin header. */
async function preflight(origin) {
  const res = await fetch(B + '/auth/login', {
    method: 'OPTIONS',
    headers: { origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' },
  });
  return res.headers.get('access-control-allow-origin');
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fromLog = (regex) => {
  const matches = [...fs.readFileSync(logPath, 'utf8').matchAll(new RegExp(regex.source, 'g'))];
  return matches.length ? matches[matches.length - 1] : null;
};
let failures = 0;
const step = (name, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' ' + JSON.stringify(detail).slice(0, 300)}`);
  if (!ok) failures++;
};

(async () => {
  const email = `owner${Date.now()}@example.com`;
  const shopId = `f${Date.now().toString(36).slice(-4)}`;

  let r = await call('POST', '/onboarding/request-otp', { email, selectedPlanCode: 'GROWTH' });
  step('1. request OTP', r.status === 200 && r.json.data.expiresInSeconds === 600, r.json);
  const sessionId = r.json?.data?.sessionId;
  await sleep(200);
  const otp = fromLog(new RegExp(`OTP for ${email.replace('.', '\\.')}: (\\d{6})`))?.[1];
  step('   OTP email produced (dev log)', !!otp, otp);

  r = await call('POST', '/onboarding/verify-otp', { sessionId, otp: otp === '000000' ? '111111' : '000000' });
  step('2a. wrong OTP rejected', r.status === 400, r.json);
  r = await call('POST', '/onboarding/verify-otp', { sessionId, otp });
  step('2b. verify OTP', r.status === 200 && r.json.data.isVerified, r.json);

  r = await call('POST', '/onboarding/complete-registration', {
    sessionId,
    businessName: 'Flow Test Store',
    ownerName: 'Flow Owner',
    phone: '9876543210',
    businessType: 'GROCERY',
    preferredShopId: shopId,
    selectedPlanCode: 'GROWTH',
    address: { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', country: 'India' },
  });
  const reg = r.json?.data;
  step('3. complete registration', r.status === 201 && reg?.username === `${shopId}_admin`, r.json);
  step('   login URL is the store address', reg?.loginUrl === storeUrl(shopId, '/login'), reg?.loginUrl);
  await sleep(200);
  const mailed = fromLog(new RegExp(`Welcome email for ${email.replace('.', '\\.')} \\| shop ${shopId} \\| user (\\S+) \\| temp password (\\S+) \\|`));
  step('   welcome email has username + temp password', mailed?.[1] === reg?.username && mailed?.[2] === reg?.temporaryPassword, mailed?.slice(1));

  r = await call('GET', `/onboarding/check-subdomain?shopId=${shopId}`);
  step('   store lookup: exists + store URL', r.json?.data?.exists === true && r.json.data.storeUrl === storeUrl(shopId, '/'), r.json?.data);
  r = await call('GET', '/onboarding/check-subdomain?shopId=zz9q');
  step('   store lookup: unknown Shop ID does not exist', r.json?.data?.exists === false, r.json?.data);

  step('   CORS allows the store address', (await preflight(storeOrigin(shopId))) === storeOrigin(shopId));
  step('   CORS allows any other store address too', (await preflight(storeOrigin('abc12'))) === storeOrigin('abc12'));
  step('   CORS rejects unknown sites', (await preflight('http://evil.example.com')) === null);
  step('   CORS rejects look-alike hosts', (await preflight(storeOrigin(shopId).replace('localhost', 'localhost.evil.com'))) === null);

  r = await call('POST', '/auth/login', { shopId, username: reg.username, password: reg.temporaryPassword }, null, storeOrigin('other1'));
  step('   login from another store address refused', r.status === 401 && /belongs to Shop ID "other1"/.test(r.json?.message), r.json);
  r = await call('POST', '/auth/forgot-password', { shopId, identifier: reg.username }, null, storeOrigin('other1'));
  step('   forgot-password from another store address refused', r.status === 401, r.json);

  r = await call('POST', '/auth/login', { shopId, username: reg.username, password: reg.temporaryPassword }, null, storeOrigin(shopId));
  step('4. login with emailed credentials on the store address', r.status === 200 && r.json.data.mustChangePassword === true, r.json);
  const token = r.json?.data?.accessToken;

  r = await call('GET', '/account/overview', null, token);
  step('   dashboard data blocked until password change', r.status === 403 && r.json.errorCode === 'PASSWORD_CHANGE_REQUIRED', r.json);

  r = await call('POST', '/auth/change-password', { currentPassword: reg.temporaryPassword, newPassword: 'MyStore@2026' }, token);
  step('5. change temporary password', r.status === 200, r.json);

  r = await call('GET', '/account/overview', null, token);
  const ov = r.json?.data;
  step('6. dashboard / settings data', r.status === 200 && ov.plan.code === 'GROWTH' && ov.store.address.city === 'Chennai', ov);
  r = await call('GET', '/catalog/products', null, token);
  step('   starter catalog seeded for GROCERY', r.status === 200 && r.json.data.length > 0, r.json?.data?.length);

  console.log(failures ? `\n${failures} step(s) failed` : '\nRegistration flow OK');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
