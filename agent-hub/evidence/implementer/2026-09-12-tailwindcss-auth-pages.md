# 2026-09-12 — tailwindcss-auth-pages

- Worker: implementer
- Version: 0.1.0
- Node: `tailwindcss-auth-pages` (new node, node 2 of the phased
  Bootstrap → Tailwind migration, follows `tailwindcss-setup`)
- Task (verbatim): "tiếp tục" (operator, continuing the migration started
  by "site đang dùng bootstap, hãy chuyển sang tailwindcss")

## Hub bytes before
111367 (root=12393, doctrine=27207, active diagram=45650, implementer
bundle=14963, verifier bundle=11154)

## Branch
`feature/tailwindcss-setup` (same branch as node 1 — one ongoing
`feature/*` effort, still nothing committed).

## Context — pilot selection
A read-only `Explore` agent surveyed every `.vue` file's Bootstrap class
usage (Plan Mode was active for this turn, so exploration ran before any
edit). Findings: most natural candidates (dashboard CRUD pages) trigger
the shared `Modal.vue` via `data-bs-toggle`/`data-bs-target`, which still
depends on Bootstrap's JS — out of scope until `Modal.vue` itself gets a
Vue-native rewrite in a later node. The 4 auth pages (`PageLogin`,
`PageRegister`, `PageForgotPassword`, `PageResetPassword`) were the
cleanest pilot: zero Bootstrap JS, each reached only via its own route
(no shared-component blast radius), and they share one identical wrapper
pattern — one node covers the whole family instead of 4 near-duplicate
ones. Wrote the plan (`ExitPlanMode`) with the exact class-mapping table
before touching any file; operator approved.

## Diff
| File | Change |
|---|---|
| `src/pages/auth/PageRegister.vue` | wrapper `div`: `d-flex align-items-center justify-content-center` → `flex items-center justify-center` |
| `src/pages/auth/PageLogin.vue` | wrapper `div` (same as above) + `RouterLink`: `d-inline-block mt-3 small` → `inline-block mt-[1rem] text-sm` |
| `src/pages/auth/PageForgotPassword.vue` | wrapper `div` (same) + `<p>`: `small opacity-75` → `text-sm opacity-75` + `RouterLink` (same as Login) |
| `src/pages/auth/PageResetPassword.vue` | wrapper `div` (same) + `<p>`: `small text-danger` → `text-sm text-danger` (`text-danger` deliberately left as Bootstrap, see below) |

`<style scoped lang="scss">` blocks (`.auth-card`, `.login-page`, etc.)
untouched in all 4 files — they read Bootstrap CSS custom properties
(`var(--bs-tertiary-bg)`, `var(--bs-border-color-translucent)`), not a
utility class, and those variables keep working as long as
`bootstrap.scss` stays imported (node 1's dual-framework decision).
`Heading.vue`/`VeeForm.vue`/`RouterLink` internals untouched.

## Deliberately NOT migrated
`.text-danger` in `PageResetPassword.vue` stays a Bootstrap class. It's
theme-reactive (`--bs-danger` is redefined per `data-bs-theme`), and
`tailwind.config.cjs` currently has no color/dark-mode token strategy —
a naive swap to a stock Tailwind color (e.g. `text-red-600`) would
silently drop dark-mode reactivity. Needs a real design-token decision in
a future node, not a guess here.

## Real bug found and fixed — Bootstrap/Tailwind class-name collision
Initially mapped Bootstrap's `mt-3` (spacer step 3 = `1rem`) to
Tailwind's `mt-4` (spacing step 4 = `1rem`) — correct on paper (same
computed value in isolation). But **Bootstrap also defines its own class
literally named `.mt-4`** (spacer step 4 = `1.5rem`, with `!important`,
since Bootstrap's numbering and Tailwind's numbering both exist in the
same bundle under the same class names for small numbers). Confirmed via
a real browser session (see Verification below) that Bootstrap's rule
was winning silently — `npm run build`/`lint`/`test` all stayed green
through this bug the entire time; none of them can catch a same-named-class
collision between two frameworks loaded side by side. Fixed by using an
arbitrary-value class, `mt-[1rem]`, which cannot collide with any
Bootstrap-defined name. Re-verified in the live browser after the fix.

Also checked `.opacity-75` (used in `PageForgotPassword.vue`) for the
same class of bug: it also has a dual definition (Tailwind's plain rule
+ Bootstrap's `!important` one), but both frameworks agree on the exact
value (`opacity: 0.75`), confirmed via live computed-style read — no
functional difference, safe as originally reasoned in the plan.

**Trap for future nodes** (worth adding to `doctrine/domains/PROJECT.md`
if this migration keeps hitting it): any Tailwind utility class whose
bare name overlaps a Bootstrap utility name — this is common for small
numeric spacing/margin/padding/opacity/sizing classes (0 through roughly
5, matching Bootstrap's spacer scale) — needs a **live value check**, not
just a green build, because Bootstrap's `!important` wins the collision
silently and the wrong value never shows up in `npm run build` output.

## Verification — live browser (not just build/lint/test)
A remote-debugging Chrome was already listening on port 9888 (per
`doctrine/domains/PROJECT.md`'s recorded CDP technique). Started
`npm run dev` (`http://localhost:5174/resume-vuejs-website/`, confirmed
the app uses `createWebHashHistory` — routes only resolve at
`#/<path>`), then drove the debug browser via raw CDP (`ws` package,
transitively present in `node_modules`, `NODE_PATH` pointed at the
repo's `node_modules`):
- `Target.createTarget` + `Target.attachToTarget` for a fresh tab,
  `Page.navigate` to each of `#/login`, `#/register`,
  `#/forgot-password`, `#/reset-password?token=x`, waited for
  `Page.loadEventFired` + a settle delay for Vue's client-side mount,
  then `Runtime.evaluate` to read `getComputedStyle(...)` on the real
  rendered DOM.
- Wrapper `div` on all 4 pages: `{display: "flex", alignItems: "center",
  justifyContent: "center"}` — matches Bootstrap's original
  `d-flex align-items-center justify-content-center` exactly.
- Login/ForgotPassword `RouterLink` (before fix): `marginTop: "24px"` —
  WRONG (should be `16px`, matching Bootstrap's original `mt-3`).
  Inspected `document.styleSheets` for every `.mt-4` rule and found the
  two colliding definitions (quoted above). After the `mt-[1rem]` fix:
  re-navigated to `#/login`, re-read the same element →
  `{className: "inline-block mt-[1rem] text-sm", marginTop: "16px"}` —
  correct.
- ForgotPassword `<p class="text-sm opacity-75">`: `{fontSize: "14px",
  opacity: "0.75"}` — matches Bootstrap's `.small` (0.875em ≈ 14px at
  this root font-size, confirmed root/body font-size both `16px`) +
  `.opacity-75` (0.75) exactly.
- Did not get a clean read on `PageResetPassword`'s `<p class="text-sm
  text-danger">` (the element only renders when `route.query.token` is
  ABSENT, and a second CDP navigation in the same script hung waiting
  for a `Page.loadEventFired` that didn't fire — likely a same-document
  hash+query navigation quirk, not investigated further since it's out
  of scope: that class only changed `small`→`text-sm`, `text-danger` is
  byte-for-byte unchanged from before this diff).

## Command
```
npm run build
```

## Output
```
✓ built in 4.89s
```
(Run after the `mt-[1rem]` fix. Same pre-existing "chunks larger than
500 kB" warning only, no new errors.)

Also ran (extra signal, matches node 1's practice):
- `npm run lint` → clean, no output, exit 0.
- `npm run test` → `Test Files 13 passed (13)`, `Tests 92 passed (92)`.

## Acceptance
| Criterion | Evidence |
|---|---|
| All 4 auth pages' Bootstrap utility classes converted | `grep -nE 'd-flex\|align-items-center\|justify-content-center\|d-inline-block\|\bmt-3\b\|\bsmall\b'` across all 4 files → zero matches |
| Visual layout unchanged (wrapper centering) | Live CDP computed-style read on all 4 pages: `display:flex; align-items:center; justify-content:center` |
| Spacing value unchanged (the `mt-3`→bug→fix) | Live CDP computed-style read: `marginTop: "16px"` after fix (was `"24px"` before, caught and corrected) |
| Typography/opacity values unchanged | Live CDP computed-style read on ForgotPassword's `<p>`: `fontSize:"14px"`, `opacity:"0.75"` |
| Build stays green | `npm run build` → `✓ built in 4.89s` |
| No shared/global component touched | `git diff --stat -- src/pages/auth/` shows exactly the 4 target files, 8 insertions/8 deletions total |

## Noticed, not done
- Bootstrap/Tailwind same-named-utility-class collision (see above,
  already logged in the diagram row too) — worth a permanent trap entry
  in `doctrine/domains/PROJECT.md` if a future node hits it again.
- `.text-danger` migration deferred — needs a Tailwind color/dark-mode
  token decision first (separate node).
- The 2nd CDP navigation hang (ResetPassword check) — not investigated,
  worked around by relying on the fact that `text-danger` itself is
  unchanged in this diff.

## Seal gate
No outward-facing action taken — nothing committed, diff lives in the
working tree on `feature/tailwindcss-setup` alongside node 1's
still-uncommitted diff. Committing/pushing/PR into `staging` still
requires `/ship`, after all planned nodes in this migration (or at a
point the operator chooses to ship incrementally).
