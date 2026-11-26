# Job applications tracker

- Status: verified — verified by `evidence/verifier/2026-11-25/issue-423-application-accepted-status-seal.md` (Behavior 7-9, #423); Behavior 1-6 verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/job-applications-spec.md`
- Source: backfill from code
- Issues: #423, #427, #447, #448, #450, datvt243/resume-nodejs-api#400, datvt243/resume-nodejs-api#410
- Anchors: `src/pages/dashboard/PageApplication.vue`, `src/models/application.model.ts`, `src/composables/useCandidate.ts`, `src/composables/useDocument.ts`, `src/services/base.ts`, `src/i18n/index.ts`
- Last verified: c37845b

## Goal
The candidate tracks the jobs they applied to, which CV profile they sent, and where each application stands.

## Behavior
1. `/dashboard/application` lists applications (`GET api/v1/application/`, cached), newest `appliedDate` first, re-sorted after each save. Empty → empty state with "Add"; load failure → error + retry. The count also appears as the Applications KPI on Home.
2. Each card: company (title), position, applied date `DD/MM/YYYY`, note, a status badge — Applied (grey, also the fallback for unknown statuses), Interview (amber), Offer (green), Accepted (#423, see 7), Rejected (red) — and actions.
3. Form (Add / Edit / Duplicate): company (required, max 100), position (required, max 100), applied date (required, sent as timestamp), status (required select), CV profile (optional select of existing profiles), job link (optional valid URL, max 500), note (optional, max 1000).
4. Save: `POST application/create` or `PUT application/update`; Duplicate creates a new application. If the chosen profile no longer exists, `profileId` is left out of the request (the backend keeps the stored link). Delete: confirm, then `DELETE application/delete/<id>`.
5. When the application's profile exists and the candidate has a slug or email, the card shows the profile name badge plus:
   - "View public CV" → opens `#/resume/<slug or email>?profile=<id>` in a new tab.
   - "Download PDF" → opens `<API>api/me/<slug or email>/download-pdf?template=ats&profile=<id>&lang=<CV language>` in a new tab (language = the shared CV language setting, `useCvLang`).
   - *(#448 — draft)* "Download PDF" moves to the owner `GET api/v1/download-pdf` (works for a private CV) — via the shared Download CV flow (overlay, Cancel, `<CV file name>_VI|_EN.pdf`); "View public CV" unchanged — spec in `cv-profiles.md` Behavior 10–11.
6. "Open job" (only when a job link exists) opens the link in a new tab.
7. (#423) Status `accepted`: label `option.applicationStatus.accepted` in both `vi` and `en`, and a card badge (dot + subtle background, DESIGN.md §5.6) whose color differs from the other four statuses (still free: `info`, `accent`).
8. (#423) The status select offers only the transitions the backend allows (datvt243/resume-nodejs-api#410) from the **saved** status of the record being edited (not the value currently picked in the form). Rank: applied 0 < interview 1 < offer 2.
   - Add and Duplicate (both send `POST application/create`): all five statuses.
   - Edit, saved `applied`: applied, interview, offer, rejected.
   - Edit, saved `interview`: interview, offer, rejected.
   - Edit, saved `offer`: offer, accepted, rejected.
   - Edit, saved `accepted` or `rejected`: the select is disabled and shows the saved status; saving the other fields re-sends the same status (allowed).
   - Options keep the model order: applied, interview, offer, accepted, rejected.
9. (#423) When the backend answers a save with 400 (e.g. an invalid transition), the error toast shows the backend's message, the modal stays open, and the list is unchanged. (Already true via `handleBase` → `_helper.error`; must keep working.)

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageApplication.spec.ts` passes.
- Job link `example` shows the URL error and sends no request.
- An application whose profile was deleted shows no profile badge and no View/Download buttons.
- Status `interview` renders the amber "Interview" badge.
- (#423) `npx vitest run src/pages/dashboard/PageApplication.spec.ts` covers: status `accepted` renders the `option.applicationStatus.accepted` label in a badge class different from offer/rejected/interview/applied; the status field's options for Add, Duplicate of an `offer` record, and Edit of each saved status equal the lists in Behavior 8; the status field is `disabled` when editing an `accepted` or `rejected` record and not disabled otherwise.
- (#423) `vi.accepted` and `en.accepted` exist under `option.applicationStatus` in `src/i18n/index.ts` (grep shows both).
- (#423) `npm run build` and `npm run lint` exit 0.
- (#423) Manual (QA account): edit an `interview` application → select shows only Interview / Offer / Rejected; a 400 from `PUT application/update` shows its message in the danger toast and the modal stays open.

## Edge cases
- Unknown status value → shown as "Applied".
- No slug and no email → no profile links.
- (#423) Edit of a record whose saved status is unknown/legacy → treated as `applied` (same fallback as the badge): options applied, interview, offer, rejected.
- (#423) Picking a different status in the form, then re-opening another record → options follow that record's saved status, not the previous pick.
- (#423) Edit a final (`accepted`/`rejected`) record → company/note/etc. still editable and saveable.

## Out of scope
- Reminders, follow-up dates, or status history.
- (#423) Undoing a final status ("unreject") — backend forbids it; workaround is delete + re-create (resume-nodejs-api#410).
- (#423) Client-side yup rule for transitions — the select restricts the choice; the backend is the authority.
- *(#448)* "View public CV" for a private CV.

## Open questions
1. The per-application PDF and public CV go through the PUBLIC endpoints, so they only work while the CV is public (code shortcut note). For a private CV both links fail. Acceptable until the backend's owner `download-pdf` supports `?profile=`? → **Answer (operator 2026-11-07):** Change: owner endpoint once datvt243/resume-nodejs-api#400 lands — #448
2. The per-application PDF is always the ATS template and never passes the CV language (`lang`). Intended? → **Answer (operator 2026-11-07):** Bug: pass the CV language — #450
3. The list is not sorted by applied date (the shared sort uses `startDate`, which applications don't have) — order is the API's. Should it sort newest applied first? → **Answer (operator 2026-11-07):** Bug: newest applied first — #447
4. Same `window.location.host === 'localhost'` check as the header (never true with a port), so dev always uses the real API host. Intended? → **Answer (operator 2026-11-07):** Bug — #427

Note (operator 2026-11-07): follow-up — add status `accepted` + status transition rules — #423 (backend datvt243/resume-nodejs-api#410).

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
| 2026-11-06 | Backfilled from code | /spec-backfill | - |
| 2026-11-07 | Operator confirmed Behavior + answered all open questions; Status → verified | analyst backfill re-check, see `evidence/analyst/2026-11-07/job-applications-spec.md` | - |
| 2026-11-15 | Behavior #1: sorted by `appliedDate`, newest first | #447 (operator answer to open question 3) | `issue-443-list-date-sort` |
| 2026-11-21 | Behavior #5: PDF link passes `lang` from the shared CV language | #450 (operator answer to open question 2) | `issue-427-450-dev-host-pdf-lang` |
| 2026-11-25 | Behavior 7-9 + criteria / edge cases / out of scope for status `accepted` and allowed transitions; Status → draft until the node SEALs | #423 (backend datvt243/resume-nodejs-api#410, closed) | - |
| 2026-11-26 | Behavior #5 (draft): per-application PDF via owner export | #448, see `cv-profiles.md` | - |
