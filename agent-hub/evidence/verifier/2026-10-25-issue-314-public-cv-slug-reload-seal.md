# 2026-10-25 - issue-314-public-cv-slug-reload - SEAL

- Worker: verifier 0.1.0
- Node: `issue-314-public-cv-slug-reload` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note under review: `evidence/implementer/2026-10-25-issue-314-public-cv-slug-reload.md`
- Verdict: **SEAL**

## Isolation proof
This pass was spawned as a fresh subagent with the task string `verifier "issue-314-public-cv-slug-reload — evidence note agent-hub/evidence/implementer/2026-10-25-issue-314-public-cv-slug-reload.md"` and the worktree instruction (`/Users/_david/Workspace/Project/resume/rv-wt314`). It has no memory of the implementer pass and did not write the diff.

## Re-run
`none`: audit only. The output is verbatim, the commands match `doctrine/MEMORY.md`, and the node is not outward-facing.

## Checks
| Check | Result |
|---|---|
| Commands vs doctrine | `npm run test`, `npm run build`, `npm run typecheck` from the worktree root, plus `npx vitest run <spec>` with and without the fix. These match `doctrine/MEMORY.md`. |
| Output not truncated | Summary lines quoted verbatim; no `...` or "truncated". |
| 1. Refetch on slug change | New spec drives a real `<RouterView />`: GETs `['api/me/alice', 'api/me/bob']`, bob rendered. Red on the old file (`1 failed / 5 passed`), green with the fix (`6 passed`). |
| 2. Unknown slug → not-found | Same spec: after `/resume/missing`, `.cv-introduction` gone and `.no-data` shown. `load` resets `data`/`notFound`/`loading` first. |
| 3. Existing behaviour kept | The 5 existing tests (`?lang`, visit POST, no visit on not-found) pass. |
| Tests | 278 passed, 1 failure (`VeeForm` VI/EN toggle), already failing on `staging` per the #307 baseline. Not touched here. |
| Build / typecheck | `✓ built in 3.75s`. 90 `error TS` (= baseline), none in `PagePublicResume`. |
| Comments per code-comments.md | One `//` WHY comment, no `(#N)` ref. |
| Supersedes / still open (6b) | `## Supersedes: none` / `## Still open: none`. The active diagram has only one #314 row. |
| Forbidden states | ADHOC_WORK no · NO_EVIDENCE no · EDIT_UNVERIFIED no · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row present) · MAIN_EDIT no. |
| Branch (7b) | `fix/issue-314-public-cv-slug-reload` off `staging` `3c06ad3`, in worktree `rv-wt314` (confirmed checked out). |
| Seal gate (8) | No commit/push. |
| Proportionality (9) | 1 page, 1 spec, 1 diagram row. The out-of-order-response race was noted but not done. |

## Caveat (not blocking)
The manual browser check was BLOCKED (the Playwright window was hidden). The spec mounts the real page under a real router, so the criteria are covered. Release re-testing should still edit the slug by hand once.

## PM status
The row was archived to `haven/diagrams/dev-loop-archive.md`, and the active row was replaced in place with a SEALED pointer. The 3 oldest pointer rows (`issue-221-table-default`, `issue-222-forms`, `issue-223-crud-lists`, whose full rows are already in the archive) were pruned to keep 20 pointers.
