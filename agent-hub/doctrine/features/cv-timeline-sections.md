# Timeline sections: Experience, Education, Project

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-timeline-sections-spec.md`
- Source: backfill from code
- Issues: #57, #60, #400, #402, #442, #443, #444, #445, #446, datvt243/resume-nodejs-api#413, datvt243/resume-nodejs-api#414
- Anchors: `src/pages/dashboard/PageExperience.vue`, `src/pages/dashboard/PageEducation.vue`, `src/pages/dashboard/PageProject.vue`, `src/components/experience/ExperienceItem.vue`, `src/components/education/EducationItem.vue`, `src/components/project/ProjectItem.vue`, `src/components/global/ItemActions.vue`, `src/models/experience.model.ts`, `src/models/education.model.ts`, `src/models/project.model.ts`, `src/composables/useManualOrder.ts`, `src/composables/useFormLang.ts`, `src/composables/useCandidate.ts`, `src/composables/useDocument.ts`, `src/lib/swal.lib.js`

## Goal
The candidate keeps a dated list of jobs (and career breaks), schools and projects for their CV, and can put them in the order they want.

## Behavior
Shared by all three pages (`/dashboard/experience`, `/dashboard/education`, `/dashboard/project`):
1. The list loads once per session from `GET api/v1/<collection>/` (cached in the candidate store), sorted by start date, newest first; re-sorted after each save (new, edited or duplicated entry). Empty → empty state with "Add"; load failure → error + retry.
2. "Add" (heading and empty state) opens a modal form. Save: no `_id` → `POST <collection>/create`, else `PUT <collection>/update`. Dates are sent as timestamps (ms); the "current" checkbox is sent as `false` when unchecked; the description is sent as `{ vi, en }`. On success the entry is added/replaced in the list and the modal closes; the API message shows as a toast.
3. Each entry has Edit (modal pre-filled), Duplicate (modal pre-filled, title "Duplicate …", saving creates a NEW entry and leaves the original), and Delete (confirm dialog naming the entry, then `DELETE <collection>/delete/<id>`).
4. Drag-and-drop reorder (a hint "drag to sort" above the list). The order is saved only in this browser: `localStorage['cv-manual-order:<collection>:<candidateId>']`. Entries not in the saved order (new ones) go to the end.

Per section:
5. Experience: "Add" first asks "Experience or career break?". Experience fields: company (required, max 100), position (required), start date (required), end date, "currently working" checkbox, description (Vietnamese required, English optional — `withEnglish`, `src/types/model.type.ts:106`). Career break: break type (required, one of 12 LinkedIn types: career transition, caregiving, full-time parenting, gap year, health, layoff, personal goal, professional development, relocation, retirement, travel, voluntary work), dates, "currently on break", description. Saving a break clears company/position; saving a job clears the break type. A break's title is "Career break — <type>". Experience also has a read-only "View" modal (dates `MM/YYYY - MM/YYYY` or "Present", sanitized description) with an Edit button.
6. Education: school (Vietnamese required, max 255), major (Vietnamese required, 1–255); the English variants are optional but, when filled, follow the same max/min rules, start/end dates, "currently studying", description vi/en (optional).
7. Project: name (required, max 50), position (required, max 100), technology (required; typed comma-separated, stored as a trimmed array, shown joined by ", "), start/end dates, "still working on it", link, description vi/en.
8. *(#400 — spec complete, not yet implemented/sealed)* Experience "View" modal content language: the modal shows a VI | EN toggle (same look and behavior as the VeeForm toggle: radiogroup, `aria-checked`, active option highlighted, aria-label `form.contentLang`). It reads and writes the same shared state as the forms (`useFormLang().formLang`, `src/composables/useFormLang.ts`) — switching it in the view changes the forms' toggle and vice versa, and it survives closing/reopening the modal and route changes. The description shows `getLocalizedText(description, formLang)`: the selected language, falling back to the other language when the selected one is empty. Field labels (`dt`) stay in the UI language (`i18n.global.locale`); position, company and dates are plain values and do not change. The career-break type label and the modal title ("Career break — <type>") stay in the UI language, as today. The header VI | EN (UI language) is not affected by this toggle.

9. *(#402 — spec complete, not yet implemented/sealed)* Project "View" modal (read-only), same pattern as Experience (#5, #8). Each Project card has a View (eye) button (`ItemActions viewable`, `action="view"`, aria-label from i18n naming the project) next to Edit / Duplicate / Delete. Clicking it opens a modal titled with the project name that lists, as label/value rows (`dl`, labels in the UI language): project name, position, technology (the stored array joined by ", "), dates (`MM/YYYY - MM/YYYY`, or `MM/YYYY - <Present>` when "still working on it" is checked), link (a clickable link opening in a new tab, `rel="noopener"`; "—" when empty), and the description (HTML passed through `sanitizeHtml`). The modal has the same VI | EN content toggle as #8 (radiogroup, `aria-checked`, aria-label `form.contentLang`) bound to the shared `useFormLang().formLang`, so it stays in sync with the forms and the Experience View modal; the description shows `getLocalizedText(description, formLang)` (falls back to the other language when the selected one is empty). Name, position, technology, dates and link are plain values and do not change with the toggle. The footer has an Edit button (`Button action="update"`, text `common.edit`) that closes the View modal and opens the normal Edit form pre-filled with that project (same as clicking Edit on the card). Viewing sends no API request and changes nothing. Any new label (e.g. the link row) is an i18n key in both `vi` and `en`.
## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageExperience.spec.ts` passes.
- `npx vitest run src/composables/useManualOrder.spec.ts src/composables/useCandidate.spec.ts src/composables/useDocument.spec.ts` passes.
- `npx vitest run src/models/experience.model.spec.ts` passes (career break title/payload).
- Duplicating an entry and saving sends `POST api/v1/<collection>/create` and the list then holds both entries.
- After dragging entry B above A and reloading, B is still above A on the same browser.
- Project technology `"Vue, , TS "` is saved as `["Vue","TS"]`.
- (#400) `npx vitest run src/pages/dashboard/PageExperience.spec.ts` covers: with `description: { vi: 'Mô tả', en: 'Desc' }`, opening View shows "Mô tả" when `formLang='vi'`; clicking the EN option in the modal shows "Desc" and sets `useFormLang().formLang.value === 'en'`; with `description: { vi: 'Mô tả', en: '' }` and EN selected, the modal shows "Mô tả".
- (#400) Manual: in the View modal pick EN, close, click Edit on any entry → the form toggle is on EN; switch the form to VI, open View → the modal toggle is on VI.
- (#400) `grep -n "contentLang" src/pages/dashboard/PageExperience.vue` hits (toggle aria-label from i18n, no hardcoded text); `npm run lint` and `npm run build` pass.

- (#402) `npx vitest run src/pages/dashboard/PageProject.spec.ts` covers: with a project `{ name: 'P1', position: 'Dev', technology: ['Vue','TS'], isWorking: true, link: 'https://x.dev', description: { vi: 'Mô tả', en: 'Desc' } }`, opening View shows "P1", "Dev", "Vue, TS", a date ending in the "Present" text, a link with `href="https://x.dev"` and `target="_blank"`, and "Mô tả" when `formLang='vi'`; clicking the EN option shows "Desc" and sets `useFormLang().formLang.value === 'en'`; with `description: { vi: 'Mô tả', en: '' }` and EN selected it shows "Mô tả"; a description containing `<script>` or `onerror=` renders without them; clicking Edit in the modal opens the form with `document._id` equal to the project's `_id`.
- (#402) `grep -n "viewable" src/components/project/ProjectItem.vue` hits and the card emits `onView` with a copy of the project.
- (#402) Manual (QA account): on `/dashboard/project` each card shows the blue eye button; View opens the read-only modal with all fields above; Edit switches to the pre-filled form; the VI | EN toggle in the Project View, the Experience View and the forms all show the same selection. No network request is sent when opening View.
- (#402) Every new key used in the Project View exists in both `vi` and `en` of `src/i18n/index.ts`; `npm run lint` and `npm run build` pass.
## Edge cases
- Saved order references a deleted entry → that id is skipped.
- Career-break entry edited back into a job → `careerBreakType` sent as `''`.
- `localStorage` unavailable → order works for the session but is not saved.
- (#400) Description is a plain string (legacy) → same text under VI and EN.
- (#400) Description empty in both languages → empty, no error.

- (#402) Legacy project with `technology` empty/missing or `link` empty → that row shows "—", no error.
- (#402) Description is a plain string (legacy) → same text under VI and EN; empty in both → empty, no error.
- (#402) Project with `isWorking` true and `endDate` null → `MM/YYYY - <Present>`.
## Out of scope
- Server-side order (backend has no order field; issue #57).
- Images on projects (field disabled in the model).
- (#400) Language toggle in a View modal for Education/Project (#444/#402 — they may reuse it, not part of #400).

- (#402) Education View modal (#444); editing inside the View modal; showing project images (field disabled).
## Open questions
1. The manual order is per browser only and is not used by the CV preview, public page or PDF (they sort by date / API order). Is the manual order meant to affect the CV? → **Answer (operator 2026-11-07):** Change: persist the order to the backend for Education and Project and use it on the CV; Experience excluded — always sorted by date, no manual order — #442, datvt243/resume-nodejs-api#413
2. Newly saved or duplicated entries are appended to the end of the list until reload (the date sort runs only on load). Intended? → **Answer (operator 2026-11-07):** Bug: re-sort after save — #443
3. Reordering is mouse drag only (HTML5 drag events) — no keyboard or touch alternative. Is that acceptable? → **Answer (operator 2026-11-07):** Intended (for now)
4. Only Experience has the read-only "View" modal. Should Education and Project get one? → **Answer (operator 2026-11-07):** Change: Project #402, Education #444
5. End date is sent as a timestamp even when "current" is checked (empty date becomes `NaN`/`0`). Should it be `null`? → **Answer (operator 2026-11-07):** Bug: send null — #445
6. Education requires a major of at least 3 characters (e.g. "IT" is rejected). Intended? → **Answer (operator 2026-11-07):** Bug: min 1 — #446, datvt243/resume-nodejs-api#414
7. (#400) In the Experience View modal, should the career-break type label and the modal title ("Career break — <type>") follow the content VI | EN toggle, or stay in the UI language (header VI | EN) as they do today (`CAREER_BREAK_TYPES[...][$i18n.locale]`, `experienceTitle` default lang)? → **Answer (operator 2026-11-19):** Stay UI language — only the localized description follows the modal's content toggle.

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/cv-timeline-sections-spec.md` | - |
| 2026-11-15 | Behavior #1: list re-sorted after each save | #443 (operator answer to open question 2) | `issue-443-list-date-sort` |
| 2026-11-16 | Behavior #6: education major min 1 (was 3) | #446 (operator answer to open question 6) | `issue-446-short-major-optional-award-link` |
| 2026-11-19 | Behavior #8 (draft): VI \| EN toggle in Experience View modal, shared with form toggle | #400 | - |
| 2026-11-19 | Q7 answered (break label/title stay UI language); Behavior #8 spec complete | operator answer | - |
| 2026-11-19 | Behavior #9 (draft): Project read-only View modal with Edit + shared VI \| EN toggle | #402 | - |
