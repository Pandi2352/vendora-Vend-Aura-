// Smoke test against the throwaway server on :5055 (database vendora_smoketest).
// The password-reset checks read/patch the same database directly (SMOKE_DB_NAME).
const crypto = require('crypto');
const mongoose = require('mongoose');
const SMOKE_DB_NAME = process.env.SMOKE_DB_NAME || 'vendora_smoketest';
if (!/^vendora_smoketest[a-z0-9_]*$/.test(SMOKE_DB_NAME)) throw new Error(`refusing to use "${SMOKE_DB_NAME}": not a smoke-test database`);
const ids = JSON.parse(process.argv[2] || require('fs').readFileSync(0, 'utf8'));
const B = process.env.SMOKE_API_URL || 'http://localhost:5055/api/v1';
let pass = 0, fail = 0;
async function call(method, path, body, token) {
  const res = await fetch(B + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body: keep json = null */ }
  return { status: res.status, json };
}
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra !== undefined ? JSON.stringify(extra).slice(0, 300) : ''); }
}
(async () => {
  let r = await call('GET', `/orders?tenantId=${ids.tenantId}`);
  check('orders without token -> 401', r.status === 401, r);
  r = await call('GET', '/saas-admin/overview');
  check('admin overview without token -> 401', r.status === 401, r);
  r = await call('GET', `/catalog/products?tenantId=${ids.tenantId}`);
  check('catalog without token -> 401', r.status === 401, r);

  r = await call('POST', '/saas-admin/login', { username: 'admin', password: 'ptest123' });
  check("admin login with 'admin' alias rejected", r.status === 401, r);
  r = await call('POST', '/saas-admin/login', { username: 'padmin', password: 'ptest123' });
  check('admin login ok', r.status === 200, r);
  const adminToken = r.json?.data?.accessToken;
  r = await call('GET', '/saas-admin/overview', null, adminToken);
  check('admin overview with token -> 200', r.status === 200, r);
  r = await call('GET', '/orders', null, adminToken);
  check('admin token cannot use store endpoints -> 403', r.status === 403, r);

  r = await call('POST', '/auth/login', { shopId: 'smoke', username: 'smoke_admin', password: 'TempPass1!' });
  check('store login ok', r.status === 200 && r.json.data.mustChangePassword === true, r);
  let { accessToken, refreshToken, user } = r.json.data;
  check('login returns store info', user.store && user.store.gstin === '33ABCDE1234F1Z5' && user.store.outletCode === 'OUT-01', user.store);

  r = await call('GET', '/orders', null, accessToken);
  check('temp password blocked -> 403 PASSWORD_CHANGE_REQUIRED', r.status === 403 && r.json.errorCode === 'PASSWORD_CHANGE_REQUIRED', r.json);
  r = await call('GET', '/saas-admin/overview', null, accessToken);
  check('store token cannot use admin endpoints', r.status === 403, r);
  r = await call('GET', '/orders', null, refreshToken);
  check('refresh token rejected as access token -> 401', r.status === 401, r);

  r = await call('POST', '/auth/change-password', { currentPassword: 'TempPass1!', newPassword: 'NewPass123!' }, accessToken);
  check('change password ok', r.status === 200, r);
  r = await call('POST', '/auth/login', { shopId: 'smoke', username: 'smoke_admin', password: 'NewPass123!' });
  ({ accessToken, refreshToken } = r.json.data);
  r = await call('POST', '/auth/refresh', { refreshToken });
  check('refresh ok + rotated', r.status === 200 && r.json.data.refreshToken && r.json.data.refreshToken !== refreshToken, r);
  const oldRefresh = refreshToken;
  accessToken = r.json.data.accessToken; refreshToken = r.json.data.refreshToken;
  r = await call('POST', '/auth/refresh', { refreshToken: oldRefresh });
  check('old refresh token revoked after rotation', r.status === 401, r);

  r = await call('GET', `/catalog/products?tenantId=${ids.other}`, null, accessToken);
  check('tenantId query param rejected', r.status === 400, r.json);
  r = await call('GET', '/catalog/products', null, accessToken);
  check('catalog returns only own products', r.status === 200 && r.json.data.length === 2 && r.json.data.every((p) => p.name !== 'Foreign'), r.json?.data);

  r = await call('POST', '/orders', { items: [{ productId: ids.soap, quantity: 1 }], paymentMode: 'CASH' }, accessToken);
  check('billing without open shift -> 400', r.status === 400 && /shift/i.test(r.json.message), r.json);

  r = await call('POST', '/orders/shifts/open', { openingFloat: 1000 }, accessToken);
  check('open shift', r.status === 201 && r.json.data.shiftNumber, r.json);

  r = await call('POST', '/orders', { tenantId: ids.other, items: [{ productId: ids.soap, quantity: 1 }], paymentMode: 'CASH' }, accessToken);
  check('body tenantId rejected (forbidNonWhitelisted)', r.status === 400, r.json);

  r = await call('POST', '/orders', { items: [{ productId: ids.soap, quantity: 3, unitPrice: 0.01, total: 0.03 }, { productId: ids.rice, quantity: 1 }], paymentMode: 'CASH', grandTotal: 1, cashTendered: 500 }, accessToken);
  const o1 = r.json?.data;
  // soap: 99.99 base, tax 18.00 (17.9982) ; rice 100 base, tax 5 -> sub 199.99 tax 23 -> 222.99 -> 223
  check('order priced on server', r.status === 201 && o1.subTotal === 199.99 && o1.taxTotal === 23 && o1.grandTotal === 223 && o1.roundOff === 0.01, o1);
  check('cgst+sgst = tax', o1 && o1.cgst + o1.sgst === o1.taxTotal, o1);
  check('change due computed', o1 && o1.changeDue === 277, o1);
  check('order has id + itemsCount', o1 && o1.id && o1.itemsCount === 2, o1);
  check('invoice number format', o1 && /^INV-\d{4}-00001$/.test(o1.invoiceNumber), o1?.invoiceNumber);

  r = await call('POST', '/orders', { items: [{ productId: ids.rice, quantity: 5 }], paymentMode: 'CASH' }, accessToken);
  check('insufficient stock -> 400', r.status === 400 && /stock/i.test(r.json.message), r.json);
  r = await call('POST', '/orders', { items: [{ productId: ids.foreign, quantity: 1 }], paymentMode: 'CASH' }, accessToken);
  check("other shop's product rejected", r.status === 400, r.json);

  r = await call('POST', '/orders', { items: [{ productId: ids.soap, quantity: 6 }], paymentMode: 'CREDIT', customerId: ids.customer }, accessToken);
  check('credit limit enforced -> 400', r.status === 400 && /limit/i.test(r.json.message), r.json);
  r = await call('POST', '/orders', { items: [{ productId: ids.soap, quantity: 2 }], paymentMode: 'CREDIT', customerId: ids.customer }, accessToken);
  check('credit sale within limit ok', r.status === 201, r.json);
  const o2 = r.json?.data;
  check('second invoice sequential', o2 && /-00002$/.test(o2.invoiceNumber), o2?.invoiceNumber);

  // concurrency: 5 parallel bills -> unique invoice numbers
  const par = await Promise.all([...Array(5)].map(() => call('POST', '/orders', { items: [{ productId: ids.soap, quantity: 1 }], paymentMode: 'UPI' }, accessToken)));
  const nums = par.map((p) => p.json?.data?.invoiceNumber);
  check('parallel bills get unique invoice numbers', par.every((p) => p.status === 201) && new Set(nums).size === 5, nums);

  r = await call('GET', `/orders/returns/invoice/${o1.invoiceNumber}`, null, accessToken);
  const soapLine = r.json?.data?.returnableItems?.find((i) => i.productId === ids.soap);
  check('returnable items', r.status === 200 && soapLine && soapLine.returnableQty === 3 && soapLine.unitRefund === 39.33, r.json?.data?.returnableItems);
  r = await call('POST', '/orders/returns', { originalInvoiceNumber: o1.invoiceNumber, items: [{ productId: ids.soap, quantityReturned: 2, reason: 'DEFECTIVE' }], refundMode: 'CASH' }, accessToken);
  check('return incl GST', r.status === 201 && r.json.data.totalRefundAmount === 78.66 && /^RET-\d{4}-00001$/.test(r.json.data.returnNumber), r.json);
  r = await call('POST', '/orders/returns', { originalInvoiceNumber: o1.invoiceNumber, items: [{ productId: ids.soap, quantityReturned: 2, reason: 'DEFECTIVE' }], refundMode: 'CASH' }, accessToken);
  check('over-return rejected', r.status === 400, r.json);

  r = await call('GET', '/orders?limit=5', null, accessToken);
  check('orders list has id/itemsCount', r.status === 200 && r.json.data.every((o) => o.id && typeof o.itemsCount === 'number'), r.json);

  for (const period of ['today', 'week', 'month', 'fy', 'all']) {
    r = await call('GET', `/reports/executive?period=${period}`, null, accessToken);
    check(`reports period=${period}`, r.status === 200, r.json);
  }
  r = await call('GET', '/reports/executive?period=30d', null, accessToken);
  check('reports period=30d rejected', r.status === 400, r.json);

  r = await call('GET', '/orders/shifts/current', null, accessToken);
  const shift = r.json?.data;
  check('current shift', r.status === 200 && shift && shift.billsCount === 7, shift && { billsCount: shift.billsCount, expectedCash: shift.expectedCash });
  r = await call('POST', '/orders/shifts/close', { shiftId: String(shift._id), actualCashCounted: shift.expectedCash }, accessToken);
  check('close shift', r.status === 201 && r.json.data.status === 'CLOSED' && r.json.data.variance === 0, r.json);

  r = await call('GET', '/account/overview', null, accessToken);
  check('account overview: plan + usage + terminal', r.status === 200 && r.json.data.plan.name && r.json.data.usage.users.used >= 1 && r.json.data.terminal.outletCode === 'OUT-01' && r.json.data.store.shopId === 'smoke', r.json?.data);

  // ---- reusable foundation checks ----
  r = await call('GET', '/orders?limit=2&page=1', null, accessToken);
  check('paginated orders: meta present', r.status === 200 && r.json.data.length === 2 && r.json.meta && r.json.meta.total === 7 && r.json.meta.hasNextPage, r.json?.meta);
  r = await call('GET', '/orders?limit=500', null, accessToken);
  check('page size above 100 rejected', r.status === 400, r.json);
  r = await call('GET', '/orders/not-an-id', null, accessToken);
  check('invalid :id -> 400', r.status === 400, r.json);
  r = await call('GET', '/customers?search=' + encodeURIComponent('(a+)+$'), null, accessToken);
  check('regex special chars in search are safe', r.status === 200 && Array.isArray(r.json.data), r.json);
  r = await call('POST', '/customers', { name: 'Bad Phone', phone: '12345' }, accessToken);
  check('invalid mobile rejected', r.status === 400, r.json);
  r = await call('POST', '/customers', { name: 'Kumar', phone: '+91 9876500000', gstin: '33abcde1234f1z5' }, accessToken);
  check('customer created (phone normalised, GSTIN uppercased)', r.status === 201 && r.json.data.phone === '9876500000' && r.json.data.gstin === '33ABCDE1234F1Z5' && r.json.data.id, r.json);
  r = await call('POST', `/customers/${ids.customer}/payment`, { amount: 100000, paymentMode: 'CASH' }, accessToken);
  check('khata over-payment rejected', r.status === 400, r.json);
  r = await call('POST', `/customers/${ids.customer}/payment`, { amount: 10, paymentMode: 'UPI' }, accessToken);
  check('khata payment ok', r.status === 201 && r.json.data.balanceAfter >= 0, r.json);
  r = await call('GET', `/customers/${ids.customer}/statement`, null, accessToken);
  check('statement paginated', r.status === 200 && r.json.meta && r.json.data.length >= 2, r.json?.meta);

  r = await call('POST', '/suppliers', { name: 'Meenakshi Traders', phone: '9840122334' }, accessToken);
  check('supplier created', r.status === 201, r.json);
  const supplierId = r.json?.data?.id;
  r = await call('POST', '/suppliers/inward', { supplierId, items: [{ productId: ids.rice, name: 'Rice', barcode: 'R1', quantityReceived: 10, unitCostPrice: 80, taxRatePercent: 5 }], paymentStatus: 'UNPAID', amountPaid: 0 }, accessToken);
  check('GRN recorded, totals recomputed', r.status === 201 && r.json.data.grandTotal === 840 && /^GRN-\d{4}-00001$/.test(r.json.data.grnNumber), r.json);
  r = await call('POST', `/suppliers/${supplierId}/pay`, { amount: 900, paymentMode: 'UPI' }, accessToken);
  check('supplier over-payment rejected', r.status === 400, r.json);
  r = await call('POST', `/suppliers/${supplierId}/pay`, { amount: 400, paymentMode: 'UPI' }, accessToken);
  check('supplier payment ok', r.status === 201 && r.json.data.balanceDue === 440, r.json);
  r = await call('GET', `/suppliers/${supplierId}/payments`, null, accessToken);
  check('supplier payment ledger', r.status === 200 && r.json.data.length === 1 && r.json.data[0].balanceAfter === 440, r.json);

  // ---- General Master APIs ----
  // 1. Company Profile
  r = await call('GET', '/account/company-profile', null, accessToken);
  check('company profile read ok', r.status === 200 && r.json.data.companyCode, r.json);
  r = await call('PUT', '/account/company-profile', { companyCode: 'CMP-01', companyName: 'Smoke Mart Updated', city: 'Madurai' }, accessToken);
  check('company profile update ok', r.status === 200 && r.json.data.companyName === 'Smoke Mart Updated', r.json);

  // 2. Warehouses
  r = await call('POST', '/master/warehouses', { code: 'WH99', name: 'Smoke Godown', handlingPercent: 5 }, accessToken);
  check('create warehouse ok', r.status === 201 && r.json.data.code === 'WH99', r.json);
  const warehouseId = r.json.data._id || r.json.data.id;
  r = await call('POST', '/master/warehouses', { code: 'WH99', name: 'Duplicate' }, accessToken);
  check('duplicate warehouse code -> 409', r.status === 409, r.json);
  r = await call('GET', '/master/warehouses', null, accessToken);
  check('list warehouses ok', r.status === 200 && r.json.data.some((w) => w.code === 'WH99'), r.json);
  r = await call('PATCH', `/master/warehouses/${warehouseId}`, { name: 'Smoke Godown North' }, accessToken);
  check('patch warehouse ok', r.status === 200 && r.json.data.name === 'Smoke Godown North', r.json);
  r = await call('DELETE', `/master/warehouses/${warehouseId}`, null, accessToken);
  check('delete warehouse ok', r.status === 200, r.json);

  // 3. Territories
  r = await call('POST', '/master/territories', { code: 'SZ', name: 'South Zone', isGroup: true }, accessToken);
  check('create territory group ok', r.status === 201 && r.json.data.code === 'SZ', r.json);
  const territoryGroupId = r.json.data._id || r.json.data.id;
  r = await call('POST', '/master/territories', { code: 'MDU', name: 'Madurai', parentId: territoryGroupId }, accessToken);
  check('create child territory ok', r.status === 201 && r.json.data.code === 'MDU', r.json);
  const childTerritoryId = r.json.data._id || r.json.data.id;
  r = await call('DELETE', `/master/territories/${territoryGroupId}`, null, accessToken);
  check('delete territory group with children -> 400', r.status === 400, r.json);
  r = await call('DELETE', `/master/territories/${childTerritoryId}`, null, accessToken);
  check('delete child territory ok', r.status === 200, r.json);
  r = await call('DELETE', `/master/territories/${territoryGroupId}`, null, accessToken);
  check('delete empty territory group ok', r.status === 200, r.json);

  // 4. Reasons
  r = await call('POST', '/master/reasons', { code: 'RSN01', description: 'Defective item', transactionType: 'sales-return', effect: 'addition' }, accessToken);
  check('create reason ok', r.status === 201 && r.json.data.code === 'RSN01', r.json);
  const reasonId = r.json.data._id || r.json.data.id;
  r = await call('GET', '/master/reasons', null, accessToken);
  check('list reasons ok', r.status === 200 && r.json.data.some((x) => x.code === 'RSN01'), r.json);
  r = await call('DELETE', `/master/reasons/${reasonId}`, null, accessToken);
  check('delete reason ok', r.status === 200, r.json);

  // 5. Params
  r = await call('POST', '/master/params', { code: 'BILL_COPIES', description: 'Copies', module: 'billing', valueType: 'number', value: '2' }, accessToken);
  check('create param ok', r.status === 201 && r.json.data.code === 'BILL_COPIES', r.json);
  const paramId = r.json.data._id || r.json.data.id;
  r = await call('GET', '/master/params', null, accessToken);
  check('list params ok', r.status === 200 && r.json.data.some((x) => x.code === 'BILL_COPIES'), r.json);
  r = await call('DELETE', `/master/params/${paramId}`, null, accessToken);
  check('delete param ok', r.status === 200, r.json);

  // 6. Transporters
  r = await call('POST', '/master/transporters', { code: 'TR-SMK', name: 'Smoke Logistics', transporterId: '33AABCS1234F1Z5' }, accessToken);
  check('create transporter ok', r.status === 201 && r.json.data.code === 'TR-SMK', r.json);
  const transporterId = r.json.data._id || r.json.data.id;
  r = await call('GET', '/master/transporters', null, accessToken);
  check('list transporters ok', r.status === 200 && r.json.data.some((x) => x.code === 'TR-SMK'), r.json);
  r = await call('PATCH', `/master/transporters/${transporterId}`, { name: 'Smoke Logistics Express' }, accessToken);
  check('patch transporter ok', r.status === 200 && r.json.data.name === 'Smoke Logistics Express', r.json);
  r = await call('DELETE', `/master/transporters/${transporterId}`, null, accessToken);
  check('delete transporter ok', r.status === 200, r.json);

  // roles: cashier can bill but not manage suppliers / see reports
  r = await call('POST', '/auth/login', { shopId: 'smoke', username: 'smoke_cashier', password: 'Cashier123!' });
  const cashierToken = r.json?.data?.accessToken;
  r = await call('GET', '/suppliers', null, cashierToken);
  check('cashier blocked from suppliers', r.status === 403, r.json);
  r = await call('GET', '/reports/executive?period=today', null, cashierToken);
  check('cashier blocked from reports', r.status === 403, r.json);
  r = await call('PUT', `/customers/${ids.customer}`, { creditLimit: 999999 }, cashierToken);
  check('cashier cannot raise credit limit', r.status === 403, r.json);
  r = await call('GET', '/catalog/products', null, cashierToken);
  check('cashier can read catalog', r.status === 200, r.json);
  r = await call('POST', '/auth/logout', null, cashierToken);
  check('logout ok', r.status === 200, r.json);

  // ---- forgot / reset password ----
  await mongoose.connect(`mongodb://localhost:27017/${SMOKE_DB_NAME}`);
  const users = mongoose.connection.db.collection('users');
  const sha256 = (t) => crypto.createHash('sha256').update(t, 'utf8').digest('hex');

  r = await call('POST', '/auth/login', { shopId: 'smoke', username: 'smoke_cashier', password: 'Cashier123!' });
  const cashierRefresh = r.json?.data?.refreshToken;
  check('cashier login before reset', r.status === 200 && cashierRefresh, r.json);

  const unknownUser = await call('POST', '/auth/forgot-password', { shopId: 'smoke', identifier: 'nobody_here' });
  const unknownShop = await call('POST', '/auth/forgot-password', { shopId: 'no-such-shop', identifier: 'smoke_cashier' });
  const knownUser = await call('POST', '/auth/forgot-password', { shopId: 'SMOKE', identifier: 'C@X.IN' });
  check('forgot-password: unknown user -> generic 200', unknownUser.status === 200 && typeof unknownUser.json?.message === 'string', unknownUser.json);
  // Everything except the envelope's per-request fields must be identical.
  const comparable = (res) => JSON.stringify({ status: res.status, body: { ...res.json, timestamp: undefined, requestId: undefined } });
  check('forgot-password: same response for unknown shop, unknown user and known user',
    comparable(unknownUser) === comparable(unknownShop) && comparable(unknownUser) === comparable(knownUser),
    [comparable(unknownUser), comparable(unknownShop), comparable(knownUser)]);
  let cashierDoc = await users.findOne({ username: 'smoke_cashier' });
  const ttlMinutes = cashierDoc?.resetTokenExpiresAt ? (cashierDoc.resetTokenExpiresAt.getTime() - Date.now()) / 60000 : 0;
  check('forgot-password stores only a SHA-256 hash + 30 min expiry', /^[0-9a-f]{64}$/.test(cashierDoc?.resetTokenHash || '') && ttlMinutes > 29 && ttlMinutes <= 30, { hash: cashierDoc?.resetTokenHash, ttlMinutes });
  r = await call('POST', '/auth/forgot-password', { shopId: 'smoke' });
  check('forgot-password without identifier -> 400', r.status === 400, r.json);

  r = await call('POST', '/auth/reset-password', { token: 'not-a-real-token', newPassword: 'Reset1234' });
  check('reset with bad token -> 400 invalid/expired', r.status === 400 && r.json?.message === 'This reset link is invalid or has expired.', r.json);
  r = await call('POST', '/auth/reset-password', { token: 'whatever', newPassword: 'onlyletters' });
  check('reset with weak password -> 400', r.status === 400, r.json);

  // The raw token is only emailed, so plant a known token's hash for the rest of the checks.
  const expiredToken = crypto.randomBytes(32).toString('hex');
  await users.updateOne({ username: 'smoke_cashier' }, { $set: { resetTokenHash: sha256(expiredToken), resetTokenExpiresAt: new Date(Date.now() - 1000) } });
  r = await call('POST', '/auth/reset-password', { token: expiredToken, newPassword: 'Reset1234' });
  check('reset with expired token -> 400', r.status === 400 && /invalid or has expired/.test(r.json?.message), r.json);

  const resetToken = crypto.randomBytes(32).toString('hex');
  await users.updateOne({ username: 'smoke_cashier' }, { $set: { resetTokenHash: sha256(resetToken), resetTokenExpiresAt: new Date(Date.now() + 30 * 60000) } });
  r = await call('POST', '/auth/reset-password', { token: resetToken, newPassword: 'Reset1234' });
  check('reset with valid token -> 200', r.status === 200 && typeof r.json?.message === 'string', r.json);
  cashierDoc = await users.findOne({ username: 'smoke_cashier' });
  check('reset clears token + refresh hash, not temporary', cashierDoc && !cashierDoc.resetTokenHash && !cashierDoc.resetTokenExpiresAt && !cashierDoc.refreshTokenHash && cashierDoc.isTemporaryPassword === false, cashierDoc && { h: cashierDoc.resetTokenHash, e: cashierDoc.resetTokenExpiresAt, r: cashierDoc.refreshTokenHash });
  r = await call('POST', '/auth/reset-password', { token: resetToken, newPassword: 'Another1234' });
  check('reset token is one-time use -> 400', r.status === 400, r.json);
  r = await call('POST', '/auth/refresh', { refreshToken: cashierRefresh });
  check('reset signs out other sessions (refresh -> 401)', r.status === 401, r.json);
  r = await call('POST', '/auth/login', { shopId: 'smoke', username: 'smoke_cashier', password: 'Cashier123!' });
  check('old password rejected after reset', r.status === 401, r.json);
  r = await call('POST', '/auth/login', { shopId: 'smoke', username: 'smoke_cashier', password: 'Reset1234' });
  check('login with reset password ok', r.status === 200 && r.json.data.mustChangePassword === false, r.json);
  await mongoose.disconnect();

  // onboarding shop ID rules shared between check + registration
  r = await call('GET', '/onboarding/check-subdomain?shopId=admin');
  check('reserved shop id rejected', r.status === 200 && r.json.data.isAvailable === false, r.json);
  r = await call('POST', '/onboarding/complete-registration', { sessionId: 'x', businessName: 'Shop', ownerName: 'Owner', phone: '9876543210', businessType: 'GROCERY', preferredShopId: 'my-shop-long', address: { city: 'Chennai' } });
  check('registration rejects invalid shop id format', r.status === 400, r.json);

  // suspend tenant -> existing access token stops working
  const tenants = await call('GET', '/saas-admin/tenants', null, adminToken);
  check('admin tenants list', tenants.status === 200, tenants.json);
  r = await call('PATCH', `/saas-admin/tenants/${ids.tenantId}/status`, { status: 'BOGUS' }, adminToken);
  check('invalid status rejected', r.status === 400, r.json);
  r = await call('PATCH', `/saas-admin/tenants/${ids.tenantId}/status`, { status: 'SUSPENDED' }, adminToken);
  check('suspend tenant', r.status === 200, r.json);
  r = await call('GET', '/orders', null, accessToken);
  check('suspended shop token rejected', r.status === 401, r.json);
  r = await call('POST', '/auth/refresh', { refreshToken });
  check('suspended shop refresh rejected', r.status === 401, r.json);

  r = await call('POST', '/onboarding/request-otp', { email: 'new@shop.in', plan: 'GROWTH' });
  check("request-otp with old 'plan' field -> 400", r.status === 400, r.json);

  // rate limit on admin login (5 / minute)
  const attempts = await Promise.all([...Array(7)].map(() => call('POST', '/saas-admin/login', { username: 'x', password: 'y' })));
  check('admin login rate-limited -> 429', attempts.some((a) => a.status === 429), attempts.map((a) => a.status));

  console.log(`\n${pass} passed, ${fail} failed`);
})().catch((e) => { console.error(e); process.exit(1); });
