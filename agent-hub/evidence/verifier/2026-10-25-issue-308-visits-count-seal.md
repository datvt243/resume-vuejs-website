# 2026-10-25 - issue-308-visits-count - SEAL

- Worker: verifier 0.1.0
- Node: `issue-308-visits-count` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note under review: `evidence/implementer/2026-10-25-issue-308-visits-count.md`
- Verdict: **SEAL**

## Isolation proof
This pass was spawned as a fresh subagent with the task string `verifier "issue-308-visits-count — evidence note agent-hub/evidence/implementer/2026-10-25-issue-308-visits-count.md"` and the worktree instruction (`/Users/_david/Workspace/Project/resume/resume-vuejs-website-wt308`). It has no memory of the implementer pass and did not write the diff.

## Re-run
`none`: audit only. The output is verbatim, the commands match `doctrine/MEMORY.md`, and the node is not outward-facing.

## Checks
| Check | Result |
|---|---|
| Commands vs doctrine | `npm run test`, `npm run build`, `npm run typecheck` from the worktree root, plus `npx vitest run <file>`. These match `doctrine/MEMORY.md`. |
| Output not truncated | Summary lines quoted verbatim; no `...` or "truncated". |
| 1. All-time count is the real total | Spec "count from meta.total" (1375). Live shape check: `count_new":1648`, where the old code's `data.count` gave `undefined`, which became 0. |
| 2. Detail table lists visits | Spec: `visits` = `data` array. Live items have `createdAt`/`location`/`ip`. |
| 3. Dashboard card | Reads the same cached `visitCount` (`PageHome.vue:48`), which the spec-covered callback sets. |
| 4. Spec | `useVisits.spec.ts`: `Tests  3 passed (3)`. |
| Tests | 276 passed, 1 failure (`VeeForm` VI/EN toggle). The note says it was already failing before this diff, and the sibling #307 note recorded that with a `git stash` baseline run (same test, `expected 'VI' to contain '!'`). `VeeForm` is untouched. |
| Build / typecheck | `✓ built in 3.60s`. 90 `error TS` (= baseline), none in `useVisits`. |
| Comments per code-comments.md | Header comment updated to the current API envelope, with no `(#N)` ref. |
| Supersedes / still open (6b) | `## Supersedes: none` / `## Still open: none`. The active diagram has only one #308 row. |
| Forbidden states | NO_EVIDENCE no · EDIT_UNVERIFIED no · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row present) · MAIN_EDIT no. |
| Branch (7b) | `fix/issue-308-visits-count` off `staging` `148b268`, in a separate worktree. |
| Seal gate (8) | No commit/push. Only a read-only API call with the test account. |
| Proportionality (9) | 1 composable, 1 new spec, 1 diagram row. Unbounded-list perf was noted but not done. |

## Caveat (not blocking)
The manual browser click-through was BLOCKED: the Playwright window was hidden, and CORS only allows `:5173`. The logic sits wholly in the spec-covered composable, and the 3 consumers are unchanged and read its cache. Release re-testing should still confirm the UI shows the real count.

## PM status
The row was archived to `haven/diagrams/dev-loop-archive.md`, and the active row was replaced in place with a SEALED pointer. The 2 oldest pointer rows (`issue-219-home-overview`, `issue-220-visits-analytics`, whose full rows are already in the archive) were pruned to keep 20 pointers.
