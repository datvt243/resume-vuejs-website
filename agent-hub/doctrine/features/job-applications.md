# Job applications tracker

- Status: verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/job-applications-spec.md`
- Source: backfill from code
- Issues: #423, #427, #447, #448, #450, datvt243/resume-nodejs-api#400, datvt243/resume-nodejs-api#410
- Anchors: `src/pages/dashboard/PageApplication.vue`, `src/models/application.model.ts`, `src/composables/useCandidate.ts`, `src/composables/useDocument.ts`

## Goal
The candidate tracks the jobs they applied to, which CV profile they sent, and where each application stands.

## Behavior
1. `/dashboard/application` lists applications (`GET api/v1/application/`, cached). Empty → empty state with "Add"; load failure → error + retry. The count also appears as the Applications KPI on Home.
2. Each card: company (title), position, applied date `DD/MM/YYYY`, note, a status badge — Applied (grey, also the fallback for unknown statuses), Interview (amber), Offer (green), Rejected (red) — and actions.
3. Form (Add / Edit / Duplicate): company (required, max 100), position (required, max 100), applied date (required, sent as timestamp), status (required select), CV profile (optional select of existing profiles), job link (optional valid URL, max 500), note (optional, max 1000).
4. Save: `POST application/create` or `PUT application/update`; Duplicate creates a new application. If the chosen profile no longer exists, `profileId` is left out of the request (the backend keeps the stored link). Delete: confirm, then `DELETE application/delete/<id>`.
5. When the application's profile exists and the candidate has a slug or email, the card shows the profile name badge plus:
   - "View public CV" → opens `#/resume/<slug or email>?profile=<id>` in a new tab.
   - "Download PDF" → opens `<API>api/me/<slug or email>/download-pdf?template=ats&profile=<id>` in a new tab.
6. "Open job" (only when a job link exists) opens the link in a new tab.

## Acceptance criteria
- `npx vitest run src/pages/dashboard/PageApplication.spec.ts` passes.
- Job link `example` shows the URL error and sends no request.
- An application whose profile was deleted shows no profile badge and no View/Download buttons.
- Status `interview` renders the amber "Interview" badge.

## Edge cases
- Unknown status value → shown as "Applied".
- No slug and no email → no profile links.

## Out of scope
- Reminders, follow-up dates, or status history.
- The owner-only PDF endpoint with profile filtering (backend does not support `?profile=` there yet).

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
