# 2026-10-25 - issue-310-toast-language - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-310-toast-language` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence reviewed: `evidence/implementer/2026-10-25-issue-310-toast-language.md`

## Verdict: SEAL

## Isolation proof
Spawned as a fresh verifier subagent with the task string `verifier "issue-310-toast-language — evidence note agent-hub/evidence/implementer/2026-10-25-issue-310-toast-language.md"`, told to work only in worktree `/Users/_david/Workspace/Project/resume/rv-wt310`. This context has no memory of the implementer pass and did not write the diff.

## Cited
| Criterion | Evidence in note |
|---|---|
| 1. Toasts from API messages follow UI language (base.ts + auth.ts) | Interceptor sets `Accept-Language` from `i18n.global.locale` on every `_axios` call (covers `handleBase` and `auth.ts`). Spec `axios.spec.ts` fails without the change (`1 failed`) and passes with it (`7 passed`). Live API: `en` gives `Validation has errors`, `vi` gives `Dữ liệu không hợp lệ`. |
| 2. Takes effect on the next request, no reload | Spec flips the locale between two calls; adapter sees `['en', 'vi']`. |
| Cross-site safe | Preflight from `https://datvt243.github.io` returns `access-control-allow-headers: authorization,accept-language`. |
| Test (`npm run test`) | `1 failed / 278 passed (279)`. The one failure is pre-existing on `staging` (`VeeForm > VI / EN toggle`), with its baseline cited in the #307 note. |
| Build (`npm run build`) | `built in 3.68s` |
| Typecheck (`npm run typecheck`) | 90 errors = MEMORY.md baseline. The same 7 `services/axios` errors exist on clean `staging`, with line numbers shifted +2. None are new. |
| Comments per code-comments.md | One `//` WHY comment, no `(#N)`. |

## Missing
none. The manual browser check is declared BLOCKED (hidden Playwright window). It is covered by the spec plus the live API responses.

## Forbidden states
ADHOC_WORK no (node row exists) · NO_EVIDENCE no · EDIT_UNVERIFIED no (test, build and typecheck all cited verbatim) · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row updated) · MAIN_EDIT no: the branch is `fix/issue-310-toast-language` off `staging` `3c06ad3`, and the worktree `git branch --show-current` confirms it.

## Seal gate
No outward-facing action (no commit, push or deploy). The live calls were an unauthenticated invalid login and an OPTIONS request.

## Proportionality
2 source files (`axios.ts` +2 lines, a new spec) plus the diagram row. Nothing outside the node. The `refreshTokens` gap is noted, not touched.

## Supersedes / still open
Both are declared `none`. No other open #310 row exists on the active diagram.

## PM status
The row was archived verbatim (state SEALED) to `dev-loop-archive.md` and replaced in place with a pointer. The active pointer rows went to 23 (cap 20), so the 3 oldest were removed: `issue-221-table-default`, `issue-222-forms`, `issue-223-crud-lists`. Their full rows were confirmed present in the archive first.

## Re-run
none. Audit only: the output is verbatim, the commands match `doctrine/MEMORY.md`, and every criterion is covered.
