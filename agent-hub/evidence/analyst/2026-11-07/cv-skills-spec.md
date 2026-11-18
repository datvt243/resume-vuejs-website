# analyst — cv-skills — 2026-11-07

## Task (verbatim)
document cv-skills

## Doc
`agent-hub/doctrine/features/cv-skills.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageSkills.vue`
- `src/components/PickedSkills.vue`
- `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` (`handleUpdate`, typed-`delete` Swal, `if (!_id) return`)
- `src/lib/swal.lib.js` (`confirmDelete`)
- `src/composables/useDocument.ts` (`updatePatchDoc`)

## Re-check vs code
Behavior 1–6 match code. PATCH `general-information/update` via `updatePatchDoc`, reload → `getData` (`PageSkills.vue`). `MAIN_SKILLS_MAX = 5`; picker search + group filter, options disabled when `selected.length >= max`, modal hides only when `save` resolves true; × chip saves the list without that name (`PickedSkills.vue`). Tab from `route.query.tab` (`personal` else professional). Groups editor → `professionalSkillsGroup`; `groupSkills(items, skillsGroup)` incl. "Ungrouped"; add fields name max 100 / exp positive / group select from `groupNames`, `presetGroup` for "Add" on a group; edit via `showModalEditDoc`; × → typed `delete` Swal (`VeeFormGeneralInformationUpdate.vue`). Rename: Swal input, required + clash check, one PATCH of tags + skills. Delete group: `confirmDelete` (plain), drops tag + its skills. Personal tab: name max 100, add/delete via same component. No `_id` → `handleUpdate` returns silently. No discrepancy.

## Questions + answers
Operator (2026-11-07): "behavior đúng" (Behavior section confirmed correct).
1. Main/familiar skills are stored by name. Renaming or deleting a skill (or deleting its group) does not update `mainSkills`/`familiarSkills`, which can then hold names that no longer exist. Intended? → **Answer (operator 2026-11-07):** Bug: keep them in sync — #437
2. If the general-information document has no `_id` yet (new account that never saved General information), add/delete returns silently with no message. Intended? → **Answer (operator 2026-11-07):** Bug: show a message — #438
3. Typing `delete` is required to remove one skill, but deleting a whole group (with all its skills) only needs a normal confirm. Intended? → **Answer (operator 2026-11-07):** Change: typed `delete` — #439
4. The typed confirm word is always the English `delete`, even in the Vietnamese UI. Intended? → **Answer (operator 2026-11-07):** Intended
5. Skills are not rendered anywhere on the CV layout. Should they be? → **Answer (operator 2026-11-07):** Change: show them on the CV layout — #440

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/cv-skills-spec.md` set in doc + INDEX row; Issues: #437, #438, #439, #440. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
