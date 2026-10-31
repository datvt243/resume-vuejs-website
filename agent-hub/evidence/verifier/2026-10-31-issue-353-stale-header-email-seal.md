# 2026-10-31 — issue-353-stale-header-email — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-353-stale-header-email` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note under review: `evidence/implementer/2026-10-31-issue-353-stale-header-email.md`

## Isolation proof
Separately spawned Agent subagent (fresh context, no memory of the implementer pass), launched from the implementer's `/todo` session with the task string "You are a fresh verifier subagent ... Invoke the Skill tool with skill "worker" and args: verifier "agent-hub/evidence/implementer/2026-10-31-issue-353-stale-header-email.md"". This session wrote no part of the diff.

## Verdict: SEAL

## Cited
| Criterion | Evidence |
|---|---|
| 1. B's user in the store before `isAuthenticated` can show A | Note: `setUser` moved to right after `setTokens`, before any await. Root cause matches `stores/auth.ts:47` (`isAuthenticated = !!_user?.email && !!_refreshToken`). |
| 2. Spec asserts order, red without fix | New `handleLogin success` test; stash run `Tests  1 failed | 4 passed (5)`, with fix `5 passed (5)`. |
| 3. test/build/lint/typecheck | `npm run test` 305/305 · build `✓ built in 3.73s` · lint exit 0 · typecheck 90 errors = baseline, `auth.ts` 17 before and after (same codes). |
| Comments per code-comments.md | One `//` single-sentence why-comment above `setUser` (`auth.ts:48`), no issue ref, says why not what. OK. |

## Failure path (operator asked to check)
Note's claim holds: `catch` (`auth.ts:55`) calls `authStore().setTokens()` with defaults, which clears `_refreshToken`, so `isAuthenticated` stays false after a failed candidate fetch. B's user now remains in `localStorage` instead of A's, which is display-only and no worse than before. Confirmed by reading `auth.ts` `catch` and `stores/auth.ts` `setTokens`. This was a read of existing code to check one claim, not a review of the diff.

## Missing
none

## Forbidden states
None hit. Branch `fix/issue-353-stale-header-email` (not main/staging) → no `MAIN_EDIT`. Commands match `doctrine/MEMORY.md`. Outputs cited, not truncated. Typecheck cited. Diff scoped to the node (the `Object.assign` stale-key concern is listed under "Noticed, not done", not folded in) → `SmallestDiff` OK. Supersedes: none, and there's no other open #353 row.

## Seal gate
N/A: no commit, push, or data write.

## Re-run
none (audit-only; the note is complete and verbatim, and the node isn't outward-facing)
