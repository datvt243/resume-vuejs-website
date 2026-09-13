# 2026-09-13 — tailwindcss-dropdown-menu-styling

- Worker: implementer
- Version: 0.1.0
- Node: `tailwindcss-dropdown-menu-styling` (new node, node 7 of the
  phased Bootstrap → Tailwind migration, follows
  `tailwindcss-button-component-system`)
- Task (verbatim): "tiếp tục luôn" (operator, continuing)

## Hub bytes before
139315 (root=12393, doctrine=27207, active diagram grown post-node-6,
implementer bundle=14963, verifier bundle=11154)

## Branch
`feature/tailwindcss-setup` (same branch as nodes 1-6, still
uncommitted).

## Context
Natural continuation of `tailwindcss-button-component-system`'s
`@layer components` design system — `.dropdown-item`/`.dropdown-divider`
were left explicitly deferred by that node (only the caret icon was
covered). Applied the exhaustive-verification lesson from that node's
REOPEN from the very start this time: checked every new rule
individually in the compiled output (not a 1-selector sample), and
added every new class name to `tailwind.config.cjs`'s `safelist`
explicitly, regardless of incidental usage elsewhere.

## Diff
2 files (same 2 as node 6's correction): `src/styles/tailwind.css`
(+~55 lines) and `tailwind.config.cjs` (+4 safelist entries:
`dropdown-menu`, `dropdown-item`, `dropdown-divider`, `disabled`).

- `.dropdown-menu` — background/border/text/radius from root-scoped
  `var(--bs-tertiary-bg)`/`var(--bs-border-color-translucent)`/
  `var(--bs-body-color)`/`var(--bs-border-radius)` (same pattern as
  `.auth-card` from `tailwindcss-auth-pages`, deliberately NOT the
  dropdown-specific `--bs-dropdown-*` variables — see below).
- `.dropdown-item` — padding/color/hover (`var(--bs-secondary-bg)`
  background on hover)/disabled state.
- `.dropdown-divider` — a 1px top border using
  `var(--bs-border-color-translucent)`.

## Real, currently-LIVE bug found and fixed
Read Bootstrap's actual `node_modules/bootstrap/scss/_dropdown.scss`
(not assumed from memory, same discipline as node 6's `var(--bs-*)`
verification). Bootstrap's real dropdown-menu positioning:
```scss
&[data-bs-popper] {
    top: 100%;
    left: 0;
    margin-top: var(--#{$prefix}dropdown-spacer);
}
```
This is gated behind a `[data-bs-popper]` attribute that ONLY
Bootstrap's own Popper.js-integrated `Dropdown` JS class ever sets at
runtime (when it computes and applies positioning). `tailwindcss-
dropdown-toast-navbar` already removed that JS entirely — meaning
`[data-bs-popper]` has never been set on any dropdown menu since that
node shipped, and every dropdown in the live app has had NO explicit
`top`/`left` at all since then, silently relying on the browser's
default "static position" fallback for an absolutely-positioned element
with no offsets set (which happens to often look approximately right
due to normal document flow, but isn't the same as Bootstrap's real,
intentional 100%-below-with-spacer-gap positioning). This wasn't caught
at the time because `Dropdown.spec.ts`'s jsdom tests check class/state
toggling (`show` class, `aria-expanded`, etc.), not real CSS layout —
jsdom doesn't compute real layout positions.

**Fix**: added `position: absolute; top: 100%; left: 0; z-index: 1000;
margin-top: 0.125rem;` unconditionally to the new `.dropdown-menu` rule
(matching Bootstrap's real values — `0.125rem` is Bootstrap's default
`$dropdown-spacer`).

## Design choice: root-scoped vars, not dropdown-specific ones
Bootstrap defines `--bs-dropdown-bg`/`--bs-dropdown-color`/etc. ONLY
inside its own `.dropdown-menu` rule (element-scoped custom properties,
not `:root`-scoped like `--bs-primary`/`--bs-tertiary-bg`). Using those
dropdown-specific variables would work today (Bootstrap's rule still
defines them) but would silently break the moment Bootstrap's own
`.dropdown-menu` CSS is removed at the final cleanup node — at that
point nothing would define `--bs-dropdown-bg` anymore. Used the same
root-scoped tokens `.auth-card` already relies on instead, which stay
defined independently of any Bootstrap COMPONENT css, only needing
Bootstrap's base `:root`/`[data-bs-theme]` variable definitions to
survive.

## Important: NOT fully dormant, unlike node 6
Node 6's button system was 100% inert today because Bootstrap's own
`.btn`/`.btn-outline-*` rules declare every property mine did, and
(being later in the cascade) fully override them. Here, Bootstrap's
`.dropdown-menu` base rule does NOT declare `top`/`left` at all outside
the `[data-bs-popper]` gate — so those two specific properties from
MY rule are NOT contested by anything and take effect immediately. The
color/background/border/padding properties, which Bootstrap's rule DOES
also declare (and which comes later in the cascade — confirmed via byte
offset: mine at 32929, Bootstrap's at 150419 in the compiled CSS),
remain dormant/shadowed as expected. Only the positioning fix is a real,
live behavior change from this diff.

## Verification gap, disclosed honestly
No live authenticated browser session was available (same limitation
noted starting at `tailwindcss-dropdown-toast-navbar`) to visually
confirm the position fix renders as intended. Verified instead by:
reading Bootstrap's actual source for the exact values its own JS
applies (not guessed), reproducing them exactly, and confirming via the
compiled build that these specific properties (`top`/`left`) aren't
contested by any other currently-active rule for `.dropdown-menu`.
Judged low risk — standard, spec-documented CSS values (`position:
absolute` + `top`/`left` offsets relative to a `position: relative`
parent, which `.dropdown` already has), not a nuanced same-property
cascade fight like Modal's `display:block` bug was. Flagging the gap
rather than claiming a confidence level not actually earned.

## Command
```
npm run build
```

## Output
```
✓ built in 6.23s
```
Same pre-existing "chunks larger than 500 kB" warning only.

Verified EVERY new rule group individually in the compiled output
(exhaustive, not sampled, per node 6's lesson):
```
.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;margin-top:.125rem;min-width:10rem;padding:.5rem 0;color:var(--bs-body-color);background-color:var(--bs-tertiary-bg);border:1px solid var(--bs-border-color-translucent);border-radius:var(--bs-border-radius, .375rem)}
.dropdown-item{display:block;width:100%;padding:.25rem 1rem;clear:both;font-weight:400;color:var(--bs-body-color);text-align:inherit;text-decoration:none;white-space:nowrap;background-color:transparent;border:0}
.dropdown-item:hover,.dropdown-item:focus{color:var(--bs-body-color);background-color:var(--bs-secondary-bg)}
.dropdown-item.disabled,.dropdown-item:disabled{color:var(--bs-secondary-color, #6c757d);pointer-events:none;background-color:transparent}
.dropdown-divider{height:0;margin:.5rem 0;overflow:hidden;border-top:1px solid var(--bs-border-color-translucent);opacity:1}
```
All 5 present — 0 missing.

Also ran:
- `npm run lint` → clean, exit 0.
- `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
  failed | 108 passed (111)` — same pre-existing `VeeForm.spec.ts`
  flakiness as every prior node.

## Acceptance
| Criterion | Evidence |
|---|---|
| All 5 new rule groups compile | Exhaustive grep, 5/5 present, quoted above |
| Positioning fix uses Bootstrap's real values | Read `_dropdown.scss` directly, `0.125rem` = Bootstrap's `$dropdown-spacer` default |
| Color/border/padding still dormant (no live change there) | Byte-offset comparison: Bootstrap's rule at 150419 vs mine at 32929 |
| Build/lint stay green | `✓ built in 6.23s`, lint exit 0 |
| No new test regressions | 108/111, same pre-existing pattern |
| Scope contained | `git status --porcelain` — only `tailwind.css` + `tailwind.config.cjs` |

## Noticed, not done
- Live visual confirmation of the position fix — no authenticated
  browser session available, disclosed above as a real gap, not
  silently skipped.
- `.card`/`.badge`/`.alert` and other Bootstrap component classes used
  elsewhere in the app — separate future nodes.
- Bootstrap's responsive `dropdown-menu-{breakpoint}-end` variants and
  `dropup`/`dropend`/`dropstart` directional positioning — not used
  anywhere in this app (confirmed via `grep`), not reproduced.

## Seal gate
No outward-facing action taken — nothing committed, diff lives in the
working tree on `feature/tailwindcss-setup` alongside nodes 1-6's
still-uncommitted diffs. Committing/pushing/PR into `staging` still
requires `/ship`.
