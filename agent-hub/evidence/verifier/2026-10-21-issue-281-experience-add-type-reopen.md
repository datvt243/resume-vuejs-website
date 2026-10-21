# 2026-10-21 - issue-281-experience-add-type - REOPEN
- Worker: verifier · Version: 0.1.0
- Node: `issue-281-experience-add-type` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence read: `evidence/implementer/2026-10-21-issue-281-experience-add-type.md`

## Isolation proof
Spawned as a fresh verifier subagent with task string "You are a fresh, isolated verifier subagent ... You did NOT write this diff" via `/worker verifier "agent-hub/evidence/implementer/2026-10-21-issue-281-experience-add-type.md"`; this context has no implementer turns.

## Verdict: REOPEN

## Cited (OK)
- Branch `feature/issue-281-experience-add-type`, not main/staging (confirmed `git branch --show-current`). No MAIN_EDIT.
- Commands match doctrine/MEMORY.md: `npm run test`, `npm run build`, lint on changed files, `Typecheck: CANNOT RUN` stated.
- Test: 272 passed, 1 failed; failure shown pre-existing on base staging (1 failed | 270 passed, same VeeForm test). New spec 2 tests pass.
- Build `✓ built in 3.60s`.
- Chooser-first, type-fitting form, edit/duplicate skip chooser: covered by `PageExperience.spec.ts`.
- i18n 7 keys in vi + en.
- Comments: 2 one-line WHY comments claimed.
- Seal gate: no commit/push, none needed.

## Missing
- The issue's second half is "design lại UI phù hợp với experience hay career break" — a UI redesign. Project CLAUDE.md requires UI work to follow `DESIGN.md` §10 Definition of done. The note cites none of it: no token grep (`#hex`/arbitrary px/opacity) on the changed `.vue`, no keyboard/focus pass on the new 2-card chooser, no screenshots at 1440 light / 1440 dark / 375 dark. The note itself says "visual styling of the cards is unverified on screen" (spec stubs Modal/VeeForm). The UI half of the acceptance has no citable evidence → `EDIT_UNVERIFIED`.

## To fix
Add to the evidence note: DESIGN.md §10 token grep output on `PageExperience.vue`; keyboard pass on the chooser (cards are focusable buttons, visible focus); screenshots of the chooser + both form variants at the 3 required sizes. If login is the blocker, mount the page in dev with a stubbed auth/candidate store or ask the operator for a test account — and say which was used.

## Forbidden hit
`EDIT_UNVERIFIED` (UI half of acceptance)

## Re-run
none — audit-only; note was complete enough to judge, gap is missing evidence, not a broken command.
