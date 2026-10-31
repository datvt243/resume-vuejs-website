# 2026-10-31 — issue-355-education-major-min — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-355-education-major-min`
- Evidence reviewed: `evidence/implementer/2026-10-31-issue-355-education-major-min.md`

## Isolation proof
Separately spawned Agent subagent (not the implementer's `/todo` session), launched with the task string "fresh verifier subagent ... You did NOT write this diff — you were spawned specifically to verify it", invoking `/worker verifier "agent-hub/evidence/implementer/2026-10-31-issue-355-education-major-min.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
`doctrine/standards/code-comments.md` → Enforcement: "the evidence note's `## Acceptance` carries one row 'comments per code-comments.md' citing the touched comments (or 'no comments touched') ... Verifier: that row missing ... → REOPEN." The note's `## Acceptance` table has only criteria 1-3; it has no comments row. That also leaves the agent-hub CLAUDE.md "Every diff (1)" requirement unproven → `EDIT_UNVERIFIED`. The diff adds a new file (`src/models/education.model.spec.ts`), so whether it touched comments can't be assumed.

## Cited (OK)
- Branch: `fix/issue-355-education-major-min` off `staging` @ `77fec7f` (not main): no MAIN_EDIT.
- Commands match doctrine/MEMORY.md: test, build, lint, typecheck (90 = baseline, none in changed files).
- Output is quoted and not truncated. The 1 test failure is `VeeForm.spec.ts:287`, the known pre-existing #347.
- Criterion 1: the new spec rejects `'QA'` and accepts `'CNTT'`. Criterion 2: the vi and en strings for `validation.minChars` are both quoted.
- Diagram row is there (`sealed_pending_verifier`). Supersedes/Still open lines are there. Seal gate: none (no outward action). The diff is proportional, and the extra API-min findings are only listed under "Noticed, not done".

## Missing
- `## Acceptance` row "comments per code-comments.md" (cite the touched comments or "no comments touched").

## Forbidden hit
EDIT_UNVERIFIED (comments rule not evidenced)

## To fix
Add the comments row to the note's `## Acceptance` table (check the new spec file and model edit against code-comments.md), then re-run the verifier. Nothing else needs to change.

## PM status
Not updated (REOPEN; row stays `sealed_pending_verifier` per RatchetOnly).

## Re-run
none (audit-only; the note failed a documentary check, which the Re-run scope rules say to REOPEN on rather than re-run)
