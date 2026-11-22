# 2026-11-21 - issue-403-salary-range

- Worker: implementer · Version: 0.1.0
- Node: `issue-403-salary-range` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS)
- Branch: `feature/issue-403-salary-range` (off `staging` @ 75250fb, linked to #403 via `gh issue develop`)
- Task: #403 "feat(general-information): nhập/hiển thị mức lương mong muốn dạng từ – đến" — Backend đổi `salaryDesired` thành khoảng `salaryDesiredFrom` – `salaryDesiredTo` (datvt243/resume-nodejs-api#362, PR #367, v2.6.0). AC: nhập được khoảng lương, `To < From` báo lỗi trên form; lỗi 400 API đúng field; dữ liệu cũ hiển thị đúng; test cho model/form mới.

## Hub bytes before: 100325

## Feature doc: doctrine/features/general-information.md (Behavior #5, Open questions 4–6 answered by operator 2026-11-21) + doctrine/features/home-overview.md (Behavior #2)

## Diff
| File | Why |
|---|---|
| `src/models/generalInformation.model.ts` | `salaryDesired` → `salaryDesiredFrom` + `salaryDesiredTo` (currency, `col-md-6`, both required/positive integer — Behavior #5a/c). Shared `salary(yup)` builder; `''` transformed to `undefined` so an empty input reports `validation.required`, not `validation.number`. To gets `.test('salaryRange', 'validation.salaryRange', to >= From)` (#5c). |
| `src/components/veevalidate/part/FrmCurrency.vue` | Emptied input emitted `''` and `handleChange(+'')` turned it into `0` (doc Edge case); now keeps `''`. Comment example updated to the new field name. |
| `src/pages/dashboard/PageGeneralInformation.vue` | `onError` for `updateDoc`: `400 VALIDATION_ERROR` whose details all name a salary field → `setFieldError` per field, no toast; else toast (#5e, same pattern as `experienceErrorOf` in PageProject). `ref="refVeeForm"`. |
| `src/utilities/index.ts` | `formatSalaryRange(from, to)` — range / equal ends → one number / "Từ X" · "Đến Y" / '' (#5g), `Intl.NumberFormat(uiLocale)`. |
| `src/pages/home/PageHome.vue` | Salary line under the desired position in the profile strip, hidden when empty (#5f, home-overview #2). |
| `src/composables/useProfileCompletion.ts` | `isRequiredField` also counts `describe().optional === false` — yup 1.4 `number().required()` adds no test named `required` (checked: `yup.number().required('r').describe()` → `{"optional":false,…,"tests":[]}`), so without this the salary ends would never count toward completion (AC). |
| `src/i18n/index.ts` | vi+en: `validation.salaryRange`, `field.salaryDesiredFrom`, `field.salaryDesiredTo`, `home.salaryFrom`, `home.salaryTo` (`{value}`); removed unused `field.salaryDesired`. |
| `src/models/generalInformation.model.spec.ts` (new), `src/pages/dashboard/PageGeneralInformation.spec.ts` (new), `src/utilities/index.spec.ts`, `src/composables/useProfileCompletion.spec.ts` | Tests per AC; completion fixture uses the range fields. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Node row. |

Not touched: `.claude/skills/todo/SKILL.md` was already modified before this task (operator's own change, carried onto the branch) — not part of this node.

## Command
- `npm run test` · `npm run lint` · `npm run build` · `npm run typecheck` (doctrine/MEMORY.md rows, repo root)
- `npx vitest run src/models/generalInformation.model.spec.ts src/pages/dashboard/PageGeneralInformation.spec.ts src/utilities/index.spec.ts src/composables/useProfileCompletion.spec.ts`

## Output
```
npm run test → exit 0
 Test Files  64 passed (64)
      Tests  418 passed (418)

npm run lint → exit 0
> eslint src --ext .js,.ts,.vue
(no errors)

npm run build → exit 0
✓ built in 3.86s

npm run typecheck → exit 2
grep -c "error TS" → 78
grep -cE "generalInformation\.model|PageGeneralInformation|PageHome|utilities/index|FrmCurrency" → 0
(src/composables/useProfileCompletion.ts(75..80) TS2339 `.value` on useCandidate union — pre-existing listSection lines, shifted +1 line by this diff; total = baseline 78)

npx vitest run <4 specs>
 ✓ src/models/generalInformation.model.spec.ts (3 tests)
 ✓ src/utilities/index.spec.ts (22 tests)
 ✓ src/composables/useProfileCompletion.spec.ts (9 tests)
 ✓ src/pages/dashboard/PageGeneralInformation.spec.ts (1 test)
 Test Files  4 passed (4)
      Tests  35 passed (35)
```

Manual (Vite started by this session on :5173, debug Chrome :9888 via Playwright, `qa.full@example.com`; server stopped after):
```
load /dashboard/general-information (legacy single value) → {"from":"VND 25,000,000","to":"VND 25,000,000"}
From 30000000, To 20000000 → errTo: "Mức lương \"Đến\" phải lớn hơn hoặc bằng \"Từ\"", saveDisabled: true, no request
To cleared → errEmpty: "Vui lòng nhập"
From 20000000, To 30000000 → save → PUT https://nodejs-resume-api-ts.onrender.com/api/v1/general-information/update salary:{"salaryDesiredFrom":20000000,"salaryDesiredTo":30000000}
reload → {"from":"VND 20,000,000","to":"VND 30,000,000"}
Home strip vi → ["NV","Nguyễn Văn Full","Frontend Developer","20.000.000 – 30.000.000","Đang mở tìm việc",…]
Home strip en → ["NV","Nguyễn Văn Full","Frontend Developer","20,000,000 – 30,000,000","Open to work",…]
saved 25000000/25000000 (QA data restored to its original value) → Home strip ["NV","Nguyễn Văn Full","Frontend Developer","25.000.000"]
```

## Acceptance
| Criterion | Evidence |
|---|---|
| Model spec: From/To currency, no `salaryDesired`; To<From → path `salaryDesiredTo` + `validation.salaryRange`; 1000/2000 and 1000/1000 ok; 0/negative → `validation.salaryPositive`; empty → `validation.required` | `generalInformation.model.spec.ts (3 tests)` ✓ |
| Page spec: payload has both keys, no `salaryDesired`; `VALIDATION_ERROR` on `salaryDesiredTo` → `setFieldError('salaryDesiredTo','Y')`, returns true (no toast); other field / other code → false (toast) | `PageGeneralInformation.spec.ts (1 test)` ✓ |
| Display spec: `1.000 – 2.000`, `1.500`, `Từ 1.000`, `To 2,000`, `''` | `utilities/index.spec.ts (22 tests)` ✓ (`formatSalaryRange` case); Home hides the line on `''` (`v-if="salary"`) |
| Completion: fixture uses range fields; section incomplete when either end `null` | `useProfileCompletion.spec.ts (9 tests)` ✓ incl. new "incomplete while either salary end is null" |
| Manual QA: To<From error + no request; PUT body has both; reload shows values; legacy shows same value in both; Home vi/en range; equal ends one number | Manual block above |
| CV/Preview/public/jsonResume untouched | `git diff --stat -- src/components/cv/CvResumeLayout.vue src/pages/dashboard/PagePreview.vue src/pages/public/PagePublicResume.vue src/utilities/jsonResume.ts \| wc -l` → `0` |
| New keys in vi + en; lint/build/test pass; typecheck ≤ 78, none in changed files | i18n diff adds each key twice (vi block + en block); outputs above (78, 0 in changed files except the shifted pre-existing useProfileCompletion lines) |
| VeeForm / useDocument / useCandidate specs pass | inside `npm run test` 64/64 files |
| No stale `salaryDesired` in src (non-spec) | `grep -rn "salaryDesired\b" src \| grep -v spec` → no output |
| Comments per code-comments.md | 4 new `//` one-liners (WHY: yup typeError trap, `+''` = 0, yup 1.x required detection, i18n watcher in spec) + JSDoc on exported `formatSalaryRange`; no issue refs, no history |

## Supersedes: none
## Still open: none

## Review
`/code-review medium` on the working tree — 7 findings:
1. "To ≥ From not re-checked when From changes" → **false positive**: vee-validate 4.13.1 re-runs the whole form schema in `validated-only` mode on every change and updates every validated field (`node_modules/vee-validate/dist/vee-validate.esm.js:2381-2408`).
2. "`optional === false` also makes `yearsOfExperience` count" → **intended**: doc Behavior/completion = every required field; `yearsOfExperience` is `.required()` and was silently skipped by the same yup quirk. Only generalInformation is affected (information.model validators are all `string()`). Listed below.
3. "Server message under the field doesn't re-translate on VI/EN switch" → kept: spec #5e says show the API message, same as PageProject's `experienceErrorOf`. Noted.
4. "Reversed range displayed as-is" / 5. "numeric strings / 0" → out of scope (backend enforces To ≥ From and returns Numbers; spec defines no such case). Noted.
6. "New Intl.NumberFormat per call" → cleanup, negligible (one line on Home). Noted.
7. "`markSaved()` not called" → **false positive for this page**: the dirty guard is only `inject('modalDirtyGuard')` in modals; this page isn't one, and the page never called it before.

## Noticed, not done
- `yearsOfExperience` now counts toward profile completion (side effect of the `isRequiredField` fix) — a user with it empty sees General information as incomplete.
- Field-level salary 400 messages are server text and won't re-translate on a VI/EN switch (same as PageProject).
- Home doesn't fetch General information itself: after a hard reload on `/`, the strip shows "No desired position yet" until the form page is visited (pre-existing, not this diff).
- `formatSalaryRange` doesn't guard against a reversed range or a stored `0` from another client.
