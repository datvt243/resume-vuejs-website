# 2026-11-16 - issue-445-enddate-null-current — REOPEN
- Worker: verifier · Version: 0.1.0
- Node: `issue-445-enddate-null-current` (`haven/diagrams/dev-loop.prime-mermaid.md`) → stays IN_PROGRESS
- Note audited: `evidence/implementer/2026-11-16/issue-445-enddate-null-current-plan.md`

## Verdict
REOPEN

## Isolation proof
Separately spawned Agent-tool subagent (fresh context), launched with the task "You are a fresh, isolated verifier subagent ... Task: #445 Timeline sections ... Branch: fix/issue-445-timeline-sections-send" and skill args `verifier "agent-hub/evidence/implementer/2026-11-16/issue-445-enddate-null-current-plan.md"`. No memory of writing this diff.

## Cited
| Criterion | Evidence in note | OK |
|---|---|---|
| 1 Experience `isCurrent` → `endDate: null` | spec "sends endDate null…" passes (4 passed); fails with fix reverted (AssertionError quoted) | yes |
| 2 Education `isCurrent` → `endDate: null` | only "same one-line expression" at `PageEducation.vue:82`; note says "not unit-tested"; nothing was run | **no** |
| 3 Project `isWorking` → `endDate: null` | only `PageProject.vue:74` + model line; "not unit-tested"; nothing was run | **no** |
| 4 Unchecked unchanged | else branch is original expression; Experience spec suite still green | yes (code citation, unchanged path) |
| 5 Display safe | every `endDate` reader cited file:line, flag-gated | yes |
| 6 test / build / lint / typecheck | `376 passed`; lint exit 0; typecheck 78 ≤ baseline 78, none in touched files; build block contains an elided `...` line | partial — see Missing |
| 7 comments per code-comments.md | "No comments added or changed" | yes |
| Feature doc | `## Feature doc` cites cv-timeline-sections.md; Open question 5 answer recorded (operator 2026-11-07, "send null — #445") | yes |
| Review | `## Review` present, inline, no findings | yes |
| Supersedes | `none`, grep cited | yes |

## Missing
1. **Criteria 2 and 3 have no executed evidence** (`EvidenceOnly`). Education and Project are claimed by analogy to Experience ("same one-line expression"). Project uses a different flag (`isWorking`), so the analogy is not proof. Fix: add a spec per page (`PageEducation.spec.ts`, `PageProject.spec.ts`) using the same VeeForm `submitFn` stub + hoisted `updateDoc` mock as `PageExperience.spec.ts`, assert `endDate: null` when the flag is checked, and cite red (fix reverted) → green output. A live payload check on a QA account is also acceptable.
2. **Build output is elided** (`verify_seal` step 5): the `npm run build` block has a literal `...` line. Quote the output verbatim, or use one line like `✓ built in Xs (only the existing chunk-size warning)` as earlier notes did.

## Forbidden states
`EDIT_UNVERIFIED` for criteria 2 and 3: correct behavior is claimed but nothing was run. Nothing else is hit. Branch `fix/issue-445-timeline-sections-send` is not main/staging, so no `MAIN_EDIT`. Diagram row exists (IN_PROGRESS). Nothing was added to `haven/`.

## Seal gate
Not outward-facing (no commit, push or API call).

## Proportionality
3 one-line edits + 1 spec. Within node scope. Leaving the unchecked-with-cleared-date `0`/`NaN` case out is the right call (outside "current checked").

## Doctrine proposal
none

## Re-run
none — audit-only. Per "Re-run scope", missing citations / elided output → REOPEN, don't re-run.

## PM update
Row stays IN_PROGRESS (REOPEN). The verdict pointer was appended to the active row.

## For the next round
After SEAL, Behavior #2 in `doctrine/features/cv-timeline-sections.md` still says "Dates are sent as timestamps (ms)". The analyst/operator should add the null-when-current rule. A fix SEAL doesn't edit Behavior.
