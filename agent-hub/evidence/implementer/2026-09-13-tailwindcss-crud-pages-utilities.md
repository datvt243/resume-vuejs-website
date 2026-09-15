# 2026-09-13 — tailwindcss-crud-pages-utilities

- Worker: implementer
- Version: 0.1.0
- Node: `tailwindcss-crud-pages-utilities` (new node, node 5 of the
  phased Bootstrap → Tailwind migration, follows
  `tailwindcss-dropdown-toast-navbar`)
- Task (verbatim): "tiếp tục cho tới khi xong" (operator, continuing)

## Hub bytes before
128842 (root=12393, doctrine=27207, active diagram grown post-node-4,
implementer bundle=14963, verifier bundle=11154)

## Branch
`feature/tailwindcss-setup` (same branch as nodes 1-4, still
uncommitted).

## Context — scope narrowed mid-node, operator consulted
Node 4 finished removing all Bootstrap JS. The natural next step, the 6
dashboard CRUD pages, turned out to have TWO very different kinds of
Bootstrap classes: simple utilities (spacing/flex/opacity/font-size —
same class of thing already converted in `tailwindcss-auth-pages`) and
Bootstrap COMPONENT classes (`.btn`, `.btn-outline-*`, `.btn-group`,
`.dropdown-item`) which carry real visual design (colors, hover states,
border-radius, ~15 CSS custom properties per Bootstrap's own
`_buttons.scss`) that Tailwind has no built-in equivalent for — Tailwind
ships bare utilities, not pre-made button components. Converting THOSE
properly means designing a Tailwind-based button system from scratch,
which is real design work spanning ~28 files using `.btn`-family
classes, not mechanical renaming.

Stopped and asked the operator (`AskUserQuestion`, 2 rounds) rather than
either (a) silently deciding a design direction that might not match
their taste, or (b) blindly renaming component classes without a real
Tailwind equivalent behind them. Operator decided:
1. Build the button/component system via Tailwind's `@layer components`,
   keeping the exact same class names (`.btn`, `.btn-outline-danger`,
   etc.) — so none of the ~28 consuming files need per-file edits, only
   the CSS *source* changes from Bootstrap to Tailwind eventually.
2. Fidelity level: "vừa đủ" (good-enough) — reproduce color/hover/
   border-radius/size correctly (using Bootstrap's own `var(--bs-*)`
   color variables directly, so dark mode stays automatic), explicitly
   skip focus-visible ring, `btn-check` integration, and gradient/
   box-shadow nuance as disclosed simplifications.

That button-system work is now its own separate, not-yet-started node —
this node covers ONLY the simple-utility subset that doesn't depend on
it.

## Diff
6 files, 21 insertions / 21 deletions total — `PageAward.vue`,
`PageCertificate.vue`, `PageEducation.vue`, `PageExperience.vue`,
`PageProject.vue`, `PageReference.vue`.

| Bootstrap class | Tailwind result | Why |
|---|---|---|
| `mb-4` (outer wrapper, all 6 files) | `mb-[1.5rem]` | Arbitrary value — Bootstrap's OWN `.mb-4` = 1.5rem collides with Tailwind's own `.mb-4` = 1rem (same bug class as `tailwindcss-auth-pages`'s `.mt-4` discovery: Bootstrap's `!important` would silently win with the wrong value) |
| `mx-3` (the "Đóng" button, all 6 files) | `mx-[1rem]` | Same reasoning — Bootstrap's `.mx-3`=1rem would collide with Tailwind's own `.mx-3`=0.75rem if a same-numbered Tailwind class were used |
| `small` (Education/Experience/Project's drag-hint text) | `text-sm` | Matches the mapping already established in `tailwindcss-auth-pages` |
| `opacity-50` | unchanged | Verified Bootstrap's `.opacity-50` and Tailwind's own `.opacity-50` are both `opacity: 0.5` — identical value, safe regardless of which wins the cascade (same reasoning already applied to `opacity-75` in node 2) |
| `mb-2` / `pe-2` / `gap-2` | unchanged | Bootstrap's spacer step 2 (`0.5rem`) and Tailwind's own step 2 are IDENTICAL for this specific step (both frameworks use the same 0.25rem base unit for steps 0-2, only diverging from step 3 onward) — these are already valid, future-proof Tailwind class names as-is, nothing to change |
| `d-flex align-items-start` (draggable item wrapper) | `flex items-start` | Direct 1:1, no collision |
| `flex-grow-1` | `grow` | Tailwind's name for this is entirely different (`grow`, not `flex-grow-1`) — zero collision risk since the names don't overlap at all |
| `clearfix` | unchanged (deferred) | Tailwind ships no `clearfix` utility; Bootstrap's own class still works fine since Bootstrap CSS stays imported (dual-framework) — revisit at the final Bootstrap-removal node |

Explicitly NOT touched (deferred to the future button/component-system
node): `btn`, `btn-group`, `btn-sm`, `btn-outline-danger`/`warning`/
`primary`/`success`/`secondary`, `dropdown-item`, `dropdown-divider`,
`text-warning`/`text-primary`/`text-danger` (theme-reactive color
classes, same category as `PageResetPassword.vue`'s deferred
`.text-danger` from node 2).

## Command
```
npm run build
```

## Output
```
✓ built in 6.35s
```
Same pre-existing "chunks larger than 500 kB" warning only, no new
errors. Confirmed the new arbitrary-value classes actually compiled:
`grep -o "margin-bottom:1\.5rem" dist/assets/index-*.css` and
`grep -o "mx-\\\[1rem\\\]{[^}]*}" dist/assets/*.css` both matched —
`margin-left:1rem;margin-right:1rem` for the latter.

Also ran:
- `npm run lint` → clean, exit 0.
- `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
  failed | 108 passed (111)` — identical failure pattern to node 4 (same
  3 pre-existing `VeeForm.spec.ts` flaky tests, confirmed unrelated via
  `git diff --stat -- src/components/veevalidate/` = empty).

## Acceptance
| Criterion | Evidence |
|---|---|
| No leftover converted classes in the 6 files | `grep -nE 'class="[^"]*\bmb-4\b\|...\bd-flex\b\|...\bflex-grow-1\b\|...\bsmall\b'` across all 6 → zero matches |
| New Tailwind classes present in the real build | `grep` on `dist/assets/*.css` confirmed both arbitrary-value rules compiled correctly |
| Build/lint stay green | `✓ built in 6.35s`, lint exit 0 |
| No new test regressions | 108/111, same pre-existing flaky failures as node 4 |
| Scope contained to exactly the 6 target files | `git diff --stat` — 6 files, 21/21 |

## Noticed, not done
- `.btn`-family / `.dropdown-item` / color-utility classes across these
  6 pages AND ~22 other files — deferred to the new button/component-
  system node (operator-scoped, "vừa đủ" fidelity, see Context above).
- `clearfix` — no direct Tailwind equivalent, left as Bootstrap's own
  class, revisit at final Bootstrap removal.

## Seal gate
No outward-facing action taken — nothing committed, diff lives in the
working tree on `feature/tailwindcss-setup` alongside nodes 1-4's
still-uncommitted diffs. Committing/pushing/PR into `staging` still
requires `/ship`.
