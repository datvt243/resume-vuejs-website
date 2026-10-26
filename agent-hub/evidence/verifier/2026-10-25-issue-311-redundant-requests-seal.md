# 2026-10-25 - issue-311-redundant-requests - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-311-redundant-requests` (`haven/diagrams/dev-loop.prime-mermaid.md`, now SEALED and archived)
- Evidence reviewed: `evidence/implementer/2026-10-25-issue-311-redundant-requests.md`
- Branch named in note: `fix/issue-311-redundant-requests` (non-main, off `staging` `3c06ad3`, worktree `rv-wt311`). MAIN_EDIT: no.

## Isolation proof
Spawned as a fresh verifier subagent with the task string `verifier "issue-311-redundant-requests — evidence note agent-hub/evidence/implementer/2026-10-25-issue-311-redundant-requests.md"` and an instruction to write hub files only in the `rv-wt311` worktree. This context did not write the diff and did not open it.

## Verdict: SEAL

## Cited
- Criterion 1 (no 401 burst after reload): new `axios.spec.ts` test, with an empty access token, a refresh token and 2 parallel GETs, gets exactly 1 refresh and both requests carry `Bearer new`. It fails on the stashed old `axios.ts` (`1 failed | 18 passed (19)`). The existing 401-refresh, dedupe and NETWORK_ERROR specs still pass.
- Criterion 2 (a fetched empty list stays cached): new `useCandidate.spec.ts` test, `awards: []` gives no fetch. It fails on the old file (`1 failed | 18 passed (19)`). The note also checked the live payload: none of the 9 fields is pre-set.
- Criterion 3 (stats fetched once): the node's diagram row puts this on the App.vue mount redirect that node `issue-317-reload-redirect` removed. That node is SEALED (`rv-wt317/agent-hub/evidence/verifier/2026-10-25-issue-317-reload-redirect-seal.md`; branch pushed to origin). The verifier confirmed with grep that `useVisitStats()` has exactly 2 callers, `PageHome.vue:67` and `PageVisits.vue:23`, and that it fetches once per mount (`watch(interval, getData, { immediate: true })`). The dependency is recorded under `## Still open`.
- Commands match `doctrine/MEMORY.md`. `npm run test` gives `1 failed | 279 passed (280)`, and the one failure is the `VeeForm` VI | EN test that already fails on `staging`. `npm run build` gives `✓ built in 3.71s`. `npm run typecheck` gives 90 errors, which equals the baseline; the errors in the changed files are the same pre-existing ones, only moved to new line numbers. eslint on the changed files is clean.
- Comments per code-comments.md: `//` comments explaining WHY, with no `(#N)`.
- Supersedes: none, and no other open #311 row is on the active diagram. Still open is declared.
- Seal gate: no commit or push. One read-only API call (login + GET) was declared.
- Proportionality: 2 source files and 2 specs, all inside the node. The rate-limit config is listed as noticed, not done.

## Missing
none

## Forbidden states
None hit. The output is quoted, not truncated. The manual browser check is declared BLOCKED with a reason, and specs cover criteria 1 and 2.

## Re-run
none. This was an audit only. The verifier ran only a grep and a read of the non-diff `useVisitStats.ts` to back criterion 3; no build or test was re-run.

## Release note
Merge `fix/issue-317-reload-redirect` before or together with this branch. Then re-count the `visits/stats` and 401 requests in the network tab after a reload.

## PM status
The row was set to SEALED and archived to `haven/diagrams/dev-loop-archive.md`. The active row is now a pointer, edited in place. The 3 oldest pointer rows (`issue-221/222/223`) were removed to keep 20 pointers; their full rows are already in the archive.
