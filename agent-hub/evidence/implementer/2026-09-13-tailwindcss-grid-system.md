# 2026-09-13 — tailwindcss-grid-system

- Worker: implementer
- Node: `tailwindcss-grid-system`
- Branch: `feature/tailwindcss-setup` (same ongoing migration branch)
- Status: sealed_pending_verifier

## Task
Node 11 of the Bootstrap→Tailwind migration (operator: "tiếp tục", the
standing "tiếp tục cho tới khi xong" directive). Following node 10's
"Skipped, logged as follow-up" list, the next un-migrated Bootstrap
system is the **grid** (`.container`/`.row`/`.col`/`.col-auto`/
`.col-md-*`), flagged in multiple prior nodes' notes as the biggest
remaining structural piece.

## Survey (before any edit)
Ran a 2-part grep sweep (`\.(container|row|col|col-[a-z0-9-]*)\b`
against Pug dot-chain AND `class="..."` attribute syntax) across all of
`src/`, then read every matched line directly to separate real Bootstrap
grid usage from custom app classes that merely contain the substring
"container"/"row" (a false-positive risk this session already learned
about the hard way in node 10 with Pug/JS blind spots).

**Real Bootstrap grid usage — 7 files:**
- `.container`: `Footer.vue:14`, `Header.vue:85`, `LayoutAuth.vue:19`,
  `LayoutDefault.vue:55` (all Pug dot-chain), `Navbar.vue:24` (class
  attr).
- `.row` + `.col-12` + dynamic `col-md-6`/`col-md-12`:
  `VeeForm.vue:131,133` — `<div :class="['col-12', el?.col ||
  'col-md-12']">`, where `el.col` comes from each field's model
  definition. Grepped every `src/models/*.model.ts` for `col:` — only 2
  distinct values used anywhere: `'col-md-12'` and `'col-md-6'`.
- `.col` + `.col-auto`: `ItemTemplate.vue:56,58,60` — `.col.grow`,
  `.col-auto`, `.col-auto.ms-auto`, all nested inside `.flex` (Tailwind),
  NOT inside a `.row`.

**False positives, confirmed by reading the line, NOT touched:**
`Toasts.vue` (`toast-container`), `Spinner.vue` (`spinner-container`),
`TableDefault.vue` (`table-container`), `VeeFormGeneralInformationUpdate.vue`
+ `PageHome.vue` + all 6 dashboard CRUD pages + `PagePreview.vue` +
`PagePublicResume.vue` (`block-container`), `NotFound.vue`
(`auth-container`), `PageHome.vue` (`attach-row`), `PageInformation.vue`
(`avatar-row`) — all pre-existing custom classes, unrelated to
Bootstrap's grid system.

## Design
Read Bootstrap's real source (not guessed):
- `node_modules/bootstrap/scss/_variables.scss`: `$grid-gutter-width:
  1.5rem`, `$container-max-widths: (sm: 540px, md: 720px, lg: 960px, xl:
  1140px, xxl: 1320px)`, `$grid-breakpoints: (xs: 0, sm: 576px, md:
  768px, lg: 992px, xl: 1200px, xxl: 1400px)`.
- `node_modules/bootstrap/scss/mixins/_container.scss` (`make-container`):
  `width:100%`, `padding-{left,right}: calc(gutter-x * .5)` = 0.75rem,
  `margin-{left,right}: auto`.
- `node_modules/bootstrap/scss/_grid.scss` + `mixins/_grid.scss`
  (`make-row`, `make-col-ready`, `make-col`, `make-col-auto`): `.row`
  sets `display:flex; flex-wrap:wrap; margin-{left,right}: calc(-.5 *
  gutter-x)` = -0.75rem. `.row > *` (via `make-col-ready`) sets
  `flex-shrink:0; width:100%; max-width:100%; padding-{left,right}:
  0.75rem` — this is a genuinely separate selector from any specific
  `.col-*` class, applying to ANY direct child of `.row` regardless of
  which column class it carries. `.col` (bare) is its own standalone
  rule: `flex: 1 0 0%` — independent of `.row` ancestry. `.col-auto`:
  `flex: 0 0 auto; width: auto` — also standalone, independent of `.row`
  ancestry. `.col-12`: `flex: 0 0 auto; width: 100%` (12/12 columns).
  `.col-md-6`/`.col-md-12` inside `@media (min-width: 768px)`: `flex: 0
  0 auto; width: 50%`/`100%`.

Key finding: `ItemTemplate.vue`'s `.col`/`.col-auto` usage has NO `.row`
ancestor, so in real Bootstrap CSS today it never actually receives the
`.row > *` padding/width-100%-base rule — only the bare `.col`/`.col-auto`
selectors apply (flex-basis only, no padding). Reproduced this exactly
rather than "fixing" it by accidentally adding padding that was never
actually live.

Added to `src/styles/tailwind.css` under `@layer components`, same style
as every prior node (hardcoded rem/px values matching Bootstrap's real
output, root-scoped where colors are involved — none needed here, this
is pure layout):
```css
.container { width:100%; padding-right:.75rem; padding-left:.75rem; margin-right:auto; margin-left:auto; }
@media (min-width:576px){ .container{ max-width:540px } }
@media (min-width:768px){ .container{ max-width:720px } }
@media (min-width:992px){ .container{ max-width:960px } }
@media (min-width:1200px){ .container{ max-width:1140px } }
@media (min-width:1400px){ .container{ max-width:1320px } }

.row { display:flex; flex-wrap:wrap; margin-right:-.75rem; margin-left:-.75rem; }
.row > * { flex-shrink:0; width:100%; max-width:100%; padding-right:.75rem; padding-left:.75rem; }
.col { flex:1 0 0%; }
.col-auto { flex:0 0 auto; width:auto; }
.col-12 { flex:0 0 auto; width:100%; }
@media (min-width:768px){
  .col-md-6 { flex:0 0 auto; width:50%; }
  .col-md-12 { flex:0 0 auto; width:100%; }
}
```
Scoped to exactly these 7 classes — Bootstrap's full 12-column
generation (`.col-1`..`.col-11`, `.offset-*`, `.row-cols-*`, `.g-*`
gutter utilities, `.container-sm/-lg/-xl/-xxl`) is not built, confirmed
unused via the grep sweep above, same "only what's used" scoping
established in nodes 8/9.

**Zero consumer-file edits needed for the grid classes themselves** —
same "keep the class name, change the CSS source" strategy as nodes
6-9. `.container`/`.row`/`.col`/`.col-auto`/`.col-12`/`.col-md-6`/
`.col-md-12` all stay exactly as they already appear in `Footer.vue`,
`Header.vue`, `LayoutAuth.vue`, `LayoutDefault.vue`, `Navbar.vue`,
`VeeForm.vue`, `ItemTemplate.vue`.

All 7 classes added to `tailwind.config.cjs`'s `safelist` array,
defensively, even though all 7 already appear literally in scanned
content (the established discipline since node 6's purge-defect
discovery — don't rely on incidental usage surviving future edits).

## Bonus fix (same file already being touched) + bug caught
While in `VeeForm.vue` for the `.row`/`.col` survey, noticed the
adjacent line: `:class="[`justify-content-${props.buttonPosition}`]"`
— a leftover Bootstrap flex-utility dynamic class, not itself part of
the grid system but trivial to fix in the same file/pass.
`buttonPosition` values used across the codebase (grepped): `'start'`
(default), `'end'`, `'center'` — Tailwind's own utilities use the exact
same suffix words (`justify-start`/`justify-end`/`justify-center`), so
renamed to `` `justify-${props.buttonPosition}` `` with no fidelity
gap.

**This caught a real, live purge bug from the rename itself**: because
the class name is built via JS template-string interpolation, Tailwind's
content scanner cannot statically resolve it to a literal string, so any
interpolated value not ALSO used literally elsewhere in `src/` is
silently dropped from the compiled CSS. First build after the rename
confirmed this empirically:
```
grep -c '\.justify-start{' dist/assets/index-*.css   → 0
grep -c '\.justify-end{' dist/assets/index-*.css     → 0
grep -c '\.justify-center{' dist/assets/index-*.css  → 1  (survived by incidental literal usage elsewhere)
```
Had this shipped unnoticed, `buttonPosition="end"` (used on 6 CRUD
pages' submit-button rows) would have silently lost its right-alignment.
Fixed by adding `justify-start`/`justify-end`/`justify-center` to the
same `safelist` array. Rebuilt, re-checked: all 3 now present (1 match
each).

## Verification
1. `rm -rf dist && npm run build` → `✓ built in 4.78s` (first pass,
   before the safelist fix) and `✓ built in 4.78s` (second pass, after)
   — only the pre-existing "chunks larger than 500 kB" warning both
   times.
2. `npm run lint` → exit 0, clean, both passes.
3. `npm run test`:
   - First run (before the justify-* safelist fix — unrelated to it):
     `Test Files 1 failed | 15 passed (16)`, `Tests 1 failed | 110
     passed (111)` — the failure is
     `VeeForm.spec.ts`'s documented-flaky "BUG (real, verified): typing
     then clearing a required field does NOT disable submit" test
     (named in `doctrine/MEMORY.md`'s flakiness note since node 4).
   - Second run (after the safelist fix, final state): `Test Files 16
     passed (16)`, `Tests 111 passed (111)` — the flaky test passed this
     time, consistent with documented flakiness, not a regression caused
     by this diff (unrelated code path).
4. Exhaustively verified all 13 new CSS declarations present in the
   compiled main bundle (`dist/assets/index-*.css`, confirmed by size —
   230KB, the one carrying the full Tailwind+Bootstrap stylesheet, not
   one of the small per-route chunks) via a Python regex script (learned
   from node 10's shell-escaping mistake — grep alone previously produced
   a false negative on an escaped selector):
   ```
   FOUND  \.container\{width:100%
   FOUND  max-width:540px / 720px / 960px / 1140px / 1320px  (all 5)
   FOUND  \.row\{display:flex
   FOUND  \.row>\*\{flex-shrink:0
   FOUND  \.col\{flex:1 0 0%\}
   FOUND  \.col-auto\{flex:0 0 auto;width:auto\}
   FOUND  \.col-12\{flex:0 0 auto;width:100%\}
   FOUND  \.col-md-6\{flex:0 0 auto;width:50%\}   (inside 768px media query)
   FOUND  \.col-md-12\{flex:0 0 auto;width:100%\} (inside 768px media query)
   ```
5. Forbidden states: branch = `feature/tailwindcss-setup`, not
   main/staging (`MAIN_EDIT` clear). Node added to
   `dev-loop.prime-mermaid.md` before this note (`ADHOC_WORK` clear).
   This note exists (`NO_EVIDENCE` clear). No `.vue`/`.js`/`.ts` under
   `haven/` (`CODE_IN_HAVEN` clear). Diagram row written with full
   findings, not left thin (`DIAGRAM_DRIFT` avoided pending verifier
   SEAL). `EDIT_UNVERIFIED` avoided — every claim above was actually run
   and read back, not inferred.

## Deferred (unchanged from node 10's list, minus grid which is now done)
- Navbar component classes (`.navbar-nav`/`.nav-link`/`.nav-item`/
  `.navbar-brand`) — a separate Bootstrap Navbar sub-system, not grid.
- Remaining color-semantic utilities (`.bg-body-tertiary`,
  `.text-success`/`.text-info`/`.text-danger`, `.border-success`) —
  needs a dedicated color/dark-mode token decision, deferred since node
  2.
- Final Bootstrap removal (the npm package + `bootstrap.scss` + its
  import) — still untouched, will need real visual QA once attempted,
  since that's when all the dormant `@layer components` CSS (buttons,
  dropdowns, badges, alerts, forms, and now grid) actually activates.

## Verification gap, disclosed
No live browser session available this session (same limitation as
nodes 4/7/10 — no login credentials, no open authenticated tab).
Mitigated the same way as those nodes: exhaustive compiled-CSS presence
checks (not sampling) + reading Bootstrap's actual source values rather
than guessing, plus the immediate self-caught purge bug above as a
concrete demonstration the verification method actually works, not just
theater.

## Hub bytes
before=163563 (from the prior node's verifier SEAL note's
`hub_bytes_after`) · after not yet measured — verifier to measure at
SEAL/REOPEN time per convention.
