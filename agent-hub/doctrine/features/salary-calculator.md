# Gross ↔ Net salary calculator

- Status: verified — verified by evidence/verifier/2026-11-23/issue-404-460-461-salary-password-ats-seal.md
- Source: feature request
- Issues: #404
- Anchors: `src/pages/_layouts/LayoutDefault.vue` (`nav.tools` group), `src/routers/index.ts` (`/dashboard` children), `src/models/generalInformation.model.ts` (`salaryDesiredFrom`, `salaryDesiredTo`), `src/composables/useCandidate.ts` (`generalInformation`, as `PageGeneralInformation.vue` / `PageHome.vue` read it), `src/components/veevalidate/part/FrmCurrency.vue` (`VND ` input), `src/components/global/SegmentedControl.vue`, `src/components/global/NoData.vue`, `src/i18n/index.ts`, `DESIGN.md`

## Goal
A candidate comparing offers converts a monthly Vietnamese salary between gross (before deductions) and net (take-home), with a breakdown, without leaving the app. Reference only: nothing is saved.

## Behavior
1. New page `/dashboard/salary-calculator` (`requiresAuth`), menu item "Tính lương Gross ↔ Net" / "Gross ↔ Net salary" with icon `fa-solid fa-calculator` in the `nav.tools` group, after "ATS check". Layout: DESIGN.md §4.3 (form, `max-w-4xl`).
2. Inputs:
   - Direction: `SegmentedControl` "Gross → Net" / "Net → Gross"; default Gross → Net (the saved desired salary is gross).
   - Amount: a VND currency input (positive integer, the same `VND ` formatting as `FrmCurrency.vue`).
   - Dependents: integer 0–20, default 0.
   - Region: a select Region I / II / III / IV for the unemployment-insurance cap; default Region I.
3. Default amount: General information's `salaryDesiredFrom` (treated as gross). If General information has no salary, the amount is empty and a `NoData`-style hint links to `/dashboard/general-information`.
4. The result updates as the user types (no submit button, no request). Editing the amount, direction, dependents or region never writes to General information or any API, and is lost on leaving the page.
5. Breakdown table (all amounts whole đồng, `vi-VN` grouping, "đ"): Gross; BHXH 8%; BHYT 1.5%; BHTN 1%; total insurance; personal deduction; dependent deduction (count × amount); taxable income (≥ 0); PIT (with the brackets reached); Net. Net → Gross shows the same table for the computed gross.
6. Calculation (employee side, resident, full-month labor contract):
   - Insurance base = gross (Out of scope: a separate insurance salary). BHXH and BHYT on `min(gross, 20 × base salary)`; BHTN on `min(gross, 20 × regional minimum wage of the chosen region)`.
   - Taxable = `max(0, gross − insurance − personal − dependents × dependent)`.
   - PIT = progressive schedule on taxable income (monthly brackets).
   - Net = gross − insurance − PIT.
   - Net → Gross is the exact inverse of that function (net is strictly increasing in gross, so the inverse exists and is unique); rounding to whole đồng happens only for display.
7. All legal values live in ONE exported constant object (one file, e.g. `src/utilities/salaryVn.ts`) with the date they apply from and their legal sources in a comment: rates, base salary, regional minimum wages, deduction amounts, PIT brackets. The page reads nothing legal from elsewhere; the page shows the "values as of <date>" line from that object.
8. The calculation is a pure function (no Vue, no i18n) in `src/utilities/` (or `src/lib/`), e.g. `grossToNet({ gross, dependents, region })` / `netToGross({ net, dependents, region })` returning the breakdown; the page only renders it.
9. Every visible string (labels, table rows, hint, "values as of", direction options, aria-labels) goes through i18n in `vi` and `en`.

### Legal values shipped (operator 2026-11-23: 2026 regional wages + base salary 2,530,000 from 01/07/2026; "values as of 01/07/2026")
| Value | Amount | Source |
|---|---|---|
| Employee rates | BHXH 8%, BHYT 1.5%, BHTN 1% | Luật BHXH 58/2024/QH15 (from 01/07/2025), Luật BHYT, Luật Việc làm |
| Base salary (lương cơ sở) → BHXH/BHYT cap 20× | 2,530,000 → 50,600,000 (from 01/07/2026; was 2,340,000 → 46,800,000) | Nghị định 161/2026/NĐ-CP (replaces 73/2024) |
| Regional minimum wage → BHTN cap 20× | I 5,310,000 (cap 106,200,000) · II 4,730,000 · III 4,140,000 · IV 3,700,000 (from 01/01/2026) | Nghị định 293/2025/NĐ-CP |
| *Not shipped:* regional minimum wage from 01/01/2027 | I 5,700,000 · II 5,080,000 · III 4,450,000 · IV 4,040,000 | Nghị định 399/2026/NĐ-CP (replaces 293/2025) — a separate follow-up issue (opened by the operator) updates the constant object on 01/01/2027 |
| Family deduction | self 15,500,000 · each dependent 6,200,000 / month (tax period 2026) | Nghị quyết 110/2025/UBTVQH15 |
| PIT on salary (monthly taxable) | ≤10M 5% · 10–30M 10% · 30–60M 20% · 60–100M 30% · >100M 35% (5 brackets, salary income from tax period 2026) | Luật Thuế TNCN 109/2025/QH15, Điều 9 (law in force 01/07/2026; salary provisions apply to tax period 2026) |

## Acceptance criteria
- `npx vitest run src/utilities/salaryVn.spec.ts` (path as created) passes with, using the values table above, region I, constants from 01/07/2026:
  - gross 15,000,000, 0 dependents → insurance 1,575,000, PIT 0, net 13,425,000.
  - gross 30,000,000, 0 dependents → insurance 3,150,000, PIT 635,000, net 26,215,000.
  - gross 60,000,000, 1 dependent → insurance 5,407,000 (BHXH/BHYT capped at 50,600,000), PIT 3,078,600, net 51,514,400.
  - gross 150,000,000, 2 dependents → insurance 5,869,000 (all three capped), PIT 26,180,850, net 117,950,150.
  - round trip: for each gross above and every integer gross in a sweep (e.g. 1,000,000 … 300,000,000 step 997,001), `|netToGross(round(grossToNet(g).net)) − g| ≤ 1`.
  - `netToGross` of each net above returns the matching gross within 1 đ.
- `npm run test`, `npm run build` and `npm run lint` pass; every new i18n key exists in `vi` and `en`.
- A page spec (e.g. `src/pages/dashboard/PageSalaryCalculator.spec.ts`, `npx vitest run <path>`): with a mocked General information salary, the amount input starts at that value; changing the amount sends no request (no `handleBase`/axios call) and leaves the store's `generalInformation` unchanged; without a salary, the hint links to `/dashboard/general-information`.
- Live (QA account): the menu item opens `#/dashboard/salary-calculator`; switching to EN translates every label.

## Edge cases
- Amount empty, 0, negative or non-numeric → no table, a short hint; never `NaN` on screen.
- Gross below the regional minimum wage → still calculated (reference tool), no floor applied.
- Net → Gross for a net above which the inverse lands in a cap region → still exact (piecewise-linear inverse, not a guess loop that can stop early).
- Taxable exactly on a bracket edge (10,000,000 / 30,000,000 / 60,000,000 / 100,000,000) → lower bracket's rate for that last đồng (brackets are "up to and including").
- Very large input (e.g. 10,000,000,000) → computed, no overflow (all values < 2^53).

## Out of scope
- Saving, sharing or exporting the calculation; history.
- Employer-side cost (employer BHXH/BHYT/BHTN), union fee (đoàn phí), separate insurance salary, probation / non-resident 20% / 10% withholding on non-contract income.
- Annual tax finalization, bonuses, tax-exempt allowances.
- Other currencies.
- Fetching legal values from an API; switching between law versions in the UI.

## Open questions
1. Is the saved desired salary gross or net, and which value fills the amount? → **Answer (operator 2026-11-23):** Gross; default direction Gross → Net; amount from `salaryDesiredFrom`.
2. Which legal values ship (regional wages change 01/01/2027, Nghị định 399/2026)? → **Answer (operator 2026-11-23):** the 2026 regional wages + base salary 2,530,000 (from 01/07/2026); a follow-up issue covers the 01/01/2027 change.
3. Region for the BHTN cap → **Answer (operator 2026-11-23):** Region I–IV select, default Region I.

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-23 | Created (draft) | #404 | - |
| 2026-11-23 | Operator answered Q1–Q3; Behavior 2, 3 and the values table updated | #404 round 2 | - |
