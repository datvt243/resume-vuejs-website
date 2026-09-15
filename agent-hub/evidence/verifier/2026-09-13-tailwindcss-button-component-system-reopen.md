# 2026-09-13 — tailwindcss-button-component-system — REOPEN

- Worker: verifier
- Node: `tailwindcss-button-component-system`
- New PM status: IN_PROGRESS (unchanged — REOPEN does not advance the
  ratchet)

## Isolation proof
This verifier pass was launched by the operator as a brand-new subagent
via `/worker verifier "tailwindcss-button-component-system"`. This
session's context has no memory of writing the implementer diff or note
under review — `evidence/implementer/2026-09-13-tailwindcss-button-
component-system.md` was read cold from disk this turn, not carried over
from any prior turn. `NeverVerifyOwnWork` satisfied by construction.

## Reasoning
Read the implementer's note, then independently re-derived every claim
rather than trusting the note's numbers, per the operator's explicit
instruction to re-derive (not just audit) this node's central safety
claims.

| Criterion | Independent evidence |
|---|---|
| Branch (`NoMainEdit`) | `git branch --show-current` → `feature/tailwindcss-setup` (not `main`/`staging`) |
| Only 1 file touched by this node | `src/styles/tailwind.css` is untracked (`??`) on this branch — `grep -l "tailwind.css" evidence/implementer/*.md` shows only `tailwindcss-setup` (node 1, created the file with just the 3 `@tailwind` directives — confirmed by reading that note's Diff table) and this node reference it; no node 2-5 evidence note touches it. Current file content (`tail -220 src/styles/tailwind.css`) matches the note's described `@layer components` block verbatim (`.btn`/`.btn-sm`, 8-color solid+outline variants, `.btn-group`, `.dropdown-toggle::after`/`-split`). `git status --porcelain` repo-wide shows no other file newly touched beyond what nodes 1-5 already had pending. |
| All 10 `var(--bs-*)` names real | Fresh `rm -rf dist && npm run build` → `✓ built in 5.71s`. Grepped compiled `dist/assets/index-94wzc1a1.css` for definitions: `--bs-primary: #0d6efd`, `--bs-secondary`, `--bs-success`, `--bs-danger`, `--bs-warning`, `--bs-light`, `--bs-dark`, `--bs-info`, `--bs-border-radius`, `--bs-border-radius-sm` — all 10 confirmed defined at `:root`. |
| `grep -rl "btn-check" src` → zero real usages | Literal `grep -rl "btn-check" src` now returns `src/styles/tailwind.css` — but checked the match: both hits (lines 23, 220) are inside this node's OWN code comments explaining the disclosed `.btn-group` simplification, not actual usage of the pattern. Re-ran scoped to consumer file types only: `grep -rl "btn-check" src --include="*.vue" --include="*.js" --include="*.ts"` → zero matches, exit 1. Substantive claim holds. |
| Lint clean | `npm run lint` → exit 0, no output (clean). |
| Test — same pre-existing pattern | `npm run test` → `Test Files 1 failed \| 15 passed (16)`, `Tests 3 failed \| 108 passed (111)`, matching the note. All 3 failures are inside `VeeForm.spec.ts`, same named tests as node 5's verifier note documented as pre-existing/flaky ("typing then clearing a required field...", "clicking submit on a pristine form...", "clicking submit after touching+clearing..."). This diff touches nothing under `src/components/veevalidate/` — unrelated. |
| **Dormant / zero live visual change** — claim checked for the rules that DO exist | For the 9 of 16 color-rule-pairs that actually compiled (see below), byte-offset comparison in `dist/assets/index-94wzc1a1.css` confirms this node's rule always appears EARLIER (e.g. `.btn-danger{` at byte 29632 vs Bootstrap's own at 183196; `.btn-outline-danger{` at 30495 vs 187039; `.btn-secondary{` at 29176 vs 181314; `.btn-success{` at 29410 vs 181788) — Bootstrap's still lands LATER and wins the cascade today. **This part of the note's claim is TRUE for the variants that exist.** |

## A defect the note's own check missed — REOPEN reason
The note verified "the new rules actually compiled" by checking exactly
ONE selector: `.btn-outline-danger`. Re-deriving this independently
across **all 16** color-rule-pairs (8 solid + 8 outline) that this node
claims to add, both in the final bundled `dist/assets/index-*.css` and in
raw `npx tailwindcss -i src/styles/tailwind.css -o ... --config
tailwind.config.cjs` output (i.e. before Vite/Bootstrap merge or
minification touch it — isolating this to Tailwind's own `@layer
components` processing), **7 of the 16 new rules never compile into a
distinct CSS rule at all — they are silently dropped**:

- Solid variants MISSING (verified absent, not just "later in cascade"):
  `.btn-primary`, `.btn-warning`, `.btn-info`, `.btn-light`, `.btn-dark`
- Outline variants MISSING: `.btn-outline-light`, `.btn-outline-dark`
- Solid variants that DO survive: `.btn-secondary`, `.btn-success`,
  `.btn-danger`
- Outline variants that DO survive: `.btn-outline-primary`,
  `.btn-outline-secondary`, `.btn-outline-success`, `.btn-outline-danger`,
  `.btn-outline-warning`, `.btn-outline-info`

Reproduced independently 3 ways:
1. `grep -o "\.btn-primary{[^}]*}" dist/assets/index-*.css` → only
   Bootstrap's own `--bs-btn-*` rule, no `background-color:var(--bs-
   primary)` rule anywhere in the 224KB compiled file.
2. Same absence confirmed in raw `npx tailwindcss` CLI output
   (`tw-out.css`, 1179 lines) — `grep -n "btn-warning"` returns zero
   hits anywhere in the file, not even inside the `color: #fff`/`color:
   #000` comma-grouped selector remnant.
3. **Isolated minimal repro**, unrelated to this file's specific colors —
   a 15-line test CSS with the same shape (`.a, .b, .c { color: #fff }`
   followed by individual `.b { background: blue }` then `.a {
   background: red }`) run through the exact same `tailwindcss`/config
   reproduces the pattern: `.b`'s override survives, `.a`'s does not
   (`.a` was declared LAST among the trio in source but its override
   also came LAST among the individual per-selector rules — same
   position pattern as the real file's `.btn-primary`/`.btn-dark`
   losses). This is a real Tailwind v3 JIT `@layer components`
   compilation defect (or at minimum an unsafe pattern this project's
   CSS structure triggers), not a fluke of this specific file, not a
   minifier artifact, and not something the note's single-selector spot
   check could have caught.

**Consequence**: the note's own stated activation plan is that these
rules go live once Bootstrap's own button CSS is removed at the final
migration node. At that point, any `.btn-primary`, `.btn-warning`,
`.btn-info`, `.btn-light`, `.btn-dark`, `.btn-outline-light`, or
`.btn-outline-dark` button in the app would fall back to the bare `.btn`
base rule only (`background-color: transparent; border: 1px solid
transparent`) — i.e. an invisible/unstyled button — not the "vừa đủ"
color fidelity the operator explicitly approved. This is a real,
reproducible correctness gap in the diff, currently masked only by the
fact that it's dormant (Bootstrap is still covering for it), exactly the
kind of thing a full compile-check across all variants (not one) would
have caught before merge.

## Forbidden states scan
`ADHOC_WORK` no (node exists on diagram, already IN_PROGRESS).
`NO_EVIDENCE` no (note exists, read). `EDIT_UNVERIFIED` — **partial hit**:
the note's claim "verified the new rules actually compiled" was only
checked for 1 of 16 variants and does not hold generally; see above.
`CODE_IN_HAVEN` no. `DIAGRAM_DRIFT` no (row left at IN_PROGRESS, matching
this REOPEN — not advanced). `MAIN_EDIT` no (branch confirmed above).

## Seal gate
None required — no outward-facing action was taken; nothing to approve.

## Missing
- A build/compile check covering **all 16** color-rule-pairs (not 1),
  showing each one lands as a distinct rule containing its intended
  `var(--bs-{color})` declaration, in the actual compiled CSS.
- A fix for the 7 currently-dropped rules (`.btn-primary`, `.btn-warning`,
  `.btn-info`, `.btn-light`, `.btn-dark`, `.btn-outline-light`,
  `.btn-outline-dark`) — likely requires restructuring the `@layer
  components` block so these selectors aren't only reachable through a
  shared comma-group followed by a separate individual-selector rule
  (the exact shape that reproduced the drop in the isolated test above).
- Re-verification after the fix, across all 16 variants, before this node
  can SEAL.

## Verdict
**REOPEN**

## Re-run
`full` — re-ran `rm -rf dist && npm run build` from scratch, `npm run
lint`, `npm run test`, plus an out-of-band raw `npx tailwindcss` CLI
compile and an isolated minimal repro CSS file. Reason: the operator's
task explicitly asked for independent re-derivation of this node's
central safety claim (not just an audit of the note), and doing that
re-derivation exhaustively (all 16 variants, not the note's 1-selector
sample) is what surfaced the real compilation defect above — a build-only
audit of the note as written would have missed it.
