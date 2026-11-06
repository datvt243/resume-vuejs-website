# General information (job preferences)

- Status: draft
- Source: backfill from code
- Issues: -
- Anchors: `src/pages/dashboard/PageGeneralInformation.vue`, `src/models/generalInformation.model.ts`, `src/composables/useCandidate.ts`, `src/composables/useDocument.ts`, `src/services/base.ts`

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

## Acceptance criteria
- `npx vitest run src/components/veevalidate/VeeForm.spec.ts` passes (shared form engine).
- `npx vitest run src/composables/useDocument.spec.ts src/composables/useCandidate.spec.ts` passes (create vs update, caching).
- Years of experience `-1` shows the "min 0" error; salary `0` shows the "positive" error; neither sends a request.
- A first save for a new account sends `POST api/v1/general-information/create`; the next save sends `PUT .../update`.

## Edge cases
- Load fails → the form area shows the error + retry block (LoadingGate), not an empty form.
- API returns an array → the first item is used.

## Out of scope
- Showing desired level, desired salary or "open to work" on the CV (the layout shows career, current level, education level, years of experience, employment type, work location, career goal).

## Open questions
1. Desired salary is required (and must be positive), so a candidate cannot save without stating a salary. Intended?
2. "Remote" is listed as an employment type alongside Full-time/Part-time, though it is a work arrangement. Intended?
3. ~~Career has no English input~~ — withdrawn by review 2026-11-06: `generalInformation.model.ts:30` wraps `career` in `withEnglish`, so the form has an optional English input (`careerEn`) and saves send what it holds.

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
