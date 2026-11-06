# Account settings and app language

- Status: draft
- Source: backfill from code
- Issues: #63, #182
- Anchors: `src/pages/dashboard/PageAccountSettings.vue`, `src/i18n/index.ts` (`uiLang`, `setUiLang`), `src/composables/useCvLang.ts`, `src/composables/useDownloadCv.ts`, `src/stores/auth.ts`

## Goal
The candidate manages account-level settings: interface language, CV file name and CV language, and can delete their account.

## Behavior
1. `/dashboard/account-settings` sections, top to bottom: Email, Password, Delete account, App language, CV file name, CV language.
2. Email: shows the signed-in email (or "—"). "Change email" is disabled, marked "coming soon".
3. Password: "Change password" is disabled, marked "coming soon" (no backend endpoint for a signed-in user yet).
4. Delete account (danger section, "cannot be undone"): confirm dialog warning that all CV data and uploaded files are deleted permanently → `DELETE api/v1/candidate` → on success, sign out and go to `/login`. Failure → red toast.
5. App language: Tiếng Việt / English. Changes menus, buttons and messages immediately, sets `<html lang>`, and is saved in `localStorage.uiLang`. Without a saved choice it starts from the old `cvLang` value, else Vietnamese. It does not change the CV language.
6. CV file name: optional text, trimmed, max 100 characters, must not contain `\`, `/`, `"` or line breaks; no `.pdf` needed; empty = default name. Saved with `PATCH api/v1/candidate/update` (`cvFileName`); the store takes the server value. How the name is used: see `cv-preview-export.md`.
7. CV language: the same shared CV-language setting as Preview, Home and Header (`localStorage.cvLang`); see `cv-preview-export.md`.

## Acceptance criteria
- `npx vitest run src/i18n/index.spec.ts` passes.
- Switching App language to English changes the page's labels to English and `document.documentElement.lang` to `en`, while the CV language stays as it was.
- CV file name `a/b` shows the invalid-characters error and sends no request.
- After a successful account delete, the app is on `#/login` and `localStorage.user` is gone.

## Edge cases
- Candidate id missing → file-name save returns without a request or message.
- Hard reload on this page → the file-name field fills once the candidate loads.

## Out of scope
- Changing email or password while signed in (blocked on backend).
- Notification or privacy settings.

## Open questions
1. Deleting the account uses the normal confirm dialog, while deleting a single skill requires typing `delete`. Should account deletion require typing (or the password)?
2. App language is only switchable here; signed-out pages (login/register) have no language switch. Intended?
3. Email and password "coming soon" buttons — is there a backend issue to link, so they are not forgotten?

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
