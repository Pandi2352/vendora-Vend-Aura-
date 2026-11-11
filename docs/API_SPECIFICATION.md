# 📡 Vendora – REST API Specification & Endpoint Contracts

> **Product**: Vendora – Cloud-Based Multi-Tenant Retail POS & ERP SaaS  
> **API Version**: `v1`  
> **Base URL Format**: `https://api.vendora.com/api/v1` or `https://{shopId}.vendora.com/api/v1`

---

## 1. Global API Standards & Conventions

### 1.1 Request Headers
| Header | Description | Required |
| :--- | :--- | :---: |
| `Content-Type` | `application/json` | Yes |
| `Authorization` | `Bearer <JWT_ACCESS_TOKEN>` | Yes (for protected routes) |
| `X-Tenant-ID` | Subdomain slug (e.g. `srimurugan`) if not resolved by Host header | Optional |

### 1.2 Unified Success Response Envelope
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 1420,
    "totalPages": 57
  }
}
```

### 1.3 Unified Error Response Envelope
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "barcode must be a valid EAN-13 string",
    "sellingPrice must be greater than 0"
  ],
  "timestamp": "2026-11-11T05:00:00.000Z",
  "path": "/api/v1/products"
}
```

---

## 2. Onboarding & Registration Endpoints

### 🔹 `POST /onboarding/request-email-otp`
Requests a 6-digit email OTP for onboarding verification.
- **Request Body**:
```json
{
  "email": "owner@srimurugan.in",
  "selectedPlanCode": "FREE_TRIAL"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Verification OTP sent to your email",
  "data": {
    "sessionId": "reg_sess_9a8f27bc12",
    "email": "owner@srimurugan.in",
    "expiresInSeconds": 300
  }
}
```

---

### 🔹 `POST /onboarding/verify-email-otp`
Verifies the 6-digit OTP.
- **Request Body**:
```json
{
  "sessionId": "reg_sess_9a8f27bc12",
  "otp": "849201"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "sessionId": "reg_sess_9a8f27bc12",
    "isVerified": true
  }
}
```

---

### 🔹 `GET /onboarding/check-subdomain`
Real-time debounce query to verify shop ID availability.
- **Query Params**: `?shopId=srimurugan`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "shopId": "srimurugan",
    "isAvailable": true,
    "fullSubdomainUrl": "https://srimurugan.vendora.com"
  }
}
```

---

### 🔹 `POST /onboarding/complete-registration`
Submits business profile, provisions tenant, default outlet, categories, owner account, and dispatches credential email.
- **Request Body**:
```json
{
  "sessionId": "reg_sess_9a8f27bc12",
  "businessName": "Sri Murugan Supermarket",
  "ownerName": "Pandi Selvam",
  "phone": "+919876543210",
  "businessType": "GROCERY",
  "preferredShopId": "srimurugan",
  "address": {
    "street": "12 Market Street",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600001",
    "country": "India"
  },
  "gstin": "33AAAAA0000A1Z5"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Workspace successfully provisioned! Credentials sent via email.",
  "data": {
    "tenantId": "65f02bc765d891e4a112001a",
    "shopId": "srimurugan",
    "loginUrl": "https://srimurugan.vendora.com",
    "username": "srimurugan_admin",
    "trialEndsAt": "2026-12-11T10:30:00.000Z"
  }
}
```

---

## 3. Authentication & RBAC Endpoints

### 🔹 `POST /auth/login`
- **Request Body**:
```json
{
  "username": "srimurugan_admin",
  "password": "temporaryPassword123"
}
```
- **Response (200 OK - Temporary Password Case)**:
```json
{
  "success": true,
  "message": "Temporary credentials verified. Password change required.",
  "data": {
    "mustChangePassword": true,
    "resetToken": "jwt_single_use_token_for_reset",
    "user": {
      "id": "65f02bc765d891e4a112001b",
      "fullName": "Pandi Selvam",
      "role": "OWNER"
    }
  }
}
```

---

### 🔹 `POST /auth/first-login-change-password`
- **Headers**: `Authorization: Bearer <resetToken>`
- **Request Body**:
```json
{
  "newPassword": "SecurePermanentPassword@2026",
  "confirmPassword": "SecurePermanentPassword@2026"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {
    "accessToken": "ey...",
    "refreshToken": "ey...",
    "user": {
      "id": "65f02bc765d891e4a112001b",
      "fullName": "Pandi Selvam",
      "role": "OWNER"
    }
  }
}
```

---

## 4. Product Catalog Endpoints

### 🔹 `GET /products/barcode/:barcode`
High-speed endpoint (<30ms) utilized by the POS laser scanner listener.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "65f03a118e90a12001f",
    "name": "Tata Tea Gold 500g",
    "barcode": "8901052001015",
    "sku": "TTG-500",
    "unit": "PIECE",
    "purchasePrice": 240.00,
    "mrp": 310.00,
    "sellingPrice": 290.00,
    "taxRatePercent": 5,
    "hsnCode": "0902",
    "currentStock": 42
  }
}
```

---

### 🔹 `POST /products`
Creates a new product with optional initial opening stock.
- **Request Body**:
```json
{
  "name": "Aashirvaad Superior MP Sharbati Atta 5kg",
  "barcode": "8901725181222",
  "sku": "AASH-ATTA-5KG",
  "categoryId": "65f02c0011a2b3c4d5",
  "unit": "PIECE",
  "purchasePrice": 260.00,
  "mrp": 340.00,
  "sellingPrice": 315.00,
  "taxRatePercent": 5,
  "hsnCode": "11010000",
  "minStockLevel": 10,
  "openingStock": 30
}
```

---

## 5. POS Billing & Invoicing Endpoints

### 🔹 `POST /pos/invoices`
Atomic checkout endpoint. Generates invoice, updates double-entry stock ledger, and appends payment record.
- **Request Body**:
```json
{
  "outletId": "65f02bc765d891e4a1120020",
  "clientInvoiceId": "d7b1e4c0-38a6-443b-a9f4-129486c99021",
  "customerId": "65f03011a221338801b",
  "items": [
    {
      "productId": "65f03a118e90a12001f",
      "quantity": 2,
      "unitPrice": 290.00,
      "discountAmount": 10.00,
      "taxRatePercent": 5
    }
  ],
  "billDiscount": 0,
  "payments": [
    {
      "mode": "UPI",
      "amount": 570.00,
      "referenceNumber": "UPI-TRANS-981248102"
    }
  ]
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Bill finalized successfully",
  "data": {
    "invoiceId": "65f0410099ab2134001c",
    "invoiceNumber": "INV-2026-1042",
    "billedAt": "2026-11-11T10:45:00.000Z",
    "grandTotal": 570.00,
    "taxDetails": {
      "cgst": 13.57,
      "sgst": 13.57,
      "taxable": 542.86
    },
    "receiptPrintPayload": {
      "header": "Sri Murugan Supermarket",
      "address": "12 Market Street, Chennai",
      "gstin": "33AAAAA0000A1Z5",
      "invoiceNo": "INV-2026-1042",
      "items": [
        { "name": "Tata Tea Gold 500g", "qty": 2, "rate": 290.00, "total": 570.00 }
      ],
      "total": 570.00,
      "paymentMode": "UPI"
    }
  }
}
```

---

### 🔹 `POST /pos/offline-sync-batch`
Syncs an array of bills processed while offline.
- **Request Body**:
```json
{
  "invoices": [
    {
      "clientInvoiceId": "f12c-...",
      "billedAt": "2026-11-11T09:15:00.000Z",
      "items": [ ... ],
      "payments": [ ... ]
    }
  ]
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Batch synced successfully",
  "data": {
    "syncedCount": 1,
    "assignedInvoices": [
      {
        "clientInvoiceId": "f12c-...",
        "serverInvoiceNumber": "INV-2026-1043",
        "status": "RECORDED"
      }
    ]
  }
}
```

---

## 6. Inventory & Stock Ledger Endpoints

### 🔹 `GET /inventory/stock-ledger`
Audit trail of inventory movements.
- **Query Params**: `?productId=65f03a118e90a12001f&limit=20`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f0410099ab2134002d",
      "transactionType": "POS_SALE",
      "referenceNumber": "INV-2026-1042",
      "quantityIn": 0,
      "quantityOut": 2,
      "balanceAfter": 40,
      "createdAt": "2026-11-11T10:45:00.000Z"
    },
    {
      "_id": "65f03a118e90a120020a",
      "transactionType": "OPENING_STOCK",
      "referenceNumber": "INIT",
      "quantityIn": 42,
      "quantityOut": 0,
      "balanceAfter": 42,
      "createdAt": "2026-11-11T08:00:00.000Z"
    }
  ]
}
```

---

## 7. Procurement & Suppliers Endpoints

### 🔹 `POST /purchases/grn`
Creates Goods Receipt Note from incoming supplier shipment.
- **Request Body**:
```json
{
  "supplierId": "65f02901a1bc3344d1",
  "supplierInvoiceNumber": "SUP-INV-8912",
  "supplierInvoiceDate": "2026-11-10",
  "items": [
    {
      "productId": "65f03a118e90a12001f",
      "receivedQuantity": 50,
      "unitPurchaseCost": 240.00,
      "taxRatePercent": 5
    }
  ]
}
```

---

## 8. Reports & Analytics Endpoints

### 🔹 `GET /reports/dashboard-kpis`
Summary metrics for the executive store dashboard.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "todaySales": 48250.00,
    "todayBillsCount": 86,
    "todayGrossProfit": 8685.00,
    "lowStockAlertsCount": 4,
    "cashInDrawer": 14500.00,
    "tenderSummary": {
      "cash": 14500.00,
      "upi": 28750.00,
      "card": 5000.00
    }
  }
}
```

---

*Vendora REST API Specification – Version 1.0.0 Approved.*

