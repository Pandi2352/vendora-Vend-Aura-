# 🏪 Vendora – Cloud Retail POS & ERP SaaS

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Development-emerald?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Architecture-Multi--Tenant%20SaaS-blue?style=for-the-badge" alt="Multi-Tenant" />
  <img src="https://img.shields.io/badge/Landing-React%2019%20%2B%20Vite%208%20%2B%20Tailwind%204%20(Port%204000)-indigo?style=for-the-badge" alt="Landing" />
  <img src="https://img.shields.io/badge/Client%20POS-React%2019%20%2B%20Vite%208%20%2B%20Tailwind%204%20(Port%204001)-cyan?style=for-the-badge" alt="Client POS" />
  <img src="https://img.shields.io/badge/Backend-NestJS%2011%20%2B%20TypeScript%20(Port%205000)-red?style=for-the-badge" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-green?style=for-the-badge" alt="Database" />
</p>

> **Vendora** (*Vend* + *Aura*) is an enterprise-grade, cloud-native Point of Sale (POS) and Retail Enterprise Resource Planning (ERP) platform built for modern retail businesses — from corner Kirana shops and bakeries to multi-branch supermarkets and garment chains.

---

## 🌟 The Vendora Vision

Most retail software available today is either fragile desktop-bound legacy software requiring manual on-premise installation, or superficial billing CRUD web apps that crash when internet connectivity drops.

**Vendora** bridges this gap:
- **Instant Cloud Deployment**: A shop owner selects their business type (e.g., Grocery), verifies email via OTP, and is provisioned with a ready-to-bill store workspace (`https://yourshop.vendora.com`) complete with pre-configured categories, units, and GST rules.
- **Offline POS Resilience**: Cashiers continue barcode scanning, cart management, and receipt printing even during internet disconnects. Bills seamlessly queue in browser IndexedDB and sync in the background when connectivity resumes.
- **Double-Entry Stock Ledger**: Inventory is treated with the same mathematical rigor as financial books. Every sale, purchase, transfer, and adjustment generates an immutable ledger entry.
- **Hardware Agnostic**: Direct ESC/POS thermal printing (58mm/80mm), USB/Bluetooth barcode scanner HID listeners, and weighing scale serial integrations.

---

## 📚 Complete Project Documentation Index

Vendora's engineering blueprint is divided into 6 core specification documents:

| Document | File Name | Description |
| :--- | :--- | :--- |
| **01. Main Roadmap** | [**`docs/ROADMAP.md`**](file:///d:/mern/vendora/docs/ROADMAP.md) | **The Main Master Document**: Complete 14-phase MVP roadmap covering all 117 modules in exhaustive detail. |
| **02. System Architecture** | [**`docs/ARCHITECTURE.md`**](file:///d:/mern/vendora/docs/ARCHITECTURE.md) | Multi-tenancy isolation model, NestJS modular architecture, React frontend design, and offline sync mechanics. |
| **03. Database Schema** | [**`docs/DATABASE_DESIGN.md`**](file:///d:/mern/vendora/docs/DATABASE_DESIGN.md) | MongoDB collections, Mongoose schemas, compound indexes, and high-performance aggregation pipelines. |
| **04. Onboarding Workflow** | [**`docs/ONBOARDING_FLOW.md`**](file:///d:/mern/vendora/docs/ONBOARDING_FLOW.md) | Self-service registration flow: Plan selection ➔ Email OTP ➔ Business details ➔ Auto-provisioning ➔ Credentials email ➔ First login. |
| **05. REST API Contracts** | [**`docs/API_SPECIFICATION.md`**](file:///d:/mern/vendora/docs/API_SPECIFICATION.md) | Standardized REST contracts for Auth, Products, POS checkout, Stock ledgers, and Analytics. |
| **06. Project Master Hub** | [**`README.md`**](file:///d:/mern/vendora/README.md) | Brand identity, technology stack, directory layout, port allocations, and developer setup instructions. |

---

## 🛠️ Technology Stack

### 1. Landing & Super Admin Portal (`landing/` • Port `4000`)
- **Core**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS 4 (`@tailwindcss/vite`) + Lucide Icons
- **Routing**: React Router DOM 7
- **Networking**: Axios
- **Features**:
  - Full marketing site with 14-sector industry marquee
  - Interactive feature showcase with realistic thermal receipt mockup
  - Pricing cards (Free Trial, Starter, Growth [highlighted blue], Business)
  - Interactive 4-step self-service onboarding modal
  - Platform Super Admin Dashboard (`/admin`) for tenant user and store contact management

### 2. Merchant Store POS & ERP (`client/` • Port `4001`)
- **Core**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS 4 (`@tailwindcss/vite`) + Lucide Icons
- **Features**:
  - Dedicated store sign-in (Customer ID, Username, Password)
  - Fast barcode scanning and debounced product catalog search
  - Active shopping cart with quantity multipliers and line-item tax calculation
  - Multi-tender checkout (Cash tender with change calculation, UPI QR, Card)
  - ESC/POS thermal receipt formatting and browser printing

### 3. Backend REST API Server (`server/` • Port `5000`)
- **Framework**: NestJS 11 + TypeScript
- **Database Engine**: MongoDB 7.0+ Replica Set
- **ODM**: Mongoose 8
- **Security & Auth**: Passport.js + JWT Token Rotation + Bcrypt
- **API Documentation**: OpenAPI / Swagger (`@nestjs/swagger`) at `/docs`

---

## 📁 Project Architecture & Port Allocation

Vendora is structured into **three independent, self-contained projects** (each with its own `node_modules`):

```
vendora/
├── docs/                      # Comprehensive specifications & blueprints
│   ├── ROADMAP.md             # 🗺️ Master MVP-wise development roadmap (117 Modules)
│   ├── ARCHITECTURE.md        # 🏗️ System & Multi-tenant architecture
│   ├── DATABASE_DESIGN.md     # 🗄️ MongoDB schemas and index design
│   ├── ONBOARDING_FLOW.md     # 🚀 Self-service onboarding & OTP workflow
│   └── API_SPECIFICATION.md   # 📡 Complete REST API specification
├── landing/                   # 🌐 Port 4000: Public SaaS Landing + Super Admin Portal
│   ├── src/
│   │   ├── components/        # Hero, Pricing Cards, Receipt Mockup, How it works, Onboarding Modal
│   │   ├── pages/             # SuperAdminDashboard (/admin) for tenant user & contact management
│   │   └── shared/            # Enums, plans, and types
│   ├── package.json
│   └── vite.config.ts         # Configured for Port 4000
├── client/                    # 🏪 Port 4001: Tenant Merchant POS Terminal & Store ERP
│   ├── src/
│   │   ├── components/        # POS billing counter, barcode scanner, cart, receipt
│   │   ├── shared/            # Client-side models and types
│   │   └── App.tsx            # Cashier & store ERP shell
│   ├── package.json
│   └── vite.config.ts         # Configured for Port 4001
└── server/                    # 🚀 Port 5000: NestJS 11 + MongoDB REST API Server
    ├── src/
    │   ├── shared/            # Server-side enums and DTOs
    │   ├── modules/           # Onboarding, Tenant, User, Outlet, Subscriptions, SaasAdmin
    │   └── main.ts            # REST API + Swagger Docs at /docs
    ├── package.json
    └── nest-cli.json
```

---

## 🚦 Port Allocation & Workflow

| Service | Port | Description & Access URL |
| :--- | :---: | :--- |
| **Landing & Marketing** | `4000` | `http://localhost:4000` – Public landing page, pricing plans, feature showcase, and self-service registration wizard. |
| **Super Admin Console** | `4000` | `http://localhost:4000/admin` – Platform Super Admin dashboard to view all registered tenants, owner contact details, staff users, and plan statuses. |
| **Merchant Store POS** | `4001` | `http://localhost:4001` – Store cashier counter & retail ERP where shop owners and cashiers log in. |
| **Backend REST API** | `5000` | `http://localhost:5000/api/v1` – NestJS REST API with Swagger documentation at `http://localhost:5000/docs`. |

---

## ⚡ Quickstart Guide (Local Development Setup)

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **MongoDB**: `v7.0+` (local community server running on port `27017` or MongoDB Atlas URI)

### 1. Developer Execution Commands
From the workspace root directory:

```bash
# Terminal 1: Start Public Landing Page + Super Admin Portal (Port 4000)
npm run dev:landing

# Terminal 2: Start Tenant Merchant POS Counter (Port 4001)
npm run dev:client

# Terminal 3: Start NestJS Backend API (Port 5000)
npm run dev:server

# Build all 3 projects
npm run build
```

---

## 🐳 Deployment & CI

```bash
cp .env.docker.example .env   # set JWT_SECRET / JWT_REFRESH_SECRET (>= 32 chars, different)
docker compose up -d --build  # mongo (replica set rs0) + API :5000 + POS :4001 + landing :4000
```

GitHub Actions (`.github/workflows/ci.yml`) type-checks, tests and builds all three projects on every push and pull request. See [**`docs/DEPLOYMENT.md`**](docs/DEPLOYMENT.md) for required environment variables, production notes, image tagging and rollback.

---

## 🔐 Environment & Conventions

- **Server** (`server/.env`, see `.env.example`): `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET` (must differ), `PLATFORM_ADMIN_USERNAME` / `PLATFORM_ADMIN_PASSWORD`, `CLIENT_BASE_URL` (POS URL used in welcome emails), `CORS_ORIGINS`, SMTP settings.
- **Landing** (`landing/.env`): `VITE_API_URL`, `VITE_POS_URL`. **Client** (`client/.env`): `VITE_API_URL`, `VITE_LANDING_URL`.
- **Auth**: every API route needs a Bearer token except login/refresh, onboarding and health. The store (tenant) always comes from the token; never send `tenantId`.
- **Transactions**: billing, returns, GRNs and invoice numbering run in MongoDB transactions when MongoDB is a replica set. On a standalone dev server they run without one (a warning is logged), so use a replica set in production.
- **Shared enums**: `server/src/shared/enums` is the source of truth; `landing/src/shared/enums` is a copy and must be kept identical.

## 🚦 Roadmap at a Glance (14 MVPs)

```
[Phase 1] MVP 01: SaaS Registration & Auto-Provisioning  (15 Modules) ──► ✅ IMPLEMENTED
[Phase 1] MVP 02: Multi-Tenant Authentication & RBAC     (14 Modules) ──► ✅ IMPLEMENTED
[Phase 1] MVP 03: Business Setup & GST Configuration     (14 Modules) ──► ✅ IMPLEMENTED
[Phase 1] MVP 04: Product Catalogue & Barcode Labels     (15 Modules) ──► ✅ IMPLEMENTED
[Phase 1] MVP 05: Basic Inventory & Stock Ledger         (12 Modules) ──► ✅ IMPLEMENTED
[Phase 1] MVP 06: Core POS Billing Counter & Invoicing   (18 Modules) ──► ✅ IMPLEMENTED 🏁
[Phase 2] MVP 07: Procurement, GRN & Supplier Accounts   (13 Modules) ──► ✅ IMPLEMENTED
[Phase 2] MVP 08: Customer Management & Credit (Khata)   (12 Modules) ──► ✅ IMPLEMENTED
[Phase 2] MVP 09: Advanced Sales, Hold Bills & Returns   (13 Modules) ──► 🚧 PARTIAL (hold bills, returns, shifts)
[Phase 2] MVP 10: Reports, Analytics & GSTR-1 Summaries  (15 Modules) ──► 🚧 PARTIAL (executive, GSTR-1/3B, inventory)
[Phase 3] MVP 11: Chart of Accounts & Retail Accounting  (17 Modules)
[Phase 3] MVP 12: Multi-Branch & Inter-Store Transfers   (13 Modules)
[Phase 3] MVP 13: Offline-First POS & Loyalty Engine     (18 Modules)
[Phase 4] MVP 14: Super Admin Console & SaaS Billing     (21 Modules) ──► ✅ IMPLEMENTED (console; billing pending)
```

---

## 🎯 Target Retail Sectors

Vendora comes equipped with seed templates customized for:
1. 🛒 **Grocery & Kirana** (Fast barcode scanning, loose items in kg/grams, credit ledger)
2. 🏬 **Supermarkets** (Multiple checkout counters, FMCG, promotions, high basket sizes)
3. 👗 **Textile & Garments** (Matrix variants for size/color, barcode tags, seasonal sales)
4. 🍎 **Fruits & Vegetables** (Decimal weigh-scale integration, fast price changes)
5. 🎂 **Bakery & Sweets** (Batch tracking, advance custom orders, expiry management)
6. 📱 **Electronics & Mobiles** (Serial number & IMEI tracking, warranty invoicing)
7. 💊 **Pharmacy & Medical** (Batch number, expiry dates, HSN codes, schedule drug alerts)
8. 🔨 **Hardware & Paints** (Multiple units: bags, tins, pieces, contractor credit)

---

## 📄 License & Attribution

Copyright © 2026 **Vendora Technologies** / **Unipro Tech Solutions Pvt Ltd**. All rights reserved.  
Built with precision for high-efficiency modern retail.
