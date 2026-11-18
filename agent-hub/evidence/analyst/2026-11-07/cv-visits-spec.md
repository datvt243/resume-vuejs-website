# analyst — cv-visits — 2026-11-07

## Task (verbatim)
document cv-visits

## Doc
`agent-hub/doctrine/features/cv-visits.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageVisits.vue`
- `src/composables/useVisits.ts`
- `src/composables/useVisitStats.ts`
- `src/pages/_layouts/LayoutDefault.vue` (`useVisits` + `provide(reloadVisits)`)
- `src/lib/swal.lib.js` (`confirmDelete`)

## Re-check vs code
Behavior 1–10 match code. `visitCount = meta.total ?? list.length`, `visitsLoadError` cached; `count !== null` skips refetch. Stats params `interval`, `visitStatsFrom` (29 days / Monday − 11 weeks / month − 11), `tz`; `formatBucket` labels. KPI hint = cached list length; top rows sorted desc, `Math.round(share)`. Table `PAGE_SIZE = 25`, `vi-VN` `Intl.DateTimeFormat`, invalid date → "—"; `watch(pageCount)` clamps page. `retry()` reloads only the failed source. Delete all disabled on `loadError || !dataList.length`; `confirmDelete` with count, success → `reloadVisits` + `reloadStats`. No discrepancy in Behavior. Note: open question 2's premise says the "all-time" hint uses `meta.total`; in code the Visits page hint uses the cached list length (`PageVisits.vue` `kpiViewsHint`), only Home's Views KPI uses `visitCount` (= `meta.total`). Question kept verbatim (answer unaffected: #454).

## Questions + answers
Operator (2026-11-07): "ok, behavior đúng" (Behavior section confirmed correct).
1. The table shows the IP address of every visitor. Is showing raw IPs to the CV owner intended (privacy)? → **Answer (operator 2026-11-07):** Intended (owner's own analytics)
2. If the API paginates `GET candidate/visits`, the table only shows the first page while the "all-time" hint uses `meta.total`. Does the endpoint return all visits? → **Answer (operator 2026-11-07):** Change: use the API pagination once datvt243/resume-nodejs-api#396 lands — #454
3. Dates and numbers always use `vi-VN` formatting, even in the English UI. Intended? → **Answer (operator 2026-11-07):** Bug: format by app language — #455
4. "Delete all" has a normal confirm only, though it cannot be undone. Should it require typing, like skill deletion? → **Answer (operator 2026-11-07):** Change: typed `delete` — #456
5. The cached visit list is loaded once per session; new visits appear only after a reload or a retry. Intended? → **Answer (operator 2026-11-07):** Intended

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/cv-visits-spec.md` set in doc + INDEX row; Issues: #454, #455, #456, datvt243/resume-nodejs-api#396. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok, behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
