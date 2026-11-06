# doctrine/features/INDEX.md — feature docs

> One row per feature. Look a feature up here by area/files, then open
> only that one doc. `status`: `draft` = not yet confirmed (intent, not
> truth) · `verified` = a SEALED node implemented it, or the operator
> confirmed a backfilled doc (every open question answered).
> Every `<slug>.md` here uses the format below exactly — whoever writes
> it (analyst, or another agent doing a bulk backfill: always `Status:
> draft`, `Source: backfill from code`).

| Feature | Doc | Status | Area / anchors | Issues |
|---|---|---|---|---|
| Sign in, register, sign out, route guard | auth-login.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/auth-login-spec.md` | auth / `src/pages/auth/PageLogin.vue`, `PageRegister.vue`, `src/services/auth.ts`, `src/stores/auth.ts`, `src/routers/index.ts` | #422, #424, #425, #426, #427, #428 |
| Forgot / reset password | auth-password-reset.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/auth-password-reset-spec.md` | auth / `src/pages/auth/PageForgotPassword.vue`, `PageResetPassword.vue` | #61, #422, #429, #430 |
| Home overview | home-overview.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/home-overview-spec.md` | home / `src/pages/home/PageHome.vue`, `src/composables/useProfileCompletion.ts` | #59, #440, #455 |
| Public resume share link | public-resume.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/public-resume-spec.md` | public / `src/pages/public/PagePublicResume.vue`, `src/components/cv/CvResumeLayout.vue` | #56, #116, #117, #119, #182, #440, #442, #453, datvt243/resume-nodejs-api#399, datvt243/resume-nodejs-api#413 |
| Personal information, social links, public link + QR | personal-information.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/personal-information-spec.md` | dashboard / `src/pages/dashboard/PageInformation.vue`, `src/models/information.model.ts` | #63, #116, #117, #119, #182, #432, #433, #434, #436 |
| General information (job preferences) | general-information.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/general-information-spec.md` | dashboard / `src/pages/dashboard/PageGeneralInformation.vue`, `src/models/generalInformation.model.ts` | - |
| Skills | cv-skills.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-skills-spec.md` | dashboard / `src/pages/dashboard/PageSkills.vue`, `src/components/PickedSkills.vue` | #437, #438, #439, #440 |
| Foreign languages | cv-languages.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-languages-spec.md` | dashboard / `src/pages/dashboard/PageLanguages.vue` | #438, #440, #441 |
| Timeline sections: Experience, Education, Project | cv-timeline-sections.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-timeline-sections-spec.md` | dashboard / `src/pages/dashboard/Page{Experience,Education,Project}.vue`, `src/composables/useManualOrder.ts` | #57, #60, #402, #442, #443, #444, #445, #446, datvt243/resume-nodejs-api#413, datvt243/resume-nodejs-api#414 |
| Simple list sections: Award, Certificate, Reference | cv-simple-sections.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-simple-sections-spec.md` | dashboard / `src/pages/dashboard/Page{Award,Certificate,Reference}.vue` | #60, #446, #447, datvt243/resume-nodejs-api#414 |
| CV profiles (named variants) | cv-profiles.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-profiles-spec.md` | dashboard / `src/pages/dashboard/PageProfile.vue`, `src/composables/useActiveProfile.ts` | #116, #448, #449, datvt243/resume-nodejs-api#400 |
| CV preview, theme, language and export (incl. Download CV) | cv-preview-export.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-preview-export-spec.md` | dashboard / `src/pages/dashboard/PagePreview.vue`, `src/composables/useDownloadCv.ts`, `useCvTheme.ts`, `useCvLang.ts` | #55, #116, #119, #182, #440, #448, #451, #452 |
| Job applications tracker | job-applications.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/job-applications-spec.md` | dashboard / `src/pages/dashboard/PageApplication.vue`, `src/models/application.model.ts` | #423, #427, #447, #448, #450, datvt243/resume-nodejs-api#400, datvt243/resume-nodejs-api#410 |
| Import CV (LinkedIn export, PDF, JSON Resume) | import-cv.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/import-cv-spec.md` | dashboard / `src/pages/dashboard/PageImportLinkedin.vue`, `src/utilities/jsonResume.ts` | #457 |
| ATS check | ats-check.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/ats-check-spec.md` | dashboard / `src/pages/dashboard/PageAtsCheck.vue`, `src/types/ats.type.ts` | #159, #448, datvt243/resume-nodejs-api#400, datvt243/resume-nodejs-api#407 |
| Visit analytics | cv-visits.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/cv-visits-spec.md` | dashboard / `src/pages/dashboard/PageVisits.vue`, `src/composables/useVisits.ts`, `useVisitStats.ts` | #454, #455, #456, datvt243/resume-nodejs-api#396 |
| Account settings and app language | account-settings.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/account-settings-spec.md` | dashboard / `src/pages/dashboard/PageAccountSettings.vue`, `src/i18n/index.ts` | #63, #182, #431, datvt243/resume-nodejs-api#412 |
| App dark / light theme | app-theme.md | verified — confirmed by operator 2026-11-07, see `evidence/analyst/2026-11-07/app-theme-spec.md` | shell / `src/composables/useTheme.ts`, `src/pages/_layouts/Header.vue` | #62 |

## Doc format — `doctrine/features/<slug>.md`
~~~markdown
# <Feature name>

- Status: draft | verified — verified by `<verdict note path>` | verified —
  confirmed by operator <date>, see `<analyst note path>`
- Source: feature request | backfill from code
- Issues: #<n>[, #<n>...]
- Anchors: `<path>`, `<path>` (real paths, grep-confirmed)

## Goal
<1-3 lines: who needs this and why>

## Behavior
<numbered, observable rules: "when X, the system does Y". This is the
spec a fix is checked against.>

## Acceptance criteria
<each one measurable: a test command from doctrine/MEMORY.md, or an exact
observable result. Copied onto the diagram node by pick_next.>

## Edge cases
<input/state → expected result>

## Out of scope
<what this feature deliberately does NOT do>

## Open questions
<none, or each question + the operator's answer once given>

## Changelog
| Date | Change | Why | Node |
|---|---|---|---|
~~~
