# 2026-10-31 — issue-364-form-length-rules — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-364-form-length-rules`
- Note under review: `evidence/implementer/2026-10-31-issue-364-form-length-rules.md`
- Verdict: **SEAL**

## Isolation proof
Separately spawned Agent subagent (fresh context, not the implementer's `/todo` session), launched with the task "You are a fresh verifier subagent ... You did NOT write this diff — you were spawned specifically to verify it" and args `verifier "agent-hub/evidence/implementer/2026-10-31-issue-364-form-length-rules.md"`.

## Re-run
none — audit-only. Output is verbatim, commands match `doctrine/MEMORY.md`, and every criterion is covered.

## Cited
| Criterion | Evidence |
|---|---|
| 1. fullName 3–50, workLocation 3–100 | API sources cited (`joi.config.ts:54`, `generalInformation.validate.ts:55`); spec checks min-1/min/max/max+1 for both fields; `Tests 3 passed (3)` |
| 2. Existing i18n keys | `withParams('validation.minChars'/'maxChars', …)`, no new keys |
| 3. Red without fix, then green | red run `Tests 2 failed | 1 passed (3)`; `npm run test` 309/309; build `✓ built in 3.75s`; lint exit 0 |
| Typecheck | `npm run typecheck`: 90 errors = baseline, 0 in touched files |
| Comments per code-comments.md | one `//` WHY comment above the `describe.each`, no `(#N)` ref |

## Missing
none

## Forbidden states
ADHOC_WORK no (node row on diagram) · NO_EVIDENCE no · EDIT_UNVERIFIED no · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row updated here) · MAIN_EDIT no (branch `fix/issue-364-form-length-rules`, off `staging`).

## Seal gate
No commit/push. Outward actions (filing backend issues #331–#333, #364, closing #357) were requested by the operator, as the note records.

## Proportionality
- The `education.model.spec.ts` → `lengthRules.model.spec.ts` rename is in scope. The node needed a spec, and putting the two new boundary tests next to the #355 `major` length test (unchanged) keeps the model length-rule specs in one file. The new name matches what the file now covers. It doesn't widen behavior.
- Out of scope, not part of this note: the working tree also has a modified `.claude/commands/issues-ls.md` (an issue-table grouping/priority rewrite, mtime before the model edits) and an untracked `QC_TESTER.md` (Oct 24). Neither is in the note's diff table or tied to #364. `/ship` must not commit them with this branch: stage only the node's files, or have the operator confirm them separately.
