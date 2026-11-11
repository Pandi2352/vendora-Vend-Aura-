// End-to-end onboarding flow against a test server started WITHOUT SMTP
// (SMTP_USER= SMTP_PASS=), so OTP and credentials are read from the server log:
//   request OTP -> verify OTP -> complete registration -> login with temp password
//   -> forced password change -> account overview (dashboard/settings data).
// Usage: node test/smoke/registration-flow.js <path-to-server-log>
const fs = require('fs');
const B = process.env.SMOKE_API_URL || 'http://localhost:5055/api/v1';
const logPath = process.argv[2];

async function call(method, path, body, token) {
  const res = await fetch(B + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => null) };
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
  step('   login URL points at /login?shopId=', !!reg?.loginUrl && reg.loginUrl.endsWith(`/login?shopId=${shopId}`), reg?.loginUrl);
  await sleep(200);
  const mailed = fromLog(new RegExp(`Welcome email for ${email.replace('.', '\\.')} \\| shop ${shopId} \\| user (\\S+) \\| temp password (\\S+) \\|`));
  step('   welcome email has username + temp password', mailed?.[1] === reg?.username && mailed?.[2] === reg?.temporaryPassword, mailed?.slice(1));

  r = await call('POST', '/auth/login', { shopId, username: reg.username, password: reg.temporaryPassword });
  step('4. login with emailed credentials', r.status === 200 && r.json.data.mustChangePassword === true, r.json);
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
