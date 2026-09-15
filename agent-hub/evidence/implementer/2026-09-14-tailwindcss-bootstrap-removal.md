# 2026-09-14 — tailwindcss-bootstrap-removal

- Worker: implementer
- Node: `tailwindcss-bootstrap-removal`
- Branch: `feature/tailwindcss-setup` (same ongoing migration branch)
- Status: sealed_pending_verifier

## Task
Node 16 — the final step of the Bootstrap→Tailwind phased migration.
Operator confirmed via explicit "tiếp tục" after node 15
(`tailwindcss-root-tokens-and-remaining-gaps`) sealed and the operator
had a chance to review the plan, per the earlier `AskUserQuestion`
2-step decision. This node performs the actual, previously-deferred
deletion: `bootstrap` npm package, `src/styles/bootstrap.scss`, and its
import from `main.ts`.

## Pre-flight checks (before touching anything)
Confirmed no other dependency on the `bootstrap` package or file exists
beyond `main.ts`'s import:
- `grep -rn "from 'bootstrap'\|from \"bootstrap\"\|require('bootstrap')" src` →
  zero matches (Modal.vue/Dropdown.vue/Toasts.vue/Navbar.vue's JS
  rewrites, from earlier nodes, already removed all `bootstrap` JS
  imports).
- `grep -rn "bootstrap.scss" src` → only `main.ts`'s import and
  `bootstrap.scss` itself (plus comments elsewhere referencing it as
  documentation, not a real dependency).
- `grep -n "bootstrap" tailwind.config.cjs vite.config.ts postcss.config.cjs` →
  only a stale comment in `tailwind.config.cjs` (updated, see below), no
  functional dependency in either config file.
- `data-bs-*` HTML attributes still present in several `.vue` files
  (`Modal.vue`, `Toasts.vue`, etc.) are plain data attributes read by
  this app's OWN JS (e.g. `Modal.vue`'s `onRootClick` checking
  `[data-bs-dismiss="modal"]`) — a naming convention kept for
  continuity, not a package dependency. No change needed.
- Captured a pre-removal baseline: `rm -rf dist && npm run build` →
  clean, compiled main CSS bundle = 238,496 bytes, with `--bs-primary`/
  `--bs-success` root-var definitions appearing exactly 2× each (this
  node's self-hosted copy from node 15 + Bootstrap's own real one) —
  confirming both currently coexist, dormant/duplicate.

## Changes
1. `src/main.ts` — removed `import './styles/bootstrap.scss'` and its
   comment block; updated the remaining `tailwind.css` import's comment
   (previously explained the dual-framework import-order rationale, now
   states Tailwind is the sole framework and lists everything nodes 6-15
   rebuilt).
2. `src/styles/bootstrap.scss` — deleted outright.
3. `npm uninstall bootstrap` — removed from `package.json` dependencies,
   `package-lock.json`, and `node_modules`. Confirmed via `grep -n
   "bootstrap" package.json` → zero matches; `ls node_modules/bootstrap` →
   "No such file or directory".
4. `tailwind.config.cjs` — updated a stale top-of-file comment that
   previously said "do not remove `src/styles/bootstrap.scss` here" (a
   node-1-era instruction, now obsolete) to reflect the completed
   migration.

## Verification
1. `rm -rf dist && npm run build` → `✓ built in 4.34s`, only the
   pre-existing "chunks larger than 500kB" warning (JS bundle size,
   unrelated to CSS/Bootstrap). **Build succeeds with zero Bootstrap
   dependency** — the critical first signal.
2. `npm run lint` → exit 0, clean.
3. `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
   failed | 108 passed (111)` — all 3 failures confirmed (via `grep
   FAIL`) to be the exact same documented-flaky `VeeForm.spec.ts` tests
   named in `doctrine/MEMORY.md` since node 4, unrelated to CSS/Bootstrap.
   No new failures.
4. **Compiled CSS bundle size**: dropped from 238,496 bytes (before) to
   51,973 bytes (after) — an ~78% reduction, consistent with Bootstrap's
   entire stylesheet (Reboot + every component + every utility) actually
   being gone rather than just dormant.
5. **Exhaustive 27-check sweep** of the compiled main bundle
   (`dist/assets/index-*.css`) via Python regex, covering every category
   built across nodes 6-15 (root tokens both themes, `@layer base` body/
   link, buttons, dropdown, badge, alert, forms, grid, navbar, color
   utilities, spinner, headings, clearfix, input-group, table, toast,
   modal, and the extracted custom app CSS `.heading`/`.item-title`/
   `.post-content`/`.list`/`.footer .btn`) — **all 27 present**, nothing
   silently lost.
6. **Root-variable duplication resolved correctly**: `--bs-primary`/
   `--bs-success` definitions now appear exactly 1× each (down from 2×
   pre-removal) — confirming Bootstrap's own copy is genuinely gone and
   this app's self-hosted copy (node 15) is now the sole source, not a
   leftover duplicate.
7. **No dangling variable references**: extracted every `var(--bs-*)`
   reference AND every `--bs-*` definition from the compiled CSS via
   regex and diffed the two sets — zero references without a matching
   definition anywhere in the file. This directly tests node 15's
   central risk (self-hosted root tokens) under the real removal
   condition, not just in Bootstrap's continued presence.
8. Forbidden states: branch = `feature/tailwindcss-setup` (`MAIN_EDIT`
   clear). Node added to `dev-loop.prime-mermaid.md` before this note
   (`ADHOC_WORK` clear). This note exists (`NO_EVIDENCE` clear). No
   `.vue`/`.js`/`.ts` under `haven/` (`CODE_IN_HAVEN` clear).
   `EDIT_UNVERIFIED` avoided — every claim above actually run and read
   back, not inferred.

## Deferred / explicitly out of scope
- `body.modal-open`'s missing scroll-lock — a pre-existing behavioral
  gap unrelated to CSS/Bootstrap presence (logged in node 15's evidence,
  Bootstrap's own JS never had real CSS backing it either), not fixed
  here.
- Merging `feature/tailwindcss-setup` into `staging`/`main` — a separate,
  later, explicitly outward-facing action (`/ship`), not part of this
  node.

## Verification gap, disclosed
No live browser session available this session (same limitation as
every CSS-related node since 4). This is the node where every dormant
rule built across nodes 6-15 activates simultaneously for real — the
compiled-CSS sweep confirms every rule survives intact and every
variable resolves, which is the strongest static signal achievable
without a browser, but real visual QA (does the app actually LOOK
right — spacing, colors, modal/toast layout, table rendering) has not
been done and cannot be substituted by build/lint/test/grep alone. The
operator was informed of this gap before approving this step and may
want to `npm run dev` and look before merging.

## Hub bytes
before=198079 (from node 15's verifier SEAL note's `hub_bytes_after`) ·
after not yet measured — verifier to measure at SEAL/REOPEN time.
