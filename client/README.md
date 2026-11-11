# Vendora Store POS (client)

The cashier/owner counter app for Vendora: billing, held carts, returns, cash-drawer shifts,
customers (khata), suppliers/GRN and reports. React 19 + Vite + Tailwind 4, talking to the
NestJS API in `../server`.

## Run

```bash
cp .env.example .env   # adjust if the API is not on localhost:5000
npm install
npm run dev            # http://localhost:5173
npm run build          # type-check (tsc -b) + production build into dist/
```

The API server must be running for login and billing.

## Environment variables

| Variable           | Default                        | Purpose                                     |
| ------------------ | ------------------------------ | ------------------------------------------- |
| `VITE_API_URL`     | `http://localhost:5000/api/v1` | Base URL of the Vendora API                 |
| `VITE_LANDING_URL` | `http://localhost:4000`        | Landing/onboarding site linked from login   |

## Layout

- `src/lib/api.ts` – the only axios instance: bearer token, automatic refresh on 401, `unwrap`, `getErrorMessage`
- `src/lib/config.ts` – env-driven URLs
- `src/hooks/` – session, cart/held carts, drawer shift, catalog + customers
- `src/components/` – views and modals (no router; tabs are local state in `App.tsx`)
