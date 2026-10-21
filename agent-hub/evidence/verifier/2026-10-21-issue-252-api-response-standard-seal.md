# 2026-10-21 - issue-252-api-response-standard - SEAL

- Worker: verifier (v0.1.0)
- Node: `issue-252-api-response-standard` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence reviewed: `evidence/implementer/2026-10-21-issue-252-api-response-standard.md`
- Issue: [#252](https://github.com/datvt243/resume-vuejs-website/issues/252), body (6 change points + 4 acceptance boxes) and the owner comment (commit `API-STANDARD.md` unchanged), read with `gh issue view 252 --json body,comments`.
- Verdict: **SEAL**

## Isolation proof
This pass is a separate Agent-tool subagent spawned by the implementer session on 2026-10-21 for this node, with the task string `verifier "agent-hub/evidence/implementer/2026-10-21-issue-252-api-response-standard.md"` and an explicit "you did NOT write the diff under review" brief. This context has no memory of writing the diff and did not open it; it read only the evidence note, the issue, and the diagram row.

## Re-run
`none`. The note's output is verbatim and untruncated, its commands match `doctrine/MEMORY.md` (`npm run test`, `npm run build`, plus lint), and Typecheck is declared CANNOT RUN. The node is not outward-facing. The only extra check was `git log -- API-STANDARD.md`, which confirms the note's claim that the file is tracked (`45b5101`). That is a fact lookup, not a re-run.

## Acceptance, one by one
| Criterion | Cited | OK |
|---|---|---|
| 400 validation does not refresh or log out; 401 `TOKEN_EXPIRED` still refreshes | `axios.spec.ts` cases (`refreshCalls() === 0`, no `logOut`; TOKEN_EXPIRED gets 1 refresh + retry). The `INVALID_CREDENTIALS` cases fail on the old code (stash run: 7 failed). | yes |
| 2xx `success:false` gives an error toast and no callback | `base.spec.ts` "treats a 2xx body with success:false as an error". It fails on the old code. | yes |
| Toast/form correct for the legacy `{message, errors}` and new `{error:{message, details}}` bodies, with vitest for both | `base.spec.ts` `it.each` legacy/new, same toast string. Form: the optional "if possible" VeeValidate field mapping is not done and is logged under "Noticed, not done". Form behavior is unchanged from before, since server errors already went only to the toast. | yes |
| No more reading `invalidToken` | `grep -rn invalidToken src \| grep -v i18n` returns nothing. | yes |
| Issue items 4/5/6 (network fallback shape, types, list `meta`) | `axios.spec.ts` NETWORK_ERROR case; `api.type.ts` row; item 6 needs no change, with the grep cited. | yes |
| Comment: commit `API-STANDARD.md` unchanged | Already tracked on `staging` in `45b5101`, confirmed via `git log`. Nothing to commit. | yes |
| No regressions | Full suite `1 failed \| 268 passed (269)`. The single failure is the known pre-existing VeeForm one; baseline was 256+1, plus 12 new tests. `✓ built in 3.78s`. Lint clean. | yes |
| Comments per code-comments.md | WHY-only comments listed. | yes |

## Forbidden states
None hit. Evidence is present and verbatim. The branch is `feature/issue-252-api-response-standard`, not main, cut from `staging` `f8ba8ee` (no MAIN_EDIT). There was no outward-facing action (no commit, push or API write), so no seal gate applies. Proportionality is fine: the diff touches only the 4 files named by the issue, plus a one-line stale comment in `useAuthRedirect.ts` that described the removed flag, plus 2 specs. The extra findings were logged but not fixed.

## Follow-ups (not blocking)
- Optional item 3 mapping of `details[].field` into VeeValidate field errors. A follow-up issue is suggested.
- `PageImportLinkedin.vue:89` reads `err.message`, which will be `undefined` under the phase-5 envelope. It should read `err.error?.message ?? err.message`. This is worth its own node before backend phase 5 reaches Render.

## PM status
`issue-252-api-response-standard`: IN_PROGRESS -> SEALED (row updated in place).
