# 2026-09-25 — issue-8-jwt-httponly-cookie-migration

- Worker: implementer
- Version: 0.1.0
- Node: `issue-8-jwt-httponly-cookie-migration` (new node per LAI-13 —
  does not edit any of the 8 prior `issue-8-jwt-localstorage*` rows,
  including `issue-8-jwt-localstorage-unblocked-20260920` which first
  found the backend ready)
- Task (verbatim): "#8" (operator, via `/worker implementer`, part of a
  3-item sequence the operator approved: `/release` → this → `#116`)

## Hub bytes before
133944 (root=7714, doctrine=27207, active diagram=72906, implementer
bundle=14963, verifier bundle=11154 — `wc -c` per category, same formula
`/hub-tokens` uses).

## Branch
`fix/issue-8-jwt-httponly-cookie-migration`, cut from `staging` (after
`staging` had already absorbed v1.11.0's release-bump merge back —
verified `git status --short` was clean on `main` before branching).

## What backend already provides (verified by reading source directly,
`/Users/_david/Workspace/Project/resume/resume-nodejs-api` @ `main`)
- `setAuthCookies`/`clearAuthCookies` (`src/utils/authCookies.ts`): sets
  httpOnly `token`/`refreshToken` cookies (`sameSite: 'none'`, `secure`)
  on login/refresh, clears them on logout/logout-all. Also issues a
  **non**-httpOnly `csrfToken` cookie via `src/utils/csrf.ts` in the same
  call.
- `extractTokenWithSource` (`src/utils/helper-auth.ts`): token lookup
  order is header → body → query → cookie — dropping the `Authorization`
  header from the frontend makes every request fall through to the
  cookie automatically, no code change needed backend-side.
- `requiresCsrfCheck`/`isCsrfTokenValid` (`src/utils/csrf.ts`), wired into
  both `verifyToken` (every authenticated route) and the standalone
  `verifyCsrf` middleware (`/auth/logout`, `/auth/refresh` — these two
  don't go through `verifyToken`): a state-changing request whose token
  came from the cookie (not a header/body/query) MUST also carry a
  matching `x-csrf-token` header, or it's rejected.
- `corsConfig()` (`src/config/cors.config.ts`): `credentials: true`
  already set, origin reflects an explicit allow-list (`CORS_ORIGIN` env
  var) or the caller's origin in dev — **not independently verifiable
  from here whether `CORS_ORIGIN` on Render actually includes
  `https://datvt243.github.io`**, flagged under Noticed.
- Login/refresh responses still also return `token`/`tokenRefresh` in the
  JSON body (dual, transitional per the backend's own comment) — the
  frontend diff below stops reading them, doesn't require a backend
  change to stop sending them.

## Diff
| File | Why |
|---|---|
| `src/utilities/index.ts` | New `getCookie(name)` + `getCsrfHeader()` — reads the non-httpOnly `csrfToken` cookie, builds the `x-csrf-token` header. Placed here (not in `services/`) specifically to avoid a circular import: `services/axios.ts` already imports `authStore` from `stores/auth.ts`, and `stores/auth.ts` now needs this same helper for its own logout call — a leaf `utilities` module keeps both edges one-directional. |
| `src/services/axios.ts` | `withCredentials: true` on the shared instance; new request interceptor attaches the CSRF header on every non-safe-method dispatch (covers the post-refresh retry too, so it's never stale); refresh call no longer reads/passes `refreshToken` from `localStorage` — cookie carries it, `withCredentials`+CSRF header added to the raw `axios.post` refresh call; `_axios` no longer builds an `Authorization` header from `localStorage`/a `token` param (removed the now-dead `token` param from its signature). |
| `src/stores/auth.ts` | Removed `_token`/`_refreshToken` refs and all `localStorage` reads/writes for `token`/`tokenRefresh` (the actual anti-pattern issue #8 names) — `_user` stays cached (display data, not a credential) and now also backs `isAuthenticated` (`!!_user?.email`) instead of token presence. `logOut()` is now async and calls `POST auth/logout` (best-effort, try/catch) before clearing local state — **necessary, not scope creep**: previously clearing localStorage WAS a full client-side logout; with an httpOnly cookie, only the backend can actually invalidate it, so skipping this call would leave the cookie live after the UI claims "logged out". |
| `src/services/auth.ts` | `handleLogin` no longer destructures/stores `token`/`tokenRefresh`; drops the explicit `token` override passed into the immediate post-login `candidate/{email}` fetch (cookie already carries it, set by the login response itself via `withCredentials`). |
| `src/pages/home/PageHome.vue`, `src/pages/_layouts/Header.vue` | Both built a PDF-download link as `...download-pdf?token=${auth.getToken}` — that accessor no longer exists (and shouldn't: the JWT isn't JS-readable anymore). Backend's `/download-pdf` route uses `verifyTokenByQuery` → `verifyToken`, which already falls back to the cookie; it's a plain `<a href>` browser navigation (not fetch/axios), and `SameSite=None` cookies ride along on cross-site navigations same as any other request — confirmed by reading `verifyTokenByQuery`'s own comment ("keep for compatibility; extractToken already supports query param") and `extractTokenWithSource`'s cookie fallback. Dropped the query param entirely. |
| `src/stores/auth.spec.ts` | Rewritten for the new contract (no more `getToken`/`setToken`/`getRefreshToken`/`setRefreshToken` — those tests directly asserted the anti-pattern this issue removes). Mocks `axios` (`vi.mock('axios')`) so `logOut()`'s real network call doesn't hit anything in the test env; asserts the backend logout call happens with `withCredentials: true`, and that local state still clears when that call rejects (best-effort). |
| `src/utilities/index.spec.ts` | New tests for `getCookie`/`getCsrfHeader` (empty when unset, decodes/reads when set, picks the right cookie among several) — keeps this file's near-100% coverage from `doctrine/MEMORY.md` intact rather than adding untested exports. |

## Command
`npm run test -- --run` (repo root)

## Output
```
 Test Files  18 passed (18)
      Tests  127 passed (127)
   Start at  02:28:42
   Duration  2.05s (transform 832ms, setup 0ms, collect 2.22s, tests 409ms, environment 5.77s, prepare 857ms)
```

`npm run lint` (repo root) — exit 0, no output.

`npm run build` (repo root):
```
✓ built in 3.34s
```
Only the pre-existing chunk-size advisory (`VeeForm` chunk, unrelated to
this diff).

## Acceptance
| Criterion | Evidence |
|---|---|
| `withCredentials: true` added to the shared axios instance | `src/services/axios.ts` — `axios.create({ baseURL: API, withCredentials: true })` |
| CSRF header attached on state-changing requests, recomputed per-dispatch (not stale after refresh) | Request interceptor on `instanceAxios`, runs on every call including `instanceAxios(originalRequest)`'s retry |
| `localStorage` token/tokenRefresh storage removed from `src/stores/auth.ts` | `grep -rn "getToken\|setToken\|getRefreshToken\|setRefreshToken" src/` and `grep -rn "localStorage.*['\"]token" src/` both return nothing |
| Backend cookie actually invalidated on logout (not just local state) | `src/stores/auth.ts` `logOut()` now calls `POST auth/logout` before clearing local state; `src/stores/auth.spec.ts`'s `'logOut calls the backend logout endpoint'` test asserts the call + `withCredentials: true` |
| Build/lint/test all green | Quoted above — `✓ built in 3.34s`, lint exit 0/no output, `127 passed (127)` |
| No dangling references to the removed token accessors | `grep` sweep above (empty results) |

## Noticed, not done
- **Cannot verify from this repo** whether Render's `CORS_ORIGIN` env var
  for the production API actually includes `https://datvt243.github.io` —
  if it doesn't, `credentials: true` + an origin not on the allow-list
  means the browser will refuse to expose the response/store the
  `Set-Cookie` header entirely, and this whole migration would silently
  fail in production despite passing build/lint/test here. Flagged for
  the operator to confirm directly against the live Render env before
  fully trusting this in production (same class of caveat as the two
  prior `-unblocked-20260920` notes' "Render redeploy timing" flag).
- **No live browser click-through this session** — `curl :9888/json/list`
  showed only extension background pages, no app tab with a server behind
  it (same gap as several prior UI-diff sessions in this hub). Real
  automated verification here is the build/lint/test trio + the rewritten
  `auth.spec.ts`, not a live login/logout against the real backend.
  **Given this is a security-sensitive auth-mechanism change (not a
  cosmetic UI diff), the operator manually testing a real login → make an
  authenticated request → logout → confirm the cookie is actually gone
  cycle in a real browser before fully trusting this in production is
  strongly recommended**, disclosed rather than implied as already done.
- `resume-nodejs-api`'s `authRefreshToken` still returns `token`/
  `tokenRefresh` in its JSON response body (dual/transitional) — not a
  frontend concern, but worth the backend dropping eventually once no
  frontend reads it (this one doesn't, after this diff).

## Seal gate
No merge into `staging`/`main` yet — this note covers the implementer
pass only (branch pushed, not merged). Merging is a separate outward-
facing step (`/ship`), covered by the operator's earlier blanket "làm đi"
(do all 3, in order) approval for this session's release → #8 → #116
sequence — not re-confirmed line-by-line here per that standing
instruction.
