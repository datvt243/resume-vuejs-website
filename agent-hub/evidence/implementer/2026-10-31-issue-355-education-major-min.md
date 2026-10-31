# 2026-10-31 — issue-355-education-major-min

- Worker: implementer · Version: 0.1.0
- Node: `issue-355-education-major-min` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row — new, slug not in archive)
- Task (verbatim, issue title): "#355 [QC][P3] Học vấn: form cho nhập Chuyên ngành < 3 ký tự nhưng API từ chối (400)". Operator ran `/todo` "tiếp tục P3" and picked #355.

## Hub bytes before: 2559584 (`find agent-hub -name '*.md' -o -name '*.yaml' | xargs cat | wc -c`, same method as the previous note)

## Branch
`fix/issue-355-education-major-min` (off `staging` @ `77fec7f`, via `gh issue develop 355`).

## Acceptance criteria
1. Education form: `major` with fewer than 3 characters shows an inline field error and can't be submitted (no 400 round-trip).
2. The message goes through i18n (vi + en).
3. Test/build/lint pass; typecheck stays at the baseline.

## Diff
| file | why |
|---|---|
| `src/models/education.model.ts` | `major`: `.min(3, withParams('validation.minChars', { min: 3 }))` before the existing `max(50)`. Matches the API `education.validate.ts:12` `major: Joi.string().min(3)…` (resume-nodejs-api @ `e4451d4`) |
| `src/i18n/index.ts` | new `validation.minChars`: vi `Tối thiểu {min} ký tự`, en `Minimum {min} characters` (next to `maxChars`, which didn't have a min counterpart) |
| `src/models/education.model.spec.ts` | new: the `major` schema rejects `'QA'` and accepts `'CNTT'` |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row (appended) |

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npx vitest run src/models/education.model.spec.ts`: `Tests  1 passed (1)`
- `npm run test`: `Test Files  1 failed | 49 passed (50)` / `Tests  1 failed | 302 passed (303)`. The one failure is `src/components/veevalidate/VeeForm.spec.ts:287` (the VI|EN hidden-language test), which this diff doesn't touch. It's the known #347 failure.
- `npm run build`: `✓ built in 5.50s` (chunk-size warning only, already there before)
- `npm run lint`: exit 0, no output
- `npm run typecheck`: 90 `error TS`, the same as the baseline. No errors in changed files (grepping for `education` only matches pre-existing `src/stores/candidate.ts(62|64)` `educations` TS2339).

## Manual observation
Not done live. The yup rule is covered by the new spec. The way it renders inline (`withParams` → `tr`) is the same path `maxChars` already uses in this same field. The live UI check is left for the verifier/QC.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. `major` < 3 chars blocked client-side | `education.model.spec.ts` passes (`'QA'` → invalid) |
| 2. i18n vi + en | `validation.minChars` added to both locale blocks |
| 3. test/build/lint/typecheck | as listed above |
| Comments per code-comments.md | One comment added: a 1-line why-comment in `education.model.spec.ts` (`// the API rejects majors shorter than 3 characters with a 400`). No comments touched in `education.model.ts` or `i18n/index.ts`. (Added after REOPEN #1, `evidence/verifier/2026-10-31-issue-355-education-major-min-reopen.md`) |

## Supersedes: none
## Still open: none for #355's stated field

## Noticed, not done
The API's minimum lengths that the frontend doesn't enforce (from grepping `resume-nodejs-api/src` @ `e4451d4`), worth a follow-up issue:
- `education.school` `min(10)` (`education.validate.ts:11`). The frontend has only `max(100)`, and its `max` is 255 on the API. A school like "MIT" or "ĐH Bách Khoa" gets a 400. A 10-char minimum looks like a backend bug, not something to copy, so that call is the operator's.
- `reference.fullName` `min(3)` (`joi.config.ts:54`). `reference.model.ts` has only `max(100)`.
- `candidate.lastName` `min(3)` (`joi.config.ts:52`). `information.model.ts:29` has `min(0)`.
- general information `levelCurrent`/`levelDesired`/`education`/`workLocation` `min(3)` (`generalInformation.validate.ts:51-55`). Not checked against `generalInformation.model.ts`.
- The API strings use `.trim().strict()`, so leading/trailing spaces may be rejected rather than trimmed. Not verified.

## Seal gate
none (no commit/push; no data written)
