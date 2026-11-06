# 2026-11-05 — issue-405-cv-filename — REOPEN (round 2)

- Worker: verifier · Version: 0.1.0
- Node: `issue-405-cv-filename`
- Evidence reviewed: `evidence/implementer/2026-11-05/issue-405-cv-filename-plan.md` (whole note, focus on `## Round 2 — after REOPEN`)
- Previous verdict: `evidence/verifier/2026-11-05/issue-405-cv-filename-reopen.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched for a second verifier pass with the task "This is the second verifier pass: the previous REOPEN note is agent-hub/evidence/verifier/2026-11-05/issue-405-cv-filename-reopen.md (reasons: TS error in a changed file; DESIGN.md §10 checklist not reported)" and skill args `verifier "issue-405-cv-filename — evidence note: ... (see the '## Round 2 — after REOPEN' section at the bottom)"`. No memory of writing either diff round.

## Verdict: REOPEN

## Reason
1. **DESIGN.md §10, last item not done.** §10 says: "Ran a final pass against the Vercel Web Interface Guidelines if the `web-design-guidelines` skill is available." The skill is available in this project. The note's §10 table says `web-design-guidelines | not run`, with no reason given. Today's SEALs for UI nodes (`issue-394-languages-page-nav-group-seal.md`, `issue-398-languages-view-edit-seal.md`) both needed this pass, with findings or "no findings" cited per file.
2. **Screenshots not cited.** The earlier REOPEN asked for screenshot file names, what each one shows, and a shot with the validation error showing. The note only says "captured in own CDP window, reviewed: no overflow/overlap/clip". It gives no file names, no per-shot description, and no error-state shot. The `scrollWidth > innerWidth` false check is good evidence for overflow. It doesn't replace the cited screenshots the REOPEN asked for.

Fix:
- Run `web-design-guidelines` on `src/pages/dashboard/PageAccountSettings.vue` (the CV filename section). Cite the findings with line numbers, or say "no findings". Fix anything it finds, or give a reason for each rule not applied.
- Cite the screenshot paths for Settings → "Tên file CV" at 1440 light, 1440 dark and 375 dark, plus one with the yup error showing (for example after typing `a/b`). Write one line per shot saying what it shows.

## Cited (OK)
- Round-1 reason 1 is resolved. `npm run typecheck` gives 81 errors (baseline 90). The per-file diff from base to branch shows no file got worse. useDownloadCv.ts went from 4 to 0, useDownloadCv.spec.ts from 1 to 0, axios.ts from 4 to 0. Touched files with errors: none (useHelper.ts, PageAccountSettings.vue and i18n/index.ts are all 0).
- Commands match doctrine. Re-run after round 2: test `Tests  357 passed (357)`, lint exit 0, build `✓ built in 4.35s`. Output is not cut.
- §10 items with evidence: the token grep has no match (exit 1). The section reuses `FormSection`, `VeeForm` and `LoadingGate`, with one primary action. States: loading, empty hint, yup error and max 100. Keyboard pass: Tab order is listed, focus is visible (border plus outline), and the input has a label.
- The original criteria still have evidence from round 1, unchanged. Save and re-seed: live 2 and 4. Content-Disposition filename and fallback: live 3 and 5, plus the spec. Home shows `name.pdf`: live 2 and 5. Spec with and without the header: 5 tests. i18n: vi and en. Comments row is OK.
- Branch `feature/issue-405-cv-filename`, so no MAIN_EDIT. Supersedes and Still open: none. Seal gate: no commit or push. The only write was to the QA account qa.full, restored to ''.
- Proportionality: the round-2 typing changes to `useHelper.ts` and `axios.ts` clear TS errors in files the diff touches, which the earlier REOPEN required. `errorCodeOf` now returns `?? ''`, and the note shows both callers treat '' like undefined. That's acceptable.

## Missing
- A web-design-guidelines pass with cited results (§10).
- Screenshot paths with a one-line description each, including the validation-error state.

## Forbidden hit
none (sealing as-is would be `EDIT_UNVERIFIED` on §10)

## Re-run
none — audit only; the note's output is verbatim and matches doctrine.

## PM status
Not changed (REOPEN). Added a round-2 REOPEN pointer to the row.
