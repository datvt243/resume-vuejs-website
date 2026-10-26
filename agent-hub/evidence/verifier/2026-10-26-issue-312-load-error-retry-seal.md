# 2026-10-26 — issue-312-load-error-retry — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-312-load-error-retry` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note audited: `evidence/implementer/2026-10-26-issue-312-load-error-retry.md`

## Isolation proof
Spawned as a fresh subagent with the task string "You are a fresh verifier for the resume-vuejs-website repo ... You did NOT write this diff", invoking `/worker verifier "agent-hub/evidence/implementer/2026-10-26-issue-312-load-error-retry.md"`. This context wrote no code on this branch.

## Verdict: SEAL

## Criteria
| Criterion | Cited evidence | OK |
|---|---|---|
| Failed load is not shown as empty | live Playwright run, 500 on `GET education/` → alert "Không tải được dữ liệu … Thử lại", empty text not shown | yes |
| Retry re-runs the fetch and recovers | live: one `GET education/` after the click, alert gone; `useCandidate.spec` loadError true→false | yes |
| All 8 list pages wired | diff table; spot-check `grep -l ':error="loadError"' src/pages/dashboard/*.vue` → 8 | yes |
| i18n vi + en | `common.retry`, `error.loadList`, `error.loadListDescription` in both locales; typecheck at baseline (en typed `typeof vi`) | yes |
| DESIGN.md reuse | reuses `NoData` + `Button`, `role="alert"`; form variant of LoadingGate unchanged | yes |
| Test | `298 passed`, 1 failed = `VeeForm.spec.ts` VI/EN toggle, pre-existing, tracked in open #347 (checked: `gh issue view 347` → OPEN, VeeForm.spec flaky test) | yes |
| Build / lint / typecheck | `✓ built in 3.83s`, lint exit 0, typecheck 90 = baseline, `useCandidate.ts` 3 before / 3 after | yes |
| Comments per code-comments.md | two 1-line why-comments | yes |

## Forbidden states
None hit. Branch `fix/issue-312-load-error-retry` (not `main`/`staging`). No commit/push and no data written, so no seal gate needed. The only open #312 row on the diagram was already SEALED (`issue-312-load-login-errors`), so `## Supersedes: none` is right. Scope matches the operator's choice (8 pages; Visits/Dashboard left out and listed under `## Still open`). Nothing beyond that was changed.

## Gaps noted (not blocking)
- The other 7 pages and the EN text were not checked live. They use the same composable and the same 1-line wiring, and the grep confirms it.
- Visits/Dashboard still show zeros on a failed load (out of scope). #312 needs a follow-up issue, or a note when it is closed.

## PM status
Row set to SEALED, full row appended to `dev-loop-archive.md`, active row replaced with a pointer. Pointer rows were 24, so the 4 oldest (`issue-260`, `issue-262`, `issue-266-i18n-phase1-shared-auth`, `issue-271`) were pruned. Their full rows were already in the archive.

## Re-run
none. Audit only: the outputs are cited, the commands match doctrine and the diff is not outward-facing. The only extra checks were a read-only grep and `gh issue view 347`. No command was re-run.
