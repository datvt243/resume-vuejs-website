# Simple list sections: Award, Certificate, Reference

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-simple-sections-spec.md`
- Source: backfill from code
- Issues: #60, #446, #447, datvt243/resume-nodejs-api#414
- Anchors: `src/pages/dashboard/PageAward.vue`, `src/pages/dashboard/PageCertificate.vue`, `src/pages/dashboard/PageReference.vue`, `src/models/award.model.ts`, `src/models/certificate.model.ts`, `src/models/reference.model.ts`, `src/components/global/ItemActions.vue`, `src/components/table/TableDefault.vue`, `src/composables/useDocument.ts`

## Goal
The candidate lists awards, certificates and references for their CV.

## Behavior
Shared by all three pages (`/dashboard/award`, `/dashboard/certificate`, `/dashboard/reference`):
1. The list loads once per session from `GET api/v1/<collection>/` (cached). Empty → empty state with "Add"; load failure → error + retry.
2. "Add" opens a modal form. Save: no `_id` → `POST <collection>/create`, else `PUT <collection>/update`; on success the entry is added/replaced and the modal closes, with the API message as a toast.
3. Each entry has Edit, Duplicate (saving creates a new entry) and Delete (confirm dialog naming the entry, then `DELETE <collection>/delete/<id>`).
4. No drag-and-drop ordering on these pages.

Per section:
5. Award (item cards): name (required, max 50), organization (required, max 50), issue date (required, month picker, sent as timestamp), link (required, valid URL, max 100), description (Vietnamese required, English optional — `withEnglish` makes every `*En` field `notRequired`, `src/types/model.type.ts:106`).
6. Certificate (item cards): name (required, max 50), organization (required, max 50), start/end dates, "no expiration" checkbox (sent as `false` when unchecked; when checked, the card shows "No expiration" instead of the end date), description vi/en (optional).
7. Reference (table, not cards): full name (required, 3–50), company (required, max 100), position (required, max 100), phone. Delete is disabled for a row without `_id`.

## Acceptance criteria
- `npx vitest run src/composables/useDocument.spec.ts src/components/table/TableDefault.spec.ts` passes.
- Award link `not-a-url` shows the URL error and sends no request.
- A certificate with "no expiration" checked shows "No expiration" as its end date on the card.
- Duplicating a reference and saving sends `POST api/v1/reference/create`.

## Edge cases
- Reference row without `_id` → delete button disabled.

## Out of scope
- Images (fields disabled in the models).
- Manual ordering (only the timeline sections have it).

## Open questions
1. An award requires a link and a description — awards without a URL cannot be saved. Intended? → **Answer (operator 2026-11-07):** Change: link optional (URL when filled) — #446, datvt243/resume-nodejs-api#414
2. Award/certificate lists are sorted by `startDate` on load, but awards have only `issueDate`, so their order is effectively the API order. Should awards sort by issue date? → **Answer (operator 2026-11-07):** Bug: sort by issueDate — #447
3. Reference has no email field, only phone. Intended? → **Answer (operator 2026-11-07):** Intended
4. Reference is a table while Award/Certificate are cards. Intended difference? → **Answer (operator 2026-11-07):** Intended

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-06 | Review corrections (see note) | independent review vs code+live, `evidence/spec-backfill/2026-11-06/review.md` | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/cv-simple-sections-spec.md` | - |
