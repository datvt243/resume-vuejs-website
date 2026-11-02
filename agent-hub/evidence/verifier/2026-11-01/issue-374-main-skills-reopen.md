# 2026-11-01 — issue-374-main-skills — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-374-main-skills`
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-374-main-skills-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with the task "You are a fresh, isolated verifier subagent. You did not write this diff. Follow the verifier recipe exactly" plus the operator context on criterion 4 (prod API rejects `mainSkills` until the backend release), and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-374-main-skills-plan.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
The backend not accepting `mainSkills` is accepted as out of scope: a live 200 is NOT required. What is required is evidence that the code being shipped builds and sends that request. The note does not give it:

1. **Criterion 4, request shape.** The only captured request (`{"status":400,"keys":["_id","mainSkills"],...}`) came from "the earlier draft's save path" (`VeeFormGeneralInformationUpdate` free-text form), which the note itself says was removed. The shipped path is `PageSkills.saveMainSkills` (`updatePatchDoc` + `setGeneralInformation`). "Sends the same PATCH shape" is reasoning, not evidence (`EvidenceOnly`).
2. **Criterion 4, store update + close only on success.** `MainSkills.spec.ts` has 3 tests (lines 37, 45, 61). They exercise the component with a mocked `save` prop only. Nothing exercises `saveMainSkills`: a grep of `src` for `saveMainSkills|mainSkills` in spec files finds none. So "updates the store in place" and "`saveMainSkills` returns false on a 400, so the popup stays open" are unproven end to end.
3. **Criterion 1, × removal.** Cited as "× path in the component", which is a static reading. No spec test and no live run covers the × (the spec's 3 tests are filter/search, select/cap/save, failed save).

Fix (any one route per item is enough):
- Item 1 + the 400 half of item 2: as `qa.full@example.com` in a separate context, open the picker on the CURRENT code, tick one skill, press "Lưu". Cite the captured PATCH body from `saveMainSkills` (`{_id, mainSkills:[{name}]}`), the 400 toast, and that the modal is still open afterwards. Nothing is saved, so no cleanup.
- Success half of item 2: a spec on `PageSkills` (or on `saveMainSkills` extracted) with `updatePatchDoc` mocked to succeed, asserting the PATCH payload and that `setGeneralInformation` gets the new `mainSkills`, and returns true.
- Item 3: a spec test that clicks × on a badge and asserts `save` is called with `modelValue` minus that name.

## Cited (OK)
- Branch `feature/issue-374-skill-badges`: not main or staging, so no MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`: test `52 passed / 314 passed`, build `✓ built in 3.80s`, lint 0, typecheck 90 (= baseline 90), changed-files grep empty (`grep-exit=1`). Output not truncated.
- Criterion 1 (placement + badges): `aboveTabs: true`, screenshot `.playwright-mcp/main-skills-picker.png`.
- Criterion 2: owner read-only run, title "Chọn kỹ năng chính", 41 options, SAP group filter (6), "fio" search (1).
- Criterion 3: `count5 "Đã chọn 5/5"`, `sixthDisabled true`, plus spec.
- Criterion 4 (component half): spec shows `save` called with `[{name}]` in order, hide only on success, no hide on failure.
- Criterion 5: i18n keys listed for vi + en, new spec, outputs above.
- Owner account: only a token refresh POST, no writes. QA: rejected requests only.
- Comments row present (doc block on MainSkills, 1-line WHY on `MAIN_SKILLS_MAX` and the save-result prop). Supersedes: none; other #374 rows are SEALED pointers. Seal gate: none (no commit/push). Diff proportional to the node.

## Missing
- Criterion 4: captured request from the shipped `saveMainSkills` path (not the removed draft); proof that the store updates on success and the popup stays open on the API's 400.
- Criterion 1: evidence that × removes a main skill.

## Forbidden hit
none (`EDIT_UNVERIFIED` would apply only if sealed as is)

## PM status
Not changed (REOPEN). Under RatchetOnly the row stays `sealed_pending_verifier`. A REOPEN pointer was added to the row text.

## Re-run
none (audit only). One targeted grep of `src` (spec files mentioning `saveMainSkills|mainSkills`, and the `it(` lines of `MainSkills.spec.ts`) ran only to check the note's coverage claim. No build, lint, test or live run was repeated.
