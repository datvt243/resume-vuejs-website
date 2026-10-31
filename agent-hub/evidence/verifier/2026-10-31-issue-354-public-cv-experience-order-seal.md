# 2026-10-31 — issue-354-public-cv-experience-order — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-354-public-cv-experience-order`
- Evidence reviewed: `evidence/implementer/2026-10-31-issue-354-public-cv-experience-order.md`
- Verdict: **SEAL**

## Isolation proof
Separately spawned Agent subagent, not the implementer's `/todo` session. Spawned with a task prompt that opens "You are a fresh verifier subagent … You did NOT write this diff". It invoked `/worker verifier "agent-hub/evidence/implementer/2026-10-31-issue-354-public-cv-experience-order.md"`, with the instruction not to modify `src/`. This context has no memory of writing the diff.

## Re-run
none. The note's output is verbatim (test/build/lint/typecheck counts plus the red-without-fix stash run), and the commands match `doctrine/MEMORY.md`. The diff is not outward-facing.

## Criteria
| Criterion | Evidence cited | OK |
|---|---|---|
| 1. Public CV experience order = PDF | Same comparator as `createPDF.ats.ts:150`. Verifier checked the API repo independently: `resume-nodejs-api/src/services/createPDF.ats.ts:150` is `[...list].sort((a, b) => b.startDate - a.startDate)` | yes |
| 2. Spec with the issue's example, red without the fix | stash run: `Tests 1 failed | 7 passed (8)` → with fix `8 passed (8)` | yes |
| 3. test/build/lint/typecheck | `306 passed (306)`, `built in 3.78s`, lint exit 0, typecheck 90 = baseline, 0 in changed files | yes |
| Comments per code-comments.md | one `//` why-comment, no `(#N)` ref | yes |

## Clarified criteria (scoping to experience only)
Justified. The issue names the PDF as the reference. A grep of `createPDF.ats.ts` for `sort` shows exactly one sort (line 150, experience), so the PDF leaves education/projects in API order. Sorting them only on the web CV would create a new mismatch with the PDF. Dropping `isCurrent desc` also matches the PDF. The note records this under "Noticed, not done".

## Forbidden states
ADHOC_WORK no (node on diagram) · NO_EVIDENCE no · EDIT_UNVERIFIED no (typecheck count cited) · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row present, now SEALED) · MAIN_EDIT no (branch `fix/issue-354-public-cv-experience-order`).
Seal gate: no commit, push or data write, so none was needed. Supersedes/Still open lines are present.

## Note for /ship
The working tree also has `.claude/commands/issues-ls.md` (modified, a grouped-table change for `/issues-ls`) and `QC_TESTER.md` (untracked, dated 2026-10-24). Both are unrelated operator work and are not part of this node's diff. Keep them out of the #354 commit unless the operator wants them in.

## PM status
Row updated in place to SEALED, with the full row appended to `haven/diagrams/dev-loop-archive.md`. There are 17 pointer rows, under the 20 limit, so nothing was pruned.
