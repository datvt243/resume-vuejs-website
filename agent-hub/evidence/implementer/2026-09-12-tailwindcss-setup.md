# 2026-09-12 — tailwindcss-setup

- Worker: implementer
- Version: 0.1.0
- Node: `tailwindcss-setup` (new node, node 1 of a multi-node phased
  Bootstrap → Tailwind migration)
- Task (verbatim): "site đang dùng bootstap, hãy chuyển sang tailwindcss"
  (operator, via `/todo`)

## Hub bytes before
108380 (root=12393, doctrine=27207, active diagram=42663, implementer
bundle=14963, verifier bundle=11154)

## Branch
`feature/tailwindcss-setup` (checked out from `staging`). `feature/*` —
kept after merge, this is an ongoing multi-node effort, not a one-shot
fix.

## Context — scope decision before any code
"Chuyển sang tailwindcss" touches ~32 of 54 `.vue` files using Bootstrap
utility classes, plus 3 components (`Modal.vue`, `Dropdown.vue`,
`Toasts.vue`) driven by Bootstrap's JS plugin (`data-bs-*` attributes,
found in 14 files) — Tailwind ships no JS runtime, so those need real
interactivity rewrites, not class swaps. Doing this as one node would
produce a single huge diff that `npm run build` passing can't meaningfully
verify (visual regression + modal/dropdown behavior need manual checks) —
exactly what `SmallestDiff`/`NORTHSTAR.md` exist to prevent. Stopped and
asked the operator (`AskUserQuestion`) before writing any code. Operator
approved, 3 decisions:
1. Phased migration — this node is foundation/install only, no component
   classes touched yet. Later nodes migrate one page/component group at a
   time, each its own node.
2. `Modal.vue`/`Dropdown.vue`/`Toasts.vue` get custom Vue-native
   show/hide/toggle logic (not a headless-UI dependency, not "keep
   bootstrap JS forever") — deferred to a LATER node, explicitly out of
   scope here.
3. Bootstrap stays installed and imported side-by-side with Tailwind
   until a final removal node, once no file still references a Bootstrap
   class — avoids a broken UI mid-migration.

## Diff
| File | Why |
|---|---|
| `package.json` / `package-lock.json` | Added `tailwindcss@^3.4.19`, `postcss@^8.5.28`, `autoprefixer@^10.5.6` as devDependencies |
| `tailwind.config.cjs` (new) | Tailwind config, `content` globs cover `./index.html` + `src/**/*.{vue,js,ts,jsx,tsx}`. `.cjs` extension matches the existing `.eslintrc.cjs` convention (`package.json` has `"type": "module"`, plain `.js` would be parsed as ESM) |
| `postcss.config.cjs` (new) | Wires `tailwindcss` + `autoprefixer` into the PostCSS pipeline Vite already runs |
| `src/styles/tailwind.css` (new) | `@tailwind base; @tailwind components; @tailwind utilities;` — the only Tailwind entry point |
| `src/main.ts` | Imports `./styles/tailwind.css` BEFORE `./styles/bootstrap.scss` (comment in-file explains why: Tailwind's preflight resets plain element selectors — importing it first lets bootstrap.scss's own element styles win the cascade for anything not yet migrated, so no visual regression during the dual-framework period) |

Zero `src/**/*.vue` template/class changes — no component touched, per the
operator-approved scope for this node.

## Version choice, with reasoning
Picked Tailwind **v3.4.19**, not the latest v4.3.x. v4 changes the config
model (CSS-first `@theme`, `@tailwindcss/vite` plugin instead of
postcss.config) — a bigger, less-documented jump to make on the very
first foundation node of an already-risky framework migration. Matches
this repo's own conservative-pin precedent for new tooling
(`doctrine/domains/PROJECT.md` → `vitest@2.1.9`/`jsdom@26.1.0`, pinned
below latest for compatibility reasons). Can reassess v4 in a later node
once the phased migration is further along.

## Noticed, not done
- `npm install` (plain npm, `yarn install` never invoked) unexpectedly
  rewrote `yarn.lock` to include the 3 new packages — reverted with
  `git checkout -- yarn.lock` before finishing, confirmed `npm run build`
  still green after the revert. Root cause not investigated (out of scope
  for this node) — flagging as a new observation on top of the existing
  `doctrine/domains/PROJECT.md` trap ("Both `yarn.lock` AND
  `package-lock.json` exist... do NOT run `yarn install`"): even a plain
  `npm install` can touch `yarn.lock` in this environment, worth watching
  on future dependency-adding nodes.
- Pre-existing TS diagnostic `main.ts:50` `'err' is of type 'unknown'`
  (Vue's `errorHandler` callback) — confirmed via `git diff src/main.ts`
  this line is untouched by this diff; not caused by this change, not
  fixed (out of scope, and `doctrine/MEMORY.md` already notes `tsc`
  cannot run as a dedicated script in this project).

## Command
```
npm run build
```

## Output
```
✓ 1363 modules transformed.
...
✓ built in 5.04s
```
(Full run, after reverting the unintended `yarn.lock` change — same
pre-existing "chunks larger than 500 kB" warning only, no new
errors/warnings. Ran once more before the revert too, also green:
`✓ built in 5.39s`.)

Also ran (not the project's required command, extra signal):
- `npm run lint` → clean, no output, exit 0. Only `src/main.ts` changed
  within lint's scope (`src/`).
- `npm run test` → `Test Files 13 passed (13)`, `Tests 92 passed (92)`.

## Acceptance
| Criterion | Evidence |
|---|---|
| Tailwind installed + wired into the build pipeline | `package.json` shows `tailwindcss@^3.4.19`/`postcss@^8.5.28`/`autoprefixer@^10.5.6`; `tailwind.config.cjs` + `postcss.config.cjs` present |
| Tailwind CSS actually generated and bundled (smoke check, no component touched) | `grep -c -- "--tw-" dist/assets/index-*.css` → `1`; `grep -o "box-sizing:border-box" dist/assets/index-*.css` → matched — Tailwind's preflight reset is present in the real build output |
| Bootstrap unaffected (dual-framework, per operator decision) | `grep -c -- "--bs-" dist/assets/index-*.css` → `1`; `grep -o "\.btn{[^}]*}" dist/assets/index-*.css` → `.btn{pointer-events:none;filter:none;opacity:.65}` matched — Bootstrap still fully present in the same bundle |
| Build stays green | `npm run build` → `✓ built in 5.04s` |
| No component migrated yet (scope discipline) | `git status --porcelain` shows only `package.json`/`package-lock.json`/`src/main.ts` modified + 3 new root/`src/styles` files — zero `.vue` files touched |

## Seal gate
No outward-facing action taken — nothing committed yet, diff lives only
in the working tree on `feature/tailwindcss-setup`. Committing/pushing/PR
into `staging` still requires `/ship`, separately, after this node SEALs.
