# 2026-09-13 — tailwindcss-color-utilities — SEAL

- Worker: verifier
- Node: `tailwindcss-color-utilities`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row 176 — status column
  changed IN_PROGRESS → SEALED, findings appended to the END of the
  row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Spawned as a fresh, isolated subagent specifically to re-verify this
node after a prior REOPEN — the spawn prompt states verbatim: "You are
a fresh, isolated subagent RE-verifying node `tailwindcss-color-utilities`
... A separate implementer session applied the correction, not you —
NeverVerifyOwnWork satisfied by construction." This session's first
actions were reading `manifest.yaml`/`SOUL.md`/`recipes/verify_seal.md`
fresh, then reading the prior REOPEN verdict and the implementer's
evidence note (with its appended `## CORRECTION` section) before
touching any diff content — it wrote no part of either the original
diff or the correction. `NeverVerifyOwnWork` satisfied.

## Reasoning
This is a re-verification after an evidence-note-only correction (no
code changed since the prior REOPEN) — per the task's own scope and the
established precedent (`2026-09-13-tailwindcss-remaining-utilities-sweep-seal.md`),
ran a `partial` re-run: the specific corrected claim plus a fresh
sanity sweep, not the prior REOPEN's full exhaustive class sweep:

1. **The corrected claim, independently reproduced**:
   ```
   grep -rlE '\b(text-primary|text-success|text-info|text-warning|text-danger|border-success|border-danger|bg-body-tertiary)\b' src --include="*.vue" | wc -l
   ```
   → `20`
   ```
   grep -rnE '\b(text-primary|text-success|text-info|text-warning|text-danger|border-success|border-danger|bg-body-tertiary)\b' src --include="*.vue" | wc -l
   ```
   → `27`
   ```
   grep -l "text-danger" src/components/veevalidate/part/Frm*.vue | wc -l
   ```
   → `9`
   All three match exactly the counts the implementer's `## CORRECTION`
   section states (20 files, 27 occurrences, 9 of the `Frm*.vue`
   partials). The note's corrected headline is accurate.
2. **Confirmed no code changed since the prior REOPEN**: `git status
   --short` shows `tailwind.config.cjs` and `src/styles/tailwind.css`
   still untracked (`??`, part of the ongoing uncommitted migration
   branch, unchanged in kind since the prior pass). Read both files'
   relevant sections directly rather than trusting the note's prose:
   `src/styles/tailwind.css` lines 762-820 contain the exact 8 dormant
   rules in the `@layer components` block
   (`.text-primary{color:var(--bs-primary)}` …
   `.bg-body-tertiary{background-color:var(--bs-tertiary-bg)}`),
   byte-for-byte identical to what the prior REOPEN pass already
   reviewed and quoted. `tailwind.config.cjs` lines 100-107: all 8
   classes present in the safelist, unchanged. No diff in the CSS/JS
   substance — only the implementer's evidence-note text was edited
   between the two passes, exactly as the task described.
3. **Fresh sanity sweep**:
   - `rm -rf dist && npm run build` → `✓ built in 4.69s`, only the
     pre-existing "chunks larger than 500 kB" warning. Green, verbatim
     output read in full, not truncated.
   - `npm run lint` → exit 0, no output beyond the npm command header.
     Clean.
   - `npm run test` → `Test Files 16 passed (16)`, `Tests 111 passed
     (111)` — full green this run, no `VeeForm.spec.ts` flakiness
     surfaced (within/above the documented 108-111/111 band; no
     failures anywhere, which is not a regression signal).
4. **Forbidden states** (all 6 checked):
   - `ADHOC_WORK` — node exists on `dev-loop.prime-mermaid.md` (row
     176), both implementer and prior-verifier evidence notes exist.
     Clear.
   - `NO_EVIDENCE` — implementer note (with `## CORRECTION`) and prior
     REOPEN note both exist and were read first, per `EvidenceOnly`.
     Clear.
   - `EDIT_UNVERIFIED` — independently re-ran the 3 corrected-claim
     greps, read both source files directly, and ran build/lint/test
     myself rather than trusting either note's prose. Clear.
   - `CODE_IN_HAVEN` — `find agent-hub/haven -name "*.vue" -o -name
     "*.ts" -o -name "*.js" -o -name "*.sh"` returned zero matches.
     Clear.
   - `DIAGRAM_DRIFT` — row was at IN_PROGRESS pending this verdict;
     updated to SEALED as part of this pass, in place, findings
     appended to the end. Clear.
   - `MAIN_EDIT` — `git branch --show-current` →
     `feature/tailwindcss-setup`, not `main`/`staging`. Clear
     (`NoMainEdit` satisfied).
5. **Seal gate**: no outward-facing action in this diff or this
   verifier pass (no commit/push/merge) — nothing to gate.

## Missing
None. The single defect the prior REOPEN cited (the note's headline
"~20 usages across 14 files" contradicting its own itemized per-class
list, and "6 of the `Frm*.vue` partials" undercounting) has been
corrected in the implementer's `## CORRECTION` section, and both
corrected numbers are independently reproduced here against the real
repo state, not re-read from the note's prose. The underlying code
(8 dormant `@layer components` rules + 8-class safelist, zero consumer
edits) was already independently verified sound by the prior REOPEN
pass and is confirmed unchanged since.

## Re-run
`partial` — reason: no code changed since the prior REOPEN (only the
evidence note's prose was corrected), so the prior REOPEN pass's full
survey re-grep, Bootstrap-source `!important` reads, `--bs-*` scoping
check, cascade-mechanics reasoning, and compiled-CSS byte-offset
dormancy check were not re-run (already independently confirmed there,
nothing since touched code, per this task's own scope instruction and
the established precedent from the `tailwindcss-remaining-utilities-sweep`
node). Re-ran: the 3 specific corrected-claim greps, a direct read of
the relevant sections of both `tailwind.config.cjs` and
`src/styles/tailwind.css`, and a fresh `rm -rf dist && npm run build` +
`npm run lint` + `npm run test` sanity sweep — all from scratch in this
session.

## Hub bytes
before=182857 (from the prior REOPEN verifier's logged `hub_bytes_after`)
· after=184119 (measured via the same categories as prior notes:
root=12569, doctrine=27207, active diagram=118226 (grew from this
node's REOPEN findings having been appended to its row since the prior
snapshot), implementer bundle=14963, verifier bundle=11154; diagram
status updated IN_PROGRESS → SEALED as part of this pass, findings
appended after this bytes measurement).
