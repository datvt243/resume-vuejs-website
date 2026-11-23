# ATS check

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/ats-check-spec.md`
- Source: backfill from code
- Issues: #159, #448, #461, datvt243/resume-nodejs-api#400, datvt243/resume-nodejs-api#406, datvt243/resume-nodejs-api#407
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
6. *(#461 — draft, not yet implemented)* Not-applicable checks. Backend contract (datvt243/resume-nodejs-api#406, PR #440, merged 2026-11-08, `src/services/atsChecks.ts`): a check may carry `applicable: false` (the key is absent otherwise, never `true`). Today only `template=classic` produces it, for `standard-headings` and `metadata`; such a check comes back with `passed: true`, `severity: 'error'` and a localized message (`atsCheck.notApplicableClassic`), and the backend leaves it out of `score`.
   a. `AtsCheckResult` (`src/types/ats.type.ts`) gets the optional field `applicable?: false`.
   b. A check with `applicable === false` is shown in a third, neutral state, checked BEFORE `passed`: a grey "minus" icon (`fa-solid fa-circle-minus`, `text-fg-3`) and a neutral badge (`badgeClass('neutral')`, DESIGN.md §5.6) reading "Không áp dụng" / "Not applicable" (new key `ats.notApplicable`, vi + en). No green tick, no red/amber cross, no Error/Warning badge. Its message is the API's, as for other checks.
   c. Not-applicable checks are not counted in "<n> checks failed" (they already are not, since `passed: true`; the rule is that they must never be counted even if a future backend sends `passed: false` with `applicable: false`).
   d. Checks without the field render exactly as in Behavior 3.

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageAtsCheck.spec.ts` passes.
- A result with `score: 79` renders the score in the amber class (`text-warning`).
- Check without a job description → no keyword section rendered.
- Check with template Classic → the Classic note is shown.
- *(#461)* A new case in `src/pages/dashboard/PageAtsCheck.spec.ts`, passing with `npx vitest run src/pages/dashboard/PageAtsCheck.spec.ts`: a response with checks `[{id:'metadata', passed:true, severity:'error', applicable:false, message:'m'}, {id:'page-count', passed:false, severity:'warning', message:'p'}]` renders exactly one not-applicable badge with text `Không áp dụng` (vi; `Not applicable` after switching to en), no `[data-badge="danger"]`, one `[data-badge="warning"]`, and the failed-count text for 1 check. Same response with `passed:false` on `metadata` still shows the failed count for 1. The not-applicable badge has its own marker (e.g. `data-badge="not-applicable"`), so the existing `[data-badge="neutral"]` keyword assertion is unchanged.
- *(#461)* `npm run build` passes; `ats.notApplicable` exists in both `vi` and `en` in `src/i18n/index.ts`.

## Edge cases
- Job description of only spaces → not sent.
- All checks pass → "all checks passed" text.
- *(#461)* Classic result where every applicable check passed and two are not applicable → "all checks passed" text, two not-applicable rows.
- *(#461)* Old backend (no `applicable` field) → unchanged rendering.

## Out of scope
- Saving results or history.
- Editing the CV from the result (the user goes to the section pages).

## Open questions
1. Check messages are shown exactly as the API returns them. Are they localized by the backend for `lang`, or always in one language? → **Answer (operator 2026-11-07):** No: the backend hard-codes English in `src/services/atsChecks.ts` (resume-nodejs-api). Bug: localize every check message — datvt243/resume-nodejs-api#407 (scope extended)
2. The check runs on the full CV — the active CV profile is not sent. Should it check the profile-filtered CV? → **Answer (operator 2026-11-07):** Change: send it once datvt243/resume-nodejs-api#400 lands — #448
3. The job description has no length limit on the client. Is there a backend limit the UI should show? → **Answer (operator 2026-11-07):** Intended (backend has none either)

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/ats-check-spec.md` | - |
| 2026-11-23 | Behavior 6 (draft): neutral not-applicable state, shape from backend #406 / PR #440 | #461 | - |
