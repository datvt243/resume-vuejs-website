# 2026-11-16 - issue-445-enddate-null-current — SEAL
- Worker: verifier · Version: 0.1.0
- Node: `issue-445-enddate-null-current` (`haven/diagrams/dev-loop.prime-mermaid.md`) → SEALED, archived to `dev-loop-archive.md`
- Note audited: `evidence/implementer/2026-11-16/issue-445-enddate-null-current-plan.md` (re-read from disk, REOPEN round 1 section)
- Previous verdict: `evidence/verifier/2026-11-16/issue-445-enddate-null-current-reopen.md`

## Verdict
SEAL

## Isolation proof
Round 2 resumed via coordinator SendMessage: "Round 2: re-read agent-hub/evidence/implementer/2026-11-16/issue-445-enddate-null-current-plan.md from disk (updated under "REOPEN round 1"), re-run verify_seal steps 2-12 ... (spawn=resumed)". This context holds only my own round-1 verdict, never the implementer's reasoning.

## Cited
| Criterion | Evidence in note | OK |
|---|---|---|
| 1 Experience `isCurrent` → `endDate: null` | spec passes (4 passed); fails with fix reverted | yes |
| 2 Education `isCurrent` → `endDate: null` | `PageEducation.spec.ts` passes; red with fix reverted (`…isCurrent: true }` AssertionError) | yes (round-1 gap closed) |
| 3 Project `isWorking` → `endDate: null` | `PageProject.spec.ts` passes; red with fix reverted (`…isWorking: true }` AssertionError) | yes (round-1 gap closed) |
| 4 Unchecked unchanged | else branch is the original expression; full suite green | yes |
| 5 Display safe | every `endDate` reader cited file:line, flag-gated | yes |
| 6 test / build / lint / typecheck | `58 passed` / `378 passed`; build tail verbatim ending `✓ built in 3.77s` (the old elided block is gone); lint exit 0; typecheck 78 ≤ baseline 78, 0 in touched files | yes |
| 7 comments per code-comments.md | no comments added or changed | yes |
| Feature doc | cv-timeline-sections.md cited; Open question 5 operator answer recorded | yes |
| Review | `## Review` present, inline, no findings | yes |
| Supersedes | `none`, grep cited | yes |

## Missing
none

## Forbidden states
None hit. Branch `fix/issue-445-timeline-sections-send` (not main/staging), so no `MAIN_EDIT`. Output not truncated. Commands match `doctrine/MEMORY.md`.

## Seal gate
Not outward-facing (no commit, push or API call). Backend acceptance of `endDate: null` was not checked live; the note says so.

## Proportionality
3 one-line edits + 3 specs (2 new). Within node scope.

## Doctrine proposal
none

## Re-run
none — audit-only. Note output is verbatim, commands match doctrine, and every criterion is covered.

## PM update
Active row archived, pointer swapped in, oldest pointer (`issue-370-language-in-settings`) dropped to keep 20. Fix SEAL leaves the feature doc Status as is. Follow-up for analyst/operator: Behavior #2 of `cv-timeline-sections.md` still says dates are always sent as ms. Add the null-when-current rule.
