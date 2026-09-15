# 2026-09-13 — tailwindcss-button-component-system

- Worker: implementer
- Version: 0.1.0
- Node: `tailwindcss-button-component-system` (new node, node 6 of the
  phased Bootstrap → Tailwind migration, follows
  `tailwindcss-crud-pages-utilities`)
- Task (verbatim): "tiếp tục cho tới khi xong" (operator, continuing)

## Hub bytes before
132879 (root=12393, doctrine=27207, active diagram grown post-node-5,
implementer bundle=14963, verifier bundle=11154)

## Branch
`feature/tailwindcss-setup` (same branch as nodes 1-5, still
uncommitted).

## Context
`tailwindcss-crud-pages-utilities` flagged that Bootstrap's `.btn`/
`.btn-group`/`.btn-outline-*`/`.dropdown-item` are COMPONENT classes
(real visual design — colors, hover states, border-radius — via ~15 CSS
custom properties per Bootstrap's own `_buttons.scss`), not simple
utilities, and that reproducing them touches ~28 files' worth of class
usage. Operator decided (2 rounds of `AskUserQuestion`):
1. Build via Tailwind's `@layer components`, keeping the exact same
   class names — so consuming files need zero per-file edits.
2. "Vừa đủ" (good-enough) fidelity: colors/hover/border-radius/size
   correct, explicitly skip focus-visible ring, `.btn-check`
   integration, and gradient/box-shadow nuance.

## Diff
`src/styles/tailwind.css` only — added a `@layer components` block
(~190 lines) after the existing `@tailwind` directives:
- `.btn`/`.btn-sm` — base padding/font-size/border-radius/transition.
- Solid + outline variants for all 8 Bootstrap theme colors (primary,
  secondary, success, danger, warning, info, light, dark) — colors
  sourced from Bootstrap's own `var(--bs-{color})` CSS custom
  properties (not hardcoded hex), matching `.auth-card`'s existing
  `var(--bs-tertiary-bg)` pattern from node 2 — dark mode stays
  automatic since Bootstrap's own `[data-bs-theme=dark]` overrides keep
  driving these variables' values.
- Hover state via CSS `color-mix(in srgb, var(--bs-{color}) 85%,
  black)` — approximates Bootstrap's real SCSS `shade-color()`
  darkening (default 15-20% mix with black), a disclosed simplification
  (`color-mix()` is a real CSS function, not `@apply`-composed from
  Tailwind utilities, but achieves the same practical effect without
  needing to precompute darkened hex values per color per theme).
- `.btn-group` — merges adjacent buttons' borders (`margin-left: -1px`)
  and resets interior border-radius. Simplified vs Bootstrap's actual
  selectors, which also special-case `.btn-check` (radio/checkbox
  styled as buttons) — confirmed via `grep -rl "btn-check" src` that
  nothing in this app uses that pattern, so the simplification has zero
  real-world effect here.
- `.dropdown-toggle::after` (caret) + `.dropdown-toggle-split` sizing —
  CSS-only; the actual open/close JS behavior was already rewritten in
  `tailwindcss-dropdown-toast-navbar`, this just restores the caret's
  visual, previously supplied by Bootstrap's `dropdown.scss`.

## Verified inputs before writing (not assumed)
Grepped the actual compiled Bootstrap output for every `var(--bs-*)`
name this CSS depends on — all 10 confirmed real and correctly spelled:
`--bs-primary`, `--bs-secondary`, `--bs-success`, `--bs-danger`,
`--bs-warning`, `--bs-info`, `--bs-light`, `--bs-dark`,
`--bs-border-radius`, `--bs-border-radius-sm`. Avoids repeating the
class of mistake (assuming a name/value without checking) that caused
real bugs in `tailwindcss-modal-rewrite` and
`tailwindcss-dropdown-toast-navbar`.

## Important: this node is currently DORMANT — zero live visual change
Tailwind is imported BEFORE `bootstrap.scss` in `src/main.ts` (node 1's
decision, so Bootstrap's element resets keep winning for anything not
yet migrated). That import order means Bootstrap's own `.btn`/
`.btn-outline-*` rules land LATER in the final compiled stylesheet than
this new `@layer components` block. Both have equal specificity (a
single class selector each), so **the rule that appears later in the
cascade wins** — confirmed directly by finding both rules' byte offsets
in the real compiled `dist/assets/index-*.css` and comparing them:
Bootstrap's `.btn-outline-danger` block was found at a LATER byte
offset than this node's new one. This means Bootstrap's button CSS
keeps controlling the live app's appearance today, completely
unaffected by this diff — the new rules are correct and ready, but
inert until Bootstrap's own button/dropdown-toggle SCSS is actually
removed at the final Bootstrap-removal node.

**Consequence for verification**: there is no live visual regression
risk from this specific diff (nothing currently reads these new rules),
so a live-browser click-through wouldn't show anything different from
before this diff either way. Full visual verification (confirming every
color/size/state actually renders correctly once active) is deferred to
the final Bootstrap-removal node, when these rules go live for real —
verifying now against a page where they have zero observable effect
would be theater, not evidence.

## Command
```
npm run build
```

## Output
```
✓ built in 6.30s
```
Same pre-existing "chunks larger than 500 kB" warning only, no new
errors — confirms the CSS is syntactically valid (a bad `@layer`
block or malformed `color-mix()` call would fail the build).

Also ran:
- `npm run lint` → clean, exit 0.
- `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
  failed | 108 passed (111)` — same pre-existing `VeeForm.spec.ts`
  flaky failures as nodes 4-5.
- Verified the new rules actually compiled: `grep -o
  "\.btn-outline-danger{[^}]*}"` on the built CSS matched this node's
  rule (`color:var(--bs-danger);border-color:var(--bs-danger)`) as a
  distinct rule from Bootstrap's own (`--bs-btn-color: #dc3545;...`).
- Verified cascade order via byte-offset comparison in the compiled
  CSS (see above) — confirmed dormant, not assumed.
- Verified all 10 `var(--bs-*)` dependencies are real, spelled
  correctly, in the actual compiled Bootstrap output (see above).

## Acceptance
| Criterion | Evidence |
|---|---|
| New CSS compiles without error | `npm run build` → `✓ built in 6.30s` |
| Every referenced Bootstrap CSS variable is real | grep on compiled output, 10/10 confirmed |
| Confirmed dormant (no live visual change from this diff) | Byte-offset comparison: Bootstrap's own button rule lands later in the cascade |
| Only 1 file touched | `git status --porcelain -- src/styles/tailwind.css` |
| No new lint/test regressions | lint exit 0, 108/111 same pre-existing pattern |

## Noticed, not done
- Full visual QA of every button color/size/state — deferred to the
  final Bootstrap-removal node (this diff has zero live effect until
  then, so QA now would be against a page where it's inert).
- `.dropdown-menu`/`.dropdown-item`/`.dropdown-divider` background/text
  styling — not covered by this node (only the caret icon). A future
  node.
- `.card`/`.badge`/`.alert` and other Bootstrap component classes used
  elsewhere in the app — not covered, separate future nodes.
- `focus-visible` ring, `.btn-check` integration, gradient/box-shadow —
  disclosed, operator-approved gaps vs Bootstrap's real button system.

## Seal gate
No outward-facing action taken — nothing committed, diff lives in the
working tree on `feature/tailwindcss-setup` alongside nodes 1-5's
still-uncommitted diffs. Committing/pushing/PR into `staging` still
requires `/ship`.

---

## CORRECTION — REOPEN and fix (appended, original note above unedited)

The verifier REOPENed this node
(`evidence/verifier/2026-09-13-tailwindcss-button-component-system-reopen.md`):
independently re-checking all 16 color-rule-pairs (not the 1 this note's
original "verified the new rules actually compiled" check sampled)
found 7 silently missing from the compiled output —
`.btn-primary`/`.btn-warning`/`.btn-info`/`.btn-light`/`.btn-dark`
(solid) and `.btn-outline-light`/`.btn-outline-dark`.

**My first hypothesis (comma-grouped selector) was wrong.** I restructured
every color variant into a fully self-contained, single-selector block
(no shared `color:` grouping) and rebuilt — the SAME 7 were still
missing. Isolated further with a 10-rule minimal test file (generic
colors, no `var(--bs-*)`, no comments) — still reproduced, and a second
minimal test using fully generic selector names (`.btn-aaa`...`.btn-hhh`)
dropped ALL 8, not the same 7. This ruled out both "comma-grouping" and
"pure position" as the cause.

**Real root cause, found via a safelist test**: Tailwind's content-based
purge applies even to hand-written `@layer components` CSS — a class
name is dropped from the compiled output unless its exact string
literally appears somewhere in a file matched by `content` in
`tailwind.config.cjs`, REGARDLESS of it being explicitly authored in
`@layer components`. Confirmed precisely: `.btn-secondary`/`.btn-success`/
`.btn-danger` and 6 of 8 outline variants survived purely because those
specific class-name strings happen to already appear literally elsewhere
in `src/` (from earlier nodes' untouched markup); the 7 that were
dropped are exactly the ones with zero literal occurrence anywhere in
scanned content. Verified by adding `.btn-primary` to a test config's
`safelist` array — it then survived in an otherwise-identical minimal
rebuild.

**Fix**: added a `safelist` array to `tailwind.config.cjs` listing every
class this component system defines (all 8 solid + 8 outline color
variants, `btn`, `btn-sm`, `btn-group`, `btn-group-sm`,
`dropdown-toggle`, `dropdown-toggle-split`) — 22 entries total,
regardless of whether each currently has an incidental literal match
elsewhere (relying on that would be fragile: a future edit removing that
elsewhere-usage would silently re-break this component system with no
warning).

## Re-verification after the fix
- `rm -rf dist && npm run build` → `✓ built in 6.17s`, same pre-existing
  chunk-size warning only.
- **All 16 of 16** color-rule-pairs confirmed present via `grep -o
  "\.$prefix{[^}]*var(--bs-$c)[^}]*}"` for every combination of the 8
  colors × {solid, outline} — 0 missing (was 7 missing before the fix).
- `.btn-group` and `.dropdown-toggle:after` (Tailwind/PostCSS renders
  `::after` as `:after` in output) both confirmed present with the
  exact CSS this note's original Diff section described.
- `npm run lint` → clean, exit 0.
- `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
  failed | 108 passed (111)` — same pre-existing `VeeForm.spec.ts`
  flakiness as every prior node, unrelated (this diff still touches
  nothing under `src/components/veevalidate/`).
- `git status --porcelain -- src/styles/tailwind.css tailwind.config.cjs`
  → both untracked (as they've been since node 1), no other file
  touched by this correction.

## Updated diff summary
2 files now (was 1): `src/styles/tailwind.css` (unchanged from the
original note's description, plus the per-variant restructuring) and
`tailwind.config.cjs` (new `safelist` array, ~22 entries).

## Updated "dormant" claim — still holds
The byte-offset/cascade-order argument in the original note (Bootstrap's
own button CSS still wins today since it's imported after and has equal
specificity) is unaffected by this fix — still fully dormant, zero live
visual change, confirmed the same way after the fix as before it.
