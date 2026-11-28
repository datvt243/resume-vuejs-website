# 2026-11-28 - verdict: SEAL - issue-525-home-general-info-fetch

- Worker: verifier · Node: `issue-525-home-general-info-fetch` · Note: `evidence/implementer/2026-11-28/issue-525-home-general-info-fetch-plan.md`
- Branch named: `fix/issue-525-dashboard-shows-wrong` (not main/staging) - no MAIN_EDIT.

## Cited
- Criteria 1-5 each have evidence: diff row (useCandidate call), new spec that fails with the fix reverted and passes with it (1 failed|11 passed, then 12 passed), live check on QA account (not owner) with the single general-information request and 70% 7/10, full test 528 passed, lint exit 0, build built, typecheck 74 <= baseline 75 with the 6 errors in useProfileCompletion.ts identical on base (none new).
- Commands match doctrine/MEMORY.md (test, lint, typecheck, build). Output verbatim, not cut.
- Feature doc line present (home-overview.md, Behavior #2/#4, unchanged); Review present, no findings; Supersedes none; comment row satisfied; seal gate none (no outward action).
- Proportionality: 2 lines + 1 test, matches the node.

## Missing
none

## Forbidden state
none

## Isolation proof
Spawned as a fresh subagent via the Agent tool, description "verify issue-525" style task from /todo ("You are a fresh verifier subagent launched by /todo (blank context...)"); blank context, did not write the diff.

## Re-run
none - audit-only; not an outward-facing node.

## Doctrine proposal
none
