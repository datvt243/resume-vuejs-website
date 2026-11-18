# analyst — general-information — 2026-11-07

## Task (verbatim)
document general-information

## Doc
`agent-hub/doctrine/features/general-information.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageGeneralInformation.vue`
- `src/models/generalInformation.model.ts`
- `src/types/model.type.ts` (`withEnglish`, `defaultCheckboxBoolean`)
- `src/composables/useCandidate.ts` (once-per-session cache, `getData`, `loadError`)
- `src/composables/useDocument.ts` (`updateDoc` POST create vs PUT update)
- `src/components/veevalidate/VeeForm.vue` (cancel → `loadDocument`)

## Re-check vs code
Behavior 1–4 match code. `useCandidate` fetches `general-information/` only when the store field is unset; reload button calls `getData` (`PageGeneralInformation.vue`). Model fields/rules match item 2 exactly: openToWork checkbox; positionDesired required max 100 trim; `withEnglish(career)` VI required / EN optional; levelCurrent/levelDesired 7 options required; education 5 options required; yearsOfExperience integer min 0 required; salaryDesired currency integer positive required; workForm 8 options incl. `remote` required; workLocation 3–100 required; `withEnglish(careerGoal)` ckediter optional (`generalInformation.model.ts`). Save `localizedFromForm(['careerGoal','career'])`, `updateDoc` → POST create without `_id` / PUT update with, store `generalInformation: [data]`; toasts via `handleBase`. Cancel → `loadDocument(props.document)` (`VeeForm.vue:211`). No discrepancy.

## Questions + answers
Operator (2026-11-07): "behavior đúng" (Behavior section confirmed correct).
1. Desired salary is required (and must be positive), so a candidate cannot save without stating a salary. Intended? → **Answer (operator 2026-11-07):** Intended (keep required)
2. "Remote" is listed as an employment type alongside Full-time/Part-time, though it is a work arrangement. Intended? → **Answer (operator 2026-11-07):** Intended (backend enum)
3. ~~Career has no English input~~ — withdrawn by review 2026-11-06: `generalInformation.model.ts:30` wraps `career` in `withEnglish`, so the form has an optional English input (`careerEn`) and saves send what it holds. → **Withdrawn — no answer needed.**

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/general-information-spec.md` set in doc + INDEX row; Issues: - (no new issues). Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
