# analyst — public-resume — 2026-11-07

## Task (verbatim)
document public-resume

## Doc
`agent-hub/doctrine/features/public-resume.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/public/PagePublicResume.vue`
- `src/components/cv/CvResumeLayout.vue`
- `src/routers/index.ts` (`/resume/:slug`, no requiresAuth)
- `src/composables/useCvTheme.ts`
- `src/composables/useCvLang.ts`

## Re-check vs code
Behavior 1–6 match code. `watch(route.params.slug, load, {immediate})`; `_axios` with `customURL: api/me/<slug>`, `profile`/`lang=en` params; theme from `resolveTheme(route.query.theme)` not sent; `!success || !data` or catch → NoData not-found; skeleton while loading; layout: experiences sorted `b.startDate - a.startDate`, other sections in given order, `v-if` hides empty, `sanitizeHtml` on rich text; visit POST with `document.referrer` only after success, `.catch(() => {})`. Backend slug→email fallback and `?profile=` filtering not checked (other repo). No discrepancy.

## Questions + answers
Operator (2026-11-07): "ok, behavior đúng" (Behavior section confirmed correct).
1. The layout has no Skills or Languages section, so the public CV never shows them. Intended? → **Answer (operator 2026-11-07):** Change — #440
2. The visitor's own visit is recorded on every load, including reloads and the owner viewing their own link. Is deduplication expected (frontend or backend)? → **Answer (operator 2026-11-07):** Dedup within 24h is backend datvt243/resume-nodejs-api#399; Change: no visit when the viewer is the owner — #453
3. Education, Projects, Awards and Certificates render in API order; only Experience is sorted newest-first. The dashboard has manual ordering for Education/Experience/Project — should the public page honour it? → **Answer (operator 2026-11-07):** Change: Education/Project use the stored manual order (#442, datvt243/resume-nodejs-api#413); Experience keeps date order

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/public-resume-spec.md` set in doc + INDEX row; Issues: #56, #116, #117, #119, #182, #440, #442, #453, datvt243/resume-nodejs-api#399, datvt243/resume-nodejs-api#413. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok, behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
