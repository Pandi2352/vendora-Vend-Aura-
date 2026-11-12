# 🎨 Reusable Frontend Blueprint — Final Master Checklist

> Companion to [`BACKEND_BLUEPRINT_CHECKLIST.md`](./BACKEND_BLUEPRINT_CHECKLIST.md).
> **Goal:** one reusable frontend foundation (design tokens, components, forms, API client, routing, hooks, utilities) that every Vendora screen — and future projects — builds on before any business module is written.
>
> **Reference implementation:** `client/` (store POS & back office). Paths below are relative to `client/src/` unless noted.
> **Status legend:** `[x]` implemented and in use · `[ ]` not done yet. Notes in _italics_ say where it lives or why it is open.

**Stack:** React 19 · TypeScript (strict) · Vite 8 · Tailwind CSS v4 · React Router 7 · Axios · React Hook Form 7 + Zod 4 · Phosphor Icons · Vitest + Testing Library · Recharts 3 (admin dashboards, `landing/`)

> Icons: the blueprint draft suggested Lucide React; both Vendora apps already standardise on **Phosphor Icons** (`@phosphor-icons/react`), so that is the project icon set. Use one icon library per app.

---

## 📑 Table of Contents

- [Design rules (apply everywhere)](#-design-rules-apply-everywhere)
- [LEVEL 1 — Basic Common Frontend Foundation](#level-1--basic-common-frontend-foundation)
  - [1. Project Setup & Architecture](#1-project-setup--architecture)
  - [2. Folder Structure](#2-folder-structure)
  - [3. Design System & Theme Foundation](#3-design-system--theme-foundation)
  - [4. Common UI Components](#4-common-ui-components)
  - [5. Common Layout Components](#5-common-layout-components)
  - [6. Common Table Components](#6-common-table-components)
  - [7. Common Form Foundation](#7-common-form-foundation)
  - [8. API Integration Foundation](#8-api-integration-foundation)
  - [9. Common Hooks](#9-common-hooks)
  - [10. Common Utility Functions](#10-common-utility-functions)
  - [11. Routing Foundation](#11-routing-foundation)
  - [12. Authentication UI Foundation](#12-authentication-ui-foundation)
  - [13. State Management Foundation](#13-state-management-foundation)
  - [14. Common Feedback Components](#14-common-feedback-components)
  - [15. Environment & Configuration](#15-environment--configuration)
  - [16. Testing Foundation](#16-testing-foundation)
  - [17. Build & Deployment Foundation](#17-build--deployment-foundation)
- [LEVEL 2 — Advanced & Project-Dependent Frontend Foundation](#level-2--advanced--project-dependent-frontend-foundation)
- [Reusable component inventory](#-reusable-component-inventory)
- [Reusable building blocks: use this, never that](#-reusable-building-blocks-use-this-never-that)
- [Recommended implementation order](#-recommended-implementation-order)
- [Frontend ↔ backend foundation mapping](#-frontend--backend-foundation-mapping)

---

## ✳️ Design rules (apply everywhere)

1. **No shadows.** No `shadow-*`, no `ring-*` focus rings. Depth comes from borders and tints; focus uses `outline`.
2. **`rounded-md` everywhere.** `rounded-full` only for true circles (status dots, avatars, switch knob).
3. **Same control height.** Every single-line control (input, dropdown, password, amount, phone, search, `Button size="md"`) is `h-10`, from `components/ui/field-styles.ts`.
4. **No native `<select>`.** Use `Dropdown` / `DropdownField`.
5. **Tokens, not hex.** Colours come from `index.css` tokens (`primary-*`, `shell`, `ink`, status tints). Dark mode remaps the neutral scale, so screens need no `dark:` classes.
6. **Errors under the field, before submit.** Validation runs when the user leaves a field and again while they fix it; Submit reveals any remaining errors and focuses the first one.
7. **Shared library vs module.** Generic pieces go in `components/ui`, `components/forms`, `components/tables`, `components/feedback`. A POS billing component belongs to the POS feature, not the shared library.

---

## LEVEL 1 — Basic Common Frontend Foundation

### 1. Project Setup & Architecture
- [x] Vite + React + TypeScript initialization
- [x] Tailwind CSS v4 configuration — _`@tailwindcss/vite`, tokens in `index.css`_
- [x] React Router setup — _`app/router.tsx` (data router)_
- [x] TypeScript strict configuration — _`"strict": true` in `tsconfig.app.json`_
- [x] Folder structure — _see §2_
- [x] Naming conventions — _components `PascalCase.tsx`, hooks `useX.ts`, utils/validations `kebab` or `camel` `.ts`, tests `*.test.ts(x)` next to the code_
- [x] Import aliases — _`@/` → `src/` (`tsconfig.app.json` paths + `vite.config.ts` alias)_
- [x] Environment configuration — _`.env.example`, `lib/config.ts`_
- [ ] Development / staging / production environments — _only one `.env`; add `.env.staging` / `.env.production` when deploying_
- [x] ESLint configuration — _ESLint 9 flat config (`eslint.config.js`): typescript-eslint, react-hooks, jsx-a11y, react-refresh; `npm run lint` (0 errors)_
- [x] Prettier configuration — _`.prettierrc.json`, `npm run format` / `format:check`_
- [x] Git configuration — _`.gitignore`_
- [x] Package scripts — _`dev`, `build`, `typecheck`, `test`, `test:watch`, `format`, `format:check`, `preview`_
- [x] README and setup documentation — _`client/README.md`_

### 2. Folder Structure

Actual structure (`client/src`):

```
src/
├── app/                 App root, router, providers (Auth, Preferences, PosSession)
├── assets/
├── components/
│   ├── ui/              design-system primitives (Button, Input, Dropdown, Dialog, Badge, …)
│   │   └── dropdown/    custom select: component, keyboard helpers, positioning hook, tests
│   ├── forms/           React Hook Form integration (Form, fields, layout, server errors)
│   ├── tables/          DataTable, TablePagination, RowActions
│   ├── feedback/        Toast, Confirm dialog, Empty/Error/Network states, ErrorBoundary
│   ├── layout/          Topbar, Sidebar, flyouts, UserMenu, BrandMark
│   └── <feature>/       feature components (cart, checkout, customers, orders, suppliers, reports, pos)
├── config/              routes.ts (paths), navigation.ts (menu, roles, breadcrumbs)
├── hooks/               common.ts (generic hooks) + app hooks (useAuth, useToast, useConfirm, …)
├── layouts/             AppLayout
├── lib/                 infrastructure: api.ts (axios), config, permissions, preferences, totals, invoice
├── pages/               one file per route; page-only pieces in pages/<page>/
├── routes/              route guards
├── test/                test setup
├── types/               API + domain types
├── utils/               string, date, number, collection, browser helpers
└── validations/         zod rules (common.ts) + module schemas
```

- [x] Shared UI separated from features
- [x] Infrastructure (`lib/`) separated from pure helpers (`utils/`)
- [ ] `modules/<feature>/{components,hooks,pages,services,types,validations}` layout — _features currently live in `components/<feature>` + `pages/`; move to `modules/` when the next large module (accounting, multi-branch) starts_

### 3. Design System & Theme Foundation
- [x] Global CSS configuration — _`index.css`_
- [x] Tailwind CSS v4 theme configuration — _`@theme` tokens_
- [x] Primary colour scale — _`--color-primary-50…900` (one place to re-brand)_
- [ ] Secondary / accent colour scales — _not needed yet (neutral + primary + status)_
- [x] Background and foreground colours — _zinc scale + `white`, remapped in dark mode_
- [x] Success, warning, error and info colours — _emerald / amber / red / primary tints, `Badge`, `Alert`_
- [ ] Typography scale tokens — _Tailwind defaults used directly_
- [x] Font family configuration — _Plus Jakarta Sans / Inter_
- [x] Spacing system — _Tailwind spacing scale_
- [x] Border-radius system — _`rounded-md` rule_
- [x] Border colour conventions — _`zinc-200` surfaces, `zinc-300` controls, red when invalid_
- [x] Component sizing conventions — _`field-styles.ts` (`h-10`), Button `sm/md/lg`_
- [x] Light theme
- [x] Dark theme — _class-based, toggled from top bar / Settings_
- [x] Responsive breakpoints — _Tailwind `sm/md/lg/xl`_
- [x] Consistent icon sizing — _`w-4 h-4` in controls, `IconBadge` for headers_
- [x] Consistent component states — _hover / focus outline / invalid / disabled in `field-styles.ts`_
- [x] UI scale preference — _Compact → Extra Large + custom, via `--ui-scale`_
- [x] Custom scrollbars + stable gutter — _`index.css`_

### 4. Common UI Components

All in `components/ui/` (exported from `components/ui/index.ts`).

| Component | Status | Notes |
| :--- | :---: | :--- |
| Button | ✅ | primary · secondary · outline · ghost · danger; `sm/md/lg`; `loading`; `icon`; `fullWidth` |
| Input | ✅ | `invalid`, `leftAddon` (₹, +91), `rightAddon` (eye button) |
| Textarea | ✅ | same states as Input |
| Select → **Dropdown** | ✅ | no native select; search (>7 options), clear, disabled options, descriptions, icons, type-ahead, Home/End/PageUp/PageDown, Esc, Tab, portal + flip-up, `role=combobox/listbox` |
| Checkbox | ✅ | native input, custom look |
| Radio (RadioGroup) | ✅ | native radios, arrow-key navigation |
| Switch | ✅ | `role="switch"`; `Toggle` = labelled settings row |
| Label | ✅ | required asterisk |
| Badge | ✅ | tones + optional dot (status never colour-only) |
| Avatar | ✅ | image or initial |
| Card / CardHeader | ✅ | |
| Separator | ✅ | |
| Tooltip | ✅ | `ui/overlay/Tooltip` — hover + focus, Esc, `aria-describedby`, flips; info icon in field labels |
| Popover | ✅ | `ui/overlay/Popover` — click, focus in / out, Esc, outside click, flip + clamp (date pickers use it) |
| Dialog | ✅ | portal, focus trap, Esc/backdrop close, focus restore, scroll lock; stacked dialogs: only the topmost handles Esc / Tab |
| Alert Dialog | ✅ | `ConfirmProvider` + `useConfirm()` (danger variant) |
| Dropdown Menu (actions) | ✅ | `ui/menu/DropdownMenu` (APG menu button) + `tables/RowActionsMenu` |
| Tabs | ✅ | |
| Accordion | ❌ | |
| Breadcrumb | ✅ | `PageHeader`, generated from `config/navigation.ts` |
| Pagination | ✅ | `components/tables/TablePagination` |
| Skeleton | ✅ | |
| Spinner / PageLoader | ✅ | |
| Progress | ✅ | `UsageMeter` |
| Calendar / Date Picker | ✅ | `ui/calendar/Calendar` + `DateField`, `DateRangeField`, `TimeField` (APG date picker keyboard) |
| Command Menu | ❌ | Level 2 |

### 5. Common Layout Components
- [x] Main application layout — _`layouts/AppLayout.tsx`_
- [ ] Authentication layout component — _login / change-password pages are standalone screens_
- [x] Dashboard layout — _`AppLayout` (top bar + sidebar + outlet)_
- [x] Sidebar — _`components/layout/Sidebar.tsx`, items from `config/navigation.ts`_
- [x] Collapsible sidebar — _icons-only mode, remembered per device_
- [x] Header / Navbar — _`Topbar.tsx`_
- [ ] Footer
- [x] Mobile navigation — _off-canvas sidebar drawer_
- [x] Breadcrumb navigation
- [x] Page header — _`PageHeader` (breadcrumbs + actions)_
- [ ] Page content container component — _pages use `p-4 sm:p-6` directly_
- [x] Page action section — _`PageHeader actions`_
- [x] Responsive layout wrapper
- [x] Reusable empty-state layout — _`EmptyState`_

### 6. Common Table Components

`components/tables/DataTable.tsx` (POS app) and `landing/src/components/admin/ui/DataTable.tsx` (admin).

- [x] Reusable data table — _column config `{ key, header, render, sortValue?, align?, width? }`; used by bills, customers, suppliers, GRNs, passbook, shift history_
- [x] Table header / body / row / cell — _rendered by DataTable from the column config (not separate exports)_
- [x] Sorting — _click header; asc → desc → off; `aria-sort`; `initialSort`_
- [x] Pagination — _"Show N entries" (Dropdown), "N records · page x of y", numbered pages_
- [x] Search — _debounced_
- [ ] Column visibility
- [ ] Row selection
- [ ] Bulk actions
- [x] Loading state — _skeleton rows_
- [x] Empty state
- [x] Error state — _with Retry_
- [x] Responsive table handling — _horizontal scroll inside the card_
- [x] Row actions — _`RowActions` icon buttons (accessible labels)_
- [x] Row action dropdown menu — _`RowActionsMenu`_

### 7. Common Form Foundation

`components/forms/` + `validations/common.ts`. Usage:

```tsx
const schema = z.object({ name: rules.text('Name'), phone: rules.phone(), creditLimit: rules.amount('Credit limit') });
const form = useAppForm(schema, { defaultValues: { name: '', phone: '', creditLimit: 5000 } });

<Form form={form} onSubmit={(values) => api.post('/customers', values)}>
  <FormGrid>
    <TextField name="name" label="Name" required />
    <PhoneField name="phone" label="Mobile" required />
    <AmountField name="creditLimit" label="Credit limit" />
  </FormGrid>
  <FormActions submitLabel="Save" onCancel={close} />
</Form>
```

- [x] React Hook Form setup — _`useAppForm(schema, options)`: zod resolver, `mode: 'onTouched'`, `reValidateMode: 'onChange'`, focus first error_
- [x] Reusable form wrapper — _`<Form>`: provider, submit, double-submit guard, server-error mapping_
- [x] Form field component — _`FormField`: label, control, one message line that always keeps its height (no layout jump)_
- [x] Form label component — _`Label` with required asterisk + `aria-required`_
- [x] Form error component — _message line with icon, `aria-describedby` + `aria-invalid` on the control, `aria-live`_
- [x] Input integration — _`TextField`, `PasswordField` (show/hide), `PhoneField` (+91, digits only, max 10), `UppercaseField`_
- [x] Number / amount integration — _`NumberField`, `AmountField` (₹, decimals limit, blocks letters, stores `number | undefined`)_
- [x] Select integration — _`DropdownField` (custom dropdown, `null` when empty)_
- [x] Textarea integration — _`TextareaField` with character counter_
- [x] Checkbox integration — _`CheckboxField`_
- [x] Radio integration — _`RadioGroupField`_
- [x] Switch integration — _`SwitchField`_
- [x] Form default values — _`useAppForm(schema, { defaultValues })`_
- [x] Form reset handling — _`form.reset()`; NumberField follows outside resets_
- [x] Dirty state tracking — _`FormActions requireChanges` keeps Save disabled until something changed_
- [x] Submit loading state — _spinner + disabled + `aria-busy`_
- [x] Server-side validation error mapping — _`applyServerErrors`: "phone must be …" → under Phone, "items.0.quantity …" → under that row; other messages → form alert_
- [x] Reusable validation rules — _`rules.text / optionalText / email / phone / optionalGstin / pincode / number / amount / password / select / selectOneOf / mustAccept`, `withPasswordConfirmation`_
- [x] Create form conventions — _see "Use this, never that"_
- [x] Edit form conventions — _defaultValues from the record + `requireChanges`_
- [x] Layout helpers — _`FormGrid` (1–3 columns), `FormSection`, `FormActions`_
- [x] Group / array errors — _`FormErrorMessage name="lines"` (reads `errors.lines` and `errors.lines.root`)_
- [x] Field options — _`hideLabel` (screen-reader-only label for repeated rows), `inputClassName`, `DropdownField onValueChange`_
- [x] Migrated screens — _login, change password, add customer, khata repayment, add supplier, settle dues, goods inward (GRN), open / close shift, sales return, checkout cash tendered_

- [x] Cross-field rules show as soon as their own fields are valid — _`withCrossFieldRules()` (Zod 4 `when`), `passwordsMatchRule()`; related fields re-validate via `deps`_
- [x] Error summary — _`<Form errorSummary>` ("There is a problem" + links to each field, GOV.UK pattern)_
- [x] **Full field catalogue and per-field features:** see [`FORM_FIELDS_CHECKLIST.md`](./FORM_FIELDS_CHECKLIST.md)

### 8. API Integration Foundation

`lib/api.ts`, `types/api.types.ts`.

- [x] Centralized Axios instance
- [x] Base API URL configuration — _`VITE_API_URL`_
- [x] Request interceptor — _Bearer token, `X-Request-Id`_
- [x] Response interceptor — _401 → single shared refresh → retry; failed refresh → logout event_
- [x] Authorization header handling
- [x] Refresh token handling — _rotation, concurrent requests share one refresh_
- [x] Common API response types — _`ApiEnvelope<T>`, `Paginated<T>`, `PaginationMeta`_
- [x] Common API error types — _`ApiErrorBody`_
- [x] API service organization — _data hooks per feature (`useCatalogCustomers`, `useDashboardData`, …)_
- [x] Request timeout — _30 s_
- [x] Network error handling — _"Cannot reach the server…"_
- [x] HTTP status handling — _403 / 404 / 413 / 429 / 5xx messages in `getErrorMessage`_
- [x] Cancellation using AbortController — _pass `signal`; `isCancelled(err)` to ignore_
- [x] Request ID propagation — _`X-Request-Id` per request (server echoes it in logs)_
- [x] API response normalization — _`unwrap(res)`, `unwrapPage(res)`_

### 9. Common Hooks

`hooks/common.ts` (+ app hooks in `hooks/`).

- [x] `useDebouncedCallback` (use-debounce)
- [x] `useDebouncedValue`
- [x] `useLocalStorage`
- [x] `useSessionStorage`
- [x] `useClickOutside`
- [x] `useMediaQuery`
- [x] `useWindowSize`
- [x] `usePagination`
- [x] `useToggle`
- [x] `useCopyToClipboard`
- [x] `useDocumentTitle`
- [x] `useOnlineStatus`
- [x] `useMounted`
- [x] `useConfirm` (use-confirmation) — _plus `useToast`, `useFlyout`, `useFullscreen`, `useKioskGuard`_
- [x] Standard hook naming conventions — _`useX`_
- [x] Reusable hook types — _generic signatures_
- [x] Cleanup of event listeners — _every listener / timer is removed on unmount_
- [x] Avoid unnecessary re-renders — _latest-callback refs instead of effect dependencies_
- [ ] Test reusable hooks — _covered indirectly (Dropdown / DataTable); no dedicated hook tests yet_

### 10. Common Utility Functions

`utils/` (barrel `@/utils`), tested in `utils/utils.test.ts`.

**String:** [x] capitalize · [x] titleCase · [x] slugify · [x] squish (trim) · [x] maskEmail · [x] maskPhone · [x] truncate · [x] digitsOnly · [x] initialOf
**Date:** [x] formatDate · [x] formatDateTime · [x] formatTime · [x] formatRelative · [x] isSameDay / isBefore · [x] formatDateRange · [x] timezone-aware display (`APP_TIMEZONE`) · [x] toIsoString / toDateInputValue
**Number:** [x] formatInr · [x] formatNumber · [x] formatPercent · [x] toDecimal / round · [x] formatCompact · [x] parseNumber · [x] clamp
**Array & object:** [x] unique / uniqueBy · [x] groupBy · [x] sortBy · [x] findBy · [x] pick · [x] omit · [x] deepClone · [x] isEmpty · [x] compact
**Browser:** [x] copyToClipboard · [x] downloadFile · [x] openExternal (safe protocols, noopener) · [x] localStore / sessionStore (never throw) · [x] formatFileSize · [x] validateFile (type + size)

### 11. Routing Foundation
- [x] Centralized route definitions — _`config/routes.ts` + `app/router.tsx`_
- [x] Public routes — _`/login`_
- [x] Protected routes — _`RequireAuth`_
- [x] Authentication routes — _`/login`, `/change-password` (`RequirePasswordChange`)_
- [x] Role-based route access — _`RequireRole`_
- [x] Permission-based navigation — _`navigationForRole()` hides items_
- [x] Nested routes
- [x] Dynamic route parameters — _`/reports/:tab`_
- [x] Lazy-loaded pages — _back-office pages via `lazy()` + `PageLoader`_
- [x] Route-level error handling — _`errorElement: <RouteErrorPage />`_
- [x] Not Found page
- [x] Unauthorized page — _`/unauthorized` (403)_
- [x] Redirect handling — _login returns to the page the user came from_
- [x] Route constants

### 12. Authentication UI Foundation
- [x] Login page — _Shop ID + username + password; `?shopId=` prefill from the welcome email_
- [x] Registration page — _`landing/` `/register`_
- [x] Forgot password page — _`/forgot-password`; always the same neutral answer (no account enumeration)_
- [x] Reset password page — _`/reset-password?token=…` (30-minute, one-time link; server stores only a SHA-256 hash)_
- [x] Email verification — _OTP step in `landing/` registration_
- [x] Authentication context — _`AuthProvider` / `useAuth()`_
- [x] Current user handling
- [x] Protected route component
- [x] Logout handling — _revokes refresh token server-side_
- [x] Token / session expiry handling — _silent refresh, then logout event_
- [x] Authentication loading state — _session read synchronously (no login flash); submit spinner_
- [x] Unauthorized handling — _403 page; `PASSWORD_CHANGE_REQUIRED` → change-password page_
- [x] Forced first-login password change

### 13. State Management Foundation
- [x] Local component state conventions — _`useState` for UI-only state; forms use RHF_
- [x] Context API setup — _Auth, Preferences, PosSession, Toast, Confirm_
- [x] Global authentication state
- [x] Theme state
- [x] Sidebar state
- [x] User preference state — _theme, UI size, kiosk mode, receipt width, auto-print, default float_
- [x] Server state versus client state separation — _fetching in data hooks; no server data in global context except the shared POS session_
- [x] State persistence rules — _per-device prefs + held carts (tenant + user scoped) in localStorage; tokens cleared on logout_
- [x] Avoid unnecessary global state

### 14. Common Feedback Components
- [x] Toast notification — _`ToastProvider` / `useToast()`, `aria-live`_
- [x] Success / error / warning / info alert — _`Alert` tones_
- [x] Confirmation dialog — _`useConfirm()`_
- [x] Delete confirmation — _`confirm({ danger: true })`_
- [ ] Loading overlay
- [x] Full-page loader — _`PageLoader`_
- [x] Empty state — _`EmptyState`_
- [x] Error state — _`ErrorState` with retry_
- [x] Network error state — _`NetworkErrorState`_
- [x] 404 page
- [x] 403 page
- [x] 500 error page — _`RouteErrorPage` + app-wide `ErrorBoundary`_

### 15. Environment & Configuration
- [x] `.env` configuration
- [x] `.env.example` — _`VITE_API_URL`, `VITE_LANDING_URL`, `VITE_SUPPORT_EMAIL`_
- [x] API base URL
- [ ] Application name variable — _"Vendora POS" is hard-coded in `useDocumentTitle`_
- [x] Environment mode — _`import.meta.env.DEV`_
- [ ] Feature configuration (flags)
- [x] Centralized environment access — _`lib/config.ts`_
- [x] No private secrets in frontend variables
- [ ] Validate required configuration at startup

### 16. Testing Foundation
- [x] Vitest configuration — _`vite.config.ts` `test`, jsdom, `src/test/setup.ts`_
- [x] React Testing Library — _+ user-event, jest-dom matchers_
- [x] Component testing — _`Dropdown`, `Dialog` (stacking, focus), modals (customers, suppliers, cash drawer, returns, held bills, checkout)_
- [ ] Hook testing
- [x] Utility testing — _`utils/utils.test.ts`_
- [x] Form testing — _`Form.test.tsx` + one test file per migrated form: errors on blur, submit-all-errors + focus, formatting, cross-field limits (payment ≤ balance, return qty ≤ returnable), exact API payloads_
- [x] API mocking — _`vi.mock('@/lib/api')` in form tests_
- [ ] Route testing
- [x] Authentication flow testing (frontend) — _`LoginScreen.test.tsx`, `PasswordResetModal.test.tsx`_
- [x] Error state testing — _server error mapping test_
- [ ] Accessibility testing basics (axe)

### 17. Build & Deployment Foundation
- [x] Vite production build
- [x] Environment-specific builds — _`VITE_*` build args in the Dockerfiles_
- [x] Asset optimization — _Vite defaults_
- [x] Lazy loading
- [x] Code splitting — _per back-office page; admin console split in `landing/`_
- [x] Docker configuration — _`client/Dockerfile`, root `docker-compose.yml` (Mongo replica set + server + client + landing)_
- [x] Nginx / static hosting configuration — _`docker/nginx/spa.conf` (gzip, cache headers, security headers)_
- [x] CI pipeline — _`.github/workflows/ci.yml`: lint, typecheck, tests, build per project_
- [x] Build verification — _`npm run build` = typecheck + bundle_
- [x] Deployment documentation — _`docs/DEPLOYMENT.md`_
- [x] SPA fallback configuration (production server) — _`try_files … /index.html`_
- [x] Source map policy — _not shipped (Vite default off); nginx 404s `*.map`_

---

## LEVEL 2 — Advanced & Project-Dependent Frontend Foundation

Introduce when the product needs it. Done items are marked.

### 18. Advanced Component Architecture
- [ ] Compound component pattern
- [x] Controlled and uncontrolled components — _controls are controlled; RHF fields wrap them_
- [ ] Polymorphic components
- [ ] Headless component patterns
- [x] Component composition — _fields = FormField + control; tables = DataTable + RowActions_
- [ ] Reusable render patterns
- [ ] Dynamic component rendering
- [x] Component variants — _Button, Badge, Alert, Spinner sizes_
- [x] Advanced component props typing — _generic `Dropdown<V>`, `DataTable<T>`, `RadioGroup<V>`_
- [x] Shared component documentation — _this file + JSDoc on every component_
- [ ] Storybook integration

### 19. Advanced Data Table System
- [ ] Server-side pagination · [ ] Server-side filtering · [ ] Server-side sorting · [ ] Multi-column sorting
- [ ] Advanced column filters · [ ] Column resizing · [ ] Column reordering · [ ] Column pinning
- [ ] Saved table preferences · [ ] Export to CSV / Excel · [ ] Bulk selection · [ ] Virtualized tables
- [ ] Expandable rows · [ ] Nested tables · [x] Custom cell renderers · [ ] Advanced table state persistence

### 20. Advanced Form System
- [ ] Dynamic forms · [ ] Multi-step forms · [ ] Form wizard
- [x] Conditional fields (khata refund only for customer bills; amount paid only when PARTIAL) · [x] Dependent fields (`DropdownField onValueChange` fills cost/GST from the product) · [x] Nested form arrays (`useFieldArray`: GRN lines, return lines)
- [ ] Dynamic field generation · [x] Reusable validation schemas (`validations/common.ts` + `auth`, `customer`, `supplier`, `orders`) · [x] Cross-field validation (`withPasswordConfirmation`, `.refine`)
- [x] Async validation support (field `loading` spinner + `error` prop) · [ ] Form autosave · [ ] Draft management · [ ] Unsaved changes warning
- [x] Complex form submission handling (server error mapping, double-submit guard) · [ ] Schema-driven rendering

### 21. Advanced State Management
- [ ] Redux Toolkit · [ ] Zustand · [ ] TanStack Query (add when caching / invalidation is needed)
- [ ] Server-state caching · [ ] Query invalidation · [ ] Optimistic updates · [ ] Background refetching · [ ] Infinite queries
- [x] Persistent state (preferences, held carts) · [ ] Cross-tab synchronization · [ ] State normalization · [ ] Undo / redo

### 22. Advanced Authentication & Security
- [x] Refresh token rotation integration · [ ] Session management UI · [ ] Multi-device logout · [ ] MFA screens
- [ ] OAuth · [ ] Social login · [x] Permission-aware UI (role-filtered menu, guarded routes) · [x] Sensitive action confirmation (`useConfirm`)
- [ ] Secure cookie-based auth · [x] XSS prevention (React escaping, no `dangerouslySetInnerHTML`) · [ ] HTML sanitization (no untrusted HTML yet)
- [ ] CSRF integration (bearer tokens, not cookies) · [ ] Secure file download · [x] Authentication timeout handling

### 23. Advanced UI/UX Features
- [ ] Global command palette · [ ] Global search · [ ] Notification center · [ ] Notification preferences · [ ] Context menus
- [ ] Drag-and-drop · [ ] Multi-select · [ ] Keyboard shortcuts (POS hotkeys) · [x] Keyboard navigation (dropdown, dialogs, tables)
- [ ] Undo / redo · [ ] Onboarding walkthrough · [x] User preference management (Settings) · [ ] Recently viewed · [ ] Saved filters · [ ] Dashboard widgets

### 24. File & Media Management
- [x] Drag-and-drop upload (`FileField`) · [x] Multiple upload · [ ] Upload progress · [ ] Upload cancellation · [x] File / image preview
- [ ] Image cropping / compression · [x] File validation helper (`validateFile`) · [x] File download helper (`downloadFile`) · [ ] Download progress
- [ ] Large / resumable uploads · [ ] File manager UI · [ ] File version display

### 25. Real-Time Frontend Communication
- [ ] WebSocket · [ ] Socket.IO · [ ] Real-time notifications · [ ] Live dashboard updates · [ ] Live chat
- [ ] Connection status · [ ] Auto-reconnect · [ ] Event subscription management · [ ] Optimistic real-time updates · [ ] SSE

### 26. Advanced Routing & Navigation
- [x] Permission-driven navigation · [x] Dynamic sidebar menus (config-driven, flyouts) · [x] Nested navigation · [x] Breadcrumb generation
- [x] Route-level code splitting · [ ] Route loaders · [ ] Route-based prefetching · [ ] Navigation state persistence
- [x] Deep linking (`/reports/:tab`, `/settings?tab=`) · [x] Return-to-previous-page after login · [ ] Unsaved changes protection · [ ] Multi-tab route handling

### 27. Dashboard & Data Visualization
- [x] Reusable dashboard layout · [x] KPI cards (`StatTile`, admin `KpiCard`) · [x] Chart components (Recharts, admin)
- [x] Line / area chart · [x] Bar chart · [x] Donut chart · [x] Legends and tooltips (shared `ChartTooltip`)
- [x] Date range presets (reports) · [ ] Widget system · [ ] Drag-and-drop widgets · [ ] Dashboard customization · [ ] Export reports · [ ] Real-time charts
- [x] Colour-blind-safe chart palette (validated) — _`landing/src/components/admin/charts/chartTheme.ts`_

### 28. Accessibility (Advanced)
- [ ] Formal WCAG review
- [x] Semantic HTML conventions · [x] Keyboard-only navigation (core flows) · [x] Screen reader support (labels, roles, live regions)
- [x] Focus management (dialogs restore focus, first invalid field focused) · [x] Focus trapping in dialogs · [x] Accessible dropdowns (combobox / listbox)
- [x] Accessible form errors (`aria-invalid`, `aria-describedby`) · [x] Colour contrast verification (chart palette validator) · [x] Reduced motion support (`motion-reduce`)
- [x] Accessible data tables (`scope`, `aria-sort`) · [x] Accessible chart descriptions (`role="img"` + label, value legends)

### 29. Performance Optimization
- [ ] React.memo where useful · [x] useMemo · [x] useCallback · [x] Lazy component loading · [x] Dynamic imports
- [ ] Bundle analysis · [x] Tree shaking (named icon imports) · [ ] Image optimization · [ ] Font optimization · [ ] Virtual scrolling
- [x] Debounced search · [ ] Throttled events · [x] Avoid unnecessary re-renders · [ ] List rendering optimization · [ ] Profiling · [ ] Core Web Vitals

### 30. Internationalization & Localization
- [ ] i18n · [ ] Multi-language · [ ] Translation files · [ ] Language switching
- [x] Locale-based date formatting (`en-IN`, `Asia/Kolkata`) · [x] Locale-based number formatting (lakh/crore grouping) · [x] Currency formatting (₹)
- [ ] RTL · [ ] Regional preferences · [ ] Translation fallback

### 31. PWA & Offline Capabilities
- [ ] Manifest · [ ] Service worker · [ ] Offline fallback · [ ] Asset caching · [ ] Offline data (IndexedDB) · [ ] Background sync · [ ] Install prompt · [ ] Update notification · [ ] Push

### 32. Error Monitoring & Analytics
- [x] Error boundary · [ ] Global JS error handler · [ ] Unhandled rejection handler · [ ] Sentry · [ ] Performance monitoring
- [ ] Interaction analytics · [ ] API failure monitoring · [ ] Route performance · [ ] Release tracking · [ ] Privacy-aware analytics

### 33. Advanced Testing
- [ ] Playwright / Cypress · [ ] End-to-end · [ ] Visual regression · [ ] Accessibility automation · [ ] Cross-browser · [ ] Responsive
- [x] API contract testing (server smoke suite, `server/test/smoke`) · [ ] User journey · [ ] Performance · [ ] MSW · [ ] CI test reporting

### 34. Advanced Build & Release Management
- [ ] Bundle size budgets · [ ] Environment release config · [ ] Preview environments · [ ] Automated versioning · [ ] Changelog
- [ ] Feature flags · [ ] Gradual rollout · [ ] Source map upload · [ ] Rollback strategy · [ ] CDN · [ ] Cache invalidation

### 35. Multi-Tenant Frontend Architecture
- [x] Tenant-aware application configuration (tenant from the token; never sent by the client)
- [ ] Tenant-specific branding · [ ] Tenant-specific themes · [x] Tenant-specific navigation (role-filtered)
- [ ] Tenant feature availability (plan-based) · [ ] Organization switching · [x] Tenant-specific user preferences (held carts per tenant + user)
- [ ] Tenant-aware route handling · [x] Tenant context reset on logout · [x] Strict server-side permission enforcement (backend guards)

---

## 🧰 Reusable component inventory

| Category | Components (✅ available) |
| :--- | :--- |
| Basic UI | ✅ Button · ✅ Input · ✅ Dropdown · ✅ Textarea · ✅ Checkbox · ✅ RadioGroup · ✅ Switch / Toggle |
| Display | ✅ Card · ✅ Badge · ✅ Avatar · ✅ Separator · ✅ InfoRow · ✅ IconBadge · ✅ Tooltip · ✅ Popover |
| Navigation | ✅ Sidebar · ✅ Topbar · ✅ Breadcrumb (PageHeader) · ✅ Tabs · ✅ Dropdown Menu |
| Feedback | ✅ Toast · ✅ Alert · ✅ Dialog · ✅ Confirm Dialog · ✅ Empty / Error / Network states |
| Loading | ✅ Spinner · ✅ Skeleton · ✅ Progress (UsageMeter) · ✅ PageLoader |
| Forms | ✅ Form · ✅ FormField · ✅ Text / Password / Phone / Uppercase / Number / Amount / Textarea / Dropdown / Checkbox / Switch / RadioGroup fields · ✅ FormGrid · ✅ FormSection · ✅ FormActions |
| Tables | ✅ DataTable · ✅ TablePagination · ✅ RowActions |
| Dashboard | ✅ StatTile · ✅ KpiCard (admin) · ✅ ChartCard (admin) |
| Files | ✅ FileField / FileDropzone (upload, preview, list) |
| Advanced | ❌ CommandPalette · ✅ DateRangePicker · ✅ MultiSelect · ✅ Calendar · ✅ OTP · ✅ Slider · ✅ SearchInput |

---

## 🔁 Reusable building blocks: use this, never that

| Need | Use | Never |
| :--- | :--- | :--- |
| A choice from a list | `Dropdown` / `DropdownField` | native `<select>` |
| A form | `useAppForm` + `<Form>` + field components + `rules` | `useState` per field, manual error strings |
| Show a field error | the field's `FormField` message line (automatic) | ad-hoc red text above the form |
| Money input | `AmountField` | `<input type="number">` |
| Mobile number | `PhoneField` + `rules.phone()` | free text + regex in the component |
| Table / list with paging | `DataTable` + `RowActions` | hand-written `<table>` + paging state |
| Confirm a risky action | `useConfirm()` | `window.confirm` |
| Tell the user it worked / failed | `useToast()` | `alert()` |
| Call the API | `api` + `unwrap` / `unwrapPage` + `getErrorMessage` | `axios` / `fetch` directly, hard-coded URLs |
| Format money / dates | `formatInr`, `formatDate`, `formatDateTime` (`@/utils`) | `toLocaleString` scattered in components |
| Page title + breadcrumbs | `PageHeader` | per-page hand-made headers |
| Modal | `Dialog` | custom fixed overlays |
| Loading | `Spinner`, `Skeleton`, `PageLoader`, `Button loading` | "Loading…" text without status |
| Colours | tokens (`primary-*`, status tints) | hex values in components |

---

## 🚦 Recommended implementation order

| # | Implementation | Level | Status |
| :---: | :--- | :---: | :---: |
| 1 | Vite, React, TypeScript setup | 1 | ✅ |
| 2 | Folder structure and conventions | 1 | ✅ |
| 3 | Tailwind theme and design tokens | 1 | ✅ |
| 4 | Common UI components | 1 | ✅ core set |
| 5 | Layout components | 1 | ✅ |
| 6 | Forms and validation | 1 | ✅ |
| 7 | Axios API integration | 1 | ✅ |
| 8 | Common types and interfaces | 1 | ✅ |
| 9 | Utility functions | 1 | ✅ |
| 10 | Custom hooks | 1 | ✅ |
| 11 | Routing and protected routes | 1 | ✅ |
| 12 | Authentication foundation | 1 | ✅ (forgot / reset password pending backend) |
| 13 | State management | 1 | ✅ |
| 14 | Tables, pagination and feedback | 1 | ✅ |
| 15 | Testing foundation | 1 | ✅ base (more coverage needed) |
| 16 | Build and deployment | 1 | ⏳ build ✅, deploy / CI open |
| 17–26 | Level 2 items | 2 | as needed |

---

## 🔗 Frontend ↔ backend foundation mapping

| Backend | Frontend |
| :--- | :--- |
| Base schema / interfaces | `types/*.types.ts` |
| DTO + class-validator | zod schema (`validations/`) + RHF form |
| Response interceptor (`{ success, data, meta }`) | `ApiEnvelope<T>`, `unwrap`, `unwrapPage` |
| Exception filter (`message`, `errorCode`) | `getErrorMessage`, `applyServerErrors` (field mapping) |
| Request ID middleware | `X-Request-Id` request header |
| Pagination DTO + `PaginationUtil.paginate` | `PaginationMeta`, `DataTable`, `usePagination` |
| JWT guard + refresh rotation | `RequireAuth`, axios refresh interceptor |
| Roles guard / `ROLE_GROUPS` | `RequireRole`, `navigationForRole`, `lib/permissions.ts` (mirrors server groups) |
| `@TenantId()` | tenant never sent by the client |
| Date / number / string utils | `@/utils` (same timezone `Asia/Kolkata`) |
| Validators (`@IsIndianMobile`, `@IsGstin`, `@IsPincode`) | `rules.phone`, `rules.optionalGstin`, `rules.pincode` (same regexes) |
| Mail / OTP | landing registration OTP flow |
| Health module | — (status UI not built) |

---

> **Build once, reuse everywhere.** New screens start from these building blocks; if a screen needs something the library lacks, add it to the library first (with a test), then use it.
