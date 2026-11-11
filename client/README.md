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

```
src/
  app/            App root, router (routes + guards wiring), providers
    providers/    AuthProvider, PreferencesProvider (theme, UI size, kiosk, POS prefs), PosSessionProvider (cart, catalog, drawer, modals)
  config/         routes.ts (all paths), navigation.ts (sidebar / flyouts / breadcrumbs / roles)
  layouts/        AppLayout: top bar + sidebar + page outlet + shared POS modals
  routes/         guards: RequireAuth, RequireRole, RedirectIfAuthenticated, RequirePasswordChange
  pages/          one file per route; page-specific pieces in pages/<page>/
  components/
    ui/           design-system primitives (Button, Card, Tabs, Toggle, OptionTile, InfoRow, UsageMeter, StatTile, Alert, PageHeader)
    layout/       Topbar, Sidebar, SidebarNavItem, SidebarFlyout, UserMenu, ShiftStatusChip, BrandMark
    pos/          PosToolbar, PosModalsHost
    …             feature components (cart, checkout, customers, orders, suppliers, reports)
  hooks/          useAuth, usePreferences, usePosSession, useFlyout, useFullscreen, data hooks
  lib/            api.ts (axios + token refresh), config, permissions, preferences, format, totals, invoice
  types/          API / domain types
```

Design rules: no shadows, `rounded-md` everywhere (`rounded-full` only for circles), colours via theme
tokens in `index.css` (`primary-*` for actions, `shell` for the navy frame, `ink` for solid dark surfaces).
Dark mode remaps the neutral palette, so screens need no `dark:` classes.

## Sign-up to dashboard flow

1. Landing `/register`: email OTP → verify → complete registration.
2. Welcome email: username `<shopId>_admin`, temporary password, link `CLIENT_BASE_URL/login?shopId=<shopId>`.
3. `/login?shopId=…` prefills Shop ID and username → sign in.
4. First sign-in → `/change-password` (enforced by the server too) → `/dashboard`.
