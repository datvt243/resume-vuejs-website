# 2026-11-22 - issue-449-profile-stale-ids - SEAL

- Worker: verifier · Node: `issue-449-profile-stale-ids` · Branch cited: `fix/issue-449-cv-profiles-summary` (not main/staging)
- Verdict: **SEAL**
- Forbidden state: none (MAIN_EDIT clear; no outward-facing action, no seal gate needed)

## Cited
- Criterion 1 (counts ignore stale ids): diff row `PageProfile.vue` `countExisting` used by countSelected/summarize/modal x/y; feature doc Behavior #1 + Open question 2 answer (operator 2026-11-07).
- Criterion 2 (test fails without fix): spec passes with fix; without fix `Received: "2 items selected|2 experience"`, `1 failed (1)`.
- Criterion 3: `Test Files 65 passed (65)`, `Tests 419 passed (419)`; build `built in 3.85s`; lint exit 0; typecheck 78 errors (= baseline 78), `grep PageProfile` empty.
- Comments per code-comments.md: row present (one WHY comment).
- Feature doc line, Supersedes/Still open, Review sections present; commands match doctrine/MEMORY.md; output verbatim, not truncated.

## Missing
none

## Isolation proof
Spawned as fresh subagent via Agent tool, task: "Run /worker verifier ... #449 CV profiles: summary counts should ignore deleted entries" with hub path, note path and slug supplied by the parent; no implementer context.

## Doctrine proposal
none

## Re-run
none — audit-only; not outward-facing, note output verbatim and matches doctrine.
