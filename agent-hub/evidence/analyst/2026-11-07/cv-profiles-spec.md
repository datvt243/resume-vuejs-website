# analyst — cv-profiles — 2026-11-07

## Task (verbatim)
document cv-profiles

## Doc
`agent-hub/doctrine/features/cv-profiles.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageProfile.vue`
- `src/models/profile.model.ts`
- `src/composables/useActiveProfile.ts`
- `src/pages/dashboard/PagePreview.vue` (`filterByProfile`, profile select)
- `src/pages/dashboard/PageInformation.vue` (share-profile select, `?profile=`)
- `src/composables/useDownloadCv.ts` (params: only `template`, `lang`)

## Re-check vs code
Behavior 1–5 match code. Six sections + Select all / Clear + `countSelected`; `summarize` counts raw `*Ids` lengths (stale ids included). Name trim/min 1/max 100/required. Save merges `selectedIds` into payload; duplicate clears `_id`. `useActiveProfile` uses `localStorage.cvActiveProfileId`, '' = no filter. Preview filters client-side; Information adds `profile` query only if the profile resolves. `useDownloadCv` sends no profile param. Backend `?profile=` filtering of the public endpoint not checked (other repo). No discrepancy.

## Questions + answers
Operator (2026-11-07): "ok" (Behavior section confirmed correct).
1. "Download CV" (server PDF from Header/Home) ignores the active profile, while Preview and the public link apply it. Intended? → **Answer (operator 2026-11-07):** Change: use the owner export with `?profile=` once datvt243/resume-nodejs-api#400 lands — #448
2. Deleting an entry (e.g. an experience) does not remove its id from profiles; the profile summary count then includes the stale id. Intended? → **Answer (operator 2026-11-07):** Bug: count only existing entries — #449
3. New entries added later are never in any profile automatically — a profile silently omits them. Intended? → **Answer (operator 2026-11-07):** Intended

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/cv-profiles-spec.md` set in doc + INDEX row; Issues: #116, #448, #449, datvt243/resume-nodejs-api#400. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok" confirmation, the operator's
answers + issue numbers). No implementer reasoning, no main session
transcript. All Behavior items re-checked by reading code myself.
