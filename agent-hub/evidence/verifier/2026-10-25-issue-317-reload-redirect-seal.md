# 2026-10-25 - issue-317-reload-redirect - SEAL

- Worker: verifier 0.1.0
- Node: `issue-317-reload-redirect` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note under review: `evidence/implementer/2026-10-25-issue-317-reload-redirect.md`
- Verdict: **SEAL**

## Isolation proof
This pass was spawned as a fresh subagent with the task string `verifier "issue-317-reload-redirect — evidence note agent-hub/evidence/implementer/2026-10-25-issue-317-reload-redirect.md"` and the worktree instruction (`/Users/_david/Workspace/Project/resume/rv-wt317`, branch `fix/issue-317-reload-redirect`). It has no memory of the implementer pass and did not write the diff.

## Re-run
`none`: audit only. The output is quoted verbatim, the commands match `doctrine/MEMORY.md`, and the node is not outward-facing.

## Checks
| Check | Result |
|---|---|
| Commands vs doctrine | `npm run test`, `npm run build`, `npm run typecheck` from the worktree root, plus `npx vitest run <file>` and `npx eslint` on changed files. These match `doctrine/MEMORY.md`. |
| Output not truncated | Summary lines quoted verbatim; no `...` or "truncated". |
| 1. Reload keeps the URL (incl. `#/`) | Root cause is named precisely (`App.vue` mount push of `current-page`). The push is removed and `grep -rn "current-page" src` returns nothing. Spec "keeps the loaded URL on a reload" stays at `/`. The note says plainly that this spec also passes on the old composable, and that criterion 1 rests on the removal. That is honest, and it is enough for a pure deletion of the only override. |
| 2. Deep links respected | Same removal; no mount push remains for non-guest routes. Existing spec keeps `/dashboard/information`. |
| 3. Logged-in `/login`/`/register` goes to dashboard | New spec failed without the composable change (`1 failed | 5 passed`) and passes with it (`6 passed`). Logged-out user stays on `/login`. The login push in `services/auth.ts` is unchanged. |
| Tests | 280 passed, 1 failure (`VeeForm` VI/EN toggle). That failure is already on `staging`, per the #307 baseline. `VeeForm` is untouched. |
| Build / typecheck / lint | `✓ built in 3.68s`. 90 `error TS` (= baseline), none in the changed files. eslint is clean on the 3 source files. |
| Comments per code-comments.md | Doc comment extended, no `(#N)` ref. A dead WHAT comment was removed along with its block. |
| Supersedes / still open (6b) | `## Supersedes: none` / `## Still open: none`. The active diagram has only one #317 row. |
| Forbidden states | NO_EVIDENCE no · EDIT_UNVERIFIED no · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row present) · ADHOC_WORK no · MAIN_EDIT no. |
| Branch (7b) | `fix/issue-317-reload-redirect` off `staging` `3c06ad3`, in worktree `../rv-wt317`. |
| Seal gate (8) | No commit or push. |
| Proportionality (9) | 2 deletions, 1 composable addition that keeps the old guest-page redirect (criterion 3), 1 spec. The stale `localStorage` key was noted but not cleaned. |

## Caveat (not blocking)
The manual browser reload check was BLOCKED because the Playwright window was hidden. `App.vue` has no spec harness, so release testing must reload `#/` by hand and confirm it stays on the dashboard home.

## PM status
The row was archived to `haven/diagrams/dev-loop-archive.md` (state SEALED), and the active row was replaced in place with a SEALED pointer. There were 23 pointer rows, so the 3 oldest (`issue-221-table-default`, `issue-222-forms`, `issue-223-crud-lists`) were pruned to keep 20. Their full rows are already in the archive.
