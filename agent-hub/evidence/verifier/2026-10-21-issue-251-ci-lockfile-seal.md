# 2026-10-21 - issue-251-ci-lockfile - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-251-ci-lockfile` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note under review: `evidence/implementer/2026-10-21-issue-251-ci-lockfile.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a fresh verifier subagent (Agent tool) with task string: `verifier "#251 CI lockfile regression fix — evidence note: agent-hub/evidence/implementer/2026-10-21-issue-251-ci-lockfile.md (node issue-251-ci-lockfile, branch fix/issue-251-ci-lockfile)"`, plus instructions not to commit/push/call GitHub or run npm install/ci. This context did not write the diff.

## Re-run
`partial` — re-ran `npm run lint`, `npm run build`, `npm run test` and read installed/locked vue-i18n state. Reason: release gate (this node exists to unblock the failed v1.23.0 deploy and precedes `/release patch`). Did NOT re-run `npm ci` (operator instruction: node_modules already in the described state).

## Cited
| Criterion | Evidence |
|---|---|
| `npm ci` accepts lock under npm 10.8.2 | Note: npm 10.8.2 dry-run, 0 `npm error` lines (before: `Missing: yaml@2.9.1 from lock file`). Verifier read of `package-lock.json`: `node_modules/tailwindcss/node_modules/yaml@2.9.1` now present; root dep + `node_modules/vue-i18n` both `11.4.2`. Final proof stays the PR's own CI check, as the note's seal-gate plan states. |
| vue-i18n supports Node 20 | `node_modules/vue-i18n/package.json`: version `11.4.2`, `engines {"node":">= 16"}`. `package.json` line 34: `"vue-i18n": "11.4.2"`. |
| App behaviour unchanged | Verifier re-run: lint printed no errors; build `✓ built in 3.78s`; test `Test Files 1 failed \| 39 passed (40)`, `Tests 1 failed \| 254 passed (255)` — the sole failure (`VeeForm > VI \| EN toggle > flags the hidden language that has a validation error`) matches the note and is recorded as pre-existing in the earlier #251 notes. |
| Comments per code-comments.md | No code comments; diff is `package.json` + lockfile only. |
| Typecheck | Note states CANNOT RUN explicitly. |

## Forbidden states
- ADHOC_WORK: no — node exists on diagram.
- NO_EVIDENCE: no — note present.
- EDIT_UNVERIFIED: no — outputs quoted and independently reproduced (lint/build/test).
- CODE_IN_HAVEN: no — only a diagram row changed in `haven/`.
- DIAGRAM_DRIFT: no — row present, now SEALED.
- MAIN_EDIT: no — branch `fix/issue-251-ci-lockfile` (confirmed current branch).

## Seal gate
No outward-facing action taken; note defers commit/PR/merge/release to `/ship` + `/release patch` and says to wait for green CI before merging.

## Proportionality
Two files (`package.json` 1 line, lockfile 51+/33-). `yarn.lock` churn reverted. Out-of-scope items (required status checks, Node 22 upgrade, toolchain pin) listed under "Noticed, not done", not acted on.

## Missing
None.
