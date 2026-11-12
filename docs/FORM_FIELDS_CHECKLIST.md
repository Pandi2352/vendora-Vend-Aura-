# 🧩 Form Fields — Advanced Feature Checklist

> Part of the [Frontend Blueprint](./FRONTEND_BLUEPRINT_CHECKLIST.md) (§7). Every field in `client/src/components/forms` follows this spec.
> Sources: [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary) and [validation pattern](https://design-system.service.gov.uk/patterns/validation), [GOV.UK error message](https://design-system.service.gov.uk/components/error-message), [Home Office error messages](https://design.homeoffice.gov.uk/accessibility/interactivity/error-messages), [Mantine Input API](https://mantine.dev/core/input), [WAI-ARIA APG date picker dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog.html), [Zod 4 refinements](https://www.mintlify.com/colinhacks/zod/concepts/refinements).
>
> Status: `[x]` / ✅ implemented and covered by tests (`client/src/components/**/*.test.tsx`).

---

## A. Behaviour every field must have

### Validation & errors
- [x] Error shown **under the field** (one message line, icon + text, never colour alone)
- [x] Error appears when the user **leaves** the field (no submit needed), updates **while typing** after that
- [x] Submit validates everything, **focuses the first invalid field**
- [x] **Error summary** at the top after a failed submit ("There is a problem" + links that focus each field) — `<Form errorSummary>`
- [x] Control gets `aria-invalid`, `aria-describedby` → message (and description), `aria-required`
- [x] Message line keeps its height (no layout jump); grows for long messages
- [x] Message priority: **error > warning > success > hint**
- [x] **Warning** (non-blocking, amber) and **success** (green) messages
- [x] **Server errors** mapped to the matching field (incl. `items.0.quantity`), others to a form alert
- [x] **Cross-field rules** (`password = confirm`, `paid ≤ total`) show as soon as *those* fields are valid — `crossField()` uses Zod 4 `when`
- [x] Related fields re-validate together (`deps`) — e.g. editing *New password* re-checks *Confirm*
- [x] `error` prop to show an extra error (async check) on top of schema errors
- [x] Messages say how to fix it ("Enter a 10-digit mobile number…"), no "invalid" / "please"
- [x] Browser validation off (`noValidate`), our messages only

### Label & help
- [x] Label linked to the control (`for` / `aria-labelledby`)
- [x] `required` → red asterisk (`aria-hidden`) + `aria-required`
- [x] `optional` → "(optional)" marker
- [x] `tooltip` → info icon with help text (hover + keyboard focus, Esc to dismiss)
- [x] `labelAction` → element on the right of the label row (e.g. "Forgot password?")
- [x] `description` → help between label and control (format example), announced with the control
- [x] `hint` → help under the control
- [x] `hideLabel` → label kept for screen readers only (repeated table rows)
- [x] `layout="horizontal"` → label beside the control on wide screens

### States & look
- [x] Same height for every single-line control (`h-10`)
- [x] States: default · hover · focus (outline, no shadow) · invalid · disabled · **read-only**
- [x] `rounded-md`, no shadows
- [x] `autoFocus`, `id`, `className` (wrapper) and control class overrides
- [x] Works inside dialogs (dropdown / calendar lists render in a portal, never clipped)
- [x] Dark mode via tokens (no per-field `dark:` classes)

---

## B. Field catalogue

| Field | Status | Advanced features |
| :--- | :---: | :--- |
| `TextField` | ✅ | left/right icon, prefix/suffix addon, **clearable**, **loading** spinner (async check), **character counter** (`maxLength` + `showCount`), `normalize` (uppercase, digits…), `inputClassName`, read-only |
| `PasswordField` | ✅ | show/hide toggle, **Caps Lock warning**, **strength meter** + rule checklist (`showStrength`), `autoComplete` new/current |
| `PhoneField` | ✅ | +91 prefix, digits only, max 10, numeric keypad, paste cleanup |
| `UppercaseField` | ✅ | GSTIN / codes, auto upper-case, no spell-check |
| `EmailField` | ✅ | `type=email`, lower-cases, trims, email keyboard on phones |
| `NumberField` | ✅ | blocks letters, decimals limit, negative opt-in, **min/max clamp on blur**, **stepper buttons** (±`step`, keyboard ↑/↓), **suffix units** (kg, %, days), **grouped display** on blur (1,23,456) |
| `AmountField` | ✅ | ₹ prefix, 2 decimals, Indian grouping on blur |
| `PercentField` | ✅ | % suffix, 0–100 clamp |
| `TextareaField` | ✅ | **auto-resize**, character counter, max rows |
| `DropdownField` | ✅ | search (auto > 7 options), **async options** (`onSearch` + `loading`), clearable, disabled options, icons, descriptions, `onValueChange`, read-only, keyboard (↑↓ Home End PgUp PgDn Enter Space Esc Tab type-ahead) |
| `MultiSelectField` | ✅ | chips with remove (button + Backspace), "+N more", select all / clear, max selections, async search, Space toggles, keyboard |
| `CheckboxField` | ✅ | label + description, indeterminate (UI) |
| `CheckboxGroupField` | ✅ | array value, min/max selections (extra boxes disabled at max), "Select all" with indeterminate state, inline / stacked |
| `SwitchField` | ✅ | label + description row |
| `RadioGroupField` | ✅ | stacked / inline / **cards** / **segmented** variants, descriptions, disabled options |
| `DateField` | ✅ | typed `dd/mm/yyyy` (auto slashes) + calendar popover (APG keyboard: arrows, Home/End, PgUp/PgDn, Shift+PgUp/PgDn, Enter, Esc), min/max, disabled dates, Today, clear |
| `DateRangeField` | ✅ | start/end in one trigger, presets (Today, Yesterday, Last 7 days, This/Last month, This financial year), range calendar with hover preview, Apply / Cancel, min/max |
| `TimeField` | ✅ | hh:mm with auto colon, 12h display option, ↑/↓ step minutes |
| `OtpField` | ✅ | N boxes, auto-advance, Backspace back, ←/→, paste fills all, numeric keypad, `autocomplete=one-time-code`, `onComplete` |
| `FileField` | ✅ | drag & drop + keyboard browse, accept + max size + max files with per-file messages, image previews, remove |
| `SliderField` | ✅ | min/max/step, marks, value label + `formatValue`, keyboard (arrows, PgUp/PgDn, Home/End), drag |
| `SearchField` | ✅ | debounced `onSearch`, clear, loading, Esc clears (`SearchInput` also usable outside forms) |

---

## C. Building blocks used by fields

| Piece | Status | Notes |
| :--- | :---: | :--- |
| `Tooltip` | ✅ | hover + focus, Esc, `aria-describedby`, flips |
| `Popover` | ✅ | click, focus in/out, Esc, outside click, flips |
| `useAnchoredPosition` | ✅ | placements top/bottom (start/end/center) and side, flip + clamp, follows scroll |
| `useDropdown` + `DropdownPanel` | ✅ | shared by Dropdown and MultiSelect |
| `Calendar` | ✅ | month grid (`role=grid`), month / year jump (custom Dropdown), single + range mode, APG keyboard |
| `DropdownMenu` (actions) | ✅ | APG menu button: roving focus, type-ahead, separators, group labels, danger / disabled items, shortcuts; `RowActionsMenu` for tables |
| `FormErrorSummary` | ✅ | |
| `crossField()` | ✅ | Zod 4 `when` |

---

## D. Tests

| File | Covers |
| :--- | :--- |
| `forms/Form.test.tsx` | blur errors, submit-all + focus first, server error mapping, double submit |
| `forms/Fields.test.tsx` | shell props (asterisk, optional, description, tooltip, label action), error summary links, clear + counter (no focus loss), email / phone normalising, number stepper + clamp + grouping, percent, textarea counter, segmented / card radios, password strength + Caps Lock + `deps` |
| `forms/dates/DateFields.test.tsx` | typed dates, format / required / range errors, calendar keyboard pick, clear, range presets, time parsing |
| `validations/cross-field.test.ts` | cross-field rules fire while other fields are still invalid |
| `ui/dropdown/*.test.tsx`, `ui/menu/*.test.tsx`, `ui/calendar/*.test.tsx`, `ui/Dialog.test.tsx` | keyboard + ARIA behaviour of the building blocks |
| `forms/{Otp,File,Slider,CheckboxGroup,MultiSelect}Field.test.tsx`, `ui/SearchInput.test.tsx` | each advanced field |
