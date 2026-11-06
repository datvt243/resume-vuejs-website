# analyst — import-cv — 2026-11-07

## Task (verbatim)
document import-cv

## Doc
`agent-hub/doctrine/features/import-cv.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageImportLinkedin.vue`
- `src/utilities/jsonResume.ts` (`fromJsonResume`)
- `src/routers/index.ts` (`import-linkedin`)
- `src/i18n/index.ts` (`pdfHint` "up to 5MB")
- `src/models/experience.model.ts` (`careerBreakPayload`, not used by import)

## Re-check vs code
Behavior 1–5 match code. 3 hidden inputs (`.zip`, `.pdf`, `.json`); LinkedIn/PDF → `FormData` `file` to `candidate/parse-linkedin-export` / `candidate/parse-cv-pdf`; JSON parsed in browser. `applyParsed` lists + `extractedText` (`<details v-if>`). Placeholder titles; "No items found". `prefill` falls back to `f.default`, `_id` set to null before save → POST; `_imported` → "Added". `SyntaxError` → `importCv.invalidJson`, other → `err.message`; `e.target.value = ''` resets input. No file-size check in code. No discrepancy.

## Questions + answers
Operator (2026-11-07): "ok, behavior đúng" (Behavior section confirmed correct).
1. The 5MB PDF limit is only in the hint text; the browser does not check file size before uploading. Should it? → **Answer (operator 2026-11-07):** Bug: check size before upload — #457
2. No duplicate detection: importing the same file twice lets the user add the same entries again. Intended? → **Answer (operator 2026-11-07):** Intended
3. Imported experiences skip the career-break normalisation the Experience page applies (`careerBreakPayload`). Can a parsed item be a career break, and should it be normalised? → **Answer (operator 2026-11-07):** Intended (the parser never produces a career break)
4. JSON Resume also carries projects, skills, languages, awards and certificates — only education and experience are offered. Intended scope? → **Answer (operator 2026-11-07):** Intended (current scope)
5. Route and file are named "import-linkedin" while the feature covers three sources. Rename, or keep for link stability? → **Answer (operator 2026-11-07):** Intended (keep link stability)

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/import-cv-spec.md` set in doc + INDEX row; Issues: #457. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok, behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
