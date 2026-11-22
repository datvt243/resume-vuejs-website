# Analyst spec — #428 + #430 auth redirects

## Task (verbatim)
#428 "After login, return to the page the user first tried to open" — Successful login always goes to /dashboard/information. A signed-out user opening /dashboard/preview is sent to /login and then lands on Information, not Preview. Expected: the route guard passes the target (e.g. ?redirect=/dashboard/preview); after login go there. Only same-app internal paths are accepted (no open redirect); otherwise /dashboard/information. Decided by the operator while confirming agent-hub/doctrine/features/auth-login.md (2026-11-07).

#430 "Redirect signed-in users away from /forgot-password and /reset-password" — /login and /register redirect a signed-in user to /dashboard/information; /forgot-password and /reset-password don't. Expected: same redirect for both pages. Decided by the operator while confirming agent-hub/doctrine/features/auth-password-reset.md (2026-11-07).

## Docs updated
- `doctrine/features/auth-login.md` — Behavior #4, #10, new #15; acceptance, edge cases, out of scope, changelog
- `doctrine/features/auth-password-reset.md` — Behavior #7; acceptance, edge cases, changelog
- INDEX rows unchanged (already list #428 / #430; status stays as precedent rows on 2026-11-15/22)

## Sources read
`doctrine/domains/PROJECT.md`, `doctrine/MEMORY.md`, `doctrine/features/INDEX.md`, both feature docs,
`src/routers/index.ts` (beforeEach: `next({ name: 'login' })`, no query), `src/composables/useAuthRedirect.ts`
(GUEST_ONLY = ['login','register'], on-load redirect only), `src/composables/useAuthRedirect.spec.ts`,
`src/pages/auth/PageLogin.vue` + `PageRegister.vue` (setup-time signed-in redirect),
`src/services/auth.ts` (handleLogin `router?.push('/dashboard/information')`), `src/pages/auth/PageResetPassword.vue`.

## Questions + answers
Both behaviors were decided by the operator on 2026-11-07 (open question 7 of auth-login, 4 of auth-password-reset).
No new blocking questions. Scoped per issue text, recorded as Out of scope (operator may widen later):
forced sign-out and register→login do not carry `redirect`; signed-in `/login?redirect=` still goes to Information.

## Isolation proof
Spawned blank; got only the two issue texts + branch name. No implementer reasoning or diff seen; no code written.
