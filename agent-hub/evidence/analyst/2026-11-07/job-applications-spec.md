# analyst — job-applications — 2026-11-07

## Task (verbatim)
document job-applications

## Doc
`agent-hub/doctrine/features/job-applications.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageApplication.vue`
- `src/models/application.model.ts`
- `src/composables/useCandidate.ts` (`sortData`)
- `src/composables/useDocument.ts`
- `src/pages/home/PageHome.vue` (Applications KPI)

## Re-check vs code
Behavior 1–6 match code. Card: company/position/`DD/MM/YYYY` appliedDate/note, `statusMeta` applied/interview/offer/rejected with fallback to applied. Model: company/position max 100, appliedDate required, status select, profileId nullable select filled from profiles, jobLink URL max 500 nullable, note max 1000. `handleUpdate` drops a since-deleted `profileId`; duplicate clears `_id`. `getProfileLinks`: profile + slug|email required; public link `router.resolve('public-resume', ?profile=)`, PDF `${_host}api/me/<id>/download-pdf?template=ats&profile=<id>`; `_host` uses `window.location.host === 'localhost'` (`PageApplication.vue:44`). Job link opens when present. Home KPI = `applications.length`. No discrepancy.

## Questions + answers
Operator (2026-11-07): "ok" (Behavior section confirmed correct).
1. The per-application PDF and public CV go through the PUBLIC endpoints, so they only work while the CV is public (code shortcut note). For a private CV both links fail. Acceptable until the backend's owner `download-pdf` supports `?profile=`? → **Answer (operator 2026-11-07):** Change: owner endpoint once datvt243/resume-nodejs-api#400 lands — #448
2. The per-application PDF is always the ATS template and never passes the CV language (`lang`). Intended? → **Answer (operator 2026-11-07):** Bug: pass the CV language — #450
3. The list is not sorted by applied date (the shared sort uses `startDate`, which applications don't have) — order is the API's. Should it sort newest applied first? → **Answer (operator 2026-11-07):** Bug: newest applied first — #447
4. Same `window.location.host === 'localhost'` check as the header (never true with a port), so dev always uses the real API host. Intended? → **Answer (operator 2026-11-07):** Bug — #427

Note (operator 2026-11-07): follow-up — add status `accepted` + status transition rules — #423 (backend datvt243/resume-nodejs-api#410).

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/job-applications-spec.md` set in doc + INDEX row; Issues: #423, #427, #447, #448, #450, datvt243/resume-nodejs-api#400, datvt243/resume-nodejs-api#410. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok" confirmation, the operator's
answers + issue numbers). No implementer reasoning, no main session
transcript. All Behavior items re-checked by reading code myself.
