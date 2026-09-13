# 2026-09-13 — tailwindcss-navbar-component-system

- Worker: implementer
- Node: `tailwindcss-navbar-component-system`
- Branch: `feature/tailwindcss-setup` (same ongoing migration branch)
- Status: sealed_pending_verifier

## Task
Node 12 of the Bootstrap→Tailwind migration (operator: "tiếp tục",
standing "tiếp tục cho tới khi xong" directive), continuing straight from
node 11 (`tailwindcss-grid-system`, SEALED). Next item on the deferred
list: Bootstrap's Navbar component classes (`.navbar-nav`/`.nav-link`/
`.nav-item`/`.navbar-brand`).

## Survey
Grepped `src/` for `\.(navbar[a-z-]*|nav-link|nav-item)\b` (both `class`
attr and Pug dot-chain) and separately for bare `\bnav\b`. Real usage,
confined to 2 files:
- `Header.vue`: `.navbar-nav`, `.nav-item` (×2), `.nav-link` (×2),
  `.navbar`, `.navbar-expand-lg`, `.navbar-brand` (both the
  unauthenticated top-bar and the authenticated header's real `<nav>`
  block).
- `LayoutDefault.vue:68`: `nav.nav.flex-col.dashboard-sidebar-nav` —
  bare `.nav` (Bootstrap's base nav-reset class), separate from
  `navbar-nav`.

While reading `Header.vue`'s authenticated block, noticed it reuses the
standalone `Navbar.vue` component is only used in the UNAUTHENTICATED
branch, but `Navbar.vue` itself (the self-contained mobile-collapse
rewrite from node `tailwindcss-dropdown-toast-navbar`) uses its own,
separate set: `.navbar`, `.navbar-expand-lg`, `.container`,
`.navbar-brand`, `.navbar-toggler`, `.navbar-toggler-icon`, `.collapse`,
`.navbar-collapse`. My first pass at the `tailwind.css` comment claimed
"`.navbar-toggler`(...)/`.navbar-collapse` confirmed unused" — this was
WRONG, caught by re-reading `Navbar.vue` directly instead of trusting my
own grep pattern's blind spot (it only searched for `navbar[a-z-]*`/
`nav-link`/`nav-item`, which does match `navbar-toggler`/
`navbar-collapse` — the miss was in my prose, not the grep; corrected
before finalizing, not left in the shipped comment).

## Design
Read Bootstrap's real source, not guessed:
- `_variables.scss`: `$nav-link-padding-y: .5rem`, `$nav-link-padding-x:
  1rem`, `$navbar-padding-y: $spacer*.5 = .5rem`,
  `$navbar-nav-link-padding-x: .5rem`, `$navbar-brand-font-size:
  $font-size-lg = $font-size-base*1.25 = 1.25rem`,
  `$navbar-brand-margin-end: 1rem`, `$navbar-toggler-padding-y: .25rem`,
  `$navbar-toggler-padding-x: .75rem`, `$navbar-toggler-font-size:
  $font-size-lg = 1.25rem`, `$navbar-toggler-border-radius:
  $btn-border-radius = var(--bs-border-radius)`,
  `$navbar-toggler-focus-width: $focus-ring-width = .25rem`.
  `$navbar-brand-padding-y` computed: `(nav-link-height -
  navbar-brand-height)*.5` where `nav-link-height = font-size-base *
  line-height-base + nav-link-padding-y*2 = 1rem*1.5 + 1rem = 2.5rem` and
  `navbar-brand-height = navbar-brand-font-size * line-height-base =
  1.25rem*1.5 = 1.875rem` → `(2.5-1.875)*.5 = 0.3125rem`.
- `_nav.scss`/`_navbar.scss`: `.nav` (flex reset), `.nav-link` (block,
  padding, color, hover), `.navbar-nav` (flex-column list reset,
  descendant `.nav-link` gets padding-x:0 via a CSS custom property Bootstrap
  sets on `.navbar-nav` — reproduced directly as a descendant-selector
  override for simplicity), `.navbar` (flex row, space-between,
  vertical padding), `.navbar-brand` (padding/margin/font-size/color),
  `.navbar-expand-lg`'s breakpoint behavior (`≥992px`: `flex-wrap:nowrap`,
  `.navbar-nav{flex-direction:row}`, `.navbar-nav .nav-link` gets
  horizontal padding back), and — critically — the same breakpoint's
  `.navbar-collapse{display:flex!important;flex-basis:auto}` +
  `.navbar-toggler{display:none}` pair, which is what keeps a
  `.navbar-expand-lg` navbar permanently expanded above its breakpoint
  regardless of the JS toggle state. Missing this pair would have left
  the desktop nav hidden behind a hidden toggle button — caught by
  reading `_navbar.scss`'s `navbar-expand-loop` mixin fully, not stopping
  at the first few rules.
- `.navbar-toggler-icon`'s hamburger SVG: copied byte-for-byte from
  Bootstrap's own COMPILED `dist/css/bootstrap.css` (both the light
  `rgba(33,37,41,.75)` and dark `rgba(255,255,255,.55)` stroke-color
  variants) rather than hand-deriving Sass's `escape-svg()` URL encoding.

Colors use `var(--bs-emphasis-color)` / `var(--bs-emphasis-color-rgb)` /
`var(--bs-body-color)` — confirmed root/`[data-bs-theme]`-scoped in
Bootstrap's compiled output (not the `.navbar`-element-scoped
`--bs-navbar-*` vars), same root-scoped-preference reasoning as
`.dropdown-menu` (node `tailwindcss-dropdown-menu-styling`).

`.nav-item` intentionally gets no CSS rule — Bootstrap itself gives it
zero styling outside `.nav-tabs`/`.nav-pills`/`.nav-fill` contexts, none
of which this app uses (confirmed via grep for those 3 + `.nav-underline`
+ `.nav-justified` — all zero matches).

## Real bug found and fixed: `.collapse` name collision
While verifying the compiled CSS (see below), found that Tailwind
generates its OWN `.collapse{visibility:collapse}` utility (meant for
table-row collapsing) — a real, unrelated class sharing the exact name
Bootstrap's `.collapse`/`.collapse.show` convention uses, which
`Navbar.vue`'s root div already carried literally
(`class="collapse navbar-collapse grow"`, from node
`tailwindcss-dropdown-toast-navbar`).

Because Tailwind's `@layer utilities` always outranks `@layer
components` regardless of source order (cascade-layer priority, not
specificity or document order), any `@layer components` attempt to
override `.collapse`'s `visibility` back to something sane cannot win
normally. Confirmed empirically: `.collapse{visibility:collapse}` was
ALREADY present in the compiled bundle before I added anything (Tailwind
generates it from the literal "collapse" token, already present in
`Navbar.vue`'s class list, independent of any safelist entry). Since
`visibility:collapse` behaves like `visibility:hidden` on a non-table
element, this would silently keep the navbar's collapsible content
invisible whenever `.show` is present — breaking BOTH the mobile
expanded state AND the desktop always-expanded state (`.navbar-expand-lg`
forces `display:flex` there, but that doesn't override an independent
`visibility:collapse`).

This is a pre-existing latent bug (the literal `collapse` class has been
in `Navbar.vue` since node `tailwindcss-dropdown-toast-navbar`, and
Tailwind's utility generation doesn't care which node added the class) —
not something this node's diff introduced, but caught here because this
is the first node to actually inspect the navbar's full compiled CSS
output. Fixed with the smallest possible diff, following the same
"rename to dodge a collision" precedent as node 2's `.mt-4` numeric-scale
fix: dropped the bare `collapse` token from `Navbar.vue`'s markup
entirely (kept `navbar-collapse` + the dynamic `show` binding, both
unique names with no Tailwind collision), and keyed the new
`@layer components` rule off `.navbar-collapse:not(.show)` instead of
`.collapse:not(.show)`. Documented in both `Navbar.vue`'s own doc comment
and `tailwind.css`'s comment for this rule, so a future reader doesn't
reintroduce the bare class. `Navbar.spec.ts` (pre-existing, from node 4)
already asserted against `.navbar-collapse`'s `show` class, never the
bare `.collapse` token, so it needed no changes and still passes.

**Zero other consumer-file edits needed** for the actual navbar/nav
classes (`.nav`, `.nav-link`, `.navbar`, `.navbar-brand`, `.navbar-nav`,
`.navbar-expand-lg`, `.navbar-toggler`, `.navbar-toggler-icon`,
`.navbar-collapse`) — same "keep the class name, change the CSS source"
strategy as every prior component node. Only `Navbar.vue`'s one bare
`collapse` token was removed, for the collision reason above.

All 9 real classes (excluding the deliberately-not-reused `collapse`)
added to `tailwind.config.cjs`'s `safelist`, with a note explaining why
`collapse` itself is deliberately absent.

## Verification
1. `rm -rf dist && npm run build` → `✓ built in 4.88s` (final state,
   after the collision fix), only the pre-existing chunk-size warning.
2. `npm run lint` → exit 0, clean.
3. `npm run test` → `Test Files 16 passed (16)`, `Tests 111 passed
   (111)` — including `Navbar.spec.ts`'s 4 tests (open/close toggle,
   slot rendering), all passing after the markup change.
4. Compiled main CSS bundle (`dist/assets/index-*.css`, ~230KB)
   independently checked via Python regex for all new rules:
   ```
   FOUND  .collapse{visibility:collapse}              (Tailwind's own utility — confirmed present but now UNUSED, no element carries the bare class anymore, verified via a repo-wide grep for a standalone "collapse" token outside comments/doc-strings)
   FOUND  .navbar-collapse:not(.show){display:none}
   FOUND  .navbar-collapse{flex-basis:100%...}
   FOUND  .nav{display:flex;flex-wrap:wrap;padding-left:0...}
   FOUND  .nav-link{display:block;padding:.5rem 1rem...}
   FOUND  .navbar-nav{display:flex;flex-direction:column...}
   FOUND  .navbar-nav .nav-link{padding-left:0;padding-right:0}
   FOUND  .navbar{position:relative;display:flex...}
   FOUND  .navbar-brand{display:inline-block;padding-top:.3125rem...}
   FOUND  .navbar-toggler{padding:.25rem .75rem...}
   FOUND  .navbar-toggler-icon{display:inline-block...}
   FOUND  [data-bs-theme=dark] .navbar-toggler-icon{...}  (quotes stripped by minifier, still a valid/matching attribute selector)
   FOUND  .navbar-expand-lg{flex-wrap:nowrap...}
   FOUND  .navbar-expand-lg .navbar-nav{flex-direction:row}
   FOUND  .navbar-expand-lg .navbar-collapse{display:flex!important;flex-basis:auto}
   FOUND  .navbar-expand-lg .navbar-toggler{display:none}
   ```
   16/16 expected rules found; the collision fix independently confirmed
   by re-grepping `src/` for any remaining bare-`collapse` class-list
   usage (0 matches outside prose/comments).
5. Forbidden states: branch = `feature/tailwindcss-setup`
   (`MAIN_EDIT` clear). Node added to `dev-loop.prime-mermaid.md` before
   this note (`ADHOC_WORK` clear). This note exists (`NO_EVIDENCE`
   clear). No `.vue`/`.js`/`.ts` under `haven/` (`CODE_IN_HAVEN` clear).
   `EDIT_UNVERIFIED` avoided — every claim above was actually run and
   read back.

## Deferred (unchanged from node 11's list, minus navbar which is now done)
- Remaining color-semantic utilities (`.bg-body-tertiary`,
  `.text-success`/`.text-info`/`.text-danger`, `.border-success`) —
  needs a color/dark-mode token decision, deferred since node 2.
- Final Bootstrap removal — still untouched, needs real visual QA once
  attempted (grid + navbar + everything else's dormant CSS all activate
  at once).

## Verification gap, disclosed
No live browser session available this session (same limitation as
nodes 4/7/10/11). Mitigated the same way: exhaustive compiled-CSS
presence checks + reading Bootstrap's real source values, plus this
node's own self-caught `.collapse` collision bug as a concrete
demonstration the method catches real defects, not just theater.
`Navbar.spec.ts`'s existing tests provide some interactive-behavior
coverage (toggle open/close) that build/lint alone wouldn't, though they
don't render real CSS (jsdom), so they couldn't have caught the
visibility-collision bug themselves — only the compiled-CSS grep did.

## Hub bytes
before=170989 (from node 11's verifier SEAL note's `hub_bytes_after`) ·
after not yet measured — verifier to measure at SEAL/REOPEN time per
convention.
