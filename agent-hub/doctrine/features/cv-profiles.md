# CV profiles (named variants)

- Status: draft
- Source: backfill from code
- Issues: #116
- Anchors: `src/pages/dashboard/PageProfile.vue`, `src/models/profile.model.ts`, `src/composables/useActiveProfile.ts`, `src/pages/dashboard/PagePreview.vue`, `src/pages/dashboard/PageInformation.vue`, `src/pages/public/PagePublicResume.vue`

## Goal
The candidate keeps one set of CV data but makes named variants (e.g. "Frontend", "Backend") that show only chosen entries, for different job applications.

## Behavior
1. `/dashboard/profile` lists profiles (`GET api/v1/profile/`, cached). Each card shows the name and a summary such as "2 education · 3 experience". Empty → empty state with "Add"; load failure → error + retry.
2. Add/Edit/Duplicate open a modal: Name (required, 1–100 characters, trimmed) plus a checklist per section — Education, Experience, Project, Certificate, Award, Reference — listing that section's existing entries (title + subtitle), with "Select all" / "Clear" per section and a selected count.
3. Save sends the name plus six id arrays (`educationIds`, `experienceIds`, `projectIds`, `certificateIds`, `awardIds`, `referenceIds`); `POST profile/create` or `PUT profile/update`. Duplicate saves a new profile. Delete asks for confirmation, then `DELETE profile/delete/<id>`.
4. Choosing the active profile happens elsewhere: the select on Preview and on Information's Share block (shared via `localStorage.cvActiveProfileId`; empty = all entries).
5. Effect of an active profile:
   - Preview / print / JSON export: each of the six sections shows only that profile's selected ids (filtered in the browser).
   - Public link: `?profile=<id>` is added; the backend filters (invalid id → unfiltered).
   - Server PDF download: not affected (see open questions).

## Acceptance criteria
- `npx vitest run src/composables/useActiveProfile.spec.ts` passes.
- A profile with name `"   "` cannot be saved (required/empty error).
- With a profile that selects 1 of 3 experiences active, Preview shows exactly 1 experience.
- Deleting the active profile → Preview shows all entries and the public link has no `?profile=`.

## Edge cases
- A section with no ticked entries → that section is empty in the filtered preview (not "show all").
- Active profile id not found → no filter.

## Out of scope
- Skills, Languages and General information per profile (not part of a profile).
- Per-profile theme or language.

## Open questions
1. "Download CV" (server PDF from Header/Home) ignores the active profile, while Preview and the public link apply it. Intended?
2. Deleting an entry (e.g. an experience) does not remove its id from profiles; the profile summary count then includes the stale id. Intended?
3. New entries added later are never in any profile automatically — a profile silently omits them. Intended?

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
