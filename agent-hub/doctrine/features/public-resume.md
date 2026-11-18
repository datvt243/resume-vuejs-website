# Public resume share link

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/public-resume-spec.md`
- Source: backfill from code
- Issues: #56, #116, #117, #119, #182, #440, #442, #453, datvt243/resume-nodejs-api#399, datvt243/resume-nodejs-api#413
- Anchors: `src/pages/public/PagePublicResume.vue`, `src/components/cv/CvResumeLayout.vue`, `src/routers/index.ts`, `src/composables/useCvTheme.ts`, `src/composables/useCvLang.ts`

## Goal
Anyone with the candidate's share link can read their CV without an account — e.g. a recruiter opening it from an application.

## Behavior
1. Route `/resume/:slug` has no login requirement. The page shell follows the viewer's own login state (signed-in viewers see the dashboard shell, others the auth shell).
2. On load (and again whenever only the slug changes) the page shows a pulsing skeleton and calls `GET api/me/<slug>` (no `api/v1/` prefix, no toast). The backend resolves the value as a vanity slug first, then as an email.
3. Query params on the link:
   - `?profile=<id>` → forwarded to the API, which filters each section to that CV profile (falls back to unfiltered on an invalid id).
   - `?lang=en` → forwarded to the API and used for the layout's fixed labels; anything else means Vietnamese.
   - `?theme=classic|modern|compact` → layout theme; any other value means `classic`. Not sent to the API.
4. Response without `success` or `data`, or any request error → a "not found" block with a description. A private profile and a missing one look the same.
5. On success the CV renders through the shared `CvResumeLayout` (the same component the dashboard Preview uses): name, desired position, phone · address · email, introduction, General information, Education, Experience (newest start date first), Projects, Awards, Certificates, References. Empty sections are hidden. Rich-text fields are sanitized before rendering.
6. After a successful load the page records a visit: `POST api/me/<slug>/visit` with `document.referrer`. Fire-and-forget — a failure never affects what is shown.

## Acceptance criteria
- `npx vitest run src/pages/public/PagePublicResume.spec.ts` passes.
- `npx vitest run src/components/cv/CvResumeLayout.spec.ts` passes.
- Signed out, opening `#/resume/<existing-public-slug>` shows the CV, not `/login`.
- `#/resume/<unknown>` shows the "not found" block and sends no visit POST.
- `#/resume/<slug>?theme=bogus` renders with the `cv-theme-classic` class.

## Edge cases
- Old link using an email instead of a slug → still works (backend fallback).
- Profile set to private → "not found", same as missing.
- Slug changes without leaving the page → data reloads.

## Out of scope
- Server-side theme storage (the theme travels only in the URL).
- Showing visit stats to the visitor.
- Generating or copying the link (see `personal-information.md`).

## Open questions
1. The layout has no Skills or Languages section, so the public CV never shows them. Intended? → **Answer (operator 2026-11-07):** Change — #440
2. The visitor's own visit is recorded on every load, including reloads and the owner viewing their own link. Is deduplication expected (frontend or backend)? → **Answer (operator 2026-11-07):** Dedup within 24h is backend datvt243/resume-nodejs-api#399; Change: no visit when the viewer is the owner — #453
3. Education, Projects, Awards and Certificates render in API order; only Experience is sorted newest-first. The dashboard has manual ordering for Education/Experience/Project — should the public page honour it? → **Answer (operator 2026-11-07):** Change: Education/Project use the stored manual order (#442, datvt243/resume-nodejs-api#413); Experience keeps date order

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/public-resume-spec.md` | - |
