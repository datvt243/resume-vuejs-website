# 2026-10-10 - issue-177-forced-logout-redirect

- Worker: implementer
- Version: 0.1.0
- Node: `issue-177-forced-logout-redirect` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table)
- Task (verbatim, from issue #177): "[MEDIUM] Bug: Logout bắt buộc (refresh fail/invalidToken) không redirect về /login" — `logOut()` is called without `router` in `src/services/axios.ts:62` (refresh token failure) and `src/services/base.ts:109` (`invalidToken`). State is cleared → `App.vue` switches to `LayoutAuth`, but the route stays on `/dashboard/...` (the `beforeEach` guard doesn't re-run); the page keeps calling the API and each 401 calls `logOut()` again. Suggested fix: in `App.vue`, `watch(() => store.isAuthenticated, v => { if (!v && route.meta.requiresAuth) router.push('/login') })`.

## Hub bytes before: 170247

## Branch
`fix/issue-177-forced-logout-redirect` — created off freshly pulled `staging` (`5d89427`) via `gh issue develop 177 --checkout --base staging`. Never on `main`/`staging` while editing.

## Diff
| File | Why |
|---|---|
| `src/composables/useAuthRedirect.ts` (new) | the watch from the issue's suggested fix, extracted into a composable so it is unit-testable (App.vue itself has no spec and mounts both layouts + API calls). Pushes `{ name: 'login' }` only when auth is lost AND the current route has `meta.requiresAuth` — public `/resume/:slug` is left alone. |
| `src/App.vue` | import + call `useAuthRedirect()` once at setup (+2 lines) |
| `src/composables/useAuthRedirect.spec.ts` (new) | 3 tests with a real `vue-router` (memory history) + real Pinia `authStore`: forced logout on a protected child route → `login`; logout on public route → stays; token refresh (auth stays valid) → no navigation |

Not touched: `services/axios.ts`, `services/base.ts`, `stores/auth.ts` — one watcher at the app root covers every logout path, no router threading needed. `src/composables/index.ts` barrel not updated (it doesn't list every composable either, e.g. `useTheme`, `useCvTheme`, `useActiveProfile`; App imports directly).

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npm run test`
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN (no script; `vue-tsc` incompatible — see MEMORY.md)
- Extra: `npx vitest run src/composables/useAuthRedirect.spec.ts` with the redirect line neutralised (replaced by `void [isAuthenticated, route, router]`), then restored from backup — proves the test catches the bug.

## Output
New spec, real fix:
```
 ✓ src/composables/useAuthRedirect.spec.ts (3 tests) 21ms
      Tests  3 passed (3)
```
New spec, redirect neutralised:
```
   × useAuthRedirect > redirects to /login when a forced logout happens on a protected route 23ms
      Tests  1 failed | 2 passed (3)
```
After restoring: `Tests  3 passed (3)`.

`npm run build`:
```
✓ built in 4.59s
```
`npm run lint`: exit 0.

`npm run test` (full):
```
   × VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit 1303ms
   × VeeForm > clicking submit on a pristine form calls submitFn anyway, because pristine meta.valid is true 232ms
   × VeeForm > BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn 755ms
 Test Files  1 failed | 21 passed (22)
      Tests  3 failed | 144 passed (147)
```
The 3 `VeeForm.spec.ts` failures are the same pre-existing ones already proven independent of any diff in `evidence/implementer/2026-10-09-issue-176-178-sanitize-html.md` (reproduced on unmodified `staging`, flaky count 1–3 across runs) and accepted by that node's verifier. This diff touches neither `VeeForm.vue`, its spec, nor vee-validate. CI (`ci.yml`) runs lint + build only, not tests.

No live authenticated browser check this session (no logged-in debug tab; forcing a real refresh-token failure needs a live backend session). The spec uses a real router + real Pinia store and calls `logOut()` with no router exactly as `services/axios.ts` does — disclosed, not implied as a click-through.

## Acceptance
| Criterion | Evidence |
|---|---|
| Forced logout (no router passed) on a protected route redirects to `/login` | spec "redirects to /login when a forced logout happens on a protected route" passes; fails when the redirect is removed (`× … 23ms`) |
| Covers both `axios.ts` refresh failure and `base.ts` `invalidToken` | both call `authStore().logOut()` → `isAuthenticated` false → single root watcher fires; no per-call-site change needed |
| Public route (`/resume/:slug`) not hijacked | spec "stays on a public route when auth is lost there" passes |
| No spurious navigation while auth stays valid | spec "does not navigate while auth stays valid" passes |
| Build green | `✓ built in 4.59s` |
| Lint clean | exit 0 |
| comments per code-comments.md | added one JSDoc on exported `useAuthRedirect` (WHY: forced logouts have no router + guard only runs on navigation); one `//` in the spec (why the call has no router). No issue refs, no history narration, no blank Author template. |

## Noticed, not done
- Concurrent 401s still each call `logOut()` once (after the first, refresh token is empty → `refreshTokens` throws → `logOut()` again). Now harmless — no token so no `/auth/logout` POST, and the redirect unmounts the page — but could be guarded with an "already logged out" early return.
- `VeeForm.spec.ts` flaky tests — see previous node's "Noticed, not done".

## Seal gate
none — no commit/push/merge in this pass. Commit + PR into `staging` is `/ship`'s step.
