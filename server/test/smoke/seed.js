// Seeds ONLY the throwaway database "vendora_smoketest".
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
(async () => {
  await mongoose.connect('mongodb://localhost:27017/vendora_smoketest');
  const db = mongoose.connection.db;
  if (db.databaseName !== 'vendora_smoketest') throw new Error('wrong db');
  await db.dropDatabase();
  const tenantId = new mongoose.Types.ObjectId();
  const outletId = new mongoose.Types.ObjectId();
  await db.collection('tenants').insertOne({ _id: tenantId, shopId: 'smoke', businessName: 'Smoke Store', ownerName: 'Owner', email: 'o@x.in', phone: '9999999999', businessType: 'GROCERY', status: 'TRIAL', primaryOutletId: outletId, settings: { timezone: 'Asia/Kolkata', gstin: '33ABCDE1234F1Z5', address: { city: 'Chennai', state: 'TN', pincode: '600001' } }, isActive: true });
  await db.collection('outlets').insertOne({ _id: outletId, tenantId, name: 'Main', code: 'OUT-01', isPrimary: true, address: { city: 'Chennai', pincode: '600001', state: 'TN' }, isActive: true });
  await db.collection('users').insertOne({ tenantId, outletIds: [outletId], username: 'smoke_admin', email: 'o@x.in', fullName: 'Owner', passwordHash: await bcrypt.hash('TempPass1!', 10), role: 'OWNER', isTemporaryPassword: true, isActive: true });
  const other = new mongoose.Types.ObjectId();
  await db.collection('tenants').insertOne({ _id: other, shopId: 'other', businessName: 'Other', ownerName: 'X', email: 'x@x.in', phone: '1', businessType: 'GROCERY', status: 'TRIAL', isActive: true });
  const r = await db.collection('products').insertMany([
    { tenantId, name: 'Rice 1kg', category: 'Grains', barcode: 'R1', unitPrice: 100, mrp: 110, costPrice: 80, taxRatePercent: 5, stock: 3, unit: 'pcs', isActive: true },
    { tenantId, name: 'Soap', category: 'Care', barcode: 'S1', unitPrice: 33.33, mrp: 40, costPrice: 20, taxRatePercent: 18, stock: 50, unit: 'pcs', isActive: true },
    { tenantId: other, name: 'Foreign', category: 'X', barcode: 'F1', unitPrice: 1, mrp: 1, taxRatePercent: 0, stock: 5, unit: 'pcs', isActive: true },
  ]);
  const c = await db.collection('customers').insertOne({ tenantId, name: 'Ravi', phone: '9876543210', creditLimit: 200, currentCreditBalance: 0, totalPurchasesCount: 0, totalSpent: 0, isActive: true });
  console.log(JSON.stringify({ tenantId, other, rice: r.insertedIds[0], soap: r.insertedIds[1], foreign: r.insertedIds[2], customer: c.insertedId }));
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
