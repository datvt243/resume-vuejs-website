# 2026-10-31 — issue-364-form-length-rules

- Worker: implementer · Version: 0.1.0
- Node: `issue-364-form-length-rules` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row — new, slug not in archive)
- Task (verbatim, issue title): "[QC][P3] Form cho nhập độ dài mà API từ chối: Người tham chiếu (fullName) và Nơi làm việc (workLocation)". The operator asked to file backend-side problems as backend issues and then continue. This issue (#364, created by `/todo` free-text mode) is the frontend-side remainder of #355's "Noticed, not done".

## Hub bytes before: 2606357 (`find agent-hub -name '*.md' -o -name '*.yaml' | xargs cat | wc -c`)

## Branch
`fix/issue-364-form-length-rules` (off `staging` @ `8bd6ece`, via `gh issue develop 364`).

## Acceptance criteria
1. Reference `fullName` accepts 3–50 characters only, and general-information `workLocation` 3–100 only. These are the API's rules (`resume-nodejs-api` @ `e4451d4`: `joi.config.ts:54` `fullName min(3).max(50)`; `generalInformation.validate.ts:55` `_stringDefault({ min: 3, max: 100 })`), so a bad length fails inline instead of as a 400.
2. Messages go through the existing `validation.minChars` / `validation.maxChars` keys.
3. A spec checks both boundaries and fails without the fix. Test/build/lint pass, and typecheck stays at the baseline.

## Triage: frontend vs backend
API rules that look wrong were filed on the backend repo, not copied into the forms:
- datvt243/resume-nodejs-api#331: `education.school` `min(10)` rejects "MIT" (checked with the repo's Joi: `string.min`).
- datvt243/resume-nodejs-api#332: 14 `.trim().strict()` fields reject surrounding spaces (`string.trim`) instead of trimming.
- datvt243/resume-nodejs-api#333: `lastName` `min(3)`, but the frontend uses it for the given name (Tên), so "An"/"Vy"/"Hà" are rejected (`string.min`).
The general-information selects (`levelCurrent`/`levelDesired`/`education`/`workForm`, API `min(3)`) need no change: every option value is at least 3 chars (shortest is `ceo`).
Also closed #357 (waiting-backend). Backend #326 shipped in API v2.2.3, and a prod `POST cv/ats-check` on `qa.full@example.com` returns the summary with no `<p>`.

## Diff
| file | why |
|---|---|
| `src/models/reference.model.ts` | `fullName`: `.min(3, …minChars)`, and `max` 100 → 50 |
| `src/models/generalInformation.model.ts` | `workLocation`: `.min(3, …minChars).max(100, …maxChars)` |
| `src/models/education.model.spec.ts` → `src/models/lengthRules.model.spec.ts` | renamed, since it now covers three models. Added a `describe.each` for the min-1/min/max/max+1 boundaries of both fields. The #355 `major` test is unchanged. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row (appended) |

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- The spec run before the model edits landed (the first edit script aborted on a non-unique anchor, so both models were still unchanged): `× reference fullName > accepts 3-50 characters only`, `× general workLocation > accepts 3-100 characters only`, `AssertionError: expected true to be false`, `Tests  2 failed | 1 passed (3)`. This is the red-without-fix run.
- After the edits, `npx vitest run src/models/lengthRules.model.spec.ts`: `Tests  3 passed (3)`
- `npm run test`: `Test Files  51 passed (51)` / `Tests  309 passed (309)`
- `npm run build`: `✓ built in 3.75s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS`, the same as the baseline. 0 in the three touched files.

## Manual observation
Not done live. These are pure yup rules that render the same way as the existing `maxChars` errors on these fields.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. API length rules enforced in the form | spec boundaries for both fields |
| 2. Existing i18n keys | `withParams('validation.minChars'/'maxChars', …)`, no new keys |
| 3. Spec red without the fix; test/build/lint/typecheck | as listed above |
| Comments per code-comments.md | One `//` why-comment above the new `describe.each` in the spec. No `(#N)` ref. Nothing added in the models. |

## Supersedes: none
## Still open: none for #364. The backend-side rules are tracked in resume-nodejs-api #331–#333.

## Noticed, not done
- A stored `workLocation`/reference name that is already shorter than 3 (or a reference name over 50) now fails the form on edit. The API would reject that save anyway, so the user just sees it earlier.

## Seal gate
Outward actions this run, all requested by the operator ("tạo issue cho backend, sau đó tiếp tục"): created resume-nodejs-api #331/#332/#333 and resume-vuejs-website #364, and commented on and closed #357. No commit/push; no data written.
