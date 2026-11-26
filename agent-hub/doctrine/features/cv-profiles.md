# CV profiles (named variants)

- Status: verified (Behavior 1–5) — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-profiles-spec.md`; Behavior 6–11 (#448) verified by `evidence/verifier/2026-11-26/issue-448-owner-export-profile-seal.md`
- Source: backfill from code
- Last verified: d84c704
- Issues: #116, #448, #449, datvt243/resume-nodejs-api#400
- Anchors: `src/pages/dashboard/PageProfile.vue`, `src/models/profile.model.ts`, `src/composables/useActiveProfile.ts`, `src/pages/dashboard/PagePreview.vue`, `src/pages/dashboard/PageInformation.vue`, `src/pages/public/PagePublicResume.vue`, `src/composables/useDownloadCv.ts`, `src/pages/dashboard/PageApplication.vue`, `src/pages/dashboard/PageAtsCheck.vue`

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
   - Server PDF download: not affected today; changes with #448 (Behavior 6–11, draft).

### Owner export with `?profile=` (#448 — draft)
Backend contract (datvt243/resume-nodejs-api#400, PR #455, released v2.8.0): `GET api/v1/download-pdf` and `POST api/v1/cv/ats-check` accept the **query** param `profile=<profile _id>`. One of the caller's own non-deleted profiles → each section filtered to its ids; missing / unknown / deleted / foreign / malformed → unfiltered, no error. Every format and template.
6. "Download CV" — every entry point of the shared flow (header button, account-menu item, Home CV card, ATS check "Download this template"; `cv-preview-export.md` #6, #10) — adds `profile=<id>` to `GET api/v1/download-pdf` when `localStorage.cvActiveProfileId` is non-empty. "All profiles" (empty) → no `profile` param: the request is exactly today's.
7. The id is the one stored **at click time**: switching the profile on Preview or Information, then clicking the header button (which stayed mounted) sends the new id. (Each `useActiveProfile()` call reads localStorage once when created, so a long-lived component's ref goes stale — the download must not rely on it.)
8. A stored id that no longer exists is sent as is; the backend returns the unfiltered CV — the same result Preview shows for an unknown id ("no filter").
9. ATS check "Check" sends `POST api/v1/cv/ats-check` with `profile=<active id>` as a **query** param (body fields `template`/`lang`/`jobDescription` unchanged) when a profile is active; none → no param (`ats-check.md` open question 2, operator answer → #448).
10. Job applications "Download PDF" (`job-applications.md` #5) uses the owner `GET api/v1/download-pdf` with `template=ats`, `profile=<the application's profileId>`, and `lang=en` only when the CV language is English — it works while the CV is private. The public `api/me/<slug>/download-pdf` is no longer used there. It runs through the shared Download CV flow (`useDownloadCv`, Open question 4 → a): the download icon is a `<button>` (same icon, aria-label and title as today), clicking it shows the download overlay with Cancel, the file saves as `<CV file name>_VI|_EN.pdf` (`cv-preview-export.md` #7–8), Bearer header + 401 refresh. It shares the one download state (`cv-preview-export.md` #10): while any download runs, every application's PDF button is disabled and a click is ignored. The application's profile is passed explicitly and wins over the active profile. The button shows under the same condition as today (the application's profile exists and the candidate has a slug or email).
11. "View public CV" on an application is unchanged: it still opens `#/resume/<slug or email>?profile=<id>` and still fails while the CV is private (Open question 5 → a, out of scope for #448).

## Acceptance criteria
- (#448) `npx vitest run src/composables/useDownloadCv.spec.ts` passes and covers: with `localStorage.cvActiveProfileId = 'p1'` the `instanceAxios.get` params contain `profile: 'p1'`; with it empty/absent, params have no `profile` key; setting the key after the composable was created still sends the new id.
- (#448) Live (QA account `qa.full@example.com`, a profile selecting 1 of its experiences active on Preview): header "Download CV" → DevTools Network shows `GET api/v1/download-pdf?profile=<id>`, and the saved PDF contains exactly 1 experience; with "All profiles" the request has no `profile` and the PDF has all experiences. Same for the Home CV card and the ATS check download.
- (#448) Live: ATS check "Check" with a profile active → request URL `api/v1/cv/ats-check?profile=<id>`; with "All profiles" → no query string.
- (#448) Live: on `#/dashboard/application`, an application linked to a profile → "Download PDF" sends `GET api/v1/download-pdf` with `template=ats` and `profile=<that application's profileId>` (not the active profile), and the PDF contains only that profile's entries — also when the CV is private (public `#/resume/<slug>` shows not-found). No request to `api/me/.../download-pdf` is sent from that page; the download overlay (`[role="dialog"][aria-modal="true"]`) appears with Cancel focused, and the file saves as `<CV file name>_VI.pdf` / `_EN.pdf`; Cancel → request canceled, no file, no toast.
- (#448) `npx vitest run src/composables/useDownloadCv.spec.ts` also covers: `download({ template: 'ats', profile: 'p2' })` with `cvActiveProfileId = 'p1'` sends `profile: 'p2'` and `template: 'ats'`.
- `npx vitest run src/composables/useActiveProfile.spec.ts` passes.
- A profile with name `"   "` cannot be saved (required/empty error).
- With a profile that selects 1 of 3 experiences active, Preview shows exactly 1 experience.
- Deleting the active profile → Preview shows all entries and the public link has no `?profile=`.

## Edge cases
- A section with no ticked entries → that section is empty in the filtered preview (not "show all").
- Active profile id not found → no filter.
- (#448) Application profile ≠ active profile → the per-application PDF uses the application's profile; the active one only drives Download CV / ATS check.
- (#448) Active profile set, then the user signs out and another account signs in on the same browser → the stored id belongs to the other account; the backend treats a foreign id as unfiltered (no leak, no error).

## Out of scope
- (#448) "View public CV" per application for a private CV (Open question 5).
- (#448) A profile name in the downloaded file name.
- Skills, Languages and General information per profile (not part of a profile).
- Per-profile theme or language.

## Open questions
1. "Download CV" (server PDF from Header/Home) ignores the active profile, while Preview and the public link apply it. Intended? → **Answer (operator 2026-11-07):** Change: use the owner export with `?profile=` once datvt243/resume-nodejs-api#400 lands — #448
2. Deleting an entry (e.g. an experience) does not remove its id from profiles; the profile summary count then includes the stale id. Intended? → **Answer (operator 2026-11-07):** Bug: count only existing entries — #449
3. New entries added later are never in any profile automatically — a profile silently omits them. Intended? → **Answer (operator 2026-11-07):** Intended
4. (#448) How does the per-application "Download PDF" fetch the owner PDF? (a) Same shared flow as "Download CV" (`useDownloadCv`): the icon becomes a button, the download overlay with Cancel shows, the file saves as `<CV file name>_VI|_EN.pdf`, Bearer header + 401 refresh — this reverses `cv-preview-export.md` Out of scope "the per-profile PDF link in Job applications — not this flow, no overlay". (b) Keep a new-tab link `api/v1/download-pdf?token=<access token>&template=ats&profile=<id>&lang=<l>` — the access token is memory-only and short-lived, so a link rendered before a token refresh fails, and the token lands in the URL / browser history. Analyst leans (a). → **Answer (operator 2026-11-26):** (a) Same shared flow; reverse the cv-preview-export.md out-of-scope line
5. (#448) "View public CV" on an application (opens `#/resume/<slug>?profile=<id>`) still fails while the CV is private; the issue's Expected names only the PDF. (a) Leave it as is (out of scope for #448). (b) Replace it with an owner view: open `#/dashboard/preview` with that application's profile made active. (c) Something else. → **Answer (operator 2026-11-26):** (a) Leave as is — out of scope for #448

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/cv-profiles-spec.md` | - |
| 2026-11-26 | Behavior 6–11 (draft): owner export / ATS check with `?profile=`; Open questions 4–5 | #448 spec, backend #400 released; see `evidence/analyst/2026-11-26/issue-448-owner-export-profile-spec.md` | - |
| 2026-11-26 | Open questions 4–5 answered; Behavior 10–11 finalized (draft until SEAL) | operator answers, see `evidence/analyst/2026-11-26/issue-448-owner-export-profile-spec.md` | - |
