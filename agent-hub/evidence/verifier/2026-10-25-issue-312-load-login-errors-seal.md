# 2026-10-25 - issue-312-load-login-errors - SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-312-load-login-errors` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note audited: `evidence/implementer/2026-10-25-issue-312-load-login-errors.md`

## Isolation proof
Spawned as a fresh subagent with the task string `/worker verifier "issue-312-load-login-errors — evidence note agent-hub/evidence/implementer/2026-10-25-issue-312-load-login-errors.md"` and the instruction to work only in worktree `/Users/_david/Workspace/Project/resume/rv-wt312`; no memory of the implementer pass.

## Verdict: SEAL

## Cited
- A (scoped: failed load visible with reason): base spec — `toastError` receives `{ message: 'Too many requests', bg: 'danger' }` on a rejected silent fetch, not called on success; red on old `base.ts`. The 3 `toast: null` callers (useCandidate/useVisits/useVisitStats) pass `toastError: toast`. Full retry UI declared under `## Still open`, PR "Refs #312" keeps the issue open.
- B (login reason): auth spec, 3 tests (new envelope, legacy body, TypeError → generic `t('error.loginFailed')`); 2 red on old `auth.ts`, fallback green on both as expected.
- C (hung request ends): axios spec `timeout === 90_000`, red on old `axios.ts`; no-response → `NETWORK_ERROR` covered by the existing spec. 90 s chosen above the Render cold start.
- Commands match `doctrine/MEMORY.md`: `npm run test` 282 passed + 1 pre-existing VeeForm failure (baseline cited to the #307 note) · `npm run build` `✓ built in 3.71s` · `npm run typecheck` 90 = baseline (the 93→90 regression caught and fixed is recorded) · eslint on changed files clean.
- Comments per code-comments.md: three `//` WHY comments, no `(#N)`.
- Output is verbatim excerpts, no truncation markers.

## Missing
None for the scoped criteria. Manual browser check BLOCKED (hidden Playwright window) — declared, and covered by the spec red/green checks.

## Forbidden states
ADHOC_WORK clear (node row on diagram, worker used) · NO_EVIDENCE clear · EDIT_UNVERIFIED clear (all commands read back, typecheck counted) · CODE_IN_HAVEN clear (no code files under `haven/`) · DIAGRAM_DRIFT clear (row updated to SEALED here) · MAIN_EDIT clear (branch `fix/issue-312-load-login-errors` off `staging` `3c06ad3`, confirmed checked out in the worktree).

## Other checks
- Supersedes: none; only one #312 row on the active diagram (this node).
- Seal gate: none needed (no commit/push).
- Proportionality: diff limited to the three scoped parts + their specs. The `useDownloadCv` 90 s side effect is logged under "Noticed, not done", not acted on.

## PM update
Row collapsed to a SEALED pointer, full row appended to `haven/diagrams/dev-loop-archive.md`; pointer rows trimmed to 20 (dropped issue-221/222/223 pointers, full rows already archived).

## Re-run
none — audit-only; note is verbatim, commands match doctrine, every criterion cited, not outward-facing.
