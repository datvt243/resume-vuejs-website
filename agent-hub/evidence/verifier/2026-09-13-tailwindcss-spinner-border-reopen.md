# 2026-09-13 — tailwindcss-spinner-border — REOPEN

- Worker: verifier
- Node: `tailwindcss-spinner-border`
- New PM status: REOPEN (diagram row left at IN_PROGRESS, unchanged —
  `verify_seal.md` step 11 only updates PM status on SEAL)

## Isolation proof
Spawned as a fresh, isolated subagent whose task description states
verbatim: "You are a fresh, isolated subagent verifying node
`tailwindcss-spinner-border` ... A separate implementer session wrote
this diff, not you — NeverVerifyOwnWork satisfied by construction."
This session's first actions were reading `manifest.yaml`/`SOUL.md`/
`recipes/verify_seal.md` fresh, then reading the implementer's evidence
note before touching any diff content — it wrote no part of the diff
under review. `NeverVerifyOwnWork` satisfied.

## Reasoning
Read the implementer's note FIRST (`EvidenceOnly`), then independently
re-derived every claim against the real repo state, not the note's
prose:

1. **Branch**: `git branch --show-current` → `feature/tailwindcss-setup`
   — not `main`/`staging`. `NoMainEdit` satisfied.
2. **Scoped diff / no consumer edits**: `tailwind.config.cjs` and
   `src/styles/tailwind.css` are both untracked (`??`). `git diff --
   src/components/Spinner.vue` shows only pre-existing changes from an
   earlier node (`visually-hidden`→`sr-only`, `mt-3`→`mt-[1rem]`,
   `fw-semibold`→`font-semibold`, `small`→`text-sm`) — the
   `class="spinner-border spinner-border-sm text-success"` string and
   the scoped `.countdown-ring .spinner-border` override are untouched
   in both the working tree and this node's diff. Zero consumer-file
   edits for this node, confirmed.
3. **Sole consumer + `.spinner-grow` unused, re-derived myself**:
   `grep -rn "spinner-border" src/` → only `src/components/Spinner.vue`
   (lines 59, 130, the class usage + scoped-style override) and
   `src/styles/tailwind.css` (the new rule + its comment) contain the
   string; no other `src/` file references it in any form. `grep -rn
   "spinner-grow" src/` → zero real usages, only a mention inside the
   `tailwind.css` comment. Matches the note's survey exactly.
4. **Values vs. Bootstrap's real compiled CSS, read myself** (not
   trusted from the note): `node_modules/bootstrap/dist/css/bootstrap.css`
   lines 6229-6237 (`.spinner-grow, .spinner-border { display:
   inline-block; width: var(--bs-spinner-width); height: var(--bs-
   spinner-height); vertical-align: var(--bs-spinner-vertical-align);
   border-radius: 50%; animation: var(--bs-spinner-animation-speed)
   linear infinite var(--bs-spinner-animation-name); }`), lines 6244-6253
   (`.spinner-border { --bs-spinner-width: 2rem; --bs-spinner-height:
   2rem; --bs-spinner-vertical-align: -0.125em; --bs-spinner-border-
   width: 0.25em; --bs-spinner-animation-speed: 0.75s; ...; border:
   var(--bs-spinner-border-width) solid currentcolor; border-right-
   color: transparent; }`), lines 6255-6259 (`.spinner-border-sm {
   --bs-spinner-width: 1rem; --bs-spinner-height: 1rem; --bs-spinner-
   border-width: 0.2em; }`). Every flattened value in the new rule
   (`src/styles/tailwind.css` lines 851-869: 2rem/1rem width+height,
   .25em/.2em border-width, -.125em vertical-align, .75s animation
   speed, `@keyframes spinner-border { to { transform: rotate(360deg);
   } }`) matches numerically. `tailwind.config.cjs` lines 108-111:
   both `spinner-border`/`spinner-border-sm` present in the safelist.
   All correct.
5. **Build, re-run myself**: `rm -rf dist && npm run build` →
   `✓ built in 5.39s`, only the pre-existing chunk-size warning.
   Matches the note.
6. **Compiled CSS, independently re-derived**: main bundle
   `dist/assets/index-BatHk9I_.css` (232,974 bytes). Wrote my own Python
   regex scan (not reused from the note) and found exactly 3
   `.spinner-border{` occurrences: byte 39118 (this node's flattened
   rule, `display:inline-block;width:2rem;height:2rem;...;animation:
   spinner-border .75s linear infinite`), byte 215025 (Bootstrap's
   shared `.spinner-grow,.spinner-border{...}` base, using `var(--bs-
   spinner-*)`), byte 215338 (Bootstrap's own `.spinner-border{--bs-
   spinner-width: 2rem;...}` custom-property block). Matches the note's
   claimed count and rough offsets exactly.
7. **Lint, re-run myself**: `npm run lint` → exit 0, zero output beyond
   the npm command header. Matches the note.
8. **Test, re-run myself**: `npm run test` → `Test Files 16 passed
   (16)`, `Tests 111 passed (111)` — full green, no `VeeForm.spec.ts`
   flakiness this run. Matches the note.
9. **Forbidden states** (all 6 checked): `ADHOC_WORK` clear (node
   exists on `dev-loop.prime-mermaid.md` row 178, appended directly
   after the prior SEALED row, no reordering). `NO_EVIDENCE` clear
   (implementer note exists, read first). `EDIT_UNVERIFIED` clear
   (every claim above independently re-run). `CODE_IN_HAVEN` clear
   (`find agent-hub/haven -name "*.vue" -o -name "*.ts" -o -name "*.js"
   -o -name "*.sh"` → zero matches). `DIAGRAM_DRIFT` — not applicable to
   REOPEN (status stays IN_PROGRESS, correctly not advanced). `MAIN_EDIT`
   clear (branch confirmed `feature/tailwindcss-setup`).
10. **Seal gate**: no outward-facing action in this diff (no
    commit/push/merge) — nothing to gate.

## Missing — REOPEN reason
The task explicitly asked to independently verify the note's central
technical claim — that this rule is dormant "per the CSS Cascade Layers
spec," because "an unlayered NORMAL declaration ... always beats ANY
layered normal declaration ... regardless of specificity, `!important`
absence, **or source order**." This claim does not hold up:

1. **Zero native `@layer` at-rules exist anywhere in the compiled
   output.** `grep -c '@layer' dist/assets/index-BatHk9I_.css` → `0`.
   `grep -l '@layer' dist/assets/*.css` (all 16 CSS files in `dist/`) →
   no matches at all. `tailwind.config.cjs` has no `future`/
   `experimental` cascade-layers flag enabled (checked directly).
   `package.json` confirms Tailwind v3.4.19. Tailwind v3's `@layer
   components { ... }` directive in `src/styles/tailwind.css` is a
   Tailwind-internal build-time bucketing construct — it is consumed
   and stripped by PostCSS, and never becomes a real, browser-native
   CSS `@layer <name> { ... }` at-rule in the shipped file. There is
   no CSS Cascade Layers mechanism active in this bundle at all, so a
   rule "per the CSS Cascade Layers spec" cannot be the real reason
   anything wins here.
2. **This exact mechanism was already correctly established by an
   already-SEALED sibling node** —
   `evidence/verifier/2026-09-13-tailwindcss-navbar-component-system-seal.md`
   (step 6, "Mechanism sanity-check") independently verified: "Tailwind
   v3.4.19 ... does not emit native CSS `@layer` at-rules ...
   Instead Tailwind buckets all `@layer components {...}` and `@layer
   utilities {...}` source blocks and re-emits them in the fixed
   base→components→utilities order in the final file, regardless of
   where in the source those blocks were authored." That note also
   found the components-authored rule appearing at an EARLIER byte
   offset than the utilities-generated rule in the SAME `tailwind.css`
   output — i.e., that node's own evidence already shows position
   inside the final file (byte offset / **source order**) is exactly
   what decides which rule is later, not any order-independent layering
   guarantee.
3. **Applying that already-established mechanism here**: `src/main.ts`
   imports `./styles/tailwind.css` BEFORE `./styles/bootstrap.scss`
   (confirmed directly, with the file's own comment explaining this is
   intentional so Bootstrap's element styles win preflight). Because
   Bootstrap's stylesheet is a separate import that lands AFTER
   `tailwind.css` in the final bundle, Bootstrap's `.spinner-border`
   rules end up LATER in the compiled file (byte 215025/215338) than
   this node's rule (byte 39118) — confirmed by direct byte-offset
   inspection in step 6 above. For two same-specificity (0,1,0),
   non-`!important` rules on the identical selector, the LATER
   declaration in the cascade wins by plain CSS tie-breaking — this is
   an ordinary **source-order-dependent** outcome, not a source-order-
   *independent* one.
4. **The note's own wording is self-contradicting the evidence it
   would need**: it explicitly claims the dormancy holds "regardless of
   ... source order," but the only real mechanism actually present
   (Tailwind's internal base→components→utilities bucketing plus
   `main.ts`'s current tailwind-then-bootstrap import order) is
   entirely ABOUT source order — it is a byte-position tie-break, not a
   real cascade-layer guarantee. If `main.ts`'s import order were ever
   reversed (bootstrap.scss before tailwind.css), this node's flattened
   `.spinner-border` would win instead, and the spinner would visibly
   change — directly contradicting an "regardless of source order"
   claim. A hypothetical genuine `@layer` setup would truly be order-
   independent; this bundle has no such thing.

The underlying technical decision (flattened values are numerically
correct, safelist entries correct, zero consumer-file edits, `.spinner-
grow` correctly left unbuilt, build/lint/test all green) is sound. This
REOPEN is narrowly on evidence-note-accuracy grounds, matching this
hub's established bar (see the
`tailwindcss-color-utilities`/`tailwindcss-remaining-utilities-sweep`
REOPEN precedents): a specific, checkable technical claim in the note
is factually wrong, and it is presented as a "self-corrected," settled
justification that other engineers (or future nodes, up to and
including the planned final-Bootstrap-removal node) could rely on as an
order-independent invariant when it is not one.

Fix needed before re-submitting: rewrite the "Correction made before
finalizing: dormancy status" section (and the mirrored diagram-row text
and `tailwind.css` comment) to state the real mechanism — Tailwind v3
emits no native `@layer` at-rules (verified: zero `@layer` occurrences
in the whole compiled `dist/`); dormancy instead comes from `main.ts`
importing `tailwind.css` before `bootstrap.scss`, which puts Bootstrap's
identical-specificity, non-`!important` `.spinner-border` rule LATER in
the final bundle, where it wins by ordinary last-declaration-wins CSS
tie-breaking — an outcome that depends on, not despite, source order.
No code change is required (the CSS/config diff itself is correct); this
is a note-text/comment-only fix, same class as the prior
`tailwindcss-color-utilities` REOPEN.

## Re-run
`full` — reason: the task explicitly asked for a from-scratch build +
compiled-CSS byte-offset re-derivation and an independent check of the
cascade-layers claim against the CSS spec (not audit-only), matching
this hub's established pattern for this class of claim (nodes 6, 9, 11,
12, and the `navbar-component-system`/`color-utilities` REOPEN passes).
Ran: `rm -rf dist && npm run build`, `npm run lint`, `npm run test`, a
fresh Python regex byte-offset scan of the compiled CSS bundle, direct
reads of `node_modules/bootstrap/dist/css/bootstrap.css`, `src/main.ts`,
`tailwind.config.cjs`, `src/styles/tailwind.css`, and the sibling
`tailwindcss-navbar-component-system` SEAL note's own mechanism
evidence — all from scratch in this session, not reused from the note
under review.

## Hub bytes
before=184119 (from the implementer note's stated
`hub_bytes_before`, itself taken from node 13's verifier SEAL note's
`hub_bytes_after`) · after=187491 (measured via the `/hub-tokens`
methodology, same 5 session categories: root=12393, doctrine=27207,
active diagram=121774 (grew from this node's detailed IN_PROGRESS row
being added since node 13's SEAL snapshot), implementer bundle=14963,
verifier bundle=11154; diagram status left at IN_PROGRESS per REOPEN,
not advanced — this note itself lives in `evidence/verifier/`, which is
cold storage and not counted in the session total).
