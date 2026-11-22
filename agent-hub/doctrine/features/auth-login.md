# Sign in, register, sign out, route guard

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/auth-login-spec.md`
- Source: backfill from code
- Issues: #422, #424, #425, #426, #427, #428, #459
- Anchors: `src/pages/auth/PageLogin.vue`, `src/pages/auth/PageRegister.vue`, `src/services/auth.ts`, `src/stores/auth.ts`, `src/services/axios.ts`, `src/routers/index.ts`, `src/composables/useAuthRedirect.ts`, `src/pages/_layouts/Header.vue`

## Goal
A candidate creates an account, signs in to edit their CV, and signs out.
Every dashboard page is reachable only while signed in.

## Behavior
1. Signed-out header shows the "Resume API" logo (links to `/login`), "Login" and "Register" links (the current one highlighted), and the dark/light toggle.
2. `/login` shows a form: Email (required, valid email), Password (required), and a "Forgot password" link to `/forgot-password`. There is no "Remember me" checkbox. Below the fields a short note (vi + en, via i18n) says the session is kept only in this tab: closing it or opening a new tab requires signing in again.
3. On submit, a spinner shows; the app sends `POST api/v1/auth/login` with the email and password both trimmed.
4. On success: a green toast with the API's message; the access token is kept in memory only, the refresh token in `sessionStorage` (`refreshToken`, this tab only), the user object in `localStorage` (`user`); the app then loads `GET api/v1/candidate/<email>` into the candidate store and navigates to the `redirect` query value of `/login` when it is a safe internal path (see #15), else to `/dashboard/information`.
5. On failure: tokens are cleared and a red toast shows the API's own reason (`error.message`, else `message` when `success === false`), else the generic "login failed" text.
6. Opening `/login` or `/register` while signed in redirects to the safe `redirect` query target (see #15), else `/dashboard/information`. This check also runs when login itself flips the session on (the layout swap remounts `PageLogin`), so login lands on the target directly, with no stop at Information.
7. `/register` shows Email (required, valid), Password (required, at least 12 characters with a lowercase letter, an uppercase letter, a digit and a special character), Confirm password (must match). No name fields — names are set later on the Information page.
8. On register submit the submit button shows its submitting state until the request settles; the app sends `POST api/v1/auth/register` with `email` trimmed and `password`, `repassword` untrimmed. Success: green toast with the API message, then navigate to `/login`. Failure: red toast with the API's own reason (same extraction as login, #5), else the generic "something went wrong" text.
9. "Signed in" means: a cached user with an email AND a refresh token in this tab. A cached user without a refresh token (e.g. a new tab) counts as signed out.
10. Route guard: every route with `meta.requiresAuth` (`/` and all `/dashboard/*`) sends a signed-out user to `/login?redirect=<the requested path, incl. its query>` (e.g. `/login?redirect=/dashboard/preview`). `/login`, `/register`, `/forgot-password`, `/reset-password`, `/resume/:slug` and the 404 route are open.
11. After a page reload only the refresh token survives; the first API request first calls `POST api/v1/auth/refresh` once. Any 401 whose error code is missing or one of `NO_TOKEN`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `TOKEN_REVOKED` triggers one refresh and one retry; concurrent requests share a single refresh call. If the refresh fails, the user is signed out and sent to `/login` right away.
12. Signed-in header shows a user menu labelled with the candidate's first + last name, else the email, else "Account" (HTML-escaped). The menu has "View API" (opens `<API>api/me/<email>` in a new tab) and "Log out".
13. Log out: calls `POST api/v1/auth/logout` with the access token and body `{ refreshToken }` so the API can revoke both (best effort — local state is cleared even if it fails), removes `user` from `localStorage`, clears tokens and the candidate store, and navigates to `/login`.
14. `/login` shows a "No account? Register" link to `/register`; `/register` shows an "Already have an account? Log in" link to `/login` (vi + en, via i18n).
15. A `redirect` value is safe only when it is a string that starts with exactly one `/` (not `//`, not `/\`) — i.e. a path inside this app. Anything else (missing, empty, `https://evil.com`, `//evil.com`, `/\evil.com`, `javascript:...`, an array from a repeated `?redirect=`) is ignored and login goes to `/dashboard/information`.

## Acceptance criteria
- `npx vitest run src/stores/auth.spec.ts` passes (store: tokens, `isAuthenticated`, logOut).
- `npx vitest run src/services/auth.spec.ts` passes (login/register handlers).
- `npx vitest run src/services/axios.spec.ts` passes (refresh-once, retry, sign-out on refresh failure).
- Signed out, opening `#/dashboard/skills` lands on `#/login?redirect=/dashboard/skills`.
- Signed out, opening `#/dashboard/preview` then logging in with a QA account lands on `#/dashboard/preview` (not Information).
- Logging in from `#/login` (no query), `#/login?redirect=https://example.com`, `#/login?redirect=//example.com` and `#/login?redirect=/%5Cexample.com` each lands on `#/dashboard/information`; the browser never leaves the app origin.
- A unit test covers the safe-path check (accepts `/dashboard/preview`, `/dashboard/preview?x=1`; rejects `undefined`, `''`, `https://a.com`, `//a.com`, `/\a.com`, `javascript:alert(1)`, an array) and passes under `npm run test`.
- Signed in, opening `#/login` lands on `#/dashboard/information`.
- Register with password `short` shows the min-length error and sends no request.
- Opening `#/login`: no checkbox in the form; the tab-only note is visible; the link to `#/register` navigates there. Opening `#/register`: the link to `#/login` navigates there. Switching to EN changes both texts.
- `grep -rn rememberMe src` returns nothing.
- `npm run build` and `npm run lint` pass.
- After login, `sessionStorage.refreshToken` is set and `localStorage` holds no token.

## Edge cases
- Wrong password → red toast with the API's reason; tokens cleared; stays on `/login`.
- API unreachable → rejected body is `{ error: { code: 'NETWORK_ERROR', message: <network text> } }`; login shows that message.
- Private mode with blocked `sessionStorage` → the session lasts until reload.
- Refresh token rejected → signed out, `/login`.
- `redirect` points to an unknown internal path (e.g. `/nope`) → login navigates there and the 404 page shows (internal, harmless).
- `redirect=/login` or another guest-only page (`/register`, `/forgot-password`, `/reset-password`) → not a valid target, login goes to `/dashboard/information`.
- Signed out on the bare site URL (`/`, Home) → `/login?redirect=/`; login returns to Home (operator 2026-11-22).
- Wrong password with a `redirect` → stays on `/login?redirect=...`, so the next successful attempt still returns to the target.
- A 401 with a non-token code (e.g. `INVALID_CREDENTIALS`) → no refresh, error passed on.

## Out of scope
- Carrying the target through a forced sign-out (refresh failure / `useAuthRedirect` watch) or through the `/register` → `/login` trip: only the route guard adds `redirect` (#428 as written).
- Password reset (see `auth-password-reset.md`).
- Changing email/password or deleting the account (see `account-settings.md`).
- Cookie-based auth — deliberately not used (the API is a different site; third-party cookies are blocked).

## Open questions
1. "Remember me" is shown but its value is never used — the session is always tab-scoped. Intended placeholder, or should it change token storage? → **Answer (operator 2026-11-07):** Change: remove the checkbox, show an info note that the session is tab-only — #424
2. Register (and forgot/reset) toast on failure reads only `err.message`; the newer API envelope puts the reason in `error.message`, so the toast may be empty. Login already handles both. Should register use the same logic? → **Answer (operator 2026-11-07):** Bug — #422
3. Register sends the email untrimmed while login trims it. Intended? → **Answer (operator 2026-11-07):** Bug: trim — #425
4. When the silent refresh fails, `logOut()` is called without a router, so local state is cleared but the page does not move to `/login` until the next navigation. Intended? → **Answer (operator 2026-11-07):** Bug: navigate right away — #426
5. Login has no link to Register (only the header has one). Intended? → **Answer (operator 2026-11-07):** Change: add links both ways login ↔ register — #424
6. "View API" picks a localhost base only when `window.location.host === 'localhost'`; a dev server on a port (`localhost:5173`) never matches. Intended? → **Answer (operator 2026-11-07):** Bug — #427
7. Successful login always goes to `/dashboard/information`, not to the page the user first tried to open. Intended? → **Answer (operator 2026-11-07):** Change: return to the originally requested page (internal paths only) — #428

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/auth-login-spec.md` | - |
| 2026-11-15 | Behavior #8: register shows submitting state, trims email, error toast uses login's extraction | #420 #422 #425 (operator answers to open questions 2-3) | `issue-420-auth-form-fixes` |
| 2026-11-15 | Behavior #11: failed refresh navigates to `/login`; #13: logout body sends `refreshToken` | #426 (operator answer to open question 4), #459 | `issue-459-logout-refresh-token` |
| 2026-11-22 | Behavior #2: "Remember me" removed, tab-only session note added; #14: login/register cross links | #424 (operator answers to open questions 1 and 5) | - |
| 2026-11-22 | Behavior #4, #10, #15: guard passes `?redirect=`, login returns to a safe internal target | #428 (operator answer to open question 7) | - |
| 2026-11-22 | Behavior #6: a signed-in user on `/login` follows a safe `?redirect=` (was always Information); removed from Out of scope. A bare `/` visit returns to Home after login (`redirect=/`) | #428, operator (implementer pass, review finding: Information flashed before the target) | `issue-428-430-auth-redirects` |
