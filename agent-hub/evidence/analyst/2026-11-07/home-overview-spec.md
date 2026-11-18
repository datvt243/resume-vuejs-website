# analyst — home-overview — 2026-11-07

## Task (verbatim)
document home-overview

## Doc
`agent-hub/doctrine/features/home-overview.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/home/PageHome.vue`
- `src/composables/useProfileCompletion.ts`
- `src/composables/useVisitStats.ts`
- `src/composables/useVisits.ts`
- `src/composables/useDownloadCv.ts`

## Re-check vs code
Behavior 1–6 match code. Initials fallback `U`, `avatar` comment "backend has no avatar field yet", `openToWork` badge, Views KPI `visitsLoadError ? "—"`, Completion links `missingSections[0].to` else `/dashboard/information`, `Intl.NumberFormat('vi-VN')`. Completion: 2 object sections (required yup fields filled) + 6 list sections, `Math.round`. Chart: `useVisitStats` default `day`; error block + `retryVisits`; pulse placeholder. CV card: `cvTemplate = ref('classic')`, disabled attach "coming soon", download with template + `selectedLang`, spinner + disabled. No discrepancy.

## Questions + answers
Operator (2026-11-07): "ok, behavior đúng" (Behavior section confirmed correct).
1. Completion counts 8 sections; Skills and Languages are not counted. Intended? → **Answer (operator 2026-11-07):** Change: count both — #440
2. KPI and chart numbers always use `vi-VN` formatting, even when the app language is English. Intended? → **Answer (operator 2026-11-07):** Bug — #455
3. The code notes "backend has no avatar field yet" — the avatar here only appears once the backend sends `avatar`. Is that still the state? (Information page's avatar block is "coming soon".) → **Answer (operator 2026-11-07):** Intended (still "coming soon")
4. The Classic/ATS template choice resets to Classic on every visit and is not shared with the header's Download button (which uses no template). Intended? → **Answer (operator 2026-11-07):** Intended

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/home-overview-spec.md` set in doc + INDEX row; Issues: #59, #440, #455. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok, behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
