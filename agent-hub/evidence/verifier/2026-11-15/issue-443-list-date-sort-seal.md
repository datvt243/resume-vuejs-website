# 2026-11-15 - issue-443-list-date-sort — SEAL
- Worker: verifier · Version: 0.1.0
- Node: `issue-443-list-date-sort` (`haven/diagrams/dev-loop.prime-mermaid.md`) → SEALED, archived to `dev-loop-archive.md`
- Note audited: `evidence/implementer/2026-11-15/issue-443-list-date-sort-plan.md`

## Verdict
SEAL

## Isolation proof
Separately spawned Agent-tool subagent (fresh context), launched with the task "act as the agent-hub VERIFIER ... Node: issue-443-list-date-sort ... Spawn type: fresh" and skill args `verifier "agent-hub/evidence/implementer/2026-11-15/issue-443-list-date-sort-plan.md"`. No memory of writing this diff.

## Cited
| Criterion | Evidence in note | OK |
|---|---|---|
| #443 re-sort after save (new / edited / duplicated) | test "addRecordToList re-sorts…" red (`3 failed`) → green; asserts list + store order after add and after update | yes |
| #447 awards newest `issueDate` first | test "sorts awards by issueDate descending" red → green | yes |
| #447 applications newest `appliedDate` first | test "sorts applications by appliedDate descending" red → green | yes |
| Existing startDate sort + dateless lists unchanged | existing tests pass; stable sort argued; `Tests 375 passed (375)` | yes |
| Feature docs Behavior #1 (3 docs) | `## Feature doc changed` lines each cite the recorded operator answer (2026-11-07, open questions 2 / 2 / 3), confirmed in the docs' Open questions sections | yes |
| Build / lint / test | `✓ built in 4.37s`; lint exit 0; `56 passed`, `375 passed` | yes |
| Typecheck (baseline 78) | 78 on branch = 78 on stashed staging, identical lists (`SAME_ERRORS`); `useCandidate.ts` hits are pre-existing (same precedent as `evidence/verifier/2026-11-02/issue-375-delete-all-visits-seal.md`) | yes |
| comments per code-comments.md | one `//` why-line, no issue refs | yes |
| Review | `## Review` present, inline, no correctness findings, callers enumerated | yes |
| Supersedes | `none`, grep on active diagram cited | yes |

## Missing
none

## Forbidden states
None hit. Branch `fix/issue-443-list-date-sort` (not main/staging) → no `MAIN_EDIT`. Output not truncated. Commands match `doctrine/MEMORY.md`.

## Seal gate
Not outward-facing (no commit/push/external call recorded). Live check skipped with a stated reason (composable logic, unit tests assert the returned ref).

## Proportionality
5-line source change in the shared `sortData` / `addRecordToList` + specs + 3 doc lines. Within node scope.

## Doctrine proposal
none

## Re-run
none — audit-only; note output verbatim, commands match doctrine, criteria covered.

## PM update
Active row → archived pointer; full row appended to `dev-loop-archive.md`; oldest pointer (`issue-372-skills-page`) dropped to keep 20. Feature docs already `verified` — fix SEAL leaves their Status as is.
