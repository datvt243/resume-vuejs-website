# doctrine/domains/PROJECT.md — resume-vuejs-website ground truth

## What is it
A personal resume/CV management SPA. The user logs in, enters structured
data (basic info, education, experience, projects, awards, certificates,
references) via forms, saved through a separate REST API (Node.js
resume-api, not in this repo). Author: Đạt Võ (@datvt243), used for his
own CV.

## Stack + shape
| Thing | Value |
|---|---|
| Language/runtime | Vue 3 (Composition API + `<script setup>`) + TypeScript (partial, mixed with `.js`) |
| Entry point | `src/main.js` → `src/App.vue` |
| Data store | No local DB — all data goes through an external REST API (`src/services/`, `src/config/api.config.js`) |
| Routing | Vue Router 4, config at `src/routers/index.js` |
| State | Pinia — `src/stores/{auth,candidate}.js` |

## Invariants (things that never happen here)
- The frontend never talks to a database directly — always through the
  REST API (`services/`).
- `Authorization: Bearer <token>` is attached to every request that needs
  auth; token lives in `localStorage` key `"token"`, user in `"user"`.
- Whether `_id` is present decides POST (create) vs PUT (update) in
  `useDocument.updateDoc` — not a separate flag.
- Components in `src/components/global/` are auto-registered via
  `src/plugins/GlobalComponents.js` — used directly in templates, NO
  `import` needed.
- Each data section (education, experience, project...) has one
  `src/models/*.model.ts` file defining both the UI fields and the Yup
  validation schema in ONE place — `VeeForm.vue` reads it to auto-render.

## Diagram-first
The diagram (`haven/diagrams/`) is the source of truth for progress —
code must match it.

## Forbidden states
See `CLAUDE.md` — `ADHOC_WORK`, `NO_EVIDENCE`, `EDIT_UNVERIFIED`,
`CODE_IN_HAVEN`, `DIAGRAM_DRIFT`.

## Branching rule
> **2026-08-30**: `main` and `staging` are now real GitHub
> branch-protected branches (PR required, 0 approvals needed,
> `enforce_admins: true`, no force-push, no deletion) — a raw `git push`
> to either is rejected (`GH006`), verified directly. `main` is
> production, only ever receives code from `staging` via `/release`
> (`.claude/skills/release/SKILL.md`). `staging` is the integration
> branch — this is now what every task branches from and PRs into.

**NEVER edit or commit directly on `main` OR `staging`.** Before any
diff (even one line):
1. `git checkout -b <branch> staging` (from `staging`, not `main`) —
   name it by task TYPE:
   - Bugfix → `fix/issue-<n>-<slug>` (e.g.
     `fix/issue-34-converttotruncate-length`).
   - New feature → `feature/<slug>` (e.g. `feature/export-cv-pdf`).
   - Other (docs/chore/tooling) → `chore/<slug>` or `docs/<slug>`.
   Branch naming: `fix/issue-<n>-<slug>` | `feature/<slug>` | `chore/<slug>` | `docs/<slug>` (kept over kit default)
   The prefix decides whether the branch survives after merge (see
   `/ship` — `.claude/skills/ship/SKILL.md`): `fix/*` gets deleted,
   `feature/*` is KEPT, everything else deleted by default.
2. The whole diff, `npm run build`, and the evidence note all happen on
   that branch — the evidence note MUST name the branch.
3. Merging back to `staging` is an **outward-facing** action — goes
   through the Seal Gate like any commit/push/deploy: stop, show the
   diff + branch name, wait for operator approval before `/ship`
   (`gh pr create --base staging` + `gh pr merge`, not a raw `git merge
   && git push` — that's rejected by branch protection).
4. Getting `staging` onto `main` is a SEPARATE outward-facing action —
   `/release`, not `/ship`. Never merge a task branch straight into
   `main`.
5. If you find yourself on `main` or `staging` with uncommitted changes
   already there → stop immediately, report `MAIN_EDIT`, don't
   self-continue — ask the operator whether to `git stash` that diff
   onto a new branch (branched from `staging`).

## Traps (append when you find a new one)
> Verified directly from source at hub-init time (2026-08-20). These are
> REAL bugs/tech debt currently in the codebase — don't repeat the
> pattern, and don't "just fix it" outside a `/worker` task unless asked.

| Trap | Why | What to do instead |
|---|---|---|
| `src/routers/index.js` uses `createMemoryHistory` | URL doesn't work on page refresh (route is lost) — [issue #1](https://github.com/datvt243/resume-vuejs-website/issues/1) | If the task is a routing fix, switch to `createWebHashHistory` or `createWebHistory` — don't do it outside the assigned task |
| `src/services/auth.js:28-34` login uses `method: 'get'` with `password` in `params` | Password leaks into URL/logs/browser history — [issue #2](https://github.com/datvt243/resume-vuejs-website/issues/2) | Switch to POST + body when working on an auth-related task |
| `src/components/veevalidate/VeeForm.vue:36` `delete e.valid` inside `.map()` | Mutates the object directly inside `props.fields` (props array mutated from inside) — [issue #3](https://github.com/datvt243/resume-vuejs-website/issues/3) | Use destructuring to build a new object instead of `delete` on the original element |
| `src/components/veevalidate/VeeForm.vue:93` `e.nam` (should be `e.name`) in `reset()` | Reset sets the wrong key, silent bug — [issue #4](https://github.com/datvt243/resume-vuejs-website/issues/4) | Fix `e.nam` → `e.name` when working on a form-reset task |
| `src/components/Toasts.vue:44` `v-html="props.content"` renders the server error message directly | XSS if the server returns a message containing HTML/script — [issue #5](https://github.com/datvt243/resume-vuejs-website/issues/5) | Sanitize or switch to text interpolation when fixing |
| `src/composables/useHelper.js:14` `loading: toValue(refSpinner)` | Snapshots the Ref's value at `useHelper()` call time instead of returning the Ref itself — loses reactivity with the spinner afterward — [issue #9](https://github.com/datvt243/resume-vuejs-website/issues/9) | Return the Ref (`refSpinner`) instead of `toValue(refSpinner)` |
| `GroupTags.vue:20` `tags.value.push(tag.value)` on `toRef(props, 'modelValue')` | Mutates the `modelValue` prop array directly | Copy the array before pushing, then emit instead of mutating props |
| `subURL = 'api/v1/'` hardcoded in BOTH `src/services/auth.js` AND `src/services/base.js` | DRY violation — changing the base path means editing 2 places — [issue #17](https://github.com/datvt243/resume-vuejs-website/issues/17) | Consolidate into `src/config/api.config.js` when working on a related task |
| Both `yarn.lock` AND `package-lock.json` exist at repo root | Lockfile drift risk — 2 package managers can resolve different versions | Use npm (`package-lock.json` is newer); do NOT run `yarn install` unless the task explicitly asks to clean up the lockfile |
| ~~`.eslintrc.cjs` extends `plugin:vue/vue3-essential` but `eslint-plugin-vue` was NOT in `node_modules`~~ **FIXED 2026-08-20** | Original trap: `.eslintrc.cjs:2` was also missing `@rushstack/eslint-patch` (the actual first failure, blocking even before `eslint-plugin-vue`), and `.ts`/`<script lang="ts">` couldn't parse because `parser: '@typescript-eslint/parser'` was missing. Installed `@rushstack/eslint-patch` + `eslint-plugin-vue@^9` + `eslint@^8.57.0` (declared explicitly in `devDependencies`, previously only transitive), added `.ts`/`.vue` `overrides` in `.eslintrc.cjs`, added the `lint` script. | `npm run lint` now runs for real — currently reports **95 real errors** (mostly `no-unused-vars`, `vue/multi-word-component-names`) NOT fixed, separate tech debt, not auto-fixed just because a task says "make lint run" |
| `index.html` had a hardcoded `<body data-bs-theme="dark">` | Silently overrode whatever `useTheme.ts` set on `<html>` for the entire visible app — CSS custom properties resolve from the CLOSEST ancestor carrying `data-bs-theme`, and `<body>` (containing `#app`) is closer than `<html>`. Result: the dark-mode toggle (issue #62) changed `<html>`'s attribute correctly but had **zero visible effect** — a real functional bug that shipped past both implementer and verifier because neither had a real screenshot tool that session, only unit tests + a compile check. Caught by the operator manually testing the live app. **FIXED 2026-08-25** — removed the hardcoded attribute from `index.html`; `useTheme.ts`'s fallback default changed to `dark` (was `light`) to preserve the app's existing look, only deferring to an explicit OS "light" preference | If a task touches `index.html` or introduces a theme/attribute set at build-time vs runtime, check for exactly this class of conflict: a static HTML attribute silently shadowing a JS-driven one on a DIFFERENT-but-nested element. When no browser-screenshot tool is available, verify DOM/CSS state via a raw CDP websocket script (`node -e` using the `ws` package, already present transitively in `node_modules/ws` — connect to the port-9888 debug browser's `webSocketDebuggerUrl`, `Runtime.evaluate` to read `getComputedStyle`/attributes) instead of just unit tests + a curl compile check |
| `src/composables/useDocument.ts` `getValue()` uses `f.default \|\| ''` | Any falsy-but-valid field default (`0`, `false`) is silently collapsed to `''` on document init — a numeric default of `0` can never actually be the initial value. Found while writing `useDocument.spec.ts` (2026-08-25), not fixed (out of that task's scope) | If a task touches this function, use `f.default ?? ''` instead (matches the fix already applied to `VeeForm.vue`'s `reset()` for the same class of bug, issue #4/register-password-date-currency-validation) |
| ~~No test suite at all (0 test files, no `test` script)~~ **PARTIALLY FIXED 2026-08-25, EXTENDED same day** | [issue #7](https://github.com/datvt243/resume-vuejs-website/issues/7) — Vitest installed (`vitest@2.1.9`, pinned below `^3`/`^4` to match the project's `vite@^5.3.1`; `jsdom` pinned to `26.1.0` — `27.x`+ throws `ERR_REQUIRE_ESM` from a transitive `@asamuzakjp/css-color` dependency under this Node/vitest combo). `npm run test` now covers `src/utilities/`, `src/stores/{auth,candidate}`, `src/composables/{useDocument,useCandidate}` — 50 tests. Composables needing DI (`useHelper`'s `inject()`) or an active component (`onBeforeMount`) are tested via `@vue/test-utils` `mount()` + `vi.mock()` on `@/services/base`, `@/composables/useHelper`, `@/lib/swal.lib`. Issue #7 stays OPEN — `useInitTable` and all Vue components (incl. `VeeForm.vue`, the issue's own 4th-priority target) are still untested. | For code inside the covered files, add/run real Vitest tests. For everything else, still use `npm run build` + manual `npm run dev` check, state clearly this is NOT a real test — see `doctrine/MEMORY.md` → Test row |

## Decisions, with reasoning
> A decision without a reason gets "cleaned up" by a future agent — the
> WHAT is already in the code, only the WHY is load-bearing.

| Date | Decision | Why | Alternative rejected |
|---|---|---|---|
| 2026-08-20 | Installed `eslint-plugin-vue@^9` (not the latest `^10`) | `eslint-plugin-vue@10` requires ESLint 9 + flat config; the repo is on ESLint 8.57 with `.eslintrc.cjs` (legacy format). `v9` is the newest version still supporting `eslint: '^8.0.0'` per peerDependencies, no need to migrate to flat config at the same time | Installing `v10` + migrating to `eslint.config.js` flat config in the same pass — rejected as a much bigger change than the assigned task ("install packages so lint runs"), left as a separate task if ever needed |
| 2026-08-20 | Installed lint deps + fixed `.eslintrc.cjs` overrides for `.ts`/`.vue`, but did NOT auto-fix the 95 lint findings | The assigned task was "make lint actually run," not "clean up all lint errors" — 95 errors is separate tech debt, different scope, needs an operator decision on whether to clean it up | Running `eslint --fix` or hand-fixing all 95 — rejected as out of task scope; some errors (`vue/multi-word-component-names`) would rename components and could break imports elsewhere |
| 2026-08-25 | Pinned `vitest@2.1.9` (not the latest `^4`) and `jsdom@26.1.0` (not the latest `^30`) for issue #7 | `vitest@^4` depends on `vite@^6\|\|^7\|\|^8`; installing it alongside the project's `vite@^5.3.1` produced a duplicate nested `vite@6.4.3` inside `node_modules/vitest/`, which broke `vitest.config.ts`'s TypeScript types (`Plugin<Api>` from two different `vite` copies aren't assignable). `vitest@2.1.9` depends on `vite@^5.0.0` — no duplicate, no type conflict. Separately, `jsdom@27.0.1` (latest at install time before this pin) throws `ERR_REQUIRE_ESM` on every test run — one of its transitive deps (`@asamuzakjp/css-color` → `@csstools/css-calc`) ships ESM-only and jsdom's own code still `require()`s it; `jsdom@26.1.0` predates that regression and ran clean. Only wrote the smallest test file (`src/utilities/index.spec.ts`) to prove the setup works — did not attempt the full 20-30 test / 60% coverage plan from issue #7's own write-up, that's separate follow-up scope | Installing latest `vitest`/`jsdom` and living with the type error / `ERR_REQUIRE_ESM` — rejected, `EDIT_UNVERIFIED` risk (couldn't get a clean `npm run test` run at all) |
| 2026-08-30 | Set up 2-tier release (`fix/feature/hotfix → staging → main`), both branches real GitHub-protected (`enforce_admins: true`, PR required, `required_approving_review_count: 0`, no force-push/deletion) | Operator wanted `main` fully hands-off (only reachable via a gated release, not any direct push) while still allowing a solo operator to actually merge PRs — GitHub refuses self-approval, so any review count ≥1 would have locked the repo owner out entirely. `0` still forces every change through a PR (audit trail + branch protection), just without a reviewer requirement that can't be satisfied on a 1-person repo. `/release`'s `staging → main` merge uses `--merge` (not squash/rebase) specifically so `main`'s history shows the real commits that shipped, tied to the release tag — squashing here would erase that for no benefit, since each commit already went through its own PR into `staging`. First `/release` run bumped `v1.0.0` → `v1.1.0` (minor, the skill's default) — `package.json`'s stale `"0.0.0"` was corrected to match at the same time (it had never been kept in sync with git tags before this) | Requiring ≥1 approval — rejected, self-approval is blocked by GitHub, would have made every PR permanently unmergeable. Squashing the release merge — rejected, throws away per-commit traceability that the whole 2-tier model exists to preserve. See `CONTRIBUTING.md` for the full contributor-facing writeup |
