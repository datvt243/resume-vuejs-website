# 2026-10-18 - issue-184-application-profile-unblocked-20261018 - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-184-application-profile-unblocked-20261018` in `haven/diagrams/dev-loop.prime-mermaid.md`
- Evidence reviewed: `evidence/implementer/2026-10-18-issue-184-application-profile.md`

## Isolation proof
Spawned by the implementer session through the Agent tool on 2026-10-18 as a fresh subagent, with the task "Run the project skill `/worker verifier` ... on agent-hub/evidence/implementer/2026-10-18-issue-184-application-profile.md". This context did not write the diff, so `NeverVerifyOwnWork` holds.

## Verdict
SEAL

## Cited
| Criterion | Evidence |
|---|---|
| Link application to a CV profile (create/edit/unlink) | Note Diff row `application.model.ts` (`profileId` select, `''` unlinks, backend Joi `allow(null, '')`). Spec "fills the profile select options" passes. |
| Open the public link for that profile | Spec asserts `#/cv/dat-vo?profile=p1`. |
| Download the PDF for that profile | Spec asserts `api/me/dat-vo/download-pdf?template=ats&profile=p1`. The ATS-only and public-only limit is stated in the note and marked with a `shortcut:` comment. |
| No regression from a deleted profile | Spec "omits a since-deleted profile on save" passes. |
| Tests | Re-run by the verifier: `npx vitest run src/pages/dashboard/PageApplication.spec.ts` gives `Tests 4 passed (4)`. `npm run test` gives `Tests 1 failed / 227 passed (228)`. The one failure is `VeeForm > VI \| EN toggle`, the known pre-existing failure accepted in the #158, #183 and #185 seals. The diff touches no VeeForm file. |
| Build | Re-run: `✓ built in 3.89s`. |
| Lint | Re-run: `npm run lint` printed no findings. |
| Typecheck | The note states "CANNOT RUN - pending add-typecheck-script", as the transitional rule requires. |
| Comments per code-comments.md | The note's row lists 3 comments, all explaining why, with no issue references, plus one `shortcut:` line. |
| Manual UI check | The note states it was not done and gives the reason (no credentials). The changed component is covered by a mounted-component spec instead. The #185 seal accepted the same approach. |

## Missing
None blocking.

## Forbidden states
- ADHOC_WORK: no. The node exists on the diagram and the work went through the implementer worker.
- NO_EVIDENCE: no. An implementer evidence note exists.
- EDIT_UNVERIFIED: no. The output is quoted verbatim, the verifier reproduced it, and the typecheck gap is stated explicitly.
- CODE_IN_HAVEN: no. `git status` shows code only under `src/`. The only `haven/` change is the diagram row.
- DIAGRAM_DRIFT: no. The node row was appended, and the verifier has now set it to SEALED in place.
- MAIN_EDIT: no. The branch is `feature/issue-184-application-profile`, confirmed by the current `git` branch.

## Seal gate
Nothing was committed, pushed or merged, and no real API call or GitHub write was made. Shipping is a separate `/ship` step.

## Proportionality
The diff is 3 source files plus 1 new spec (+53/-2), all inside #184's scope. No unrelated fixes.

## Re-run
partial: the verifier re-ran `npx vitest run src/pages/dashboard/PageApplication.spec.ts`, `npm run test`, `npm run build` and `npm run lint`. The operator asked for an independent re-run in the spawn task.

## Noticed, not done
- The implementer did not append its own `worker-runs.log` line for this node.
- The backend owner `download-pdf` ignores `?profile=`, and the `status: waiting-backend` label on #184 is stale. Both are carried over from the implementer note; they are operator actions.

## PM status
`issue-184-application-profile-unblocked-20261018`: IN_PROGRESS -> SEALED (row updated in place).
