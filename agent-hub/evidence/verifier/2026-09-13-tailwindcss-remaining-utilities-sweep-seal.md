# 2026-09-13 — tailwindcss-remaining-utilities-sweep — SEAL

- Worker: verifier
- Node: `tailwindcss-remaining-utilities-sweep`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row 170 — status column
  changed IN_PROGRESS → SEALED, findings appended to the END of the
  row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Spawned as a fresh subagent specifically to re-verify this node after a
prior REOPEN — the spawn prompt states verbatim: "You are a fresh,
isolated subagent re-verifying this node... A separate implementer
session applied this correction, not you — NeverVerifyOwnWork satisfied
by construction." This session's first actions were loading the
verifier bundle (manifest.yaml, SOUL.md, recipes/verify_seal.md) fresh,
then reading the prior REOPEN verdict and the implementer's corrected
note — it wrote no part of either the original diff or the correction.
`NeverVerifyOwnWork` satisfied.

## Reasoning
This is a re-verification after an evidence-note-only correction (no
code changed since the prior REOPEN) — per the task's own scope,
re-ran only the specific correction check plus a fresh sanity sweep,
not the full exhaustive class sweep the prior REOPEN pass already did:

1. **The corrected claim, independently reproduced**:
   ```
   grep -c "border-\[var(--bs-border-color)\]" src/components/global/Heading.vue src/pages/_layouts/Header.vue src/pages/_layouts/Footer.vue src/components/global/ItemTemplate.vue
   ```
   returned `Heading.vue:1`, `Header.vue:1`, `Footer.vue:1`,
   `ItemTemplate.vue:0` — exactly 1,1,1,0, matching the corrected
   "Affects: 3 files, not `ItemTemplate.vue`" claim in the implementer's
   `## CORRECTION` section exactly.
2. **Read `ItemTemplate.vue`'s current full content directly** (not
   inferred from the note): confirmed line 48
   `.item.border.rounded(class="p-[1.5rem]")` and line 62
   `div.border-start.border-success(class="ps-[1rem] mb-[1.5rem]")` are
   both bare, unrenamed Bootstrap classes — no
   `border-[var(--bs-border-color)]` anywhere in the file, and none
   should be present since nothing here was renamed. This was always
   true; only the prior note's prose incorrectly claimed the fix
   applied here. The code itself needed no change and received none.
3. **Fresh sanity sweep** (per task instruction — confirm the
   evidence-note-only edit didn't coincide with any other change):
   - `rm -rf dist && npm run build` → `✓ built in 5.99s`, only the
     pre-existing "chunks larger than 500 kB" warning. Green.
   - `npm run lint` → exit 0, no output beyond the command header.
     Clean.
   - `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
     failed | 108 passed (111)`. All 3 failures are in
     `VeeForm.spec.ts` (`clicking submit on a pristine form calls
     submitFn anyway...` and `BUG (real, verified): clicking submit
     after touching+clearing a required field still calls submitFn` —
     2 of the 3 named tests shown in the trimmed output), matching the
     documented flaky set from `doctrine/MEMORY.md`/prior nodes. No new
     failures outside that file. Within the expected 108-111 range.
4. **Forbidden states** (all 6 checked):
   - `ADHOC_WORK` — node exists on `dev-loop.prime-mermaid.md`
     (row 170), evidence notes exist for both implementer and prior
     verifier passes. Clear.
   - `NO_EVIDENCE` — implementer note (with correction) and prior
     REOPEN note both exist and were read. Clear.
   - `EDIT_UNVERIFIED` — independently re-ran the grep, read the file,
     and ran build/lint/test myself rather than trusting either note's
     claims. Clear.
   - `CODE_IN_HAVEN` — `find agent-hub/haven -name "*.vue" -o -name
     "*.ts" -o -name "*.js"` returned no results. Clear.
   - `DIAGRAM_DRIFT` — diagram row was at IN_PROGRESS pending this
     verdict; updated to SEALED as part of this pass, in place. Clear.
   - `MAIN_EDIT` — `git branch --show-current` → `feature/tailwindcss-setup`,
     not `main`/`staging`. Clear (`NoMainEdit` satisfied).
5. **Seal gate**: no outward-facing action here (no commit/push/merge
   in this verifier pass) — nothing to gate.

## Missing
None. The single defect the prior REOPEN cited (the note's "Affects"
list wrongly including `ItemTemplate.vue`) has been corrected in the
implementer's note, and the correction is independently confirmed
against the actual current file content and a fresh grep, not just
re-read from the note's prose.

## Re-run
`partial` — reason: no code changed since the prior REOPEN (only the
evidence note's prose was corrected), so the prior REOPEN pass's full
4-part exhaustive class sweep and `flex-shrink-0`/`flex-grow-1`
asymmetry check were not re-run (already passed, nothing since touched
code, per this task's own scope instruction). Re-ran: the specific
`grep -c` correction check, a full read of `ItemTemplate.vue`, and a
fresh `rm -rf dist && npm run build` + `npm run lint` + `npm run test`
sanity sweep — all from scratch in this session.

## Hub bytes
before=161549 (per task instruction, using the prior REOPEN verifier's
logged `hub_bytes_after` as the most recent true baseline) ·
after=163563 (measured via the same categories as before: root=12569,
doctrine=27207, active diagram=97670, implementer bundle=14963,
verifier bundle=11154; diagram grew from this SEAL's own findings being
appended to the node's row).
