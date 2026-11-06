# ATS check

- Status: draft
- Source: backfill from code
- Issues: #159
- Anchors: `src/pages/dashboard/PageAtsCheck.vue`, `src/types/ats.type.ts`, `src/composables/useDownloadCv.ts`, `src/composables/useCvLang.ts`

## Goal
The candidate checks whether applicant tracking systems can read their CV PDF and, optionally, how well it matches a job description.

## Behavior
1. `/dashboard/ats-check` shows: a template switch ATS-optimized / Classic (default ATS), a "Download this template" button, an optional job-description textarea, and a "Check" button in the heading.
2. "Check" sends `POST api/v1/cv/ats-check` with `template`, the current CV language (`lang`, from the shared CV-language setting) and, if non-blank, the trimmed `jobDescription`. Nothing is saved. Spinner while running; API failure → red toast.
3. Result block:
   - Score with colour: ≥ 80 green, 50–79 amber, < 50 red.
   - Page count, and "<n> checks failed" or "all checks passed".
   - When the checked template was Classic, a note that a lower score is normal for Classic.
   - Each check: green tick if passed; otherwise a red (error) or amber (warning) cross with an "Error"/"Warning" badge; the message comes from the API.
   - Only when a job description was sent: keyword coverage as a rounded percent, matched keywords (green badges) and missing keywords (grey badges); "—" for an empty group.
   - A collapsible "extracted text" block with the text the server read from the PDF.
4. "Download this template" downloads the server PDF with the chosen template and CV language (same download flow and file naming as `cv-preview-export.md`).
5. Changing the template after a check does not clear the result; the Classic note follows the template that was actually checked.

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageAtsCheck.spec.ts` passes.
- A result with `score: 79` renders the score in the amber class (`text-warning`).
- Check without a job description → no keyword section rendered.
- Check with template Classic → the Classic note is shown.

## Edge cases
- Job description of only spaces → not sent.
- All checks pass → "all checks passed" text.

## Out of scope
- Saving results or history.
- Editing the CV from the result (the user goes to the section pages).

## Open questions
1. Check messages are shown exactly as the API returns them. Are they localized by the backend for `lang`, or always in one language?
2. The check runs on the full CV — the active CV profile is not sent. Should it check the profile-filtered CV?
3. The job description has no length limit on the client. Is there a backend limit the UI should show?

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
