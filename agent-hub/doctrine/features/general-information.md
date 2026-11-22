# General information (job preferences)

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/general-information-spec.md`
- Source: backfill from code
- Issues: #403, datvt243/resume-nodejs-api#362
- Anchors: `src/pages/dashboard/PageGeneralInformation.vue`, `src/models/generalInformation.model.ts`, `src/composables/useCandidate.ts`, `src/composables/useDocument.ts`, `src/services/base.ts`, `src/components/veevalidate/part/FrmCurrency.vue`, `src/composables/useProfileCompletion.ts`, `src/i18n/index.ts`, `src/pages/home/PageHome.vue`

## Goal
The candidate states what job they want and their current level, shown in the CV's "General information" section and the Home profile strip.

## Behavior
1. `/dashboard/general-information` loads `GET api/v1/general-information/` once per session (cached in the candidate store) and fills one form. A reload button in the heading re-fetches.
2. Fields and rules:
   - Open to work (checkbox).
   - Desired position (required, max 100, trimmed).
   - Career, Vietnamese (required) and English (optional) text inputs (`withEnglish` → `career` + `careerEn`); stored as `{ vi, en }`.
   - Current level and desired level (required selects: Intern, Staff, Team leader, Manager, Vice director, Director, CEO).
   - Education level (required select: High school, Associate, Bachelor, Master, Doctorate).
   - Years of experience (required integer ≥ 0).
   - Desired salary (required positive integer, currency input).
   - Employment type (required select: Full-time, Part-time, Temporary, Internship, Freelance, Contract, Remote, Consultant).
   - Work location (required, 3–100 characters).
   - Career goal, Vietnamese and English (rich text, optional).
3. Save sends `career` and `careerGoal` as `{ vi, en }`. No `_id` → `POST general-information/create`; with `_id` → `PUT general-information/update`. Success → green toast with the API message, and the store's `generalInformation` becomes `[<response>]`. Failure → red toast with the API's reason.
4. Cancel resets the form.
5. *(#403 — draft)* Desired salary becomes a from–to range. Backend contract (datvt243/resume-nodejs-api PR #367, released v2.6.0; prod API is past it, tags up to v2.11.0):
   - Document fields `salaryDesiredFrom` and `salaryDesiredTo`, each `Number ≥ 0` or `null` (default `null`). GET always returns both (possibly `null`); it no longer returns a usable `salaryDesired`.
   - Joi: both ends optional; `salaryDesiredTo ≥ salaryDesiredFrom` checked only when From is a number. Failures → `400 VALIDATION_ERROR` with `error.details: [{ field: 'salaryDesiredFrom' | 'salaryDesiredTo', message }]` (`To < From` → field `salaryDesiredTo`).
   - Legacy: a stored document with only `salaryDesired` is read back as From = To = that value (no DB migration). A request still carrying `salaryDesired` is mapped to From = To only when NEITHER range key is in the body; it is always stripped.
   - No backend PDF / DOCX / ATS output prints salary (backend plan note `salary-desired-range-plan.md`).
   Frontend:
   a. The single "Desired salary" currency input is replaced by two currency inputs, "From" and "To" (`salaryDesiredFrom`, `salaryDesiredTo`), labels via new `field.*` keys in `vi` and `en`.
   b. The form loads both ends from the API as-is (legacy docs arrive as From = To, so they show the same value in both inputs).
   c. Both From and To are required (Open question 4); each must be a positive integer (existing `validation.required` / `validation.salaryPositive` rules, per end). When To < From, the error (new `validation.*` key, vi + en) shows under "To" and no request is sent. To = From is valid.
   d. Save sends both `salaryDesiredFrom` and `salaryDesiredTo` as numbers and no `salaryDesired` key. (Both keys always present: if they were omitted and a stale `salaryDesired` rode along, the backend would resurrect it as From = To.)
   e. A save rejected with `400 VALIDATION_ERROR` whose `error.details` all name `salaryDesiredFrom`/`salaryDesiredTo` shows each message under that field and no toast (same pattern as `experienceErrorOf` in `src/pages/dashboard/PageProject.vue`); any other error keeps the existing toast.
   f. Read-only display: dashboard only (Open question 5) — one line in the Home profile strip (`src/pages/home/PageHome.vue`), under the desired position. Chosen over the form page because the form already shows the stored range in its two inputs; the Home strip is the only read-only dashboard spot that shows job preferences (desired position, open-to-work) and already has `numberFormat` (`Intl.NumberFormat(uiLocale)`). CV layout, Preview, public page, PDF and JSON Resume: unchanged.
   g. Display format (numbers via `Intl.NumberFormat` of the app language: vi `1.000`, en `1,000`; no currency unit, as in the issue): From and To both set and different → "<From> – <To>"; From = To (every legacy record, and a new entry with equal ends) → the single number "<From>" (Open question 6); From only → "From <From>" (vi "Từ <From>"); To only → "To <To>" (vi "Đến <To>") — these two only arise for data saved by another client or before the range, since the form requires both; neither → no salary line. Labels via new i18n keys (vi + en) with `{value}` interpolation.

## Acceptance criteria
- (#403) `npx vitest run src/models/generalInformation.model.spec.ts` (new) covers: the model has `salaryDesiredFrom` and `salaryDesiredTo` of type `currency` and no `salaryDesired`; the form's yup object (built as `VeeForm` does: `yup.object({ [name]: valid(yup) })`) rejects `{ salaryDesiredFrom: 2000, salaryDesiredTo: 1000 }` with an error on path `salaryDesiredTo` and the new key, accepts `{ 1000, 2000 }` and `{ 1000, 1000 }`, rejects `0` or a negative on either end with `validation.salaryPositive`; rejects an empty From or empty To with `validation.required`.
- (#403) A spec for `PageGeneralInformation.vue` (or `useDocument`-level) covers: submitting From 1000 / To 2000 calls `updateDoc` with `salaryDesiredFrom: 1000, salaryDesiredTo: 2000` and no `salaryDesired`; a rejection `{ error: { code: 'VALIDATION_ERROR', details: [{ field: 'salaryDesiredTo', message: 'Y' }] } }` puts "Y" under the To field and calls no toast; any other error still toasts.
- (#403) A display spec (helper or `PageHome.vue` mount) covers: `(1000, 2000, 'vi')` → `1.000 – 2.000`; `(1500, 1500, 'vi')` → `1.500`; `(1000, null, 'vi')` → `Từ 1.000`; `(null, 2000, 'en')` → `To 2,000`; `(null, null)` → no salary line in the Home profile strip.
- (#403) `src/composables/useProfileCompletion.spec.ts` fixture uses the range fields and still passes; the general-information section is incomplete when either `salaryDesiredFrom` or `salaryDesiredTo` is `null`, complete when both (and the other required fields) are set.
- (#403) Manual (QA account `qa.full@example.com`, `/dashboard/general-information`): type From 2000, To 1000 → error under "To", no network request; From 1000, To 2000 → save → `PUT api/v1/general-information/update` body has `salaryDesiredFrom: 1000, salaryDesiredTo: 2000`; reload → both inputs show those values. An account whose data predates the range (single legacy value) shows that value in both inputs. Home (`/`) profile strip shows `1.000 – 2.000` under the position (vi UI), `1,000 – 2,000` (en UI); with equal ends it shows one number.
- (#403) `git diff --stat` touches none of `src/components/cv/CvResumeLayout.vue`, `src/pages/dashboard/PagePreview.vue`, `src/pages/public/PagePublicResume.vue`, `src/utilities/jsonResume.ts`.
- (#403) Every new key exists in both `vi` and `en` of `src/i18n/index.ts`; `npm run lint`, `npm run build`, `npm run test` pass; `npm run typecheck` ≤ 78 errors and none in changed files.
- `npx vitest run src/components/veevalidate/VeeForm.spec.ts` passes (shared form engine).
- `npx vitest run src/composables/useDocument.spec.ts src/composables/useCandidate.spec.ts` passes (create vs update, caching).
- Years of experience `-1` shows the "min 0" error; salary `0` shows the "positive" error; neither sends a request.
- A first save for a new account sends `POST api/v1/general-information/create`; the next save sends `PUT .../update`.

## Edge cases
- Load fails → the form area shows the error + retry block (LoadingGate), not an empty form.
- API returns an array → the first item is used.
- (#403) Clearing a currency input must yield "no value" (`''` in the form → the `required` error), not `0` — today `FrmCurrency.vue` `_handleChange` does `handleChange(+number)`, which turns an empty input into `0` (then `positive` fails, and a cleared To of `0` would read as "To < From").
- (#403) Legacy document → backend returns From = To; the form shows the same value in both inputs, Home shows a single number; saving unchanged sends From = To (no data loss).
- (#403) API returns From and To both `null` (never set) → both inputs empty, saving blocked by `required`; Home shows no salary line; completion counts the section incomplete.
- (#403) API returns only one end (saved by another client) → the form shows it, the other input is empty and required on save; Home shows "From X" / "To Y".
- (#403) Changing From after To was validated: the `To ≥ From` error re-checks at the latest on submit; no request goes out while it holds.

## Out of scope
- Showing desired level, desired salary or "open to work" on the CV (the layout shows career, current level, education level, years of experience, employment type, work location, career goal). Re-confirmed for #403 (Open question 5): salary is shown on the dashboard (Home profile strip) only.
- (#403) Backend-rendered PDF / DOCX / ATS output (they print no salary; changing that is a backend issue). JSON Resume import/export of salary (schema has no salary field; not asked). Currency choice / unit selector (not asked; the input keeps its `VND` prefix).

## Open questions
1. Desired salary is required (and must be positive), so a candidate cannot save without stating a salary. Intended? → **Answer (operator 2026-11-07):** Intended (keep required)
2. "Remote" is listed as an employment type alongside Full-time/Part-time, though it is a work arrangement. Intended? → **Answer (operator 2026-11-07):** Intended (backend enum)
3. ~~Career has no English input~~ — withdrawn by review 2026-11-06: `generalInformation.model.ts:30` wraps `career` in `withEnglish`, so the form has an optional English input (`careerEn`) and saves send what it holds. → **Withdrawn — no answer needed.**

4. (#403) Required rule for the range. The old single salary was required (Q1 answer), but the backend now accepts both ends empty. Which: (a) both From and To required; (b) at least one end required (either alone is fine); (c) both optional (salary may be left blank)? → **Answer (operator 2026-11-21):** (a) Both From and To required.
5. (#403) Where is the range shown read-only? Today salary is shown NOWHERE except the form input, and this doc's Out of scope (operator-confirmed 2026-11-07) says salary is deliberately not on the CV. The issue says "trang thông tin / preview / CV". Note the CV layout (`CvResumeLayout.vue`) is also the public share-link page, so a salary there is visible to anyone with the link; the downloaded PDF is backend-rendered and would still not show it. Options: (a) add a salary line to the CV layout (Preview + public page), PDF unchanged; (b) only on the dashboard (form page / Home profile strip), CV unchanged; (c) nowhere read-only — only the two inputs (acceptance "hiển thị" = the form shows the stored range)? → **Answer (operator 2026-11-21):** (b) Dashboard only (form page or Home profile strip), CV unchanged. Analyst picked the Home profile strip (reason in Behavior #5f).
6. (#403) Every legacy document reads as From = To. Display: (a) a single number "1.500"; (b) "1.500 – 1.500"? → **Answer (operator 2026-11-21):** (a) Single number "1.500" — also for a new entry with equal ends.

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/general-information-spec.md` | - |
| 2026-11-21 | Behavior #5 (draft): desired salary from–to range, backend contract from resume-nodejs-api PR #367; open questions 4–6 | #403 | - |
| 2026-11-21 | Open questions 4–6 answered by operator; Behavior #5 completed (both ends required, Home profile strip display, From = To → one number) | #403 | - |
