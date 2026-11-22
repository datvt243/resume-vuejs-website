# Analyst spec — #444 Education View modal + #441 Languages edit

## Task (verbatim)
#444 "Education: add a read-only "View" modal like Experience" — Problem: Only Experience has the read-only "View" modal. Project is tracked by #402; Education has none. Expected: Education gets the same View modal (dates, school, major, sanitized description, Edit button), vi/en. Decided by the operator while confirming agent-hub/doctrine/features/cv-timeline-sections.md (2026-11-07).
#441 "Languages: allow editing an existing language" — Problem: In /dashboard/languages edit mode you can only add and delete; table rows are not clickable, so changing a level means delete + re-add. Expected: Click a row → the same modal pre-filled; save patches the full foreignLanguages list. Decided by the operator while confirming agent-hub/doctrine/features/cv-languages.md (2026-11-07).

## Docs updated
- doctrine/features/cv-timeline-sections.md — Behavior #11, AC (#444), edge cases, out of scope, changelog
- doctrine/features/cv-languages.md — Behavior #6 (old #6 → #7), AC (#441), edge cases, out of scope, changelog
- INDEX rows unchanged (issues already listed; Status stays verified for the backfilled part, new items marked draft inline).

## Sources read
agent-hub/haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}, doctrine/MEMORY.md (test/typecheck cmds), doctrine/features/{INDEX.md,cv-timeline-sections.md,cv-languages.md},
src/pages/dashboard/{PageEducation.vue,PageExperience.vue (view modal 147-290),PageLanguages.vue,PageSkills.vue (edit(index) usage)},
src/components/education/EducationItem.vue, src/components/veevalidate/VeeFormGeneralInformationUpdate.vue (showModalEditDoc/editIndex already exist, unused by Languages' default table), src/components/table/TableDefault.vue (tbodyMore doc.index), spec list in src/pages/dashboard/.

## Questions + answers
No new open questions. Interpretations taken from the issue text (flag to operator if wrong):
- #444 "vi/en": school, major and description are all `{vi,en}` content, so all follow the shared content toggle (Experience Q7 kept only UI labels in UI language; school/major are content, not labels).
- #441 "click a row": an icon Edit button per row is added as the keyboard path (accessibility, never-cut rule); row click still works. Delete click must not open edit.

## Isolation proof
Spawned as a fresh analyst subagent with only the issue texts + doc paths; no implementer reasoning or diff seen (branch has no code changes for these issues; git status only shows .claude/skills/todo/SKILL.md modified).
