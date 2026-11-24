# Account settings and app language

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/account-settings-spec.md`
- Source: backfill from code
- Issues: #63, #182, #431, #460, #489, datvt243/resume-nodejs-api#412
- Anchors: `src/pages/dashboard/PageAccountSettings.vue`, `src/i18n/index.ts` (`uiLang`, `setUiLang`), `src/composables/useCvLang.ts`, `src/composables/useDownloadCv.ts`, `src/stores/auth.ts`, `src/services/auth.ts`, `src/routers/index.ts`, `src/App.vue` (reload fetch `candidate/${email}`), `src/pages/auth/PageRegister.vue` (password rules)

## Goal
The candidate manages account-level settings: interface language, CV file name and CV language, and can delete their account.

## Behavior
1. `/dashboard/account-settings` sections, top to bottom: Email, Password, Delete account, App language, CV file name, CV language.
2. Email: shows the signed-in email (or "—"). "Change email" is disabled, marked "coming soon".
3. Password: "Change password" is disabled, marked "coming soon" (no backend endpoint for a signed-in user yet).
4. Delete account (danger section, "cannot be undone"): confirm dialog warning that all CV data and uploaded files are deleted permanently → `DELETE api/v1/candidate` → on success, sign out and go to `/login`. Failure → red toast.
   - *(#431 / #489 — spec complete, not yet implemented/sealed)* Typed confirm: the dialog keeps its current title and warning text and adds a text input (placeholder `confirm.typeDeletePlaceholder`) with the prompt `confirm.typeDelete` — the same typed confirm single-skill delete uses (`VeeFormGeneralInformationUpdate.vue`), shared by all four dialogs rather than copied. The Delete button only proceeds when the input is exactly `delete` (case-sensitive, not trimmed, English in both UI languages); anything else keeps the dialog open and shows `confirm.typeDelete` as the validation message. Cancel, × or Esc closes it and sends no request. `DELETE api/v1/candidate` is sent only after a valid `delete`.
5. App language: Tiếng Việt / English. Changes menus, buttons and messages immediately, sets `<html lang>`, and is saved in `localStorage.uiLang`. Without a saved choice it starts from the old `cvLang` value, else Vietnamese. It does not change the CV language.
6. CV file name: optional text, trimmed, max 100 characters, must not contain `\`, `/`, `"` or line breaks; no `.pdf` needed; empty = default name. Saved with `PATCH api/v1/candidate/update` (`cvFileName`); the store takes the server value. How the name is used: see `cv-preview-export.md`.
7. CV language: the same shared CV-language setting as Preview, Home and Header (`localStorage.cvLang`); see `cv-preview-export.md`.
8. *(#460 — draft, not yet implemented; replaces the "coming soon" parts of 2 and 3)* Backend contract: datvt243/resume-nodejs-api#412, PR #497, released v2.11.0 (backend doc `agent-hub/doctrine/features/account-settings.md` there, rules 1–11). Both calls need the Bearer token, share the auth rate limit (10 / 15 min / IP → 429), and a wrong current password is **400** `auth.currentPasswordInvalid` (deliberately not 401, so the app must not log out).
9. *(#460)* Change password. The "Change password" button is enabled; it reveals an inline form inside the Password section (hidden until the button is pressed; Cancel hides it again and clears it) with Current password (required), New password and Confirm new password. New password uses exactly the Register rules (`PageRegister.vue`: required, min 12, lower, upper, digit, special — same `validation.*` keys, `auth.passwordHint`); Confirm must equal it (`validation.passwordMismatch`). Invalid → field errors, no request. Submit → `POST api/v1/auth/change-password` `{ currentPassword, password, repassword }`.
   - 200: the response `data: { token, tokenRefresh }` is stored with `authStore().setTokens(...)` BEFORE any other request (the backend revoked every older token, including this tab's), so the user stays signed in here; success toast with the API message ("other devices have been logged out"); the form closes and its fields are cleared.
   - 400 (wrong current password, new = current, validation) / 429: red toast with the API message; the user stays signed in and on the page; the typed values stay.
10. *(#460)* Change email. The "Change email" button is enabled; it reveals an inline form inside the Email section (hidden until pressed; Cancel hides and clears it) with New email (required, valid email; same rule as Register's email field) and Current password (required). Submit → `POST api/v1/auth/change-email` `{ currentPassword, email }`.
   - 200: success toast with the API message ("a confirmation link has been sent to the new email"); the form closes; the shown email does NOT change (the backend changes it only after the link is opened).
   - 400 (wrong password, same as current email, invalid) / 409 `EMAIL_EXISTS` / 429: red toast with the API message; nothing else changes.
11. *(#460)* Confirm page. A new public route `/confirm-email-change` (no `requiresAuth`; in `src/routers/index.ts` beside `/reset-password`) reads `token` from the query (a repeated `?token=` = no token, as `PageResetPassword.vue`). Without a token it shows the invalid-link text and a "Back to login" link, no request. With a token it sends `GET api/v1/auth/confirm-email-change?token=<t>` once on open (spinner while running):
   - 200, tab signed in (`authStore().isAuthenticated`): sign out (`logOut`, which clears `localStorage.user` for every tab) and go to `/login` with a success toast "sign in with your new email" (new i18n key, vi + en).
   - 200, not signed in: success text (API message) and a "Go to login" link.
   - No redirect for signed-in users (unlike `/reset-password`, #430): the page works signed in or out.
   - 400 (invalid/expired/used, or cancelled by a later password change / logout-all) / 409 (address taken meanwhile): error text (API message) and a "Back to login" link.
   - All texts vi + en via i18n.

## Acceptance criteria
- `npx vitest run src/i18n/index.spec.ts` passes.
- Switching App language to English changes the page's labels to English and `document.documentElement.lang` to `en`, while the CV language stays as it was.
- CV file name `a/b` shows the invalid-characters error and sends no request.
- *(#431)* In the Delete account dialog, inputs `''`, `delet`, `Delete` and `delete ` are rejected (validation message, dialog stays open, no request); `delete` is accepted and sends exactly one `DELETE api/v1/candidate`; Cancel sends none. Covered by a spec (new `src/pages/dashboard/PageAccountSettings.spec.ts` and/or the shared confirm's spec), passing with `npx vitest run <that path>`.
- After a successful account delete, the app is on `#/login` and `localStorage.user` is gone.
- *(#460)* `npx vitest run src/pages/dashboard/PageAccountSettings.spec.ts` passes with new cases: change-password submit sends exactly `{ method: 'post', url: 'auth/change-password', data: { currentPassword, password, repassword } }`; on a mocked 200 `setTokens` is called with the returned `{ token, tokenRefresh }`; on a mocked 400 `logOut` is not called. Change-email submit sends `{ method: 'post', url: 'auth/change-email', data: { currentPassword, email } }` and the shown email is unchanged after a 200.
- *(#460)* New password `Abcdefghij1!` (12 chars, all classes) is accepted by the form; `Abcdefghi1!` (11) shows `validation.passwordMin`; mismatching confirm shows `validation.passwordMismatch`; none of the invalid ones sends a request.
- *(#460)* Live (QA account, never the owner's): after changing the password in tab A, tab A keeps working after a reload of a dashboard page; a second browser signed in before the change is logged out on its next request; login with the old password fails.
- *(#460)* `#/confirm-email-change` without a token shows the invalid-link text and sends no request; with a used token shows the API's 400 message.
- *(#460)* Confirm page spec (e.g. `src/pages/auth/PageConfirmEmailChange.spec.ts`, `npx vitest run <path>`): mocked 200 while signed in → `logOut` called and router pushed to `/login`; mocked 200 signed out → success text and a link to `/login`, `logOut` not called; exactly one confirm request per page open.
- *(#460)* `npm run build` passes; every new key exists in both `vi` and `en`.

## Edge cases
- Candidate id missing → file-name save returns without a request or message.
- Hard reload on this page → the file-name field fills once the candidate loads.
- *(#460)* Change-password request whose 200 arrives but `data` lacks tokens → treat as failure? Not expected from the backend (rule 7 always returns both); implementer keeps the existing tokens and shows the toast — no logout.
- *(#460)* The email link is `<APP_URL>/confirm-email-change?token=…`; with hash routing it only reaches the page if the API's `APP_URL` ends with `/#` (same requirement the reset-password link already has). Deployment config, not code — checked on the live link before sealing.
- *(#460)* After the email changes, any tab whose stored `localStorage.user.email` is the old address fetches `candidate/<old email>` on reload (`src/App.vue:38-39`), which no longer resolves (backend rule 11). The confirming tab clears it (Behavior 11); a tab that was already open keeps its in-memory user until its next login — accepted, the operator chose sign-out on confirm only.

## Out of scope
- Asking for the password on account delete (#431 chose typed `delete`).
- Cancelling a pending email change, resending the confirmation, a "pending change" indicator (the backend has no endpoint for any of these).
- An email-verification page for `/verify-email` (separate feature).
- Notification or privacy settings.

## Open questions
1. Deleting the account uses the normal confirm dialog, while deleting a single skill requires typing `delete`. Should account deletion require typing (or the password)? → **Answer (operator 2026-11-07):** Change: require typing `delete` — #431
2. App language is only switchable here; signed-out pages (login/register) have no language switch. Intended? → **Answer (operator 2026-11-07):** Intended
3. Email and password "coming soon" buttons — is there a backend issue to link, so they are not forgotten? → **Answer (operator 2026-11-07):** Change: backend issue datvt243/resume-nodejs-api#412
4. *(#460)* Where do the two forms appear: inline in their section (button reveals a VeeForm with Cancel, like the CV-file-name form) or in a modal? → **Answer (operator 2026-11-23):** inline on Account settings, hidden until the button is pressed.
5. *(#460)* After a successful confirm, what happens to the session? Sessions stay valid server-side, but stored `user.email` is now stale and breaks the reload fetch. → **Answer (operator 2026-11-23):** signed in → sign out and go to `/login` with "sign in with your new email"; not signed in → success + "Go to login".
6. *(#460)* Should a signed-in user opening the confirm link be redirected away like `/reset-password` (#430)? → **Answer (operator 2026-11-23):** no redirect; works signed in or out.

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/account-settings-spec.md` | - |
| 2026-11-20 | Behavior (draft): typed `delete` confirm on account delete | #431 / umbrella #489 | - |
| 2026-11-23 | Behavior 8–11 (draft): change password, change email, confirm page; contract from backend #412 / PR #497 | #460 | - |
| 2026-11-23 | Operator answered Q4–Q6; Behavior 9–11 updated | #460 round 2 | - |
