# 2026-10-21 - issue-281-experience-add-type - SEAL
- Worker: verifier · Version: 0.1.0
- Node: `issue-281-experience-add-type` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence read: `evidence/implementer/2026-10-21-issue-281-experience-add-type.md`
- Round: REOPEN round 2 (prior verdict: `evidence/verifier/2026-10-21-issue-281-experience-add-type-reopen.md`, missing DESIGN.md §10 evidence)

## Isolation proof
Spawned as a fresh verifier subagent with task string "You are a fresh, isolated verifier subagent ... You did NOT write this diff ... This is REOPEN round 2" via `/worker verifier "agent-hub/evidence/implementer/2026-10-21-issue-281-experience-add-type.md"`; this context has no implementer turns.

## Verdict: SEAL

## Cited
- Branch `feature/issue-281-experience-add-type` (confirmed `git branch --show-current`). No MAIN_EDIT.
- Commands match doctrine/MEMORY.md: `npm run test`, `npm run build`, eslint on changed files, `Typecheck: CANNOT RUN` stated.
- Test: 272 passed / 1 failed; failure pre-existing on staging (same VeeForm test, 1 failed | 270 passed). New spec 2 tests pass.
- Build `✓ built in 3.60s`.
- Chooser first, form fits type, edit/duplicate skip chooser: `PageExperience.spec.ts`.
- i18n: 7 keys in vi + en.
- Comments: 2 one-line WHY comments.
- Round-1 gap closed (DESIGN.md §10): token grep on `PageExperience.vue` no output, exit 1 (re-confirmed locally, same result); keyboard pass recorded (focus trapped, visible outline, Enter on Career break reveals break form); 9 screenshots exist. I opened 4 of them (chooser 1440 light, chooser 375 dark, break 1440 dark, exp 375 dark): 2 cards side by side at 1440, stacked at 375, no overflow; break form shows "Add career break" title, break type select, "I am currently on this break"; experience form shows company/position. Login handled by mocked API routes, no real API call.
- Seal gate: no commit/push.

## Missing
none

## Forbidden hit
none

## Re-run
partial — re-ran only the DESIGN.md §10 token grep (cheap, one command) and `git branch --show-current`; no build/test re-run.

## Notes
- Screenshots live in the session scratchpad (not committed); fine for this check, gone after the session.
- At 375 a browser-extension overlay sits over the Save button in the screenshot; implementer flagged it as non-app UI.
