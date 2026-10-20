# 2026-10-19 - issue-235-career-break - REOPEN

- Worker: verifier
- Node: `issue-235-career-break` (`haven/diagrams/dev-loop.prime-mermaid.md`, stays `IN_PROGRESS`)
- Note under review: `evidence/implementer/2026-10-19-issue-235-career-break.md`
- Branch: `feature/issue-235-career-break` (confirmed with `git branch --show-current`; uncommitted working tree, nothing merged)

## Verdict: REOPEN

## Isolation proof
Fresh Agent-tool subagent spawned by the implementer session after it wrote the evidence note; no shared context. The spawn prompt was "You are a fresh verifier subagent ... You did NOT write the diff under review".

## Re-run
`partial`: `npm run test`, `npm run lint` and `npm run build`, plus `VeeForm.spec.ts` ×2 on clean HEAD in a temporary git worktree, which was removed afterwards. Reason: the operator's spawn prompt explicitly asked for independent re-runs instead of trusting the note. The note's test output also reports failures, which needed independent confirmation that they come from the baseline.

## Results (re-run)
- `npm run test`: `Test Files 1 failed | 37 passed (38)`, `Tests 3 failed | 245 passed (248)`. The failures are all in `VeeForm.spec.ts` ("BUG ..." / pristine-submit tests). The note reported 2 failed, so the count differs between runs, which fits flakiness.
- Clean baseline (HEAD without the diff), `VeeForm.spec.ts`:
  - Run 1: `1 failed | 16 passed (17)`, failing on "VI | EN toggle > flags the hidden language...".
  - Run 2: `1 failed | 16 passed (17)`, failing on "clicking submit on a pristine form...".
  - A different test fails on each run, so the note's flakiness claim is confirmed. The suite is not regressed by this diff.
- `npm run lint`: exit 0.
- `npm run build`: `✓ built in 4.93s`.
- Typecheck: the note states CANNOT RUN per doctrine, which is acceptable under the transitional rule.

## Missing (reason for REOPEN)
1. **No "comments per code-comments.md" row in `## Acceptance`.** `doctrine/standards/code-comments.md` → Enforcement: "Verifier: that row missing ... → REOPEN". The recipe's step 6 also requires this row on every node. The diff does add comments, in `experience.model.ts`, `PageExperience.vue`, `model.type.ts` and the new spec. They look compliant on a read-through: WHY-only `//`, JSDoc on the exported `experienceTitle`, no `(#N)` refs. The note still has to carry the row citing them.
2. **Payload criterion is cited by code-reading, not by a test.** The primary acceptance criterion is "create/update a career break sends the right payload". The note's evidence for it is "the `handleUpdate` code shows ..." (inference), plus a schema spec that only proves validation, not the payload `PageExperience` sends. Under EvidenceOnly, the next pass needs one small test asserting the payload `handleUpdate` builds:
   - a break gets `isCareerBreak: true`, its `careerBreakType` kept, and `company`/`position` set to `''`;
   - a normal entry gets `isCareerBreak: false` and `careerBreakType: ''`.

## Accepted as-is
- Labels per language: the `CvResumeLayout.spec` checks "Nghỉ việc tạm thời — Du lịch" (vi) and "Career break — Travel" (en), and `experience.model.spec` covers the titles.
- Normal entries unchanged: the schema spec shows company/position are still required.
- Form toggle: covered by the `VeeForm` `showIf` test.
- API 400 shown: there is no new code path, because the existing `handleBase` toast is reused. That is acceptable without a live call.
- Limitation (no live click-through, logged-out browser): acceptable. A live save would be a real API write behind the seal gate, and the same gap was accepted for `issue-116-multi-profile-frontend`. It is disclosed plainly.

## Forbidden states
- `ADHOC_WORK`: clear (the node exists).
- `NO_EVIDENCE`: clear.
- `EDIT_UNVERIFIED`: **hit**, because the comments row is missing (per `CLAUDE.md` "Every diff ... Missing either in the evidence note = `EDIT_UNVERIFIED`").
- `CODE_IN_HAVEN`: clear.
- `DIAGRAM_DRIFT`: clear (row is `IN_PROGRESS`).
- `MAIN_EDIT`: clear (`feature/issue-235-career-break`).

## Seal gate
No outward-facing action was taken, so none was needed.

## Proportionality
The diff is scoped to #235. The adjacent items it noticed (the `jsonResume` export, the LinkedIn import, the flaky `VeeForm.spec`) are listed, not done. `SmallestDiff` is clear.

## To SEAL next pass
1. Add the code-comments Acceptance row.
2. Add one payload test for `PageExperience.handleUpdate`, or extract the payload shaping into a tested function.
3. Re-run `npm run test` / `npm run build` and cite the output verbatim.
