# 2026-11-23 - issue-404-460-461-salary-password-ats

- Worker: implementer · Version 0.1.0
- Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-404-460-461-salary-password-ats` (IN_PROGRESS)
- Branch: `feature/issue-404-460-461-salary-password-ats` (off `staging`, linked to #404)
- Task: #404 Gross ↔ Net salary calculator · #460 change password / change email + confirm page · #461 ATS "not applicable" state (`/todo #461, #460 and #404`)
- Status: **sealed_pending_verifier** — first stopped `blocked` (#460 live checks, see `## Blocker`); operator waived those live checks 2026-11-23 (see `## Operator waiver`).

## Hub bytes before
100377

## Feature doc
- `agent-hub/doctrine/features/salary-calculator.md` (#404)
- `agent-hub/doctrine/features/account-settings.md` (#460, Behavior 8–11)
- `agent-hub/doctrine/features/ats-check.md` (#461, Behavior 6)
Spec note: `evidence/analyst/2026-11-23/salary-password-ats-spec.md` (operator answered Q1–Q6, 2026-11-23). Follow-up for the 01/01/2027 wages: #509.

## Diff
| File | Why |
|---|---|
| `src/types/ats.type.ts` | `applicable?: false` on `AtsCheckResult` (#461 6a) |
| `src/pages/dashboard/PageAtsCheck.vue` | `checkIcon()`: not-applicable checked before `passed` → `fa-circle-minus text-fg-3` + `badgeClass('neutral')` `data-badge="not-applicable"`; `failedCount` skips `applicable === false` (6b–6d) |
| `src/utilities/salaryVn.ts` (new) | `SALARY_VN` law constants (one object, sources in comment, `effectiveFrom`), pure `grossToNet` / `netToGross` (bisection to float precision) (#404 B6–8) |
| `src/pages/dashboard/PageSalaryCalculator.vue` (new) | Calculator page: direction SegmentedControl, VND amount (VueNumber), dependents, region select, breakdown table, NoData; prefill from `salaryDesiredFrom` via `useCandidate` (GET only), never writes (#404 B1–5, 9) |
| `src/routers/index.ts` | `/dashboard/salary-calculator` (requiresAuth); public `/confirm-email-change` |
| `src/pages/_layouts/LayoutDefault.vue` | `nav.salaryCalculator` item after ATS check, `fa-solid fa-calculator` |
| `src/plugins/initFontAwesomeIcon.js` | register `faCircleMinus`, `faCalculator` |
| `src/pages/dashboard/PageAccountSettings.vue` | inline change-password / change-email VeeForms (hidden until button, Cancel unmounts = clears); `POST auth/change-password` → `setTokens` from response; `POST auth/change-email`; header comment updated (#460 B9–10) |
| `src/pages/auth/PageConfirmEmailChange.vue` (new) | reads `?token` (array = none), one `GET auth/confirm-email-change` on mount; signed in → toast + `logOut({ router })`; signed out → success + "Go to login" (and clears a stale stored user of another tab); 400/409 → API message + back link (#460 B11) |
| `src/i18n/index.ts` | vi + en: `ats.notApplicable`, `nav.salaryCalculator`, `salary.*` (29 keys), `account.currentPassword/newEmail`, `auth.confirmEmail*`, `auth.goToLogin` |
| specs | `src/utilities/salaryVn.spec.ts` (new), `src/pages/dashboard/PageSalaryCalculator.spec.ts` (new), `src/pages/auth/PageConfirmEmailChange.spec.ts` (new), `PageAtsCheck.spec.ts` (+1 case), `PageAccountSettings.spec.ts` (+4 cases; VeeForm mock now exposes `fields`/`submitFn` + cancel slot) |

## Command
From repo root, copied from `doctrine/MEMORY.md`: `npm run test` · `npm run lint` · `npm run build` · `npm run typecheck`; per file `npx vitest run <path>`.

## Output
```
npm run test      → exit 0
 Test Files  69 passed (69)
      Tests  483 passed (483)
npm run lint      → exit 0
npm run build     → exit 0   ✓ built in 3.81s
npm run typecheck → exit 2   78 error TS   (baseline 78 on staging @ 13383c8)
  grep for changed files (Salary|salaryVn|ConfirmEmail|AccountSettings|AtsCheck|ats.type|i18n/index|LayoutDefault|routers/index|initFontAwesomeIcon.js) → no lines
npx vitest run src/utilities/salaryVn.spec.ts                  → Tests 12 passed (12)
npx vitest run src/pages/dashboard/PageAtsCheck.spec.ts        → Tests 6 passed (6)
npx vitest run src/pages/dashboard/PageSalaryCalculator.spec.ts → Tests 5 passed (5)
npx vitest run src/pages/dashboard/PageAccountSettings.spec.ts → Tests 5 passed (5)
npx vitest run src/pages/auth/PageConfirmEmailChange.spec.ts   → Tests 5 passed (5)
```

## Acceptance
| Criterion | Evidence |
|---|---|
| #461 spec case: metadata `applicable:false` → 1 badge `Không áp dụng` / `Not applicable` after EN, 0 danger, 1 warning, failed count 1; same with `passed:false` still 1 | `PageAtsCheck.spec.ts` "shows a not-applicable check as neutral…" — Tests 6 passed (6) |
| #461 `ats.notApplicable` vi + en, build passes | i18n diff; build exit 0 |
| #461 live (qa.full, Classic) | Result "73/100 · 2 checks not passed"; two rows "Not applicable to the classic template…" with badge "Not applicable", no Error badge on them |
| #404 worked examples 15M / 30M / 60M+1 / 150M+2 (insurance, PIT, net) | `salaryVn.spec.ts` it.each — Tests 12 passed (12) |
| #404 round trip ≤ 1 đ, sweep 1M…300M step 997,001, all 4 regions; netToGross of each net | same spec |
| #404 bracket edge lower rate; BHTN cap by region; 10,000,000,000 finite | same spec |
| #404 page: starts at `salaryDesiredFrom`; editing sends no request, store unchanged; no salary → empty, NoData, link to `/dashboard/general-information`, no NaN; EN labels | `PageSalaryCalculator.spec.ts` — Tests 5 passed (5) |
| #404 live: menu item opens `#/dashboard/salary-calculator`; EN translates every label | qa.full: link text "Tính lương Gross ↔ Net" → URL `…#/dashboard/salary-calculator`; after App language = English every label English (output captured in session); direct load prefilled 25.000.000 đ (qa.full's saved salary) → net 22.031.250 đ; typing updates live |
| #404 DESIGN.md: §4.3 FormSection, max-w-4xl, table §5.4, 1440 dark + 375 dark, no horizontal overflow | screenshots `…/scratchpad/salary-1440-en.png`, `salary-375-dark.png`; `scrollWidth > innerWidth` → false |
| #460 change-password request shape, `setTokens` on 200, no `logOut` on 400; change-email shape, shown email unchanged | `PageAccountSettings.spec.ts` — Tests 5 passed (5) |
| #460 `Abcdefghij1!` accepted, `Abcdefghi1!` → `validation.passwordMin`, mismatch → `validation.passwordMismatch` | same spec (schema from the rendered form's `fields`) |
| #460 confirm page: no token → invalid text, no request; 200 signed in → logOut + /login; 200 signed out → success + link, no logOut; one request | `PageConfirmEmailChange.spec.ts` — Tests 5 passed (5); live `#/confirm-email-change` (no token) → "This email confirmation link is invalid…", 0 requests to `confirm-email-change` |
| #460 **live** password change (tab A keeps working, other session logged out, old password fails); confirm with a used token → API 400 message | **WAIVED by operator 2026-11-23** — not run, backend not on prod (`## Blocker`); behavior covered by the #460 spec rows above |
| all new i18n keys in vi and en; `npm run test`, `build`, `lint` pass | `src/i18n/index.spec.ts` in the 483 passing; exit codes above |
| comments per code-comments.md | new comments are one-line "why" (VueNumber event split, bisection bounds, tokens revoked, stale stored user, `upTo` inclusive); stale "BLOCKED_ON_BACKEND" header comment in `PageAccountSettings.vue` replaced |

## Blocker
Backend PR datvt243/resume-nodejs-api#497 (#412) is merged into **`staging` only** (`mergedAt 2026-11-20`, base `staging`). The prod API answers:
- `POST /api/v1/auth/change-password` → toast "Route POST /api/v1/auth/change-password not found" (live attempt from qa.full; password unchanged)
- `GET /api/v1/auth/confirm-email-change?token=x` → HTTP 404 (curl)
The #460 live criteria need the backend released to prod (or an approved non-prod API). I did not start the local backend: its `.env` may point at the real database.

## Operator waiver
2026-11-23, operator, verbatim: "yes, waive and run the verifier" — answering whether to waive the #460 live checks (they need resume-nodejs-api#497 on prod) and verify on the spec evidence. Condition stated to the operator: do not `/release` to `main` before the backend is on prod, or the new buttons call missing routes.

## Supersedes
none (no other open row for #404/#460/#461 on the active diagram)

## Review
`/code-review medium`, 9 findings:
1. Confirm opened in a new, signed-out tab leaves another tab's stored `user` (old email) → **fixed**: signed-out success calls `logOut()` when a stored user exists (+ spec case).
2. Switching to Net → Gross kept the gross number as "net" → **fixed**: `setDirection` turns the amount into the other side of the current result (+ spec).
3. Reload after success re-sends the used token → **not changed**: spec asks for one request per page open; a reload shows the API's "invalid/used link" message. Listed under Noticed.
4. 200 without tokens skipped silently → **no change**: account-settings.md Edge cases says keep the tokens, show the toast, no logout.
5. Password rules copied a third time → Noticed, not done (refactor touches Register/Reset; SmallestDiff).
6. Fields not in `models/*.model.ts` → false positive: the page's existing cvFileName form is inline too.
7. `t()` in templates → false positive: CLAUDE.md says components mounted in specs use `import { t }` (same as `PageAtsCheck.vue`).
8. Formatter per call / 'vi-VN' hard-coded → **fixed** the per-call one (module-level `vnd`); 'vi-VN' + "đ" is what salary-calculator.md B5 specifies.
9. `rows` without null guard → **fixed** (`if (!r) return []`).

## Noticed, not done
- Password rules duplicated in `PageRegister.vue`, `PageResetPassword.vue`, `PageAccountSettings.vue` → one shared field helper.
- Confirm page reloaded after success shows the "used link" error.
- Calculator shows the "no saved salary" hint briefly while General information loads.
- The calculator spec mocks `@/services/axios` default export; the page itself only makes the `useCandidate` GET, which the cached store skips in specs.
