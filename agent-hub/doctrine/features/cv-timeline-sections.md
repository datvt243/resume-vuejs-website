# Timeline sections: Experience, Education, Project

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-timeline-sections-spec.md`
- Source: backfill from code
- Issues: #57, #60, #402, #442, #443, #444, #445, #446, datvt243/resume-nodejs-api#413, datvt243/resume-nodejs-api#414
- Anchors: `src/pages/dashboard/PageExperience.vue`, `src/pages/dashboard/PageEducation.vue`, `src/pages/dashboard/PageProject.vue`, `src/components/experience/ExperienceItem.vue`, `src/components/education/EducationItem.vue`, `src/components/project/ProjectItem.vue`, `src/models/experience.model.ts`, `src/models/education.model.ts`, `src/models/project.model.ts`, `src/composables/useManualOrder.ts`, `src/composables/useCandidate.ts`, `src/composables/useDocument.ts`, `src/lib/swal.lib.js`

## Goal
The candidate keeps a dated list of jobs (and career breaks), schools and projects for their CV, and can put them in the order they want.

## Behavior
Shared by all three pages (`/dashboard/experience`, `/dashboard/education`, `/dashboard/project`):
1. The list loads once per session from `GET api/v1/<collection>/` (cached in the candidate store), sorted by start date, newest first. Empty → empty state with "Add"; load failure → error + retry.
2. "Add" (heading and empty state) opens a modal form. Save: no `_id` → `POST <collection>/create`, else `PUT <collection>/update`. Dates are sent as timestamps (ms); the "current" checkbox is sent as `false` when unchecked; the description is sent as `{ vi, en }`. On success the entry is added/replaced in the list and the modal closes; the API message shows as a toast.
3. Each entry has Edit (modal pre-filled), Duplicate (modal pre-filled, title "Duplicate …", saving creates a NEW entry and leaves the original), and Delete (confirm dialog naming the entry, then `DELETE <collection>/delete/<id>`).
4. Drag-and-drop reorder (a hint "drag to sort" above the list). The order is saved only in this browser: `localStorage['cv-manual-order:<collection>:<candidateId>']`. Entries not in the saved order (new ones) go to the end.

Per section:
5. Experience: "Add" first asks "Experience or career break?". Experience fields: company (required, max 100), position (required), start date (required), end date, "currently working" checkbox, description (Vietnamese required, English optional — `withEnglish`, `src/types/model.type.ts:106`). Career break: break type (required, one of 12 LinkedIn types: career transition, caregiving, full-time parenting, gap year, health, layoff, personal goal, professional development, relocation, retirement, travel, voluntary work), dates, "currently on break", description. Saving a break clears company/position; saving a job clears the break type. A break's title is "Career break — <type>". Experience also has a read-only "View" modal (dates `MM/YYYY - MM/YYYY` or "Present", sanitized description) with an Edit button.
6. Education: school (Vietnamese required, max 255), major (Vietnamese required, 3–255); the English variants are optional but, when filled, follow the same max/min rules, start/end dates, "currently studying", description vi/en (optional).
7. Project: name (required, max 50), position (required, max 100), technology (required; typed comma-separated, stored as a trimmed array, shown joined by ", "), start/end dates, "still working on it", link, description vi/en.

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageExperience.spec.ts` passes.
- `npx vitest run src/composables/useManualOrder.spec.ts src/composables/useCandidate.spec.ts src/composables/useDocument.spec.ts` passes.
- `npx vitest run src/models/experience.model.spec.ts` passes (career break title/payload).
- Duplicating an entry and saving sends `POST api/v1/<collection>/create` and the list then holds both entries.
- After dragging entry B above A and reloading, B is still above A on the same browser.
- Project technology `"Vue, , TS "` is saved as `["Vue","TS"]`.

## Edge cases
- Saved order references a deleted entry → that id is skipped.
- Career-break entry edited back into a job → `careerBreakType` sent as `''`.
- `localStorage` unavailable → order works for the session but is not saved.

## Out of scope
- Server-side order (backend has no order field; issue #57).
- Images on projects (field disabled in the model).

## Open questions
1. The manual order is per browser only and is not used by the CV preview, public page or PDF (they sort by date / API order). Is the manual order meant to affect the CV? → **Answer (operator 2026-11-07):** Change: persist the order to the backend for Education and Project and use it on the CV; Experience excluded — always sorted by date, no manual order — #442, datvt243/resume-nodejs-api#413
2. Newly saved or duplicated entries are appended to the end of the list until reload (the date sort runs only on load). Intended? → **Answer (operator 2026-11-07):** Bug: re-sort after save — #443
3. Reordering is mouse drag only (HTML5 drag events) — no keyboard or touch alternative. Is that acceptable? → **Answer (operator 2026-11-07):** Intended (for now)
4. Only Experience has the read-only "View" modal. Should Education and Project get one? → **Answer (operator 2026-11-07):** Change: Project #402, Education #444
5. End date is sent as a timestamp even when "current" is checked (empty date becomes `NaN`/`0`). Should it be `null`? → **Answer (operator 2026-11-07):** Bug: send null — #445
6. Education requires a major of at least 3 characters (e.g. "IT" is rejected). Intended? → **Answer (operator 2026-11-07):** Bug: min 1 — #446, datvt243/resume-nodejs-api#414

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/cv-timeline-sections-spec.md` | - |
