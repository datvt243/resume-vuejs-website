# 2026-09-13 — tailwindcss-spinner-border — SEAL

- Worker: verifier
- Node: `tailwindcss-spinner-border`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row 178 — status column
  changed IN_PROGRESS → SEALED, findings appended to the END of the
  row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Spawned as a fresh, isolated subagent specifically to re-verify this
node after a prior REOPEN — the spawn prompt states verbatim: "You are
a fresh, isolated subagent RE-verifying node `tailwindcss-spinner-border`
... A separate implementer session applied the correction, not you —
NeverVerifyOwnWork satisfied by construction." This session's first
actions were reading `manifest.yaml`/`SOUL.md`/`recipes/verify_seal.md`
fresh, then reading the prior REOPEN verdict
(`evidence/verifier/2026-09-13-tailwindcss-spinner-border-reopen.md`)
and the implementer's evidence note with its appended `## CORRECTION`
section before touching any diff content — it wrote no part of either
the original diff or the correction. `NeverVerifyOwnWork` satisfied.

## Reasoning
This is a re-verification after a mechanism-explanation correction (no
CSS rule values/safelist changed since the prior REOPEN — only the
`tailwind.css` comment and the evidence note's prose were corrected).
Per this task's own scope and the hub's established precedent
(`2026-09-13-tailwindcss-remaining-utilities-sweep-seal.md`,
`2026-09-13-tailwindcss-color-utilities-seal.md`), ran a `partial`
re-run: the specific corrected claim plus a fresh sanity sweep, not the
prior REOPEN's full exhaustive class sweep:

1. **The corrected comment, read directly** (`src/styles/tailwind.css`
   lines 821-858): now states plainly that dormancy is "NOT because of
   any real CSS `@layer` at-rule surviving into the compiled output
   (verified: `grep -c '@layer' dist/assets/index-*.css` → 0 —
   Tailwind v3's `@layer components`/`@layer utilities` are a
   BUILD-TIME bucketing instruction only ... never emitted as actual
   `@layer` CSS)" and that "the real mechanism is ordinary
   last-rule-wins cascade by plain source order: `main.ts` imports
   `tailwind.css` BEFORE `bootstrap.scss` ... a real but
   ORDER-DEPENDENT outcome, not an inherent guarantee," explicitly
   disclosing "if `main.ts`'s import order were ever reversed, this
   rule ... would flip live immediately." The false "regardless of
   source order" claim the prior REOPEN caught is gone; the corrected
   text matches the required fix verbatim in substance.
2. **Verified the two cited facts myself, not trusted from the
   comment**:
   - `rm -rf dist && npm run build` → `✓ built in 5.21s`, only the
     pre-existing chunk-size warning. `grep -c '@layer'
     dist/assets/index-BatHk9I_.css` → `0` (grep's exit code 1 here is
     expected/correct — it means zero matches, not a command failure).
     Zero native `@layer` at-rules in the compiled bundle, confirmed
     fresh.
   - `src/main.ts` read directly (lines 20-30): `import
     './styles/tailwind.css'` (line 29) appears before `import
     './styles/bootstrap.scss'` (line 36, under the `/** import
     bootstrap */` comment) — confirmed with my own read, not the
     note's line numbers.
3. **Confirmed the CSS rule values, class names, and safelist are
   UNCHANGED since the prior REOPEN** (`git status --short` still
   shows `tailwind.config.cjs` and `src/styles/tailwind.css` as
   untracked (`??`), part of the same uncommitted migration branch —
   no tracked diff exists to diff against, so read the relevant
   sections directly instead): `src/styles/tailwind.css` lines 859-878
   — `.spinner-border{display:inline-block;width:2rem;height:2rem;
   vertical-align:-0.125em;border-radius:50%;border:0.25em solid
   currentcolor;border-right-color:transparent;animation:spinner-border
   0.75s linear infinite}`, `.spinner-border-sm{width:1rem;height:1rem;
   border-width:0.2em}`, `@keyframes spinner-border{to{transform:
   rotate(360deg)}}` — byte-for-byte identical to what both the
   original implementer note and the prior REOPEN pass already quoted
   and verified against Bootstrap's real compiled CSS. `tailwind.config.cjs`
   lines 108-111: `'spinner-border'`/`'spinner-border-sm'` both still
   present in the safelist, unchanged. Only the comment block
   (lines 821-858) and the evidence note's prose were edited — confirmed
   no rule-value or safelist drift.
4. **Fresh sanity sweep, all re-run myself**:
   - `rm -rf dist && npm run build` → `✓ built in 5.21s`, only the
     pre-existing "chunks larger than 500 kB" warning. Green, verbatim
     output read in full, not truncated.
   - `npm run lint` → exit 0, no output beyond the npm command header.
     Clean.
   - `npm run test` → `Test Files 16 passed (16)`, `Tests 111 passed
     (111)` — full green this run, no `VeeForm.spec.ts` flakiness
     surfaced (within/above the documented 108-111/111 band; no
     failures anywhere, not a regression signal).
5. **Forbidden states** (all 6 checked):
   - `ADHOC_WORK` — node exists on `dev-loop.prime-mermaid.md` (row
     178), implementer note (+ `## CORRECTION`) and prior REOPEN note
     both exist. Clear.
   - `NO_EVIDENCE` — both notes read first, per `EvidenceOnly`. Clear.
   - `EDIT_UNVERIFIED` — independently re-ran the `@layer` grep, read
     `src/main.ts` and both CSS/config files directly, and ran
     build/lint/test myself rather than trusting either note's prose.
     Clear.
   - `CODE_IN_HAVEN` — `find agent-hub/haven -name "*.vue" -o -name
     "*.ts" -o -name "*.js" -o -name "*.sh"` returned zero matches.
     Clear.
   - `DIAGRAM_DRIFT` — row was at IN_PROGRESS pending this verdict;
     updated to SEALED as part of this pass, in place, findings
     appended to the end. Clear.
   - `MAIN_EDIT` — `git branch --show-current` →
     `feature/tailwindcss-setup`, not `main`/`staging`. Clear
     (`NoMainEdit` satisfied).
6. **Seal gate**: no outward-facing action in this diff or this
   verifier pass (no commit/push/merge) — nothing to gate.

## Missing
None. The prior REOPEN's sole defect — the note (and mirrored
`tailwind.css` comment) claiming dormancy holds "per the CSS Cascade
Layers spec ... regardless of ... source order" when no real `@layer`
at-rule exists in the compiled output at all — is corrected in both
the `tailwind.css` comment and the implementer note's `##
CORRECTION` section, and the corrected mechanism (Tailwind v3 emits no
native `@layer`; dormancy is `main.ts` import-order-dependent
last-rule-wins cascade, explicitly disclosed as fragile) is
independently reproduced here against the real repo state, not
re-read from either note's prose. The underlying technical decision —
flattened values numerically correct, safelist entries correct, zero
consumer-file edits, `.spinner-grow` correctly left unbuilt,
build/lint/test all green — was already sound per the prior REOPEN
pass and is confirmed unchanged since.

## Re-run
`partial` — reason: no CSS rule values, class names, or safelist
changed since the prior REOPEN (only the `tailwind.css` comment and
the evidence note's prose were corrected), so the prior REOPEN pass's
full survey re-grep, Bootstrap-source value comparison, and
compiled-CSS byte-offset dormancy/coexistence check were not re-run
(already independently confirmed there, nothing since touched CSS
values), per this task's own scope instruction and the established
precedent from `tailwindcss-color-utilities`/
`tailwindcss-remaining-utilities-sweep`. Re-ran: a direct read of the
corrected `tailwind.css` comment block, a direct read of `src/main.ts`'s
import order, a fresh `rm -rf dist && npm run build` +
`grep -c '@layer' dist/assets/index-*.css` (→ 0) +
`npm run lint` + `npm run test` sanity sweep, and a direct re-read of
the `.spinner-border`/`.spinner-border-sm` rule block and the
`tailwind.config.cjs` safelist entries to confirm no value drift —
all from scratch in this session.

## Hub bytes
before=187491 (from the prior REOPEN verifier's logged
`hub_bytes_after`) · after=188690 (measured via the `/hub-tokens`
methodology, same 5 session categories: root=12393, doctrine=27207,
active diagram=122973 (grew from the implementer's post-REOPEN
`## CORRECTION`-mirroring text having been appended to this node's row
since the REOPEN snapshot), implementer bundle=14963, verifier
bundle=11154; diagram status updated IN_PROGRESS → SEALED as part of
this pass, findings appended after this bytes measurement, so the
final on-disk row is slightly larger than the 188690 figure above —
consistent with how every prior SEAL note in this hub reports the
pre-append total).
