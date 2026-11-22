# Analyst spec: auth-login (#424)
## Task (verbatim)
Login/Register: replace the unused "Remember me" with an info note, link the two pages (issue #424; body as given: remove checkbox, vi+en note that the session is kept only in this tab; login "No account? Register" -> /register; register "Already have an account? Log in" -> /login). Decided by operator 2026-11-07.
## Doc
agent-hub/doctrine/features/auth-login.md (updated: Behavior #2, new #14, acceptance criteria, changelog). Status unchanged (verified; spec for this change is draft until node SEAL).
## Sources read
analyst manifest/SOUL/recipes/spec_feature.md; doctrine/features/auth-login.md; features/INDEX.md (row grep); src/pages/auth/PageLogin.vue; PageRegister.vue; grep rememberMe in src (i18n/index.ts vi+en lines 121, 656, PageLogin.vue).
## Questions + answers
Q1 (Remember me) and Q5 (links) answered by operator 2026-11-07. No new questions. Exact vi/en wording is left to the implementer (issue gives the meaning).
## Isolation proof
Spawn had no implementer reasoning; only task text and files above.
