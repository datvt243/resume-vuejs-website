# 2026-10-27 — issue-312-visits-error-retry — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-312-visits-error-retry` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note audited: `evidence/implementer/2026-10-27-issue-312-visits-error-retry.md`

## Isolation proof
Spawned as a separate subagent with the task string "You are a fresh verifier pass for the agent-hub ... you did not write this diff — you were spawned as a separate subagent", invoking `/worker verifier "agent-hub/evidence/implementer/2026-10-27-issue-312-visits-error-retry.md"`. This context wrote no code on this branch and did not open the diff.

## Verdict: SEAL

## Criteria
| Criterion | Cited evidence | OK |
|---|---|---|
| A failed visits/stats load is not shown as zero/empty | live Playwright run, 500 on `candidate/visits` + `candidate/visits/stats` → alert on Home and Visits, `table: false` | yes |
| Retry re-runs the failed fetches and recovers | live: `["stats","visits"]` one request each after the click, alert gone, table shown; `PageVisits.spec` retries only what failed | yes |
| No duplicate visits fetch | retry goes through the `reloadVisits` that `LayoutDefault` provides, no second `useVisits()` | yes |
| i18n / DESIGN.md reuse | existing keys `error.loadList`, `error.loadListDescription`, `common.retry`; `NoData` + `Button`, `role="alert"` | yes |
| Test | targeted specs `17 passed (17)`; full suite 2 failed, both in untouched `VeeForm.spec.ts`. The VI/EN test is tracked in open #347 (checked: `gh issue view 347` → OPEN). The 2nd one passes when the file runs alone with the diff applied (3 runs), so it only fails under full-suite load | yes |
| Build / lint / typecheck | `✓ built in 4.05s`, lint exit 0, typecheck 90 = baseline; the only hit in a touched file (`useVisitStats.ts` TS2352) is also on the clean tree | yes |
| Comments per code-comments.md | three 1-line why-comments | yes |

## Forbidden states
None hit. Branch `fix/issue-312-visits-error-retry` (not `main`/`staging`). No commit/push and no data written (the QA account was only read), so no seal gate is needed. The only other #312 rows on the diagram are already SEALED, so `## Supersedes: none` is right. Scope matches the `## Still open` item of `issue-312-load-error-retry`; the Home KPI `—` is part of "Dashboard stats render zeros".

## Gaps noted (not blocking)
- Home's `—` KPI and the EN copy were not checked live, only in the template and specs.
- The 2nd VeeForm failure ("typing then clearing a required field…") is not named in #347. Add it there or open a follow-up.
- Home: if only the visits list fails, the KPI shows `—` with no retry on that card (the note lists this).

## PM status
Row set to SEALED. Full row appended to `dev-loop-archive.md`, active row replaced with a pointer. That made 21 pointer rows, so the oldest one (`issue-252-api-response-standard`) was pruned. Its full row was already in the archive.

## Re-run
none. Audit only: the outputs are cited, the commands match doctrine and the diff is not outward-facing. The only extra check was a read-only `gh issue view 347`.
