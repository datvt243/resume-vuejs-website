# Foreign languages

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-languages-spec.md`
- Source: backfill from code
- Issues: #438, #440, #441
- Anchors: `src/pages/dashboard/PageLanguages.vue`, `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue`, `src/components/table/TableDefault.vue`

## Goal
The candidate lists the foreign languages they speak and at what level.

## Behavior
1. `/dashboard/languages` reads the `foreignLanguages` list from the `general-information` document (reload button re-fetches).
2. Read mode (default): each language with its level as a badge. Known levels show translated (Basic, Intermediate, Advanced, Expert); unknown legacy free-text levels show as stored.
3. Empty list: an empty state with "Add", which switches to edit mode. Load failure: error + retry.
4. An "Edit" button (shown when the list is not empty or edit mode is on) toggles edit mode; in edit mode it reads "Close".
5. Edit mode: a table of languages, an "Add" button opening a modal with Language (required, max 100) and Level (required select), and a delete button per row that requires typing `delete` to confirm.
6. *(#441 — spec complete, not yet implemented/sealed)* Edit an existing language: in edit mode, clicking a table row (anywhere except its Delete button), or its Edit button (`Button action="update"`, icon only, aria-label from i18n naming the language — the keyboard path), opens the same modal titled `form.editTitle`, pre-filled with that row's language and level. Saving replaces that row in place (same position, other rows unchanged) and sends one `PATCH api/v1/general-information/update` with the full `foreignLanguages` list; the modal closes and the table and read list show the new values. Cancel sends nothing and changes nothing. "Add" after an edit opens an empty modal and appends. Reuses the existing `showModalEditDoc(index)` / `editIndex` path in `VeeFormGeneralInformationUpdate.vue` (already used by PageSkills via `edit(index)`); the index is the one `TableDefault` passes in `tbodyMore` (`doc.index`, position in the unsorted list).
7. Each add, edit or delete saves on its own: `PATCH api/v1/general-information/update` with the full new `foreignLanguages` list; the store is updated from the response.

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageLanguages.spec.ts` passes.
- Adding "English / Advanced" then closing edit mode shows "English" with the "Advanced" badge.
- Deleting a row with confirm text other than `delete` sends no request.
- (#441) `npx vitest run src/pages/dashboard/PageLanguages.spec.ts` (or a `VeeFormGeneralInformationUpdate` spec) covers: with `foreignLanguages: [{ language: 'English', level: 'basic' }, { language: 'French', level: 'advanced' }]`, triggering edit on row 0 opens the modal with `language === 'English'`, `level === 'basic'`; submitting `{ language: 'English', level: 'expert' }` calls `updatePatchDoc` with `foreignLanguages: [{ language: 'English', level: 'expert' }, { language: 'French', level: 'advanced' }]` (same order, length 2); clicking the row's Delete button does not open the edit modal.
- (#441) Manual (QA account, `/dashboard/languages`): Edit → click the "English" row → modal shows English / its level; change level to Expert, Save → one `PATCH api/v1/general-information/update` whose body `foreignLanguages` has the same length as before with English now `expert`; Close edit mode → English shows the "Expert" badge. Tab to the row's Edit button, press Enter → same modal opens.
- (#441) Every new key (e.g. the Edit aria-label) exists in both `vi` and `en` of `src/i18n/index.ts`; `npm run lint`, `npm run build`, `npm run test` pass; `npm run typecheck` ≤ 78 errors and none in changed files.

## Edge cases
- Stored level `fluent` (legacy) → shown as `fluent`.
- (#441) Editing a row whose level is a legacy free-text value (not one of the 4 options) → the Level select shows no selection; save is blocked by the existing required rule until a level is chosen.
- (#441) Table sorted by a column → editing still replaces the clicked row (index from `doc.index`, not the sorted position).
- (#441) Save fails (API error) → toast via `handleBase`, modal stays open, list unchanged.

## Out of scope
- Showing languages on the CV preview/public page (the shared layout has no languages section). *(#440 changes this — layout in `cv-preview-export.md` Behavior #20, completion in `home-overview.md` Behavior #4, both draft.)*

- (#441) Reordering languages; duplicate-language detection.

## Open questions
1. Edit mode has no way to edit an existing language (only add and delete) — the table rows are not clickable here. Intended? → **Answer (operator 2026-11-07):** Change: click a row to edit — #441
2. Adding a language when the general-information document has no `_id` yet returns silently. Intended? → **Answer (operator 2026-11-07):** Bug — #438
3. Languages are not shown on the CV layout or counted in profile completion. Intended? → **Answer (operator 2026-11-07):** Change: show them and count them — #440

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/cv-languages-spec.md` | - |
| 2026-11-22 | Behavior #6 (draft): edit an existing language (row click / Edit button → pre-filled modal, PATCH full list) | #441 (operator answer to open question 1) | - |
| 2026-11-24 | Out of scope note points to the #440 spec | #440, see `evidence/analyst/2026-11-24/issue-440-cv-skills-languages-spec.md` | - |
