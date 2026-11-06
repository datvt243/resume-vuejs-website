# Foreign languages

- Status: draft
- Source: backfill from code
- Issues: -
- Anchors: `src/pages/dashboard/PageLanguages.vue`, `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue`, `src/components/table/TableDefault.vue`

## Goal
The candidate lists the foreign languages they speak and at what level.

## Behavior
1. `/dashboard/languages` reads the `foreignLanguages` list from the `general-information` document (reload button re-fetches).
2. Read mode (default): each language with its level as a badge. Known levels show translated (Basic, Intermediate, Advanced, Expert); unknown legacy free-text levels show as stored.
3. Empty list: an empty state with "Add", which switches to edit mode. Load failure: error + retry.
4. An "Edit" button (shown when the list is not empty or edit mode is on) toggles edit mode; in edit mode it reads "Close".
5. Edit mode: a table of languages, an "Add" button opening a modal with Language (required, max 100) and Level (required select), and a delete button per row that requires typing `delete` to confirm.
6. Each add or delete saves on its own: `PATCH api/v1/general-information/update` with the full new `foreignLanguages` list; the store is updated from the response.

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageLanguages.spec.ts` passes.
- Adding "English / Advanced" then closing edit mode shows "English" with the "Advanced" badge.
- Deleting a row with confirm text other than `delete` sends no request.

## Edge cases
- Stored level `fluent` (legacy) → shown as `fluent`.

## Out of scope
- Showing languages on the CV preview/public page (the shared layout has no languages section).

## Open questions
1. Edit mode has no way to edit an existing language (only add and delete) — the table rows are not clickable here. Intended?
2. Adding a language when the general-information document has no `_id` yet returns silently. Intended?
3. Languages are not shown on the CV layout or counted in profile completion. Intended?

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
