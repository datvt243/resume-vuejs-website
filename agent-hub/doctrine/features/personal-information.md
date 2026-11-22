# Personal information, social links, public link + QR

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/personal-information-spec.md`
- Source: backfill from code
- Issues: #63, #116, #117, #119, #182, #432, #433, #434, #436
- Anchors: `src/pages/dashboard/PageInformation.vue`, `src/models/information.model.ts`, `src/components/QrCode.vue`, `src/composables/useDocument.ts`, `src/composables/useActiveProfile.ts`

## Goal
The candidate fills in the personal details shown at the top of their CV, their social links, and chooses and shares the public link to their CV.

## Behavior
1. `/dashboard/information` shows five blocks: Avatar, Personal information, Social links, Public link (slug), Share.
2. Avatar: shows the `avatar` image if the candidate has one, else initials (`U` if no name). "Choose image" is disabled and marked "coming soon"; no avatar is ever sent to the API.
3. Personal information form, seeded from the candidate store (and re-seeded when the candidate finishes loading after a hard reload): family name (required, max 15), given name (required, max 35), gender (Female/Male, required), marital status (Single/Married, required), birthday (required), address (required, max 255), phone (required), introduction in Vietnamese and English (rich text). Has Save and Cancel. Gender/marital selects show the saved value: the store's `getCandidate` maps the stored booleans to `1`/`0` (#432).
4. Saving personal information: gender and marital are sent as booleans, birthday as a timestamp (ms), the introduction as `{ vi, en }`; sent through `updateDoc` (PUT `candidate/update`). On success the candidate store is updated with the response. If the candidate id is missing, only a red generic-error toast shows and no request is sent (#433).
5. Social links form: GitHub, LinkedIn, Website. Save sends a PATCH with `socialMedia` = stored links merged with the edited ones, dropping empty values (clearing a field removes that link).
5a. (#434) Each social link field is optional, but when filled it must be an absolute URL whose scheme is `http` or `https` (e.g. `https://github.com/a`). Any other value (no scheme like `github.com/a`, another scheme like `ftp://a.com` or `javascript:…`, plain text) shows the field error "Link không đúng định dạng" / "Invalid link format" (existing key `validation.urlInvalid`) under that field, and Save sends no request. Note for the implementer: yup's `.url()` alone also accepts `ftp://`, so the http(s) scheme needs its own check.
6. Public link form: one `slug` field, trimmed and lowercased; allowed: lowercase letters, digits and single hyphens between them, 3–50 characters; empty allowed. Save sends a PATCH with `slug`; on success the shown slug and the store take the server's value.
7. Share block: a CV profile select (only if profiles exist; shared with Preview), the full public link as text, and a QR code of that link with PNG/SVG download (`qr-code.png` / `qr-code.svg`).
7a. (#436) Next to the shown public link there is a secondary button "Sao chép link" / "Copy link" (no action color: copy is not in DESIGN.md §5.3's action table). It appears only when the link is shown (same condition as the link text). Clicking it writes the exact shown link (including any `?theme=`, `?profile=`, `?lang=`) to the clipboard with the Clipboard API (`navigator.clipboard.writeText`) and shows a success toast "Đã sao chép link" / "Link copied". No API request is sent.
7b. (#436) If copying is not possible — `navigator.clipboard` is missing (non-secure context, old browser) or `writeText` rejects (permission denied, document not focused) — a danger toast says "Không sao chép được link. Hãy chọn link và sao chép thủ công." / "Couldn't copy the link. Select it and copy it manually." (DESIGN.md §7: say what happened and what to do next). Nothing throws to the console as an uncaught error, and the link text stays selectable.
8. Public link = `<origin><BASE_URL>#/resume/<slug or email>` plus `?theme=` (if not Classic), `?profile=<id>` (if a profile is chosen and still exists), `?lang=en` (if CV language is English). No link and no QR when neither slug nor email exists.

## Acceptance criteria
- `npx vitest run src/models/information.model.spec.ts` passes (field rules, `socialMediaPayload`).
- `npx vitest run src/components/QrCode.spec.ts` passes.
- Slug `Ab` shows the length error; `my--cv` shows the format error; neither sends a request.
- With slug `dat-vo`, theme Modern and CV language English, the shown link ends with `#/resume/dat-vo?theme=modern&lang=en`.
- Clearing the LinkedIn field and saving removes `linkedin` from the candidate's `socialMedia`.
- (#434) `npx vitest run src/models/information.model.spec.ts` covers the social link rule: empty → valid; `https://github.com/a` and `http://a.dev` → valid; `github.com/a`, `ftp://a.com`, `javascript:alert(1)`, `abc` → invalid with message key `validation.urlInvalid`.
- (#436) On `/dashboard/information` with a slug set, clicking "Copy link" shows the toast "Link copied" (EN) / "Đã sao chép link" (VI), and `await navigator.clipboard.readText()` in the page returns exactly the shown link text.
- (#436) With `navigator.clipboard.writeText` stubbed to reject (or `navigator.clipboard` undefined), clicking "Copy link" shows the danger toast "Couldn't copy the link. Select it and copy it manually." and no uncaught error appears in the console.
- (#436) New i18n keys exist in both `vi` and `en` in `src/i18n/index.ts` (button label, success toast, failure toast); `npm run build` is green.
- (#434) On `/dashboard/information`, typing `github.com/a` in GitHub and pressing Save shows "Invalid link format" (EN) / "Link không đúng định dạng" (VI) under GitHub, and no PATCH `candidate/…` request appears in the network log.

## Edge cases
- No slug → link uses the email.
- Stored active profile deleted → no `?profile=`.
- Hard reload directly on this page → forms fill once the candidate loads.
- (#434) A link already stored in a non-http(s) form (saved before this rule) fails validation when the form is submitted, so the candidate must fix or clear it before any social link save goes through.
- (#436) No slug and no email → no link, so no Copy button.
- (#436) Changing the CV profile, theme or CV language changes the shown link; Copy always copies the link as shown at click time.
- (#434) Clearing a field is always valid (optional) and still removes that link.

## Out of scope
- Avatar upload (backend has no field/endpoint; Joi rejects unknown keys).
- Changing the email (see `account-settings.md`).
- Rendering the public page (see `public-resume.md`).
- (#436) A copy fallback via `document.execCommand('copy')` or a hidden textarea — the issue says Clipboard API; on failure the user copies by hand.
- (#434) Checking the host matches the field (e.g. GitHub must be `github.com`), checking the link is reachable, or a max length on social links — the issue asks only for the http(s) scheme.

## Open questions
1. Gender/marital are sent as `!!value`. Code check (review 2026-11-06): `FrmSelect` passes the change event to vee-validate, which returns the option's bound value (`getBoundValue`, number `0`/`1`), so a picked Female/Single saves as `false` correctly. Open part: the store holds booleans (`gender: true/false`) but the select options are `0`/`1`, so a seeded boolean matches no option. Does the select show "please select" when editing an existing profile? (Not checked live: needs a signed-in session.) → **Answer (operator 2026-11-07):** Bug: verify signed-in and make the select show the saved value — #432
2. When the candidate id is missing, a red "generic error" toast shows but the request is still sent, and since `updateDoc` has no `_id` it goes out as `POST candidate/create`, not `PUT candidate/update` (`useDocument.ts` `updateDoc`). Should it stop? → **Answer (operator 2026-11-07):** Bug: toast only, no request — #433
3. Social link fields have no URL validation. Intended? → **Answer (operator 2026-11-07):** Change: validate http(s) when filled — #434
4. Birthday: if empty, `+new Date('')` is `NaN`. Is birthday required (and does `defaultDate` enforce it)? → **Answer (operator 2026-11-07):** Intended. Birthday is required (enforced by `defaultDate`), so an empty birthday never reaches the API and NaN isn't sent. #435 closed as not planned.
5. The link is shown as text only — there is no "copy" button. Intended? → **Answer (operator 2026-11-07):** Change: add "Copy" — #436
6. Slug uniqueness is checked only by the backend; the error shown is whatever the backend returns. Fine? → **Answer (operator 2026-11-07):** Intended

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
| 2026-11-21 | Behavior 3: selects show the saved gender/marital (#432, already true — verified live, no code change); Behavior 4: missing id → toast only, no request (#433) | operator answers to open questions 1–2 | `issue-432-433-personal-info-select` |
| 2026-11-22 | Behavior 7a–7b: "Copy link" button for the public link, success + failure toasts (#436) | operator answer to open question 5 | `issue-434-436-social-links-copy` |
| 2026-11-22 | Behavior 5a: social links validated as http(s) URLs when filled (#434) | operator answer to open question 3 | `issue-434-436-social-links-copy` |
| 2026-11-07 | Behavior 3 corrected: birthday and phone marked required, as the code does (`src/models/information.model.ts:57,68`); operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/personal-information-spec.md` | - |
