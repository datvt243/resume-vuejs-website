# 2026-09-13 — tailwindcss-navbar-component-system — SEAL

- Worker: verifier
- Node: `tailwindcss-navbar-component-system`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row 174 — status column
  changed IN_PROGRESS → SEALED, findings appended to the END of the
  row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Spawned as a fresh, isolated subagent whose task description states
verbatim: "you are a fresh, isolated subagent verifying node
`tailwindcss-navbar-component-system`... A separate implementer session
wrote this diff, not you — NeverVerifyOwnWork satisfied by
construction." This session's first actions were reading
`manifest.yaml`/`SOUL.md`/`recipes/verify_seal.md` fresh, then reading
the implementer's evidence note before touching any diff content — it
wrote no part of the diff under review. `NeverVerifyOwnWork` satisfied.

## Reasoning
Read the implementer's note FIRST (`EvidenceOnly`), then independently
re-derived every claim against the real repo state, not the note's
prose:

1. **Branch**: `git branch --show-current` → `feature/tailwindcss-setup`
   — not `main`/`staging`. `NoMainEdit` satisfied.
2. **Navbar.vue diff, read directly**: `git diff staging --
   src/components/Navbar.vue` confirms the root collapsible div's class
   list changed from `class="collapse navbar-collapse flex-grow-1"`
   (pre-existing, from node `tailwindcss-dropdown-toast-navbar`) to
   `class="navbar-collapse grow" :class="{ show: expanded }"` — bare
   `collapse` token fully removed, `navbar-collapse` kept, dynamic
   `show` binding added. Matches the note's central claim exactly.
3. **CSS keying, read directly**: `src/styles/tailwind.css` line 727 —
   the new closed-state rule is `.navbar-collapse:not(.show) { display:
   none; }`, NOT `.collapse:not(.show)`. Confirmed.
4. **Zero remaining bare-`collapse` usage**: grepped `src/` for
   `class="[^"]*\bcollapse\b[^"]*"` (class attr) and `\.collapse\b` (Pug
   dot-chain) across all `.vue` files. Only match is
   `Navbar.vue:42`'s `navbar-collapse` (substring, not a bare token) —
   zero elements anywhere carry the literal bare `collapse` class.
5. **Compiled CSS, independently checked** (`rm -rf dist && npm run
   build` → `✓ built in 4.84s`, only the pre-existing chunk-size
   warning; main bundle `dist/assets/index-zN7u4vb1.css`, 232,370
   bytes, confirmed as the large main bundle by size): via my own
   Python regex script, confirmed BOTH `.collapse{visibility:collapse}`
   (Tailwind's own utility, present, unconditional, no pseudo-class
   scoping — verified by reading the raw bytes around the match) AND
   `.navbar-collapse:not(.show){display:none}` are present, correctly
   distinct selectors.
6. **Mechanism sanity-check, done independently, not just trusted**:
   `src/styles/tailwind.css` opens with `@tailwind base; @tailwind
   components; @tailwind utilities;` in that order. Tailwind v3.4.19
   (confirmed in `package.json`) does not emit native CSS `@layer`
   at-rules — `grep -c "@layer" dist/assets/index-zN7u4vb1.css` → 0.
   Instead Tailwind buckets all `@layer components {...}` and `@layer
   utilities {...}` source blocks and re-emits them in the fixed
   base→components→utilities order in the final file, regardless of
   where in the source those blocks were authored. Verified this
   empirically: `.navbar-collapse:not(.show)` (components-authored)
   appears at byte offset 37696, `.collapse{visibility:collapse}`
   (utilities-generated) at byte offset 39023 — components rule
   precedes the utilities rule in the real compiled file. Went one step
   further than the note: checked actual CSS specificity, since same-
   specificity + later-position is what decides the winner, not merely
   "layer" terminology. A hypothetical `.collapse:not(.show){display:
   none}` override has HIGHER specificity (0,2,0, from the `:not(.show)`
   pseudo-class argument) than Tailwind's `.collapse{visibility:
   collapse}` (0,1,0) — so specificity alone would let a `display`
   override win. But the actual conflicting property is `visibility`,
   not `display`: Tailwind's utility sets `visibility:collapse`
   unconditionally (confirmed: no `:not()`/pseudo-class scoping in the
   compiled rule) and Bootstrap's real `.navbar-collapse`/`.collapse`
   rules never touch `visibility` at all — so no components-layer rule
   at any specificity was fixing this, because there was nothing for a
   components-layer override to override; the offending declaration
   comes from the SAME element merely carrying the bare `collapse`
   class Tailwind scans for, independent of any authored CSS. This
   confirms the note's fix (removing the bare token entirely) was the
   only real fix — a components-layer counter-rule could not have
   worked no matter how it was written, because there'd be no
   `visibility` property to compete against in the components layer.
   Mechanism claim holds up under a deeper property-level check, not
   just accepted at face value.
7. **Bootstrap source values, independently re-read** (not trusted from
   the note): `node_modules/bootstrap/scss/_variables.scss` confirms
   `$nav-link-padding-y:.5rem`, `$nav-link-padding-x:1rem`,
   `$navbar-padding-y:$spacer*.5`, `$navbar-nav-link-padding-x:.5rem`,
   `$navbar-brand-font-size:$font-size-lg`, `$navbar-brand-margin-end:
   1rem`, `$navbar-toggler-padding-y:.25rem`,
   `$navbar-toggler-padding-x:.75rem` (lines 1159-1206).
   `$navbar-brand-padding-y: ($nav-link-height - $navbar-brand-height)
   * .5` (line 1199) — computed by hand:
   `$nav-link-height = $font-size-base(1rem)*$line-height-base(1.5) +
   $nav-link-padding-y(.5rem)*2 = 1.5+1 = 2.5rem`;
   `$navbar-brand-height = $navbar-brand-font-size(1.25rem)*1.5 =
   1.875rem`; `(2.5-1.875)*.5 = 0.3125rem` — matches
   `tailwind.css`'s `.navbar-brand{padding-top:.3125rem...}` exactly.
   `_nav.scss` confirms `.nav{display:flex;flex-wrap:wrap;padding-
   left:0;margin-bottom:0;list-style:none}` and `.nav-link{display:
   block;padding: var(nav-link-padding-y) var(nav-link-padding-x)}` =
   `.5rem 1rem` — matches. `_navbar.scss` confirms `.navbar{position:
   relative;display:flex;flex-wrap:wrap;align-items:center;
   justify-content:space-between;padding:.5rem ...}`,
   `.navbar-brand{padding-top/bottom:var(...);margin-right:1rem;
   white-space:nowrap}`, `.navbar-nav{display:flex;flex-direction:
   column;padding-left:0;margin-bottom:0;list-style:none}`,
   `.navbar-collapse{flex-basis:100%;flex-grow:1;align-items:center}`,
   `.navbar-toggler{padding:var(toggler-padding-y) var(toggler-
   padding-x);...}`, `.navbar-toggler-icon{display:inline-block;
   width:1.5em;height:1.5em;...background-size:100%}` — all match
   `tailwind.css` line-for-line. Critically, `_navbar.scss`'s
   `navbar-expand-loop` (`scss-docs-start navbar-expand-loop`, lines
   189-258) confirms, inside `@include media-breakpoint-up($next)`
   (`$next`=lg, i.e. `min-width:992px` per `$grid-breakpoints`):
   `.navbar-nav{flex-direction:row}`, `.navbar-nav .nav-link{padding-
   left/right:var(navbar-nav-link-padding-x)}` (=.5rem),
   `.navbar-collapse{display:flex!important;flex-basis:auto}`, and
   `.navbar-toggler{display:none}` — the exact pair claimed, confirmed
   present and correctly scoped inside `@media (min-width: 992px){...}`
   in the compiled output (checked via Python: the substring
   `.navbar-expand-lg{flex-wrap:nowrap` is immediately preceded by
   `@media (min-width: 992px){`).
8. **Survey completeness, independently re-grepped**: ran a class-attr
   regex sweep (`class="[^"]*\b(nav|nav-link|nav-item|navbar[a-z-]*)
   \b[^"]*"`) and a Pug dot-chain sweep across all `.vue` files. Found
   exactly the 3 files the note/diagram row claim:
   `src/components/Navbar.vue` (`.navbar`/`.navbar-expand-lg`/
   `.navbar-brand`/`.navbar-toggler`/`.navbar-toggler-icon`/
   `.navbar-collapse`), `src/pages/_layouts/Header.vue`
   (`.navbar-nav`/`.nav-item`×2/`.nav-link`×2/`.navbar`/
   `.navbar-expand-lg`/`.navbar-brand`), `src/pages/_layouts/
   LayoutDefault.vue:68` (bare `.nav` on the dashboard sidebar). A
   broader `grep -rlE '\bnav\b'` additionally surfaced
   `Dropdown.vue`/`Toasts.vue` — read both directly and confirmed these
   are FALSE POSITIVES: the only match in each is a doc-comment
   reference to the node name `tailwindcss-dropdown-toast-navbar`, not
   a real class. No missed file found; the note's 3-file list is
   complete.
9. **Safelist**: read `tailwind.config.cjs` in full — all 9 real
   classes (`nav`, `nav-link`, `navbar`, `navbar-brand`, `navbar-nav`,
   `navbar-expand-lg`, `navbar-toggler`, `navbar-toggler-icon`,
   `navbar-collapse`) are present in `safelist`, immediately followed
   by an explicit comment explaining bare `collapse` is deliberately
   excluded and why (the exact collision this note documents).
10. **`rm -rf dist && npm run build`**, re-run myself: `✓ built in
    4.84s`, only the pre-existing "chunks larger than 500 kB" warning
    — matches the note.
11. **`npm run lint`**, re-run myself: clean exit, zero output beyond
    the npm command header — matches the note's "exit 0, clean" claim.
12. **`npm run test`**, re-run myself: `Test Files 16 passed (16)`,
    `Tests 111 passed (111)` — all green this run, including
    `VeeForm.spec.ts` (11/11, inside the documented known-flaky band,
    no failure this run) and, specifically, `Navbar.spec.ts` (4/4:
    "starts collapsed", "expands on toggler click", "collapses again on
    a second click", "renders slot content inside the collapse
    region"). Read `Navbar.spec.ts` directly: all assertions target
    `.navbar-collapse` (`wrapper.find('.navbar-collapse').classes()`)
    and `.navbar-toggler`'s `aria-expanded` attribute — never the bare
    `.collapse` token — so the suite genuinely exercises the renamed
    class and its `show`/`aria-expanded` toggle behavior correctly, not
    a stale assertion that happens to still pass.
13. **All 16 compiled-CSS rules**, independently re-checked with my own
    Python regex script against `dist/assets/index-zN7u4vb1.css`:
    `.collapse{visibility:collapse}`,
    `.navbar-collapse:not(.show){display:none}`,
    `.navbar-collapse{flex-basis:100%...}`, `.nav{display:flex;
    flex-wrap:wrap;padding-left:0...}`, `.nav-link{display:block;
    padding:.5rem 1rem...}`, `.navbar-nav{display:flex;flex-direction:
    column...}`, `.navbar-nav .nav-link{padding-left:0;padding-right:
    0}`, `.navbar{position:relative;display:flex...}`,
    `.navbar-brand{display:inline-block;padding-top:.3125rem...}`,
    `.navbar-toggler{padding:.25rem .75rem...}`,
    `.navbar-toggler-icon{display:inline-block...}`,
    `[data-bs-theme=dark] .navbar-toggler-icon{...}`,
    `.navbar-expand-lg{flex-wrap:nowrap...}`,
    `.navbar-expand-lg .navbar-nav{flex-direction:row}`,
    `.navbar-expand-lg .navbar-collapse{display:flex!important;
    flex-basis:auto}`, `.navbar-expand-lg .navbar-toggler{display:
    none}` — 16/16 FOUND, none sampled/skipped.
14. **Forbidden states** (all 6 checked):
    - `ADHOC_WORK` — node exists on `dev-loop.prime-mermaid.md` (row
      174), a worker (implementer) was used. Clear.
    - `NO_EVIDENCE` — implementer note exists and was read first.
      Clear.
    - `EDIT_UNVERIFIED` — every claim above was independently re-run
      and read back by this session (build, lint, test, compiled-CSS
      regex checks, Bootstrap source reads, survey greps, specificity/
      mechanism reasoning), not inferred from the note. Clear.
    - `CODE_IN_HAVEN` — `find agent-hub/haven -name "*.vue" -o -name
      "*.ts" -o -name "*.js" -o -name "*.sh" -o -name "*.cjs"` returned
      zero matches. Clear.
    - `DIAGRAM_DRIFT` — diagram row existed at IN_PROGRESS with full
      findings pending this verdict; updated to SEALED as part of this
      pass, in place, findings appended. Clear.
    - `MAIN_EDIT` — branch confirmed `feature/tailwindcss-setup`.
      Clear.
15. **Seal gate**: no outward-facing action in this diff (no
    commit/push/merge) — nothing to gate.
16. **Proportionality**: `git diff staging -- src/components/
    Navbar.vue` is a small, targeted diff (30 insertions / 11
    deletions) — the collision fix plus its own doc comment, no
    unrelated changes to this file. No opportunistic scope creep found.

## Missing
None. Every acceptance-relevant claim in the note has citable,
independently-reproduced evidence, including the central `.collapse`
collision claim, which was verified one level deeper than the note
itself (actual CSS specificity + which property actually conflicts),
not merely re-confirmed at face value.

## Re-run
`full` — reason: this class of change (CSS added to a shared
`@layer components` stylesheet + a safelist change affecting purge
behavior + a markup change to a component with its own existing test
file) is exactly the kind of structural, easy-to-silently-break diff
this hub's prior nodes (6, 9, 11) already learned needs independent
re-run, not just an audit; also consistent with every prior SEAL on
this same migration branch. Re-ran: `rm -rf dist && npm run build`,
`npm run lint`, `npm run test`, plus an independent Python regex sweep
of the compiled CSS bundle, fresh Bootstrap-source reads, and a
from-scratch specificity/mechanism check on the `.collapse` collision
— all from scratch in this session, not reused from the note.

## Hub bytes
before=170989 (from the implementer note's `## Hub bytes` → `before`
line, itself carried from node 11's verifier SEAL note's
`hub_bytes_after`) · after=179179 (measured via the same 5 categories
as prior notes, AFTER updating this node's PM status to SEALED:
root=12569, doctrine=27207, active diagram=113286 (this SEAL's findings
appended in place to the `tailwindcss-navbar-component-system` row),
implementer bundle=14963, verifier bundle=11154 — no change to
recipe/manifest/SOUL this pass).
