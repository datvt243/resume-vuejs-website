# analyst — cv-simple-sections — 2026-11-07

## Task (verbatim)
document cv-simple-sections

## Doc
`agent-hub/doctrine/features/cv-simple-sections.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageAward.vue`
- `src/pages/dashboard/PageCertificate.vue`
- `src/pages/dashboard/PageReference.vue`
- `src/models/award.model.ts`
- `src/models/certificate.model.ts`
- `src/models/reference.model.ts`
- `src/composables/useCandidate.ts` (`sortData`)
- `src/composables/useDocument.ts`

## Re-check vs code
Behavior 1–7 match code. Same `useCandidate`/`useDocument` CRUD + duplicate (`_id` cleared before save). No `useManualOrder`/`draggable` on these pages. Award: name/org max 50, `issueDate` month picker sent `+new Date`, link required URL max 100 (`award.model.ts:50`), description VI required / EN optional. Certificate: name/org max 50, start/end, `isNoExpiration` forced `false` when unchecked, card shows `field.noExpiration` instead of end date. Reference: `TableDefault`, fullName 3–50, company/position max 100, phone; `:delete-disabled="!doc._id"`. `sortData` sorts by `startDate` (awards have none). No discrepancy.

## Questions + answers
Operator (2026-11-07): "ok" (Behavior section confirmed correct).
1. An award requires a link and a description — awards without a URL cannot be saved. Intended? → **Answer (operator 2026-11-07):** Change: link optional (URL when filled) — #446, datvt243/resume-nodejs-api#414
2. Award/certificate lists are sorted by `startDate` on load, but awards have only `issueDate`, so their order is effectively the API order. Should awards sort by issue date? → **Answer (operator 2026-11-07):** Bug: sort by issueDate — #447
3. Reference has no email field, only phone. Intended? → **Answer (operator 2026-11-07):** Intended
4. Reference is a table while Award/Certificate are cards. Intended difference? → **Answer (operator 2026-11-07):** Intended

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/cv-simple-sections-spec.md` set in doc + INDEX row; Issues: #60, #446, #447, datvt243/resume-nodejs-api#414. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok" confirmation, the operator's
answers + issue numbers). No implementer reasoning, no main session
transcript. All Behavior items re-checked by reading code myself.
