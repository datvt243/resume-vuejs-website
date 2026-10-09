# 2026-10-10 - issue-177-forced-logout-redirect - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-177-forced-logout-redirect` in `haven/diagrams/dev-loop.prime-mermaid.md`
- Evidence reviewed: `evidence/implementer/2026-10-10-issue-177-forced-logout-redirect.md`

## Isolation proof
Spawned as a fresh subagent with task string: "You are a fresh verifier subagent. Run the project skill `/worker verifier` ... on agent-hub/evidence/implementer/2026-10-10-issue-177-forced-logout-redirect.md ... You were spawned specifically to verify". This context holds no implementer turns; diff not opened (EvidenceOnly).

## Re-run
none — audit-only. Note's commands match `doctrine/MEMORY.md`, output verbatim, every criterion cited; node is not outward-facing.

## Verdict: SEAL

| Check | Result |
|---|---|
| Commands vs MEMORY.md | `npm run test`, `npm run build`, `npm run lint` from repo root; Typecheck explicitly CANNOT RUN |
| Output truncated? | No — verbatim result lines quoted |
| Forced logout (no router) on protected route → `/login` | spec passes; mutation test (redirect neutralised) fails `1 failed / 2 passed`, restored → `3 passed` — test proven to catch the bug |
| Both logout paths (axios refresh fail, base invalidToken) | both go through `authStore().logOut()` → `isAuthenticated` false → single root watcher; reasoning sound and spec calls `logOut()` without router exactly as call sites do |
| Public `/resume/:slug` not hijacked | spec passes |
| No spurious navigation while auth valid | spec passes |
| Build | `✓ built in 4.59s` |
| Lint | exit 0 |
| Full suite | `3 failed / 144 passed`; the 3 are the `VeeForm.spec.ts` failures already proven pre-existing by controlled reproduction on pure `staging` and accepted in `evidence/verifier/2026-10-09-issue-176-178-sanitize-html-seal.md`. This diff touches neither VeeForm nor vee-validate — accepted on that evidence. |
| comments per code-comments.md | row present: one WHY JSDoc on exported composable, one `//` in spec, no issue refs/history |
| Forbidden states (6) | none hit |
| Branch (NoMainEdit) | `fix/issue-177-forced-logout-redirect` off `staging` |
| Seal gate | none needed — no commit/push/merge |
| Proportionality | 3 files (new composable, +2 lines App.vue, new spec); services/stores untouched; extra-401 double-logout left in "Noticed, not done" — correctly scoped |

Disclosed gap (accepted): no live authenticated browser check; spec uses real vue-router + real Pinia store, which covers the criterion at unit level.

## Follow-ups (not blocking)
- Guard repeated `logOut()` on concurrent 401s (implementer's "Noticed, not done").
- `VeeForm.spec.ts` flakiness — separate node.
