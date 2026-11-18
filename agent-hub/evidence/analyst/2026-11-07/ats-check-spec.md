# analyst — ats-check — 2026-11-07

## Task (verbatim)
document ats-check

## Doc
`agent-hub/doctrine/features/ats-check.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageAtsCheck.vue`
- `src/types/ats.type.ts`
- `src/composables/useDownloadCv.ts`
- `src/composables/useCvLang.ts`
- resume-nodejs-api: `src/services/atsChecks.ts` (Q1 only — `message:` strings are hard-coded English template literals)

## Re-check vs code
Behavior 1–5 match code. `template = ref('ats')`; `POST cv/ats-check` with `template`, `lang`, trimmed `jobDescription` only if non-blank; `handleBase` with toast. Score classes ≥80 success / ≥50 warning / else danger; `failedCount`; Classic note follows `checkedTemplate`; check icons/badges by `passed`/`severity`; keyword section `v-if="result.keywordMatch"` with "—" for empty groups; `<details>` extracted text. Download uses `download({ template, lang })`. No discrepancy.

## Questions + answers
Operator (2026-11-07): "ok, behavior đúng" (Behavior section confirmed correct).
1. Check messages are shown exactly as the API returns them. Are they localized by the backend for `lang`, or always in one language? → **Answer (operator 2026-11-07):** No: the backend hard-codes English in `src/services/atsChecks.ts` (resume-nodejs-api). Bug: localize every check message — datvt243/resume-nodejs-api#407 (scope extended)
2. The check runs on the full CV — the active CV profile is not sent. Should it check the profile-filtered CV? → **Answer (operator 2026-11-07):** Change: send it once datvt243/resume-nodejs-api#400 lands — #448
3. The job description has no length limit on the client. Is there a backend limit the UI should show? → **Answer (operator 2026-11-07):** Intended (backend has none either)

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/ats-check-spec.md` set in doc + INDEX row; Issues: #159, #448, datvt243/resume-nodejs-api#400, datvt243/resume-nodejs-api#407. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok, behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
