# 2026-11-21 - general-information-salary-range (analyst, spec)
- Worker: analyst · Version: 0.1.0 · Recipe: spec_feature.md (spec mode)
- Branch at read time: feature/issue-403-salary-range

## Task (verbatim)
GitHub #403 "feat(general-information): nhập/hiển thị mức lương mong muốn dạng từ – đến" — replace `salaryDesired` with two currency fields From/To; yup `To >= From`; display "1.000 – 2.000" / "Từ 1.000" / "Đến 2.000" on info page / preview / CV; i18n vi/en. AC: range entry with `To < From` error on the form; API 400 shown on the right field; legacy single value displays correctly; tests for the new model/form. Dependency: datvt243/resume-nodejs-api#362 (closed, PR #367, v2.6.0).

## Doc
`doctrine/features/general-information.md` — UPDATED (existing verified doc; new Behavior #5 marked `#403 — draft`, ACs, edge cases, out-of-scope lines, open questions 4–6, changelog row). INDEX row: Issues column now `#403, datvt243/resume-nodejs-api#362`.

## Already implemented?
No. `git log --all -i --grep=salary` → nothing. `grep -rn -i salary src` → only `src/models/generalInformation.model.ts:102` (single `salaryDesired`), `FrmCurrency.vue:44` comment, `useProfileCompletion.spec.ts:55` fixture, i18n `field.salaryDesired` / `validation.salaryPositive`. No From/To anywhere.

## Sources read
- agent-hub: `doctrine/domains/PROJECT.md`, `doctrine/MEMORY.md`, `doctrine/features/INDEX.md`, `doctrine/features/general-information.md`, `doctrine/features/cv-timeline-sections.md` (format of a feat update on a verified doc, #401)
- code: `src/models/generalInformation.model.ts`, `src/components/veevalidate/part/FrmCurrency.vue`, `src/components/veevalidate/VeeForm.vue` (schema = `yup.object` of all fields → `yup.ref` usable), `src/pages/dashboard/PageGeneralInformation.vue`, `src/services/base.ts` (`_helper.error`, `onError` skip-toast hook), `src/pages/dashboard/PageProject.vue` (`experienceErrorOf` field-mapping pattern), `src/types/api.type.ts`, `src/composables/useProfileCompletion.ts` (required-field completion), `src/components/cv/CvResumeLayout.vue` (no salary line), `src/i18n/index.ts` (lines 154, 197, 685, 728)
- backend: `gh pr view 367 -R datvt243/resume-nodejs-api --json title,body,files,mergedAt,state` (merged 2026-11-05); `gh pr diff 367` (validate.ts, model.ts, swagger, locales, tests, implementer plan + verifier seal notes); `gh search code salary -R datvt243/resume-nodejs-api` (no hit in public/PDF/ATS services); `gh api .../compare/v2.5.0...v2.6.0` (commit in v2.6.0); tags up to v2.11.0.

## Backend contract (summary)
`salaryDesiredFrom`/`salaryDesiredTo`: Number ≥ 0 or null, default null, both optional; `To ≥ From` only when From is a number → `400 VALIDATION_ERROR`, `details[].field = 'salaryDesiredTo'`. Legacy stored `salaryDesired` → `pre('init')` returns From = To (no migration). Legacy input `salaryDesired` → mapped to From = To only when neither range key is in the body, always stripped (marked `shortcut:` for removal once the Vue client sends the range). No PDF/DOCX/ATS prints salary.

## Findings worth flagging
- `FrmCurrency.vue` `_handleChange` → `handleChange(+number)`: an emptied input becomes `0`, which breaks an optional end. Recorded as edge case.
- Save must send both range keys (null when empty): omitting them while a stale `salaryDesired` is present makes the backend resurrect it.
- The issue's "display on preview / CV" conflicts with the operator-confirmed Out of scope of this doc (salary deliberately not on the CV) → failure branch "contradicts a verified doc" → question 5.

## Questions + answers
4. Required rule: both / at least one / none? → operator 2026-11-21: (a) both From and To required
5. Where to display read-only? → operator 2026-11-21: (b) dashboard only (form page or Home profile strip), CV unchanged. Analyst picked the Home profile strip: the form page already shows the range in its two inputs (a read-only copy there is redundant); the Home strip is the only read-only dashboard spot showing job preferences (`PageHome.vue:39` position, `:40` openToWork) and already has `numberFormat` = `Intl.NumberFormat(uiLocale)` (`PageHome.vue:24`). `home-overview.md` Behavior #2 got a matching draft line + changelog row; INDEX Home row Issues += #403.
6. From = To display → operator 2026-11-21: (a) single number "1.500" — also for a new entry with equal ends

## Isolation proof
Fresh Agent-tool subagent spawned by the main session with only the issue text and the instruction to run spec_feature.md; no implementer reasoning or diff in context (none exists on this branch; `git status` showed only `.claude/skills/todo/SKILL.md` modified).

## Pass 2 (2026-11-21, answers applied)
- `general-information.md`: Behavior #5c (both required), #5d (both keys always numbers), #5f (Home strip location + reason), #5g (format incl. From = To → one number); ACs, edge cases, Out of scope re-confirmed; open questions 4–6 answered; changelog row.
- Extra source read: `src/pages/home/PageHome.vue` (lines 15–45, 99), `doctrine/features/home-overview.md`.

## Outcome
pass 1: needs_input · pass 2: spec_ready
