# Form / settings section layout (FormSection)

- Status: verified — verified by evidence/verifier/2026-11-26/issue-538-page-form-layout-seal.md
- Source: feature request
- Issues: #538
- Anchors: `src/components/global/FormSection.vue`, `DESIGN.md` (§4.3), `src/pages/_layouts/LayoutDefault.vue`
- Last verified: da06aa4

## Goal
Form/settings pages (Information, General information, Skills, Languages,
Account settings, Salary calculator) put each section's title + description
in a left column and the form in the right 2/3 from `lg` (1024px) up. With
the 240px sidebar and `max-w-4xl` content, on an iPad mini 6 landscape
(1133px) the form gets ~580px and the eye has to jump right. Stack the
header above the content so the form uses the full content width.

## Behavior
1. At every viewport width, a `FormSection` renders its header (title, then
   the optional description) above its content, never beside it.
2. The content (the card, or the bare slot when `card` is false) spans the
   full width of the section, the same width as the header.
3. The optional `actions` slot stays in the header block, below the
   description (same order as today's left column), so it remains above the
   content.
4. `danger` (red title + red card border) and `card` (bordered surface card
   vs. no card) keep working exactly as today.
5. Page widths stay as they are (`max-w-4xl` on the form pages); only the
   inside of each section changes.
6. DESIGN.md §4.3 describes the stacked layout (header above a full-width
   card) instead of the `lg:grid-cols-3` Stripe-style split, and the
   `FormSection.vue` header comment says the same.

## Acceptance criteria
1. `src/components/global/FormSection.vue` contains no `lg:grid-cols-3` and
   no `lg:col-span-2` (`grep -n "grid-cols-3\|col-span-2" src/components/global/FormSection.vue` → no output).
2. `grep -n "lg:grid-cols-3" DESIGN.md` no longer matches inside §4.3
   (the §4.1 PageHome main-row line may stay).
3. Live at a 1133×744 viewport (iPad mini 6 landscape), `/dashboard/information`
   and `/dashboard/account-settings`: every section's title sits above its
   card, and each card's left edge and width equal the section's
   (`getBoundingClientRect()` of the section and its card: same `left`, same `width`).
4. Same check at 744×1133 (portrait) and 1440×900 (desktop): title above card, card full section width.
5. A `danger` section (Account settings → delete account) still shows the red title and red card border.
6. `npm run test`, `npm run lint`, `npm run build` all exit 0.

## Edge cases
- No description → header is just the title; no empty gap paragraph (the `v-if` stays).
- `card: false` content (TableDefault in PickedSkills / VeeFormGeneralInformationUpdate) → full width, no extra border.
- `actions` slot present (PickedSkills, VeeFormGeneralInformationUpdate "add" button) → shown under the description, above the table.
- Phone widths (< 768px) → unchanged from today (already stacked).

## Out of scope
- PageHome's `lg:grid-cols-3` main row (visits chart + checklist cards) — a dashboard grid, not a title/description split.
- List/CRUD pages (§4.4), page header, sidebar/drawer breakpoint, `max-w-*` page widths.
- Field-level column layout inside forms (VeeForm `col`).

## Open questions
None blocking. Defaults chosen (operator can override):
- Stack at **all** widths, not only below a breakpoint — the request is "đưa layout về trên dưới" with no width limit, and at `max-w-4xl` the split narrows the form on desktop too.
- `actions` stay under the description (not moved to the right of the title) — smallest change, keeps current order.

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-26 | Created (spec) | #538 stack section header above content | - |
