# Analyst spec — #516 Export JSON Resume: include skills and languages

- Date: 2026-11-25 · HEAD 624adcb · branch feature/issue-516-export-json-resume
- Outcome: spec_ready
- Doc: `doctrine/features/cv-preview-export.md` (updated, Behavior 32–37, draft) + INDEX row (#516, anchor `src/utilities/jsonResume.ts`)

## Task (verbatim)
Title: Export JSON Resume: include skills and languages
Follow-up from #440 (operator decision Q15, 2026-11-24: out of scope there).
`src/utilities/jsonResume.ts` exports no `skills` or `languages`, although JSON Resume defines both:
- `skills`: `[{ name, keywords[] }]` — e.g. main / familiar / one entry per professional group / personal.
- `languages`: `[{ language, fluency }]` from `generalInformation.foreignLanguages`.
Keep it consistent with the CV layout (#440): picked main/familiar skills left out of their professional groups, names only.

## Feature lookup
INDEX: no separate JSON-export doc. Export JSON is `cv-preview-export.md` Behavior #5 (anchor `src/utilities/jsonResume.ts` already listed) → updated that doc, no new doc. `import-cv.md` (fromJsonResume) untouched; its Out of scope already excludes importing skills/languages.

## Sources read
`agent-hub/haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}`, `doctrine/features/INDEX.md`, `doctrine/features/cv-preview-export.md`, `doctrine/features/import-cv.md` (grep), `doctrine/MEMORY.md` (test commands), `doctrine/domains/PROJECT.md` (grep), `src/utilities/jsonResume.ts`, `src/utilities/jsonResume.spec.ts` (40–92), `src/components/cv/CvResumeLayout.vue` (17, 46–74, 95–115), `src/utilities/index.ts` (133–143), `src/pages/dashboard/PagePreview.vue` (60–86), `src/i18n/index.ts` (283–288, 871–876, 1197–1205). Implementer note `evidence/implementer/2026-11-24/issue-440-cv-skills-languages-plan.md` was not needed beyond the feature doc's Behavior 18–23.

## Code map
- `src/utilities/jsonResume.ts:61-116` — `toJsonResume`; add `skills`/`languages` to the returned object (next to `references`, before `meta`). `compact` (46–54) drops empty `fluency`.
- `src/components/cv/CvResumeLayout.vue:95-115` — `names()`, `skillRows`, `LANGUAGE_LEVELS`, `languageLine`: the exact row/level logic to match (reuse or move into `src/utilities`, implementer's call).
- `src/components/cv/CvResumeLayout.vue:44-75` — component-local `LABELS` vi/en (`mainSkills`, `familiarSkills`, `professionalSkills`, `personalSkills`); JSON `name` must equal these strings per `lang`.
- `src/utilities/index.ts:133-143` — `groupSkills(items, groups)`.
- `src/i18n/index.ts:283-288, 871-876` — `option.languageLevel.*`; `1205` exports `t` (= `i18n.global.t`, accepts `{ locale }`).
- `src/pages/dashboard/PagePreview.vue:77-86` — caller; passes `cvData` (includes `generalInformation`) and `selectedLang` — no change needed.
- `src/utilities/jsonResume.spec.ts:50-92` — `toJsonResume` tests; fixture `generalInformation` at line 13.

## Questions + answers
None open. Decided from the issue text ("consistent with the CV layout (#440)", "names only") + Behavior 19–21 and Q12/Q13 answers:
- Skill entry `name` = layout row label in the CV language; `keywords` = names. (Issue's example rows = layout rows.)
- `fluency` = level as the layout prints it (translated known level, legacy as stored, empty → omitted) — Q13 answer.
- Empty → `[]` (matches every other section key, existing `toJsonResume({})` test style).
- No `level`, no years — "names only" / Q12a.
- Import unchanged — `import-cv.md` Q4 answer (operator 2026-11-07).
Judgment calls the orchestrator may want to surface (not blocking): language item without `language` text is skipped; skill without `name` skipped.

## Isolation proof
Spawned as analyst subagent with only the issue text + pointers; no implementer reasoning or diff seen (none exists — `src/` unchanged on this branch, `git status` showed only `.claude/skills/todo/SKILL.md` modified).
