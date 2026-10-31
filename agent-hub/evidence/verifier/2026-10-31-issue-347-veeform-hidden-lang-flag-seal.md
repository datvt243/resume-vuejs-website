# 2026-10-31 — issue-347-veeform-hidden-lang-flag — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-347-veeform-hidden-lang-flag`
- Evidence reviewed: `evidence/implementer/2026-10-31-issue-347-veeform-hidden-lang-flag.md`

## Isolation proof
A separate Agent subagent spawned from the implementer's `/todo` session, not that session itself. Its task string was "fresh verifier subagent ... You did NOT write this diff — you were spawned specifically to verify it ... Note the diff also rewrites two tests previously named 'BUG (real, verified)…' — judge whether the evidence for that ... justifies it being in scope". It ran `/worker verifier "agent-hub/evidence/implementer/2026-10-31-issue-347-veeform-hidden-lang-flag.md"`. This context has no memory of writing the diff.

## Verdict: SEAL

## Cited
- Branch: `fix/issue-347-veeform-hidden-lang-flag` off `staging` @ `84cd237`, not main, so no MAIN_EDIT. `git branch --show-current` agrees.
- Commands match doctrine/MEMORY.md: test, build, lint, typecheck. Typecheck is 90 errors, the same as the baseline, with 0 in `VeeForm.spec.ts`.
- Output is quoted and not truncated. Before: `expected 'VI' to contain '!'`, 1 failed. After: the file passed 19/19 five times, and `npm run test` passed 303/303 (50 files) three times.
- Criterion 1 (reliable pass): the 5/5 and 3/3 runs above.
- Criterion 2 (cause in the right place): the probe output shows the VI tab reads `"VI"` with no `border-danger` right after `flushPromises()`, and `"VI!"` plus `border-danger` after a 50 ms real-timer wait. The component flags correctly, so the fix belongs in the test. No `src/` component file changed (`git status` shows only the spec under `src/`).
- Criterion 3 (build, lint, typecheck): build `✓ built in 5.83s`, lint exit 0, typecheck at the baseline.
- Comments per code-comments.md: one 1-line why-comment was added (`// vee-validate debounces schema validation on a real timer, so flushPromises alone can assert too early`). It has no issue ref. Two multi-line comments were removed because they stated a conclusion the probe disproved, which the standard allows.
- The two rewritten "BUG (real, verified)" tests are in scope. The probe shows the same mechanism: submit `disabled` is `undefined` right after `flushPromises()` and `""` after 50 ms. So those tests also asserted before validation finished. They are flaky in the same way and in the same file, and they match the "2nd failure only under full-suite load" recorded in `2026-10-27-issue-312-visits-error-retry.md`. Leaving them would also break criterion 1's "npm run test passes 3 times in a row". This is not an untasked PROJECT.md trap, so SmallestDiff is respected.
- Supersedes: none. Still open: none. Seal gate: none (no commit, push or data write).

## Missing
none

## Forbidden hit
none

## Note for /ship
The working tree also has `.claude/commands/issues-ls.md` (modified) and `QC_TESTER.md` (untracked). Both were already there at session start and are not part of this node's diff. Keep them out of the #347 commit unless the operator wants them in.

## PM status
Collapsed on SEAL: the full row was appended to `haven/diagrams/dev-loop-archive.md` with state SEALED, and the active row was replaced in place with a pointer row. There are 14 pointer rows, under the 20 limit, so none were pruned.

## Re-run
none (audit-only. The note quotes its output in full, its commands match doctrine, and the change is not outward-facing.)
