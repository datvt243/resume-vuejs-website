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
| Sign in, register, sign out, route guard | auth-login.md | draft | auth / `src/pages/auth/PageLogin.vue`, `PageRegister.vue`, `src/services/auth.ts`, `src/stores/auth.ts`, `src/routers/index.ts` | - |
| Forgot / reset password | auth-password-reset.md | draft | auth / `src/pages/auth/PageForgotPassword.vue`, `PageResetPassword.vue` | #61 |
| Home overview | home-overview.md | draft | home / `src/pages/home/PageHome.vue`, `src/composables/useProfileCompletion.ts` | #59 |
| Public resume share link | public-resume.md | draft | public / `src/pages/public/PagePublicResume.vue`, `src/components/cv/CvResumeLayout.vue` | #56, #116, #117, #119, #182 |
| Personal information, social links, public link + QR | personal-information.md | draft | dashboard / `src/pages/dashboard/PageInformation.vue`, `src/models/information.model.ts` | #63, #116, #117, #119, #182 |
| General information (job preferences) | general-information.md | draft | dashboard / `src/pages/dashboard/PageGeneralInformation.vue`, `src/models/generalInformation.model.ts` | - |
| Skills | cv-skills.md | draft | dashboard / `src/pages/dashboard/PageSkills.vue`, `src/components/PickedSkills.vue` | - |
| Foreign languages | cv-languages.md | draft | dashboard / `src/pages/dashboard/PageLanguages.vue` | - |
| Timeline sections: Experience, Education, Project | cv-timeline-sections.md | draft | dashboard / `src/pages/dashboard/Page{Experience,Education,Project}.vue`, `src/composables/useManualOrder.ts` | #57, #60 |
| Simple list sections: Award, Certificate, Reference | cv-simple-sections.md | draft | dashboard / `src/pages/dashboard/Page{Award,Certificate,Reference}.vue` | #60 |
| CV profiles (named variants) | cv-profiles.md | draft | dashboard / `src/pages/dashboard/PageProfile.vue`, `src/composables/useActiveProfile.ts` | #116 |
| CV preview, theme, language and export (incl. Download CV) | cv-preview-export.md | draft | dashboard / `src/pages/dashboard/PagePreview.vue`, `src/composables/useDownloadCv.ts`, `useCvTheme.ts`, `useCvLang.ts` | #55, #116, #119, #182 |
| Job applications tracker | job-applications.md | draft | dashboard / `src/pages/dashboard/PageApplication.vue`, `src/models/application.model.ts` | - |
| Import CV (LinkedIn export, PDF, JSON Resume) | import-cv.md | draft | dashboard / `src/pages/dashboard/PageImportLinkedin.vue`, `src/utilities/jsonResume.ts` | - |
| ATS check | ats-check.md | draft | dashboard / `src/pages/dashboard/PageAtsCheck.vue`, `src/types/ats.type.ts` | #159 |
| Visit analytics | cv-visits.md | draft | dashboard / `src/pages/dashboard/PageVisits.vue`, `src/composables/useVisits.ts`, `useVisitStats.ts` | - |
| Account settings and app language | account-settings.md | draft | dashboard / `src/pages/dashboard/PageAccountSettings.vue`, `src/i18n/index.ts` | #63, #182 |
| App dark / light theme | app-theme.md | draft | shell / `src/composables/useTheme.ts`, `src/pages/_layouts/Header.vue` | #62 |

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
