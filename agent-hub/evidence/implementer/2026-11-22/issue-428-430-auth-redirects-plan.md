# 2026-11-22 - issue-428-430-auth-redirects
Worker: implementer · Version: 0.1.0 · Node: `issue-428-430-auth-redirects` (`haven/diagrams/dev-loop.prime-mermaid.md`)
Branch: `feature/issue-428-430-auth-redirects` (off `staging` @ f1765dd, linked to #428 via `gh issue develop`)

Task (verbatim): #428 + #430 auth redirects (branch feature/issue-428-430-auth-redirects) — #428: route guard sends signed-out users to /login?redirect=<fullPath>; after login go to that target if safe (starts with exactly one '/', not '//' or '/\', string only), else /dashboard/information. #430: signed-in users opening /forgot-password or /reset-password are redirected to /dashboard/information, like /login and /register. Spec: agent-hub/doctrine/features/auth-login.md, auth-password-reset.md; analyst note agent-hub/evidence/analyst/2026-11-22/issue-428-430-auth-redirects-spec.md

## Hub bytes before: 100333

## Feature doc: `doctrine/features/auth-login.md`, `doctrine/features/auth-password-reset.md`
## Feature doc changed: auth-login.md Behavior #6 "signed in on /login → /dashboard/information" → "→ safe `?redirect=` target, else /dashboard/information"; Out of scope line "signed-in `/login?redirect=` still goes to Information" removed; Edge cases: guest-only targets refused, bare `/` returns to Home. — operator (AskUserQuestion, this pass): Q1 "Login flash" → "Honor redirect (Recommended)"; Q2 "Root visit" → "Return to Home". Changelog row added.

## Diff
| File | Why |
|---|---|
| `src/routers/index.ts` | guard: `next({ name: 'login', query: { redirect: to.fullPath } })` (#428, Behavior #10) |
| `src/utilities/index.ts` | new `safeRedirect(target)`: string, one leading `/` not followed by `/` or `\`, not a guest-only page (`login`/`register`/`forgot-password`/`reset-password`) → target, else `/dashboard/information` (Behavior #15). In `utilities/`, not `services/auth.ts`: importing `services/auth` into `useAuthRedirect` pulled `services/axios` into its spec and broke it (`TypeError: Cannot read properties of undefined (reading 'interceptors')`) |
| `src/services/auth.ts` | `handleLogin` reads `safeRedirect(router.currentRoute.value.query.redirect)` BEFORE the first await, pushes it on success (Behavior #4). Reading after the awaits failed live: `setTokens` flips `isAuthenticated` → App.vue swaps layout → `PageLogin` remounts and leaves `/login`, query lost |
| `src/pages/auth/PageLogin.vue` | signed-in setup check pushes `safeRedirect(route.query.redirect)` (Behavior #6 as changed by operator) — so the remount during login goes straight to the target, no Information flash |
| `src/composables/useAuthRedirect.ts` | `GUEST_ONLY` += `forgot-password`, `reset-password` (fresh load, #430); push uses `safeRedirect(route.query.redirect)` |
| `src/pages/auth/PageForgotPassword.vue`, `PageResetPassword.vue` | same setup-time signed-in check as PageLogin/PageRegister (in-app navigation, #430) |
| `src/utilities/index.spec.ts` | `safeRedirect` accepts `/dashboard/preview`, `/dashboard/preview?x=1`, `/`, `/login-help`; rejects `undefined`, `''`, `https://a.com`, `//a.com`, `/\a.com`, `javascript:alert(1)`, array, `/login`, `/login?redirect=/x`, `/register`, `/reset-password?token=abc` |
| `src/services/auth.spec.ts` | handleLogin pushes `/dashboard/preview` even when currentRoute changes during the candidate request (regression for the remount race) |
| `src/composables/useAuthRedirect.spec.ts` | signed in → `/forgot-password`, `/reset-password`, `/reset-password?token=abc` land on `/dashboard/information`; signed out stays on `/reset-password?token=abc`; signed in `/login?redirect=/dashboard/information?tab=1` → that target; signed in `/login?redirect=/login` → `/dashboard/information` |

## Command
From `doctrine/MEMORY.md`, repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output (final run, after all changes)
```
 Test Files  65 passed (65)
      Tests  443 passed (443)
✓ built in 3.83s
lint exit 0
```
Typecheck: `npm run typecheck 2>&1 | grep -c "error TS"` → `78` (baseline 78 in `doctrine/MEMORY.md`); errors in touched files filtered by `grep -cE "utilities/|useAuthRedirect|PageLogin|PageForgot|PageReset|routers/|auth.spec"` → `0`. The pre-existing `src/services/auth.ts` errors (TS7006 `values`/`props`, TS18046 `loginRes`/`res`/`candidateRes`) are the baseline ones at shifted line numbers; none are on the lines this diff adds.

Regression proof for the remount race: with `handleLogin` temporarily reading the target after the awaits, `npx vitest run src/services/auth.spec.ts` → `× handleLogin success > goes to the safe ?redirect= target of /login, even after the page moved off /login` / `Tests  1 failed | 20 passed (21)`; restored → `Tests  21 passed (21)`.
Probe for the stuck case before the guest-only rule: `mountAt('/login?redirect=/login')` signed in → `Expected: "/dashboard/information"  Received: "/login"`; after the rule → passes (kept as a test).

## Live check (`npm run dev`, debug Chrome :9888 via Playwright MCP, QA account `qa.full@example.com`; owner account not used: the dev login form pre-fills it, overwritten each time)
- First pass (target read after awaits): signed out `#/dashboard/preview` → `#/login?redirect=/dashboard/preview` ✓; login → ended on `#/dashboard/information` ✗ → root cause above, fixed.
- After fix: login from `#/login?redirect=/dashboard/preview` → `#/dashboard/preview`, user `qa.full@example.com`.
- After operator's "Honor redirect": signed out `#/dashboard/skills` → `#/login?redirect=/dashboard/skills`; login, history log (pushState/replaceState/hashchange) = `["#/login?redirect=/dashboard/skills", "#/dashboard/skills"]` — no Information stop.
- Signed in, in-app nav from `#/dashboard/skills`: `#/forgot-password`, `#/reset-password?token=abc`, `#/login?redirect=//example.com` → each `http://localhost:5173/resume-vuejs-website/#/dashboard/information` (origin kept). Earlier run also `#/reset-password` → Information.
- Signed in, fresh load `#/reset-password?token=abc` → `#/dashboard/information`.
- Signed out, login from `#/login?redirect=//example.com` → `http://localhost:5173/resume-vuejs-website/#/dashboard/information`.
- Not live-checked: `?redirect=https://example.com`, `/%5Cexample.com` (covered by the `safeRedirect` unit cases; vue-router decodes `%5C` to `\`). Vite started by this session, stopped after.

## Acceptance
| Criterion | Evidence |
|---|---|
| auth-login: signed out `#/dashboard/skills` → `#/login?redirect=/dashboard/skills` | live history log above |
| auth-login: login from `?redirect=/dashboard/preview` lands there | live check + `auth.spec.ts` regression test (`Tests 443 passed`) |
| auth-login: no query / `https://…` / `//…` / `/\…` → `/dashboard/information`, never leaves origin | live `//example.com` (signed out + signed in); unit cases in `utilities/index.spec.ts` |
| auth-login: unit test of the safe-path check passes under `npm run test` | `describe('safeRedirect')` in `src/utilities/index.spec.ts`; `Tests 443 passed (443)` |
| auth-password-reset: signed in, `#/forgot-password`, `#/reset-password`, `#/reset-password?token=abc` (fresh load + in-app nav) → `#/dashboard/information` | live checks above + `useAuthRedirect.spec.ts` cases |
| auth-password-reset: `npx vitest run src/composables/useAuthRedirect.spec.ts` passes with cases for both pages | included in the full run, `65 passed` files |
| Behavior #6 (changed by operator): signed in on `/login?redirect=<safe>` → target | `useAuthRedirect.spec.ts` `/login?redirect=/dashboard/information?tab=1` case; live no-flash log |
| Only caller of `handleLogin` / `useAuthRedirect` | `grep -rn "handleLogin(" src \| grep -v spec` → `src/pages/auth/PageLogin.vue:47` only; `grep -rn "useAuthRedirect()" src \| grep -v spec` → `src/App.vue:26` only |
| build, lint, typecheck ≤ baseline | `✓ built in 3.83s`, `lint exit 0`, `78` / `0` in touched files |
| comments per code-comments.md | new comments state why only: `auth.ts` "read now: setTokens swaps the layout…", `PageLogin.vue` "also runs when login itself flips isAuthenticated…", `safeRedirect` JSDoc (open redirect + stuck-on-/login reason), spec comment on the remount; no issue refs, no restating |

## Supersedes: none
`grep -n "428\|430" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row.
## Still open: none

## Review
`/code-review medium` (forked), 7 findings, on the diff before the operator questions:
1. Double push / Information flash after login → **fixed**, operator chose "Honor redirect" (PageLogin + useAuthRedirect use `safeRedirect`); live log confirms no Information stop.
2. Bare `/` now logs into Home, not Information → operator chose "Return to Home" (kept; doc edge case added).
3. Forced logout drops the target → false positive for this node: auth-login.md Out of scope (#428 as written).
4. Signed-in user loses a reset link's token → false positive: auth-password-reset.md Edge case, operator decision #430 ("sign out first").
5. Guest-only check duplicated in page setups + `GUEST_ONLY` (wrong layer) → `## Noticed, not done`.
6. `safeRedirect` accepts guest-only paths → **fixed** (probe showed a signed-in user stuck on `/login?redirect=/login`); guest-only targets refused, test added.
7. Signed-in `/login?redirect=` ignores target → **fixed** with #1.
Not `security`-labeled, so no `/security-review`; the open-redirect check is covered by the unit cases and live `//example.com`.

## Noticed, not done
- Guest-only redirect lives in 4 page setups + `useAuthRedirect`'s `GUEST_ONLY`; one `beforeEach` check on a `meta.guestOnly` flag would replace all five (review #5). Refactor, out of scope.
- The dev login form pre-fills the owner account's credentials (`votan.it@gmail.com`), visible in the live snapshots. Worth checking where that default comes from.
- Touched files weren't Prettier-clean at HEAD either (`git show HEAD:<f> | npx prettier --check` → dirty for all six); not reformatted.
- `.claude/skills/todo/SKILL.md` was already modified on `staging` before this branch; not part of this diff, don't commit it with this node.

## Seal gate: none (no commit/push/merge; live check used a QA account against the prod API: login only, no writes)
