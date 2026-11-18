# analyst — cv-timeline-sections — 2026-11-07

## Task (verbatim)
document cv-timeline-sections

## Doc
`agent-hub/doctrine/features/cv-timeline-sections.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageExperience.vue`
- `src/pages/dashboard/PageEducation.vue`
- `src/pages/dashboard/PageProject.vue` (drag handlers, `technology` split/join)
- `src/models/experience.model.ts`
- `src/models/education.model.ts`
- `src/models/project.model.ts`
- `src/types/model.type.ts` (`withEnglish`, `defaultLink`)
- `src/composables/useManualOrder.ts`
- `src/composables/useCandidate.ts` (`sortData`, `addRecordToList`)
- `src/composables/useDocument.ts`

## Re-check vs code
Behavior 1–7 match code. `useCandidate.sortData` sorts by `startDate` desc on load only; `addRecordToList` pushes/replaces (no re-sort). `updateDoc`: no `_id` → POST create, else PUT update; `deleteDoc` → `confirmDelete` then DELETE `<collection>/delete/<id>`. Pages send `+new Date(startDate/endDate)`, `isCurrent` → `false` when unchecked (`PageExperience.vue:89-91`, `PageEducation.vue` same); duplicate clears `_id` before save. `useManualOrder` key `cv-manual-order:<collection>:<candidateId>`, unknown ids appended, missing ids skipped, `localStorage` errors swallowed. Drag = HTML5 `draggable`/`dragstart`/`drop` only. View modal (`refViewModal`) only in `PageExperience.vue`. Experience: 12 `CAREER_BREAK_TYPES`, `careerBreakPayload` clears company/position or break type, `experienceTitle` "Career break — <type>". Education: school max 255, major min 3 / max 255 (`education.model.ts:26`), EN optional via `withEnglish`. Project: name max 50, position max 100, technology split/trim/filter → array, joined `, ` on edit. No discrepancy.

## Questions + answers
Operator (2026-11-07): "ok" (Behavior section confirmed correct).
1. The manual order is per browser only and is not used by the CV preview, public page or PDF (they sort by date / API order). Is the manual order meant to affect the CV? → **Answer (operator 2026-11-07):** Change: persist the order to the backend for Education and Project and use it on the CV; Experience excluded — always sorted by date, no manual order — #442, datvt243/resume-nodejs-api#413
2. Newly saved or duplicated entries are appended to the end of the list until reload (the date sort runs only on load). Intended? → **Answer (operator 2026-11-07):** Bug: re-sort after save — #443
3. Reordering is mouse drag only (HTML5 drag events) — no keyboard or touch alternative. Is that acceptable? → **Answer (operator 2026-11-07):** Intended (for now)
4. Only Experience has the read-only "View" modal. Should Education and Project get one? → **Answer (operator 2026-11-07):** Change: Project #402, Education #444
5. End date is sent as a timestamp even when "current" is checked (empty date becomes `NaN`/`0`). Should it be `null`? → **Answer (operator 2026-11-07):** Bug: send null — #445
6. Education requires a major of at least 3 characters (e.g. "IT" is rejected). Intended? → **Answer (operator 2026-11-07):** Bug: min 1 — #446, datvt243/resume-nodejs-api#414

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/cv-timeline-sections-spec.md` set in doc + INDEX row; Issues: #57, #60, #402, #442, #443, #444, #445, #446, datvt243/resume-nodejs-api#413, datvt243/resume-nodejs-api#414. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok" confirmation, the operator's
answers + issue numbers). No implementer reasoning, no main session
transcript. All Behavior items re-checked by reading code myself.
