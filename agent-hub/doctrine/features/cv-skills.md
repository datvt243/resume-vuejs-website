# Skills

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-skills-spec.md`
- Last verified: 82fedcf
- Source: backfill from code
- Issues: #437, #438, #439, #440, #489
- Anchors: `src/pages/dashboard/PageSkills.vue`, `src/components/PickedSkills.vue`, `src/components/GroupTags.vue`, `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue`, `src/utilities/index.ts` (`groupSkills`)

## Goal
The candidate lists their professional skills (grouped, with years), picks their main and familiar skills, and lists personal skills.

## Behavior
1. `/dashboard/skills` reads and patches the `general-information` document (`PATCH api/v1/general-information/update`). A reload button re-fetches it.
2. Top: two picked-skills blocks.
   - Main skills: up to 5. "Add" opens a picker over the professional skills (search by name, filter by group) that edits the whole selection; once 5 are selected, unselected options are disabled. Save sends `mainSkills: [{ name }]`; the picker closes only on success.
   - Familiar skills: same picker, no limit, saved as `familiarSkills`.
   - × on a chip removes that skill from the selection.
3. Tabs Professional / Personal; the tab is kept in the URL (`?tab=personal`, Professional by default).
4. Professional tab:
   - Skill groups (tags) editor; changes save `professionalSkillsGroup`.
   - Skills shown grouped (group tags plus any group names skills already use; skills without a group under "Ungrouped").
   - Add skill: name (required, max 100), years (required positive number), group (required select from existing groups). "Add" on a group pre-selects that group.
   - Click a skill to edit it; × deletes it after typing `delete` in a confirm dialog.
   - Rename group: a prompt (required, must not clash with another group) renames the tag and moves all its skills, in one save.
   - Delete group: confirm, then removes the tag and every skill in it (the API rejects skills without a group).
     *(#439 / #489 — spec complete, not yet implemented/sealed)* Typed confirm: the dialog keeps its current title and warning text and adds a text input (placeholder `confirm.typeDeletePlaceholder`) with the prompt `confirm.typeDelete` — the same typed confirm single-skill delete uses (`VeeFormGeneralInformationUpdate.vue`), shared by all four dialogs rather than copied. The Delete button only proceeds when the input is exactly `delete` (case-sensitive, not trimmed, English in both UI languages); anything else keeps the dialog open and shows `confirm.typeDelete` as the validation message. Cancel, × or Esc closes it and sends no request. The group-name title and the "{count} skills will be deleted" text stay. The PATCH is sent only after a valid `delete`; this applies to every group, including one with 0 skills.
5. Personal tab: a list of personal skills (name, required, max 100) with add and delete, same confirm-by-typing-`delete`.
6. Every save patches only the changed field(s) and updates the store from the response; success/failure toasts come from the API message.

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageSkills.spec.ts` passes.
- `npx vitest run src/components/PickedSkills.spec.ts src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts` passes.
- With 5 main skills selected, the 6th option in the picker is disabled.
- `#/dashboard/skills?tab=personal` opens on the Personal tab.
- Deleting a skill is not sent unless the confirm input is exactly `delete`.
- *(#439)* Delete group: inputs `''`, `delet`, `Delete` and `delete ` are rejected (validation message, dialog stays open, no request); `delete` sends exactly one `PATCH api/v1/general-information/update` without the group and its skills; Cancel sends none. Asserted in `src/pages/dashboard/PageSkills.spec.ts` (`npx vitest run src/pages/dashboard/PageSkills.spec.ts` passes).
- Single-skill and personal-skill delete still behave as before: `npx vitest run src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts` passes.

## Edge cases
- No groups yet → the group select is empty, so no professional skill can be added until a group exists.
- Renaming a group to its current name → nothing is sent.

## Out of scope
- Showing skills on the CV preview/public page (the shared layout has no skills section). *(#440 changes this — specified in `cv-preview-export.md` Behavior #18–23, draft.)*
- Counting skills in profile completion. *(#440 changes this — counted, see `home-overview.md` Behavior #4, draft.)*

## Open questions
1. Main/familiar skills are stored by name. Renaming or deleting a skill (or deleting its group) does not update `mainSkills`/`familiarSkills`, which can then hold names that no longer exist. Intended? → **Answer (operator 2026-11-07):** Bug: keep them in sync — #437
2. If the general-information document has no `_id` yet (new account that never saved General information), add/delete returns silently with no message. Intended? → **Answer (operator 2026-11-07):** Bug: show a message — #438
3. Typing `delete` is required to remove one skill, but deleting a whole group (with all its skills) only needs a normal confirm. Intended? → **Answer (operator 2026-11-07):** Change: typed `delete` — #439
4. The typed confirm word is always the English `delete`, even in the Vietnamese UI. Intended? → **Answer (operator 2026-11-07):** Intended
5. Skills are not rendered anywhere on the CV layout. Should they be? → **Answer (operator 2026-11-07):** Change: show them on the CV layout — #440

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/cv-skills-spec.md` | - |
| 2026-11-20 | Behavior (draft): typed `delete` confirm on skill-group delete | #439 / umbrella #489 | - |
| 2026-11-24 | Out of scope notes point to the #440 spec (layout in `cv-preview-export.md`, completion in `home-overview.md`) | #440, see `evidence/analyst/2026-11-24/issue-440-cv-skills-languages-spec.md` | - |
