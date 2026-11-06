# analyst — auth-password-reset — 2026-11-07

## Task (verbatim)
document auth-password-reset

## Doc
`agent-hub/doctrine/features/auth-password-reset.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/auth/PageForgotPassword.vue`, `src/pages/auth/PageResetPassword.vue`
- `src/services/auth.ts` (`handleForgotPassword`, `handleResetPassword`)
- `src/i18n/index.ts` (`forgotDescription`, `resetInvalidLink`)
- `src/routers/index.ts` (no guard on both routes)

## Re-check vs code
Behavior 1–7 match code. Forgot: heading + `auth.forgotDescription` (no no-email disclosure; the source comment asks for one), email required/valid, send button, back-to-login link; `POST auth/forgot-password` trimmed email; success toast `res.message`, failure toast `err.message` only. Reset: `route.query.token`; missing → red `resetInvalidLink` `<p>` above a still-rendered form; same password rule as register + match; `POST auth/reset-password` `{token, password, repassword}`; success toast + push `/login`, failure toast `err.message`. Neither page redirects signed-in users; routes have no `requiresAuth`. No discrepancy.

## Questions + answers
Operator (2026-11-07): "behavior đúng" (Behavior section confirmed correct).
1. Error toast reads only `err.message`; the newer API envelope puts the reason in `error.message`, so the toast may be empty. Should it match login's handling? → **Answer (operator 2026-11-07):** Bug — #422
2. Without a token, the form is still submittable and sends `token: undefined`. Should the form be hidden or disabled? → **Answer (operator 2026-11-07):** Bug: disable the form — #429
3. The page's source comment says the UI must disclose that no real email is sent, but the shown description ("Enter your registered email to receive a password reset link.") does not. Should it? → **Answer (operator 2026-11-07):** Change: show a note on /forgot-password — #429
4. Signed-in users can open both pages (no redirect, unlike `/login` and `/register`). Intended? → **Answer (operator 2026-11-07):** Change: redirect to /dashboard/information like /login — #430

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/auth-password-reset-spec.md` set in doc + INDEX row; Issues #61, #422, #429, #430. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
