# Forgot / reset password

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/auth-password-reset-spec.md`
- Source: backfill from code
- Issues: #61, #422, #429, #430
- Anchors: `src/pages/auth/PageForgotPassword.vue`, `src/pages/auth/PageResetPassword.vue`, `src/services/auth.ts`

## Goal
A user who forgot their password requests a reset link, then sets a new password from that link.

## Behavior
1. `/forgot-password` shows a heading, a description, an Email field (required, valid email), a "Send request" button and a "Back to login" link.
2. Submit shows a spinner and sends `POST api/v1/auth/forgot-password` with the trimmed email.
3. Success → green toast with the API message (the backend answers the same generic message whether or not the email exists). Failure → red toast with the rejected body's `message`.
4. `/reset-password` reads `token` from the query string. Without a token it shows the "invalid link" text in red above the form (the form is still shown).
5. The form asks for a new password (same rule as registration: at least 12 characters, a lowercase letter, an uppercase letter, a digit and a special character) and a confirmation that must match.
6. Submit sends `POST api/v1/auth/reset-password` with `token`, `password`, `repassword`. Success → green toast, then navigate to `/login`. Failure → red toast with the rejected body's `message`.
7. Both pages are open to signed-out users (no route guard).

## Acceptance criteria
- `npm run test` passes (the auth handlers are covered by `src/services/auth.spec.ts`).
- `#/reset-password` without `?token=` shows the invalid-link text.
- Submitting a valid new password with a valid token ends on `#/login` with a green toast.
- A confirmation that differs from the password shows the mismatch error and sends no request.

## Edge cases
- Unknown email → same success toast as a known one (backend design, no account enumeration).
- Expired/invalid token → red toast with the backend's message; stays on the page.

## Out of scope
- Sending the email. The backend currently only logs the reset link (backend issue #70, no mail provider).
- Changing the password while signed in (see `account-settings.md`).

## Open questions
1. Error toast reads only `err.message`; the newer API envelope puts the reason in `error.message`, so the toast may be empty. Should it match login's handling? → **Answer (operator 2026-11-07):** Bug — #422
2. Without a token, the form is still submittable and sends `token: undefined`. Should the form be hidden or disabled? → **Answer (operator 2026-11-07):** Bug: disable the form — #429
3. The page's source comment says the UI must disclose that no real email is sent, but the shown description ("Enter your registered email to receive a password reset link.") does not. Should it? → **Answer (operator 2026-11-07):** Change: show a note on /forgot-password — #429
4. Signed-in users can open both pages (no redirect, unlike `/login` and `/register`). Intended? → **Answer (operator 2026-11-07):** Change: redirect to /dashboard/information like /login — #430

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/auth-password-reset-spec.md` | - |
