# 2026-09-13 — tailwindcss-root-tokens-and-remaining-gaps

- Worker: implementer
- Node: `tailwindcss-root-tokens-and-remaining-gaps`
- Branch: `feature/tailwindcss-setup` (same ongoing migration branch)
- Status: sealed_pending_verifier

## Task
Node 15 of the Bootstrap→Tailwind migration. After node 14 sealed, the
operator asked whether to proceed straight to final Bootstrap removal.
A pre-removal survey (done before touching any code) found the actual
scope of "make removal safe" is much larger than "delete 3 things" —
operator chose (via `AskUserQuestion`) the 2-step plan: this node builds
every remaining real gap while Bootstrap stays installed (safe,
additive, same risk profile as nodes 6-14); a later, separate node
(requiring fresh confirmation) does the actual deletion.

## Survey — 3 layers of gaps found, each via a different failure mode of prior surveys

### Layer 1: real Bootstrap component/utility classes, never rebuilt
Extended the token-scan methodology from node 10/11 to `.js`/`.ts` files
too (not just `.vue`), then cross-referenced every found class token
against Bootstrap's real compiled selectors
(`node_modules/bootstrap/dist/css/bootstrap.css`) and subtracted
everything already built in nodes 6-14. Found:
- **Modal system** (`.modal`, `.modal-dialog`, `.modal-dialog-scrollable`,
  `.modal-content`, `.modal-header`, `.modal-title`, `.modal-body`,
  `.modal-footer`, `.modal-backdrop`, `.modal-lg`) — `Modal.vue`'s JS was
  rewritten in node `tailwindcss-modal-rewrite`, but its plan explicitly
  said "reuses Bootstrap's own CSS as-is" — CSS was never rebuilt. Used
  across 6 CRUD dashboard pages. The single biggest gap found.
- **Toast system** (`.toast`, `.toast-container`, `.toast-header`,
  `.toast-body`) — same story, `tailwindcss-dropdown-toast-navbar`
  rewrote the JS only.
- `.h4`/`.h5`/`.h6`, `.clearfix`, `.text-uppercase`, `.border-start`,
  `.dropdown` (bare, `position: relative` anchor for `.dropdown-menu`),
  `.input-group`/`.input-group-sm`/`.input-group-text`, `.table`/
  `.table-hover`/`.table-bordered`/`.table-responsive`.
- **Found via the extended JS-file scan specifically**:
  `table/part/Table.js` — a render-function file with
  `class: ['table table-hover', ...]` — invisible to every prior
  `class="..."`-attribute-anchored survey, the exact class of blind spot
  node 10 found for Pug/`h()` calls, this time in a plain `.js` file.
  `Box.vue`'s `h()` call also uses `.clearfix`, same blind spot.

Full per-class usage confirmed via direct file reads before building
anything (not assumed): Modal → `Modal.vue` only. Toast → `Toasts.vue`
only. `.h4` → `Heading.vue` (dynamic `props.tag` class, always `'h4'` in
practice — confirmed via grep, never overridden) + `PageHome.vue`. `.h5`
→ `Modal.vue`'s title. `.h6` → `GroupTags.vue` + `PageAccountSettings.vue`
(×3). `.clearfix` → 8 files incl. `Box.vue` (global component). `.input-
group*` → `GroupTags.vue`, `FrmInput.vue`, `FrmPwd.vue`. `.table*` →
`table/part/Table.js` + `TableDefault.vue`. `.dropdown` → `Dropdown.vue`'s
own root. `.border-start` → `ItemTemplate.vue` (the exact class node
`tailwindcss-color-utilities` had deliberately left bare/deferred —
resolved now, since "leave it bare" stops being safe once Bootstrap is
actually gone).

### Layer 2: Bootstrap's Reboot (global bare-element resets)
Realized `bootstrap.scss` supplies more than component/utility classes —
it resets bare HTML elements (`body`, `a`, `table` cells, headings, `hr`,
etc.) via Bootstrap's Reboot, entirely separate from and NOT reproduced
by Tailwind's own Preflight (which deliberately leaves those elements
unstyled by design). Audited every bare-element dependency actually
present in this app (not assumed) — confirmed via grep:
- **No bare unclassed headings** anywhere (`Heading.vue`'s real heading
  is always the `.h4`-classed `<p>`; `PagePreview.vue`/
  `PagePublicResume.vue`'s `<h2>`/`<h3>` always carry `.cv-name`/
  `.cv-section-title` with their own independent scoped `<style>`) — no
  Reboot heading-default dependency exists in this app.
- **No bare `<hr>`** (both instances already carry `.dropdown-divider`/
  `.border-success`).
- **No bare form controls** outside `.form-control` (already built,
  node `tailwindcss-form-controls`) — the only unclassed `<input>`s found
  are `type="file"` with `class="hidden"` (deliberately invisible).
- **`body`** — genuinely relies on Bootstrap's Reboot for
  font-family/size/weight/line-height/color/background — confirmed no
  independent app-level `body { ... }` CSS exists anywhere.
- **Bare `<a>`** — confirmed exactly 2 real instances relying on
  Bootstrap's default link color+underline: `Footer.vue`'s copyright
  link, `Header.vue`'s `.dropdown-link` (a dead custom class name with
  zero CSS definition anywhere — its entire visual styling is the bare
  `<a>` Reboot default). Every other `<a>` in the app already carries an
  explicit styling class (`.btn`, `.dropdown-item`, `.navbar-brand`,
  etc.), already covered.

Built a `@layer base` block (Tailwind's own intended home for exactly
this: bare-element defaults) reproducing only `body` + `a`/`a:hover` —
not a full Reboot port, scoped to what's actually relied upon.

### Layer 3: the CSS-variable foundation itself — the biggest structural finding
While designing Layer 1's rules, realized every `@layer components` rule
built across nodes 6-14 references `var(--bs-*)` tokens
(`--bs-primary`, `--bs-border-color`, `--bs-tertiary-bg`, etc.) that are
**currently defined ONLY by Bootstrap's own `_root.scss` output** — i.e.
by `bootstrap.scss` itself. Deleting `bootstrap.scss` outright would
silently undefine all 24 of these variables (confirmed via a repo-wide
`var(--bs-*)` grep — 24 distinct names actually referenced), breaking
every dormant rule from nodes 6-14 simultaneously — not a hypothetical,
a certainty, since CSS custom properties with no fallback resolve to
nothing at the point of use.

**Resolution**: self-host the same 24 variable NAMES with a plain
`:root, [data-bs-theme='light'] { ... }` / `[data-bs-theme='dark'] { ... }`
block, with NO dependency on the `bootstrap` npm package — values copied
verbatim from this app's own compiled output (`dist/assets/index-*.css`,
confirmed via a fresh build, which reflects the real customization —
`--bs-success`/`--bs-primary` are `#00d095` here, not vanilla
Bootstrap's default, because `bootstrap.scss` overrides `$primay`/
`$green`). This was chosen over rewriting every `var(--bs-*)` reference
across 9 prior nodes' rules (a much larger, more error-prone diff) — same
variable names, zero changes needed to any existing rule.
`--bs-link-color-rgb`/`--bs-link-hover-color-rgb` added too, for the new
`a` rule. Only variables that differ between light/dark are repeated in
the dark block (confirmed via extraction script which values are
theme-invariant vs theme-specific), mirroring Bootstrap's own structure.

## A 4th thing found along the way: `bootstrap.scss`'s own hand-authored custom CSS
Reading `bootstrap.scss` top-to-bottom (required to design the self-hosted
variable block) revealed its tail section isn't just Bootstrap package
imports — it's ~100 lines of this app's OWN custom CSS, physically living
in the same file: `.heading` (green color+border), `.pointer` (cursor),
`.modal-title` override (green+uppercase), `.modal-footer .btn`/`.footer
.btn` (min-width), `.item`/`.item-title`/`.item-note`/`.image`
(`ItemTemplate.vue` — a GLOBAL component, used by every education/
experience/project/award/certificate/reference item card),
`.post-content` (rich-text description rendering, also via
`ItemTemplate.vue`). `.breadcrumb` and `.list` in the same section
confirmed DEAD (zero usage anywhere via grep) — not migrated.

**Real finding, not a regression to fix**: `.heading { border-color:
#00d095 !important }` (this custom rule) has been silently overriding
node `tailwindcss-remaining-utilities-sweep`'s `border-[var(--bs-border-
color)]` fix on `Heading.vue` this ENTIRE session — the `!important`,
unlayered rule always won. `.heading`'s border has actually been GREEN
this whole time, not the gray `--bs-border-color` node 10 intended.
Preserved the ACTUAL current visual (green, `!important` kept) rather
than "fixing" it to what node 10 assumed was happening — changing it now
would be the real regression.

Extracted all of it verbatim (values unchanged) into the same
`@layer components` block, with colors hardcoded (`#00d095`, matching the
original SCSS's own literal `$_green` local variable, never a real
Bootstrap token) rather than depending on the now-self-hosted
`var(--bs-green)` — one less indirection for genuinely app-specific
color.

## Design
All additions went into `src/styles/tailwind.css`:
1. New unlayered `:root`/`[data-bs-theme]` block (self-hosted `--bs-*`
   tokens) — placed right after the `@tailwind` directives.
2. New `@layer base` block (`body`, `a`, `a:hover`).
3. Layer-1 gaps appended to the end of the existing `@layer components`
   block (headings, clearfix, text-uppercase, border-start, dropdown,
   input-group, table, toast, modal — in that order, each with its own
   scoping comment).
4. Layer-4 (custom app CSS) appended last, same `@layer components`
   block — `.modal-title`'s override is placed AFTER the base
   `.modal-title` rule from step 3 (same specificity, source order
   decides, matches Bootstrap's real cascade behavior too).

All new class names added to `tailwind.config.cjs`'s `safelist`
(defensive, per established discipline — every one already appears
literally in `src/`, confirmed via grep).

## Explicitly NOT fixed, disclosed
`body.modal-open` — confirmed via Bootstrap's own source
(`_modal.scss` line 3, just a comment, no real rule) that Bootstrap 5
has never shipped CSS for this class; the real scroll-lock always came
from Bootstrap's JS setting `body.style.overflow` as an inline style,
which `Modal.vue`'s rewrite (node `tailwindcss-modal-rewrite`) never
reproduced. This is a **pre-existing behavioral gap** (modals have never
actually locked body scroll since that node), unrelated to Bootstrap
CSS presence/absence either way — noted, not fixed (out of scope for a
CSS-migration node).

## Verification
1. `rm -rf dist && npm run build` → `✓ built in 4.79s`, only the
   pre-existing chunk-size warning.
2. `npm run lint` → exit 0, clean.
3. `npm run test` → `Test Files 16 passed (16)`, `Tests 111 passed
   (111)`.
4. **Exhaustive compiled-CSS check** (40 distinct rules/values, covering
   every new addition across all 4 layers) via a Python regex script
   against the compiled main bundle (`dist/assets/index-*.css`, 238KB):
   all 40 confirmed present on the corrected pass (first pass showed 4
   false negatives from my own regex — no space-after-colon assumption
   and `::after` vs `:after` pseudo-element normalization by the
   minifier — re-verified directly with `grep -o` and corrected regexes,
   all 4 were real matches, just my check script's bug, not a code
   defect).
5. Root-token values spot-checked against the actual compiled output
   directly (not re-derived from memory): `--bs-primary: #0d6efd`,
   `--bs-success: #00d095` (confirming the app's real green override,
   not vanilla Bootstrap blue-teal), dark-theme block confirmed present
   with all 11 theme-specific overrides.
6. Forbidden states: branch = `feature/tailwindcss-setup` (`MAIN_EDIT`
   clear). Node added to `dev-loop.prime-mermaid.md` before this note
   (`ADHOC_WORK` clear). This note exists (`NO_EVIDENCE` clear). No
   `.vue`/`.js`/`.ts` under `haven/` (`CODE_IN_HAVEN` clear).
   `EDIT_UNVERIFIED` avoided — every claim actually run and read back.

## Verification gap, disclosed — larger than any prior node
No live browser session available this session (same limitation as
nodes 4/7/10/11/12/13/14). This node carries more residual risk than any
prior one specifically because of its size (Modal/Toast structural
layout, table row/cell rendering, self-hosted color-token correctness
across both themes) — mitigated maximally within the no-browser
constraint: every value traced to either Bootstrap's real compiled
source or this app's own actual compiled output (never guessed), the
40-check exhaustive compiled-CSS sweep, and the operator's own
2-step-plan decision (this node stays purely additive — Bootstrap still
installed, still the active source for anything this node might have
gotten subtly wrong — so nothing here is user-visible yet; the operator
gets a chance to `npm run dev` and look before the next node touches the
actual deletion).

## Hub bytes
before=189705 (from node 14's verifier SEAL note's `hub_bytes_after`) ·
after not yet measured — verifier to measure at SEAL/REOPEN time.

## CORRECTION (post-REOPEN)
Verifier REOPENed
(`evidence/verifier/2026-09-13-tailwindcss-root-tokens-and-remaining-gaps-reopen.md`)
with 3 findings, 2 real code gaps and 1 undisclosed simplification —
all fixed:

1. **`.list` wrongly declared dead** (the significant one). This note's
   own Layer-1 section claimed `.list` was "confirmed DEAD (zero usage
   anywhere via grep)" — wrong. `src/components/global/ListTransition.vue`
   (a global, auto-registered Pug component) renders `TransitionGroup(...
   class="list" tag="ul")` — a real `<ul class="list">`, used by every
   `Page{Award,Certificate,Education,Experience,Project}.vue` CRUD list
   view. My grep sweep missed it because it was anchored to
   `class="list"` (attribute-string) patterns and this is Pug's
   `TransitionGroup(... class="list" ...)` prop syntax — a real,
   concrete miss, exactly the class of blind spot this same node's own
   Layer-1 section claimed to have specifically corrected for (by
   extending prior nodes' `class="..."`-anchored surveys to `.js`/`.ts`
   render props) — an embarrassing one to have re-committed in the same
   node. Verified via `npx sass` compile of the real `bootstrap.scss`
   that `.list { padding:0; margin:0; list-style:none; } .list > li {
   margin-bottom: 1.5rem; }` is the actual rule (the original SCSS's
   `&:not(:last-child){margin-bottom:1.5rem}` is redundant with the
   parent `> li` rule's own `1.5rem` — same value either way, simplified
   to just `.list > li`). Fixed: added the real rule to
   `tailwind.css`'s `@layer components`, safelisted `list` in
   `tailwind.config.cjs`.
2. **Bare `<h6>` Reboot dependency missed**. `PageAccountSettings.vue`
   has 3 real `<h6>` elements (`<h6 class="text-uppercase opacity-75
   mb-2">...`) with NO `.h6` class — my own earlier token-scan
   incorrectly counted these as ".h6 class usage" because the regex
   matched the word "h6" from the raw `<h6 ...>` tag text itself, not
   distinguishing a bare tag from an actual `.h6` class reference. This
   note's "Layer 2" section explicitly claimed "no bare unclassed
   headings anywhere" — false for this specific case. Bootstrap's real
   Reboot selector is element-inclusive (`h6, .h6, h5, .h5, h4, .h4`),
   and Tailwind's own Preflight actively resets bare `h1`-`h6` to
   `font-size/font-weight: inherit` — so without this fix, these 3
   headings would have silently lost their bold weight and
   margin-bottom the moment the next node deletes `bootstrap.scss`.
   Fixed: extended the shared heading-block selector and the `.h6`
   size rule to include the bare `h6` (and, matching Bootstrap's real
   selector group exactly, `h4`/`h5` too, even though confirmed unused
   bare — defensive, matches the real selector faithfully rather than a
   narrowed one).
3. **`.footer .btn` selector narrowed, undisclosed**. The real compiled
   selector (confirmed via `npx sass`) is `.form .footer .btn` (3 levels
   nested in the original SCSS: `.form { .footer { .btn {...} } }`), not
   bare `.footer .btn`. Harmless today (the only current `.footer`
   consumer, `VeeForm.vue`, is always inside `.form`), but was an
   undisclosed simplification, unlike every other intentional one in
   this same file (which all carry an explanatory comment). Fixed:
   changed to the real 3-level selector, with a comment explaining why
   (avoids silently widening scope if a bare `.footer` outside `.form`
   is ever added later).

Re-ran the full verification suite after all 3 fixes: `rm -rf dist &&
npm run build` → clean; `npm run lint` → exit 0; `npm run test` → 3
failed / 108 passed (111), all 3 failures the exact documented-flaky
`VeeForm.spec.ts` tests, no new failures. Compiled-CSS re-check confirmed
all 3 fixes present and correctly formed:
`h6,.h6{font-size:1rem}`, the extended shared heading-block selector
including bare `h6,h5,h4`, `.form .footer .btn{min-width:160px}`,
`.list{padding:0;margin:0;list-style:none}`,
`.list>li{margin-bottom:1.5rem}`. Re-submitted for verification.
