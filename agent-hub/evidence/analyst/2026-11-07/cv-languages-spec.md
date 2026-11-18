# analyst — cv-languages — 2026-11-07

## Task (verbatim)
document cv-languages

## Doc
`agent-hub/doctrine/features/cv-languages.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageLanguages.vue`
- `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` (table + row delete, typed-`delete` Swal, `if (!_id) return`)
- `src/components/table/TableDefault.vue`
- `src/composables/useCandidate.ts` (`loadError`)

## Re-check vs code
Behavior 1–6 match code. Reads `candidate.getGeneralInformation.foreignLanguages`, reload → `getData`. Read mode list + badge via `levelText` (known 4 levels translated, else stored text). Empty → `LoadingGate` (error + retry) wrapping `NoData` with "Add" → `isEditing = true`. Edit/Close button shown when `isEditing || languages.length` (`PageLanguages.vue`). Edit mode: `TableDefault` + row delete button (typed `delete`) and "Add" modal with language (required, max 100) + level (required select); no row edit in the table slot. Each add/delete → `updatePatchDoc` with full `foreignLanguages` list, store updated (`VeeFormGeneralInformationUpdate.vue`). No discrepancy. (#398 not listed on this doc — nothing to keep.)

## Questions + answers
Operator (2026-11-07): "behavior đúng" (Behavior section confirmed correct).
1. Edit mode has no way to edit an existing language (only add and delete) — the table rows are not clickable here. Intended? → **Answer (operator 2026-11-07):** Change: click a row to edit — #441
2. Adding a language when the general-information document has no `_id` yet returns silently. Intended? → **Answer (operator 2026-11-07):** Bug — #438
3. Languages are not shown on the CV layout or counted in profile completion. Intended? → **Answer (operator 2026-11-07):** Change: show them and count them — #440

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/cv-languages-spec.md` set in doc + INDEX row; Issues: #438, #440, #441. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
