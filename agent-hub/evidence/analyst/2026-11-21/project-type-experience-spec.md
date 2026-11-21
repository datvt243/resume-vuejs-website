# 2026-11-21 - project-type-experience — analyst spec
- Worker: analyst · Version: 0.1.0 · Recipe: spec_feature (spec mode)
- Outcome: needs_input (Q8–13) → spec_ready after round 2

## Task (verbatim)
GitHub #401 "feat(project): phân loại project company/personal và chọn Experience liên kết" — add `type` (Company/Personal, default personal) and `experienceId` (select from candidate's Experiences, shown + required only when company, null when personal); display group/badge by type and the linked Experience company/position (PagePreview / CV layout / jsonResume if fitting); i18n vi/en. AC: company requires Experience, personal hides it; legacy project without type shows as personal; API 4xx (invalid Experience) shown on the right field; tests for model/form. Depends on datvt243/resume-nodejs-api#361.

## Doc path
`doctrine/features/cv-timeline-sections.md` — UPDATED (Project already lives here): Behavior #10, #401 acceptance rows, edge cases, out of scope, Q8–13, Changelog row. INDEX row: added #401.

## Sources read
- Hub: `haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}`, `doctrine/domains/PROJECT.md`, `doctrine/MEMORY.md`, `doctrine/features/{INDEX.md,cv-timeline-sections.md}`, `.claude/CLAUDE.md` (i18n rules).
- Backend (gh): `gh pr view/diff 366 -R datvt243/resume-nodejs-api` (model, Joi `project.validate.ts`, `project.service.ts` checkExperienceLink, locales, tests); `src/errors/AppError.ts` (ErrorDetail `{field,message}` in `error.details`), `src/locales/vi.ts` on main.
- Code: `src/models/project.model.ts`, `src/models/application.model.ts` (runtime `profileId` options), `src/pages/dashboard/PageApplication.vue`, `src/models/experience.model.ts` (`showIf`, `experienceTitle`), `src/types/model.type.ts` (`showIf`), `src/components/veevalidate/VeeForm.vue` (hiddenByCondition), `src/pages/dashboard/PageProject.vue`, `src/components/project/ProjectItem.vue`, `src/components/cv/CvResumeLayout.vue`, `src/pages/dashboard/PagePreview.vue` (filterByProfile), `src/utilities/jsonResume.ts`, `src/services/base.ts` (errors → toast only), `src/composables/useDocument.ts`.

## Key contract facts (from backend, not guessed)
- Field names = issue proposal: `type` (`company`|`personal`, default personal), `experienceId` (ObjectId, null; not populated in GET).
- Ownership failure → 400 BAD_REQUEST, message only, no field details. Joi failure → 400 VALIDATION_ERROR with `details[{field}]`.
- Frontend has no server-error → field mapping anywhere today.

## Questions + answers
Q8 grouping/badge surfaces · Q9 linked-Experience text · Q10 field-level error approach (backend has no field) · Q11 missing linked Experience on CV · Q12 JSON Resume `entity`/`type` mapping · Q13 exclude career breaks + option label — all pending (see doc).

## Isolation proof
Fresh Agent-tool subagent spawned as analyst for #401 with only the issue text, the dependency status and repo paths; no implementer reasoning or diff seen; contract read directly from the backend repo via gh.

## Round 2 — operator answers (2026-11-21, via coordinator)
8 c) dashboard badge only · 9 card shows linked company · position · 10 a) BAD_REQUEST on company save → experienceId field, no toast; VALIDATION_ERROR details → field · 11 Company badge + muted "Experience removed" · 12 no export change · 13 exclude career breaks, label "Company — Position".
Recorded in the doc; Behavior #10 + acceptance updated. Earlier unchecked point (public CV/PDF returning experienceId) is moot — CV display out of scope.
- Outcome: spec_ready
