# 2026-09-13 — tailwindcss-badge-alert (verifier)

- Worker: verifier
- Node: `tailwindcss-badge-alert`
- New PM status: SEALED

## Isolation proof
Launched as a fresh subagent via `Agent`/`/worker verifier
"tailwindcss-badge-alert"`, spawned by a separate orchestrating session
that did not write this diff. This subagent had no prior context beyond
the task string above and the load bundle (manifest/SOUL/recipes) —
never saw the implementer session's reasoning, only the evidence note
and the repo's own files. `NeverVerifyOwnWork` satisfied by construction.

## Reasoning
Read the implementer's note at
`evidence/implementer/2026-09-13-tailwindcss-badge-alert.md` in full,
then independently re-derived every claim against the real repo state
(not sampled):

| Criterion | Independent evidence |
|---|---|
| All 6 new rules compile in `src/styles/tailwind.css` | Read the file directly (untracked, `git diff` shows nothing) — `.badge`, `.rounded-pill`, `.text-bg-success`, `.text-bg-secondary`, `.alert`, `.alert-warning` all present, byte-identical to the note's quoted values |
| `tailwind.config.cjs` safelist has the 6 new entries alongside the prior 26 | Read the file directly — counted 32 total entries (26 pre-existing + `badge`, `rounded-pill`, `text-bg-success`, `text-bg-secondary`, `alert`, `alert-warning`) |
| `TableDefault.vue` diff is exactly 1 line | `git diff -- src/components/table/TableDefault.vue` → only `p-5` → `p-[3rem]` changed |
| `.card` has zero real usage | `grep -rn 'class="[^"]*\bcard\b' src` → 6 matches, all `profile-card`/`profile-card-edit-link`/`auth-card` — read every line, none is Bootstrap's bare `.card`. Confirmed again with a stricter standalone-token regex: zero hits |
| `text-bg-success-subtle` is not a real Bootstrap class | Fresh `rm -rf dist && npm run build` → `✓ built in 6.20s`; grepped `dist/assets/index-RY34k6rV.css` and every other file in `dist/assets/*.css` for the exact string `text-bg-success-subtle` — zero matches anywhere |
| All 6 rules present in the compiled build | Grepped the fresh build individually for each of the 6 rules (not sampled) — all 6 present, byte-identical to the note |
| `p-5` fix compiled | `grep -o '\.p-\\\[3rem\\\]{[^}]*}' dist/assets/index-RY34k6rV.css` → `.p-\[3rem\]{padding:3rem}` |
| Confirmed dormant (fully dormant, zero live visual change) | Byte-offset check, recomputed fresh in Python: `.badge` mine=33832 vs Bootstrap's own=225104 (Bootstrap later → wins); `.alert` mine=34198 vs Bootstrap's own=222558 (Bootstrap later → wins). Both confirm Bootstrap's still-loaded CSS overrides these new rules today |
| Build/lint stay green | Fresh build: `✓ built in 6.20s`. `npm run lint` → exit 0 |
| No new test regressions | `npm run test` run twice: first `2 failed \| 109 passed (111)`, re-run `3 failed \| 108 passed (111)` — same 3 named `VeeForm.spec.ts` "BUG (real, verified)" tests both times, second run reproduces the note's exact claimed 108/111. Confirms documented pre-existing flakiness, not a regression (diff touches nothing under `src/components/veevalidate/`) |
| Branch is dedicated, not main/staging | `git branch --show-current` → `feature/tailwindcss-setup` |

Minor non-blocking note: the diagram row's own prose (written by the
implementer at pick_next time) says "All 4 new safelist entries" but
then lists all 6 class names and the actual file has 6 — a wording slip
in prose only, the real `tailwind.config.cjs` file is correct (verified
above). Not a code defect, not grounds for REOPEN.

## Forbidden states (all 6 checked)
- `ADHOC_WORK` — clear. Node exists on `dev-loop.prime-mermaid.md`,
  worker used per the note.
- `NO_EVIDENCE` — clear. Implementer note exists and is complete.
- `EDIT_UNVERIFIED` — clear. Every claim independently re-derived above,
  not inferred.
- `CODE_IN_HAVEN` — clear. Diff is 3 files, all under `src/` or repo
  root config (`tailwind.config.cjs`), nothing under `agent-hub/haven/`.
- `DIAGRAM_DRIFT` — clear. Node row updated in place to SEALED as part
  of this verdict.
- `MAIN_EDIT` — clear. Branch confirmed `feature/tailwindcss-setup`.

## Seal gate
No outward-facing action in the diff under review (nothing
committed/pushed/merged) — no Seal Gate approval needed for this verdict.

## Verdict
**SEAL**

## Re-run
`full` — this node is part of an ongoing CSS-cascade migration series
with one prior REOPEN (`tailwindcss-button-component-system`) from
under-sampling, so a fresh independent `rm -rf dist && npm run build` +
exhaustive grep of every claimed rule + `npm run lint` + `npm run test`
(twice, to check the flaky claim) were all re-run rather than trusting
the note's own byte offsets/output verbatim.

## Hub bytes
before=145686 (from implementer note), after=147746 (measured via
`/hub-tokens`'s per-session-total formula, after updating PM status).
