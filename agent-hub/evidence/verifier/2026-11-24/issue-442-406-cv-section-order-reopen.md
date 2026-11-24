# 2026-11-24 - verifier - issue-442-406-cv-section-order

Verdict: **REOPEN**
Node: `issue-442-406-cv-section-order` · Branch `feature/issue-442-406-cv-section-order` (not main/staging, OK)
Note audited: `evidence/implementer/2026-11-24/issue-442-406-cv-section-order-plan.md`

## Isolation proof
Spawned via the Agent tool with description "/worker verifier for resume-vuejs-website, node issue-442-406-cv-section-order"; blank context, the implementer's reasoning not visible.

## Re-run
none (audit-only; node is not outward-facing, note output is verbatim and matches doctrine/MEMORY.md commands)

## Missing (reason for REOPEN)
- Feature doc acceptance row "(#442, #406) ... `npm run typecheck` <= 78 errors **and none in changed files**" (`doctrine/features/cv-timeline-sections.md` line 81) and the doctrine Typecheck row / verify_seal step 4 ("an error in a touched file -> REOPEN") are not met. The note itself shows 3 errors in a changed file:
  `src/composables/useCandidate.ts(68,44) TS7006`, `(76,57) TS7006`, `(80,13) TS7053`.
  Count is 78 (= baseline), but "pre-existing on staging" does not satisfy "none in changed files". `useCandidate.ts` is heavily edited by this diff (sortData, addRecordToList, reorder).
- Fix: annotate the 3 spots in `useCandidate.ts` (`e` parameter types, the `[...]` index) so `npm run typecheck | grep useCandidate.ts` is empty (count 75), re-run test/lint/build, update the note.

## Checked and fine
- Branch named, `## Feature doc`, `## Review` (findings fixed or reasoned), `## Supersedes`/`## Still open`, seal gate (live QA writes and backend issue approved, no commit/push) present.
- Commands match doctrine; output verbatim: test 497 passed, lint exit 0, build ok, typecheck 78.
- Behavior #12/#13 criteria each have cited evidence (specs + live check; Education live not done, stated and covered by spec).
- Comments row cited with grep; proportionality OK; no forbidden state hit other than the above (`EDIT_UNVERIFIED`-class gap on the typecheck criterion).

## State
PM status unchanged (IN_PROGRESS); no archive/feature-doc status edits.
