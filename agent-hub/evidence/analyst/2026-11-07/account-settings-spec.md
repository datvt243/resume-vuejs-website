# analyst — account-settings — 2026-11-07

## Task (verbatim)
document account-settings

## Doc
`agent-hub/doctrine/features/account-settings.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageAccountSettings.vue`
- `src/i18n/index.ts` (`uiLang`, `setUiLang`, locale watcher)
- `src/composables/useCvLang.ts` (`resolveCvLang`, `DEFAULT_CV_LANG = 'vi'`)
- `src/composables/useDocument.ts` (`updatePatchDoc` → `PATCH <collection>/update`)
- `src/lib/swal.lib.js` (`confirmDelete`)
- `src/stores/auth.ts` (`logOut`)

## Re-check vs code
Behavior 1–7 match code. Section order Email, Password, Delete, App language, CV file name, CV language; email shown or `—`, change email/password buttons disabled with coming-soon tooltip; delete → `confirmDelete` (normal Swal confirm) → `DELETE candidate` via `handleBase` → `logOut({ router })`; app language `SegmentedControl` → `setUiLang`, watcher sets i18n locale, `document.documentElement.lang`, `localStorage.uiLang`, initial `uiLang ?? cvLang` → `vi`; no write to `cvLang`. CV file name schema trim/max 100/`^[^\\/"\r\n]*$`, `PATCH candidate/update`, store takes `data.cvFileName`; returns early without candidate id. CV language uses shared `useCvLang`. No discrepancy.

## Questions + answers
Operator (2026-11-07): "behavior đúng" (Behavior section confirmed correct).
1. Deleting the account uses the normal confirm dialog, while deleting a single skill requires typing `delete`. Should account deletion require typing (or the password)? → **Answer (operator 2026-11-07):** Change: require typing `delete` — #431
2. App language is only switchable here; signed-out pages (login/register) have no language switch. Intended? → **Answer (operator 2026-11-07):** Intended
3. Email and password "coming soon" buttons — is there a backend issue to link, so they are not forgotten? → **Answer (operator 2026-11-07):** Change: backend issue datvt243/resume-nodejs-api#412

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/account-settings-spec.md` set in doc + INDEX row; Issues #63, #182, #431, datvt243/resume-nodejs-api#412. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
