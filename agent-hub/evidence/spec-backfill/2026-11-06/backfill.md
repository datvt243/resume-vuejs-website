# /spec-backfill — 2026-11-06

- Scope: `all` (no `$ARGUMENTS`); branch `chore/agent-hub-analyst`; no code changed, nothing committed.
- Feature list proposed in step 2, confirmed by the operator with changes: Register merged into `auth-login`; header Download merged into `cv-preview-export` (the CV language/file-name logic is documented there once, and `account-settings` points to it); `cv-timeline-sections` and `cv-simple-sections` kept as grouped docs with per-section differences.
- Method: read each page/composable/model/service in full; every anchor and every `npx vitest run` path checked to exist with a shell loop (0 missing). Acceptance criteria use `npm run test` / `npx vitest run <path>` from `doctrine/MEMORY.md`, or an exact observable result.
- Open questions total: 75.

## Docs written (18, all `Status: draft`, `Source: backfill from code`)

- `doctrine/features/auth-login.md`
- `doctrine/features/auth-password-reset.md`
- `doctrine/features/home-overview.md`
- `doctrine/features/public-resume.md`
- `doctrine/features/personal-information.md`
- `doctrine/features/general-information.md`
- `doctrine/features/cv-skills.md`
- `doctrine/features/cv-languages.md`
- `doctrine/features/cv-timeline-sections.md`
- `doctrine/features/cv-simple-sections.md`
- `doctrine/features/cv-profiles.md`
- `doctrine/features/cv-preview-export.md`
- `doctrine/features/job-applications.md`
- `doctrine/features/import-cv.md`
- `doctrine/features/ats-check.md`
- `doctrine/features/cv-visits.md`
- `doctrine/features/account-settings.md`
- `doctrine/features/app-theme.md`

## Features skipped

- Already indexed: none (INDEX.md had no rows).
- Trimmed by the operator: 404 page (`src/pages/notFound/NotFound.vue`), backend wake-up on cold start (`src/services/wakeServer.ts`).
- Merged rather than separate docs: Register (into `auth-login`), header Download CV (into `cv-preview-export`).

## Open questions per doc

### auth-login.md (7)

1. "Remember me" is shown but its value is never used — the session is always tab-scoped. Intended placeholder, or should it change token storage?
2. Register (and forgot/reset) toast on failure reads only `err.message`; the newer API envelope puts the reason in `error.message`, so the toast may be empty. Login already handles both. Should register use the same logic?
3. Register sends the email untrimmed while login trims it. Intended?
4. When the silent refresh fails, `logOut()` is called without a router, so local state is cleared but the page does not move to `/login` until the next navigation. Intended?
5. Login has no link to Register (only the header has one). Intended?
6. "View API" picks a localhost base only when `window.location.host === 'localhost'`; a dev server on a port (`localhost:5173`) never matches. Intended?
7. Successful login always goes to `/dashboard/information`, not to the page the user first tried to open. Intended?

### auth-password-reset.md (4)

1. Error toast reads only `err.message`; the newer API envelope puts the reason in `error.message`, so the toast may be empty. Should it match login's handling?
2. Without a token, the form is still submittable and sends `token: undefined`. Should the form be hidden or disabled?
3. The page's source comment says the UI must disclose that no real email is sent, but the shown description ("Enter your registered email to receive a password reset link.") does not. Should it?
4. Signed-in users can open both pages (no redirect, unlike `/login` and `/register`). Intended?

### home-overview.md (4)

1. Completion counts 8 sections; Skills and Languages are not counted. Intended?
2. KPI and chart numbers always use `vi-VN` formatting, even when the app language is English. Intended?
3. The code notes "backend has no avatar field yet" — the avatar here only appears once the backend sends `avatar`. Is that still the state? (Information page's avatar block is "coming soon".)
4. The Classic/ATS template choice resets to Classic on every visit and is not shared with the header's Download button (which uses no template). Intended?

### public-resume.md (3)

1. The layout has no Skills or Languages section, so the public CV never shows them. Intended?
2. The visitor's own visit is recorded on every load, including reloads and the owner viewing their own link. Is deduplication expected (frontend or backend)?
3. Education, Projects, Awards and Certificates render in API order; only Experience is sorted newest-first. The dashboard has manual ordering for Education/Experience/Project — should the public page honour it?

### personal-information.md (6)

1. Gender/marital are sent as `!!value`. If the select yields the string `"0"`, `!!"0"` is `true`, so Female/Single would save as Male/Married. Is the select value a number or a string here — and should the conversion be `value == 1`?
2. When the candidate id is missing, a red "generic error" toast shows but the update request is still sent. Should it stop?
3. Social link fields have no URL validation. Intended?
4. Birthday: if empty, `+new Date('')` is `NaN`. Is birthday required (and does `defaultDate` enforce it)?
5. The link is shown as text only — there is no "copy" button. Intended?
6. Slug uniqueness is checked only by the backend; the error shown is whatever the backend returns. Fine?

### general-information.md (3)

1. Desired salary is required (and must be positive), so a candidate cannot save without stating a salary. Intended?
2. "Remote" is listed as an employment type alongside Full-time/Part-time, though it is a work arrangement. Intended?
3. Career is a single text input but stored bilingual — there is no English input, so every save sends `career.en = ''` (wiping any English value set elsewhere, e.g. by import). Intended?

### cv-skills.md (5)

1. Main/familiar skills are stored by name. Renaming or deleting a skill (or deleting its group) does not update `mainSkills`/`familiarSkills`, which can then hold names that no longer exist. Intended?
2. If the general-information document has no `_id` yet (new account that never saved General information), add/delete returns silently with no message. Intended?
3. Typing `delete` is required to remove one skill, but deleting a whole group (with all its skills) only needs a normal confirm. Intended?
4. The typed confirm word is always the English `delete`, even in the Vietnamese UI. Intended?
5. Skills are not rendered anywhere on the CV layout. Should they be?

### cv-languages.md (3)

1. Edit mode has no way to edit an existing language (only add and delete) — the table rows are not clickable here. Intended?
2. Adding a language when the general-information document has no `_id` yet returns silently. Intended?
3. Languages are not shown on the CV layout or counted in profile completion. Intended?

### cv-timeline-sections.md (6)

1. The manual order is per browser only and is not used by the CV preview, public page or PDF (they sort by date / API order). Is the manual order meant to affect the CV?
2. Newly saved or duplicated entries are appended to the end of the list until reload (the date sort runs only on load). Intended?
3. Reordering is mouse drag only (HTML5 drag events) — no keyboard or touch alternative. Is that acceptable?
4. Only Experience has the read-only "View" modal. Should Education and Project get one?
5. End date is sent as a timestamp even when "current" is checked (empty date becomes `NaN`/`0`). Should it be `null`?
6. Education requires a major of at least 3 characters (e.g. "IT" is rejected). Intended?

### cv-simple-sections.md (4)

1. An award requires a link and a description — awards without a URL cannot be saved. Intended?
2. Award/certificate lists are sorted by `startDate` on load, but awards have only `issueDate`, so their order is effectively the API order. Should awards sort by issue date?
3. Reference has no email field, only phone. Intended?
4. Reference is a table while Award/Certificate are cards. Intended difference?

### cv-profiles.md (3)

1. "Download CV" (server PDF from Header/Home) ignores the active profile, while Preview and the public link apply it. Intended?
2. Deleting an entry (e.g. an experience) does not remove its id from profiles; the profile summary count then includes the stale id. Intended?
3. New entries added later are never in any profile automatically — a profile silently omits them. Intended?

### cv-preview-export.md (6)

1. "Export PDF" here prints the browser preview (theme + profile applied), while "Download CV" fetches a server PDF that gets no theme and no profile. The two PDFs can differ. Intended?
2. The layout has no Skills or Languages section, so neither appears in the preview, the print or the JSON's layout data. Intended?
3. Theme and active profile are per-page refs (not shared live like the CV language): changing them on one page does not update another open page until it re-mounts. Intended?
4. JSON export is always `resume.json` (no name, no language suffix), unlike the PDF. Intended?
5. Home's Classic/ATS template choice exists only on Home; the header button always downloads Classic. Intended?
6. The header Download button is hidden below the `sm` breakpoint, and the account menu has no download entry — no download on small phones except via Home. Intended?

### job-applications.md (4)

1. The per-application PDF and public CV go through the PUBLIC endpoints, so they only work while the CV is public (code shortcut note). For a private CV both links fail. Acceptable until the backend's owner `download-pdf` supports `?profile=`?
2. The per-application PDF is always the ATS template and never passes the CV language (`lang`). Intended?
3. The list is not sorted by applied date (the shared sort uses `startDate`, which applications don't have) — order is the API's. Should it sort newest applied first?
4. Same `window.location.host === 'localhost'` check as the header (never true with a port), so dev always uses the real API host. Intended?

### import-cv.md (5)

1. The 5MB PDF limit is only in the hint text; the browser does not check file size before uploading. Should it?
2. No duplicate detection: importing the same file twice lets the user add the same entries again. Intended?
3. Imported experiences skip the career-break normalisation the Experience page applies (`careerBreakPayload`). Can a parsed item be a career break, and should it be normalised?
4. JSON Resume also carries projects, skills, languages, awards and certificates — only education and experience are offered. Intended scope?
5. Route and file are named "import-linkedin" while the feature covers three sources. Rename, or keep for link stability?

### ats-check.md (3)

1. Check messages are shown exactly as the API returns them. Are they localized by the backend for `lang`, or always in one language?
2. The check runs on the full CV — the active CV profile is not sent. Should it check the profile-filtered CV?
3. The job description has no length limit on the client. Is there a backend limit the UI should show?

### cv-visits.md (5)

1. The table shows the IP address of every visitor. Is showing raw IPs to the CV owner intended (privacy)?
2. If the API paginates `GET candidate/visits`, the table only shows the first page while the "all-time" hint uses `meta.total`. Does the endpoint return all visits?
3. Dates and numbers always use `vi-VN` formatting, even in the English UI. Intended?
4. "Delete all" has a normal confirm only, though it cannot be undone. Should it require typing, like skill deletion?
5. The cached visit list is loaded once per session; new visits appear only after a reload or a retry. Intended?

### account-settings.md (3)

1. Deleting the account uses the normal confirm dialog, while deleting a single skill requires typing `delete`. Should account deletion require typing (or the password)?
2. App language is only switchable here; signed-out pages (login/register) have no language switch. Intended?
3. Email and password "coming soon" buttons — is there a backend issue to link, so they are not forgotten?

### app-theme.md (1)

1. Once the user toggles, the OS preference is never followed again (no way back to "system"). Intended?

