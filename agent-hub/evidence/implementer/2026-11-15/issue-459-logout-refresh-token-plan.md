# 2026-11-15 - issue-459-logout-refresh-token
- Worker: implementer · Version: 0.1.0
- Node: `issue-459-logout-refresh-token` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS)
- Task: "Fix #459 + #426 (combined, branch fix/issue-459-logout-refresh-token). #459 Logout: send the refresh token so the backend can revoke it — logOut (src/stores/auth.ts) posts auth/logout with empty body {}; must send { refreshToken } in the body (and still call logout when only the refresh token exists, e.g. after reload), so that afterwards POST auth/refresh with that token → 401 TOKEN_REVOKED. Backend: datvt243/resume-nodejs-api#391. #426 Failed silent refresh clears the session but stays on the page — in src/services/axios.ts, when auto POST auth/refresh fails, logOut() is called without a router so the page doesn't move to /login; expected: a failed refresh signs out and navigates to /login right away. Commit must also say Closes #426."

## Branch
`fix/issue-459-logout-refresh-token` (cut from `staging` @ `13383c8` via `gh issue develop 459 --base staging`). Covers #459 and #426 — `/ship` auto-appends `Closes #459` only, the commit message must add `Closes #426`.

## Hub bytes before
99387 — measured right after appending this node's diagram row (~400 bytes), not before it; the pre-row value was not captured.

## Feature doc
`doctrine/features/auth-login.md`

## Feature doc changed
- Behavior #11: "If the refresh fails, the user is signed out." → "…signed out and sent to `/login` right away." — operator: open question 4 answer (2026-11-07) "Bug: navigate right away — #426".
- Behavior #13: "with the access token" → "with the access token and body `{ refreshToken }` so the API can revoke both" — operator: issue #459 (filed by the operator) Expected section.
- Issues list + `## Changelog` row added.

## Acceptance criteria clarified
"still call logout when only the refresh token exists, e.g. after reload" → dropped. The backend `authLogout` returns 400 `noTokenToLogout` with no access token (`resume-nodejs-api` `src/auth/auth.controller.ts` authLogout, `if (!token) … BAD_REQUEST`). Also, after a reload the request interceptor refreshes up front on the first API call, so an access token is normally there by the time the user logs out. The `if (_token.value)` guard stays. That clause was the orchestrator's own wording and is not in issue #459.

"afterwards POST auth/refresh with that token → 401 TOKEN_REVOKED" → moved to backend issue datvt243/resume-nodejs-api#475 (operator choice 2026-11-15: "Open backend bug, seal FE (Recommended)"). The frontend part is "logout request body carries `refreshToken`".

## Diff
| File | Why |
|---|---|
| `src/stores/auth.ts` | `logOut` posts `{ refreshToken: _refreshToken.value }` instead of `{}`; comment fixed (it said the refresh token was revoked, which wasn't true) |
| `src/services/axios.ts` | import `router` from `@/routers`; failed refresh calls `logOut({ router })` → `/login` right away |
| `src/stores/auth.spec.ts` | new test: logout body is `{ refreshToken: 'rt' }` |
| `src/services/axios.spec.ts` | mock `@/routers`; new test: 401 + failed refresh → `logOut({ router })` |
| `agent-hub/doctrine/features/auth-login.md` | Behavior #11/#13 + changelog (see above) |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row |

Import cycle check: `@/routers` imports `@/stores/auth` (→ `@/stores/candidate`, pinia, vue, axios pkg) and lazy page components only; none import `src/services/axios.ts` at module level, so no cycle.

## Command
From `doctrine/MEMORY.md`, repo root: `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck`. Also `npx vitest run src/services/axios.spec.ts src/stores/auth.spec.ts` with and without the fix (red/green).

## Output
`npm run test` (tail):
```
 Test Files  56 passed (56)
      Tests  372 passed (372)
```
Red check, source fix stashed (`git stash push src/services/axios.ts src/stores/auth.ts`), specs kept:
```
   × authStore > logOut sends the refresh token so the backend can revoke it (issue #459) 4ms
   × _axios 401 interceptor > 401 whose refresh fails logs out and sends the user to /login (issue #426) 4ms
      Tests  2 failed | 20 passed (22)
```
Green, fix restored:
```
 ✓ src/stores/auth.spec.ts (12 tests) 7ms
 ✓ src/services/axios.spec.ts (10 tests) 12ms
 Test Files  2 passed (2)
      Tests  22 passed (22)
```
`npm run build`: `✓ built in 4.06s` (only the existing chunk-size warning).
`npm run lint`: `eslint src --ext .js,.ts,.vue`, exit 0, no output.
`npm run typecheck`: 78 `error TS` lines on the branch, 78 on `staging` (stashed run). A diff of the two lists with line/col stripped is identical, so the diff adds no errors. The touched-file errors are all pre-existing: `axios.spec.ts(15,…)` TS7006 in the old `reply` helper, `auth.ts(38)` TS2345, `auth.ts(80)` TS2339 `router` on `{}`, `auth.ts(83)` TS7006. Count 78 ≤ baseline 90.

Live check (`npm run dev` on :5173, prod API, debug Chrome via Playwright, account `qa.minimal@example.com`):
- #459: after login, `logOut({ router })` → request 137 `POST auth/logout => [200]`, request body `{"refreshToken":"eyJhbGciOiJIUzI1NiIs…"}`, landed on `#/login`. Then `POST auth/refresh` with the same token → `200` and a new pair: **the backend did not revoke it**. Cause: `extractTokenWithSource` (`resume-nodejs-api` `src/utils/helper-auth.ts`) returns the `Authorization` header before reading `fieldName`, so `extractTokenFromRequest(req, 'refreshToken')` gets the access token. Filed as datvt243/resume-nodejs-api#475.
- #426: logged in, set `sessionStorage.refreshToken = 'bogus.refresh.token'`, reloaded `#/dashboard/information`. Requests: `216 POST auth/refresh => [401]`, `273-275 GET … => [401]`, `276 POST auth/refresh => [401]`, `277 GET profile => [401]`. Then the page was at `{"hash":"#/login","user":null,"rt":null}`.
- Incident: the second login in the live check was submitted with the browser's prefilled owner account (`votan.it@gmail.com`), not the QA account (request 141 `GET candidate/votan.it@gmail.com`). Requests sent with that session: 140 login, 141-143 GETs, then the bogus-refresh 401s. No writes to the owner's data.
- Dev server started by Claude (pid 52749) was stopped afterwards; :5173 no longer listening.

## Acceptance
| Criterion | Evidence |
|---|---|
| #459: logout body sends `{ refreshToken }` | auth.spec "logOut sends the refresh token…" red without fix / green with it; live request 137 body `{"refreshToken":"eyJ…"}` |
| #459: refresh after logout → 401 TOKEN_REVOKED | NOT met; backend bug, moved to resume-nodejs-api#475 by operator decision (see clarified) |
| #426: failed refresh signs out and goes to `/login` right away | axios.spec "401 whose refresh fails…" red/green; live `hash: "#/login"`, `user: null` |
| Existing logout behavior unchanged (clears state, best effort) | existing auth.spec logOut tests pass, `Tests 372 passed (372)` |
| matches `features/auth-login.md` Behavior #11, #13 (as updated) | diff above |
| Build / lint / typecheck | `✓ built in 4.06s`; lint exit 0; typecheck 78 = staging 78 |
| comments per code-comments.md | one changed `//` comment in `auth.ts`, one sentence, says why (the API needs the access token) |

## Supersedes
none (`grep "#459\|#426"` on the active diagram: no other rows)

## Review
Ran the medium review inline (diff is 4 lines of source). I read both touched files in full and checked the `logOut` callers (`Header.vue:73`, `PageAccountSettings.vue:77` pass `{ router }`; `base.ts:114` doesn't).
- Possible import cycle `axios.ts → routers → stores/auth` → false positive, see the cycle check above; build and tests green.
- `logOut` posts the refresh token to the API over HTTPS. That is the same token `auth/refresh` already sends, so it's no new exposure.
No other correctness findings.

## Noticed, not done
- `src/services/base.ts:114` calls `store?.logOut()` without a router when `handleBase` sees a token error code. Same symptom as #426 (stays on page). It is usually reached only after the axios interceptor has already logged out, but the second `logOut` call is redundant. Separate issue if wanted.
- `doctrine/MEMORY.md` Typecheck baseline says 90; staging now has 78. Doctrine proposal: `Typecheck baseline: 90 errors on staging @ v1.35.5` → `78 errors on staging @ 13383c8 (2026-11-15)`.

## Seal gate
Live check used the prod API with the QA account (plus the accidental owner-account login above, reads only). Backend issue datvt243/resume-nodejs-api#475 created with operator approval (answer "Open backend bug, seal FE"). No commit/push.
