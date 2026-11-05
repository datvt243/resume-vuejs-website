# 2026-11-05 — issue-405-cv-filename — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-405-cv-filename`
- Evidence reviewed: `evidence/implementer/2026-11-05/issue-405-cv-filename-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with the task "Run the project skill `/worker verifier` ... You are a fresh subagent launched specifically to verify; you did not write this diff, so NeverVerifyOwnWork is satisfied" and skill args `verifier "issue-405-cv-filename — evidence note: agent-hub/evidence/implementer/2026-11-05/issue-405-cv-filename-plan.md"`. No memory of writing the diff.

## Verdict: REOPEN

## Reason
1. **Typecheck: error in a changed file.** `doctrine/MEMORY.md` Typecheck row: "count ≤ 90 and none in changed files"; `verify_seal.md` step 4: "an error in a touched file → REOPEN". The note itself cites a new branch error in `src/composables/useDownloadCv.ts` `(22,48) TS2339 'cvFileName' does not exist on type '{}'`. Being the same class as the untyped `firstName`/`lastName` on that line does not exempt it; the earlier verdicts all cite "none in changed files".
2. **DESIGN.md §10 not reported.** The diff adds a new UI section to `PageAccountSettings.vue`. §10 says "check each item and report the result". The note has no screenshots (1440 light, 1440 dark, 375 dark), no keyboard pass, and no token grep on the changed `.vue`. The same gap got a REOPEN on `issue-394-languages-page-nav-group` today.

Fix:
- Type the store access in `useDownloadCv.ts` so line 22 (`cvFileName`, and ideally `firstName`/`lastName`) has no TS errors. Re-run `npm run typecheck` and cite the count plus "none in changed files".
- Settings page with the CV filename section: take screenshots at 1440 light, 1440 dark and 375 dark (also with the validation error showing), cite the file names and what each shows. Do a keyboard pass (Tab to input → save; focus visible). Run the §10 token grep on `PageAccountSettings.vue` and cite the output.

## Cited (OK)
- Branch `feature/issue-405-cv-filename` off `staging` @ dfe7059. Not main or staging, so no MAIN_EDIT.
- Commands match doctrine: test `56 passed (56)` / `357 passed (357)`, lint clean, build `✓ built in 4.41s`, typecheck 90 = baseline 90 (count OK). Output not truncated.
- Criterion 1 (Settings saves cvFileName and re-seeds): live 2, 4: PATCH 200, reload and in-app nav show the saved value after the `watchPostEffect` fix.
- Criterion 2 (download uses Content-Disposition, falls back otherwise): live 3, 5 and the spec "saves under the Content-Disposition name".
- Criterion 3 (Home shows name.pdf): live 2, 5.
- Criterion 4 (spec with and without header): 5 tests passed in `useDownloadCv.spec.ts`.
- i18n: 4 keys in both vi and en. Comments row: 3 one-line WHY comments, no `(#N)`.
- Supersedes/Still open: none. Seal gate: no commit/push. The only write was to the QA account qa.full (a standing allowed test account), restored to ''.
- Proportionality: the diff fits the node (the `instanceAxios` export is needed to read the headers).

## Missing
- Typecheck with no error in changed files (`useDownloadCv.ts:22`).
- DESIGN.md §10: screenshots, keyboard pass, token grep.

## Forbidden hit
none (`EDIT_UNVERIFIED` would apply only if this were sealed as is)

## Re-run
none — audit only; the note's output is verbatim and matches doctrine.

## PM status
Not changed (REOPEN). REOPEN pointer added to the row.
