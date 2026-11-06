# Personal information, social links, public link + QR

- Status: draft
- Source: backfill from code
- Issues: #63, #116, #117, #119, #182
- Anchors: `src/pages/dashboard/PageInformation.vue`, `src/models/information.model.ts`, `src/components/QrCode.vue`, `src/composables/useDocument.ts`, `src/composables/useActiveProfile.ts`

## Goal
The candidate fills in the personal details shown at the top of their CV, their social links, and chooses and shares the public link to their CV.

## Behavior
1. `/dashboard/information` shows five blocks: Avatar, Personal information, Social links, Public link (slug), Share.
2. Avatar: shows the `avatar` image if the candidate has one, else initials (`U` if no name). "Choose image" is disabled and marked "coming soon"; no avatar is ever sent to the API.
3. Personal information form, seeded from the candidate store (and re-seeded when the candidate finishes loading after a hard reload): family name (required, max 15), given name (required, max 35), gender (Female/Male, required), marital status (Single/Married, required), birthday, address (required, max 255), phone, introduction in Vietnamese and English (rich text). Has Save and Cancel.
4. Saving personal information: gender and marital are sent as booleans, birthday as a timestamp (ms), the introduction as `{ vi, en }`; sent through `updateDoc` (PUT `candidate/update`). On success the candidate store is updated with the response.
5. Social links form: GitHub, LinkedIn, Website (free text). Save sends a PATCH with `socialMedia` = stored links merged with the edited ones, dropping empty values (clearing a field removes that link).
6. Public link form: one `slug` field, trimmed and lowercased; allowed: lowercase letters, digits and single hyphens between them, 3–50 characters; empty allowed. Save sends a PATCH with `slug`; on success the shown slug and the store take the server's value.
7. Share block: a CV profile select (only if profiles exist; shared with Preview), the full public link as text, and a QR code of that link with PNG/SVG download (`qr-code.png` / `qr-code.svg`).
8. Public link = `<origin><BASE_URL>#/resume/<slug or email>` plus `?theme=` (if not Classic), `?profile=<id>` (if a profile is chosen and still exists), `?lang=en` (if CV language is English). No link and no QR when neither slug nor email exists.

## Acceptance criteria
- `npx vitest run src/models/information.model.spec.ts` passes (field rules, `socialMediaPayload`).
- `npx vitest run src/components/QrCode.spec.ts` passes.
- Slug `Ab` shows the length error; `my--cv` shows the format error; neither sends a request.
- With slug `dat-vo`, theme Modern and CV language English, the shown link ends with `#/resume/dat-vo?theme=modern&lang=en`.
- Clearing the LinkedIn field and saving removes `linkedin` from the candidate's `socialMedia`.

## Edge cases
- No slug → link uses the email.
- Stored active profile deleted → no `?profile=`.
- Hard reload directly on this page → forms fill once the candidate loads.

## Out of scope
- Avatar upload (backend has no field/endpoint; Joi rejects unknown keys).
- Changing the email (see `account-settings.md`).
- Rendering the public page (see `public-resume.md`).

## Open questions
1. Gender/marital are sent as `!!value`. Code check (review 2026-11-06): `FrmSelect` passes the change event to vee-validate, which returns the option's bound value (`getBoundValue`, number `0`/`1`), so a picked Female/Single saves as `false` correctly. Open part: the store holds booleans (`gender: true/false`) but the select options are `0`/`1`, so a seeded boolean matches no option. Does the select show "please select" when editing an existing profile? (Not checked live: needs a signed-in session.)
2. When the candidate id is missing, a red "generic error" toast shows but the request is still sent, and since `updateDoc` has no `_id` it goes out as `POST candidate/create`, not `PUT candidate/update` (`useDocument.ts` `updateDoc`). Should it stop?
3. Social link fields have no URL validation. Intended?
4. Birthday: if empty, `+new Date('')` is `NaN`. Is birthday required (and does `defaultDate` enforce it)?
5. The link is shown as text only — there is no "copy" button. Intended?
6. Slug uniqueness is checked only by the backend; the error shown is whatever the backend returns. Fine?

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
