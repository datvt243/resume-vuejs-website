# Sign in, register, sign out, route guard

- Status: draft
- Source: backfill from code
- Issues: -
- Anchors: `src/pages/auth/PageLogin.vue`, `src/pages/auth/PageRegister.vue`, `src/services/auth.ts`, `src/stores/auth.ts`, `src/services/axios.ts`, `src/routers/index.ts`, `src/pages/_layouts/Header.vue`

## Goal
A candidate creates an account, signs in to edit their CV, and signs out.
Every dashboard page is reachable only while signed in.

## Behavior
1. Signed-out header shows the "Resume API" logo (links to `/login`), "Login" and "Register" links (the current one highlighted), and the dark/light toggle.
2. `/login` shows a form: Email (required, valid email), Password (required), "Remember me" checkbox, and a "Forgot password" link to `/forgot-password`.
3. On submit, a spinner shows; the app sends `POST api/v1/auth/login` with the email and password both trimmed.
4. On success: a green toast with the API's message; the access token is kept in memory only, the refresh token in `sessionStorage` (`refreshToken`, this tab only), the user object in `localStorage` (`user`); the app then loads `GET api/v1/candidate/<email>` into the candidate store and navigates to `/dashboard/information`.
5. On failure: tokens are cleared and a red toast shows the API's own reason (`error.message`, else `message` when `success === false`), else the generic "login failed" text.
6. Opening `/login` or `/register` while signed in redirects to `/dashboard/information`.
7. `/register` shows Email (required, valid), Password (required, at least 12 characters with a lowercase letter, an uppercase letter, a digit and a special character), Confirm password (must match). No name fields — names are set later on the Information page.
8. On register submit the app sends `POST api/v1/auth/register` with `email`, `password`, `repassword` (not trimmed). Success: green toast with the API message, then navigate to `/login`. Failure: red toast with the rejected body's `message`.
9. "Signed in" means: a cached user with an email AND a refresh token in this tab. A cached user without a refresh token (e.g. a new tab) counts as signed out.
10. Route guard: every route with `meta.requiresAuth` (`/` and all `/dashboard/*`) sends a signed-out user to `/login`. `/login`, `/register`, `/forgot-password`, `/reset-password`, `/resume/:slug` and the 404 route are open.
11. After a page reload only the refresh token survives; the first API request first calls `POST api/v1/auth/refresh` once. Any 401 whose error code is missing or one of `NO_TOKEN`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `TOKEN_REVOKED` triggers one refresh and one retry; concurrent requests share a single refresh call. If the refresh fails, the user is signed out.
12. Signed-in header shows a user menu labelled with the candidate's first + last name, else the email, else "Account" (HTML-escaped). The menu has "View API" (opens `<API>api/me/<email>` in a new tab) and "Log out".
13. Log out: calls `POST api/v1/auth/logout` with the access token (best effort — local state is cleared even if it fails), removes `user` from `localStorage`, clears tokens and the candidate store, and navigates to `/login`.

## Acceptance criteria
- `npx vitest run src/stores/auth.spec.ts` passes (store: tokens, `isAuthenticated`, logOut).
- `npx vitest run src/services/auth.spec.ts` passes (login/register handlers).
- `npx vitest run src/services/axios.spec.ts` passes (refresh-once, retry, sign-out on refresh failure).
- Signed out, opening `#/dashboard/skills` lands on `#/login`.
- Signed in, opening `#/login` lands on `#/dashboard/information`.
- Register with password `short` shows the min-length error and sends no request.
- After login, `sessionStorage.refreshToken` is set and `localStorage` holds no token.

## Edge cases
- Wrong password → red toast with the API's reason; tokens cleared; stays on `/login`.
- API unreachable → rejected body is `{ error: { code: 'NETWORK_ERROR', message: <network text> } }`; login shows that message.
- Private mode with blocked `sessionStorage` → the session lasts until reload.
- Refresh token rejected → signed out, `/login`.
- A 401 with a non-token code (e.g. `INVALID_CREDENTIALS`) → no refresh, error passed on.

## Out of scope
- Password reset (see `auth-password-reset.md`).
- Changing email/password or deleting the account (see `account-settings.md`).
- Cookie-based auth — deliberately not used (the API is a different site; third-party cookies are blocked).

## Open questions
1. "Remember me" is shown but its value is never used — the session is always tab-scoped. Intended placeholder, or should it change token storage?
2. Register (and forgot/reset) toast on failure reads only `err.message`; the newer API envelope puts the reason in `error.message`, so the toast may be empty. Login already handles both. Should register use the same logic?
3. Register sends the email untrimmed while login trims it. Intended?
4. When the silent refresh fails, `logOut()` is called without a router, so local state is cleared but the page does not move to `/login` until the next navigation. Intended?
5. Login has no link to Register (only the header has one). Intended?
6. "View API" picks a localhost base only when `window.location.host === 'localhost'`; a dev server on a port (`localhost:5173`) never matches. Intended?
7. Successful login always goes to `/dashboard/information`, not to the page the user first tried to open. Intended?

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
