# analyst — auth-login — 2026-11-07

## Task (verbatim)
document auth-login

## Doc
`agent-hub/doctrine/features/auth-login.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/auth/PageLogin.vue`, `src/pages/auth/PageRegister.vue`
- `src/services/auth.ts` (`handleLogin`, `handleRegister`)
- `src/stores/auth.ts`
- `src/services/axios.ts` (request/response interceptors, `refreshOnce`, `TOKEN_ERROR_CODES`, `_axios` NETWORK_ERROR body)
- `src/routers/index.ts` (routes + `beforeEach`)
- `src/pages/_layouts/Header.vue`
- `src/config/api.config.js`

## Re-check vs code
Behavior 1–13 match code. Login fields incl. unused `rememberMe` checkbox + forgot link (`PageLogin.vue`); `POST auth/login` with trimmed email+password, toast, `setTokens` (memory access token, `sessionStorage.refreshToken`), `setUser` (`localStorage.user`), `GET candidate/<email>`, push `/dashboard/information`; failure clears tokens + toast `error.message` → `message` if `success === false` → `error.loginFailed` (`services/auth.ts` `handleLogin`). Redirect when signed in on `/login`/`/register` (both pages' setup). Register rule min 12 + 4 classes + match; untrimmed body; failure toast `err.message` only (`handleRegister`). `isAuthenticated = user.email && refreshToken` (`stores/auth.ts`). Guard on `meta.requiresAuth` (`/` + all `/dashboard/*`) → `login` (`routers/index.ts`). Up-front refresh when no access token; 401 + missing/token code → one refresh + retry, shared promise; refresh failure → `logOut()` without router (`axios.ts`). Header signed-out/signed-in menu, escaped name, View API host check `window.location.host === 'localhost'`, logout best-effort `POST auth/logout` then clear (`Header.vue`, `stores/auth.ts`). No discrepancy.

## Questions + answers
Operator (2026-11-07): "behavior đúng" (Behavior section confirmed correct).
1. "Remember me" is shown but its value is never used — the session is always tab-scoped. Intended placeholder, or should it change token storage? → **Answer (operator 2026-11-07):** Change: remove the checkbox, show an info note that the session is tab-only — #424
2. Register (and forgot/reset) toast on failure reads only `err.message`; the newer API envelope puts the reason in `error.message`, so the toast may be empty. Login already handles both. Should register use the same logic? → **Answer (operator 2026-11-07):** Bug — #422
3. Register sends the email untrimmed while login trims it. Intended? → **Answer (operator 2026-11-07):** Bug: trim — #425
4. When the silent refresh fails, `logOut()` is called without a router, so local state is cleared but the page does not move to `/login` until the next navigation. Intended? → **Answer (operator 2026-11-07):** Bug: navigate right away — #426
5. Login has no link to Register (only the header has one). Intended? → **Answer (operator 2026-11-07):** Change: add links both ways login ↔ register — #424
6. "View API" picks a localhost base only when `window.location.host === 'localhost'`; a dev server on a port (`localhost:5173`) never matches. Intended? → **Answer (operator 2026-11-07):** Bug — #427
7. Successful login always goes to `/dashboard/information`, not to the page the user first tried to open. Intended? → **Answer (operator 2026-11-07):** Change: return to the originally requested page (internal paths only) — #428

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/auth-login-spec.md` set in doc + INDEX row; Issues #422, #424, #425, #426, #427, #428. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
