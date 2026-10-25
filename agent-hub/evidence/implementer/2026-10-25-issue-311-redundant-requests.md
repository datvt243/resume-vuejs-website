# 2026-10-25 - issue-311-redundant-requests

- Worker: implementer
- Version: 0.1.0
- Node: `issue-311-redundant-requests` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, operator): "xong hết thì tiếp tục P3-P4". This pass covers issue #311 "[QC][P3] Request thừa (401 hàng loạt mỗi lần reload, refetch list rỗng, stats gọi 2 lần) làm chạm rate limit 100 req → 429".

## Hub bytes before: 82257
(Same tree state as the sibling #310/#312/#314–#317 notes: clean `staging` `3c06ad3`.)

## Branch
`fix/issue-311-redundant-requests`, created from up-to-date `staging` (`3c06ad3`) via `gh issue develop 311 --base staging --name fix/issue-311-redundant-requests`. It is checked out in the git worktree `../rv-wt311` (`node_modules` symlinked).

## Acceptance criteria (the 3 sources listed in #311)
1. After a reload, data requests don't each 401 first. One refresh happens, then requests go out with the new token.
2. A list that was fetched and came back empty isn't refetched on every visit.
3. `candidate/visits/stats` isn't requested twice on dashboard load.

## Diff
| File | Why |
|---|---|
| `src/services/axios.ts` | (1) The access token is memory-only (CLAUDE.md), so after a reload only the refresh token is left and every initial GET went out tokenless → 401 → refresh → retry, roughly twice the requests. The request interceptor is now `async`. When there is no access token but there is a refresh token, it first awaits `refreshOnce()`, so all concurrent requests share one `auth/refresh`, then attaches the new token. The existing dedupe block in the 401 path is extracted into `refreshOnce()`, so both paths share one in-flight promise. That matters because the backend rotates refresh tokens, so a second parallel refresh would fail. A failed up-front refresh is swallowed: the request then goes out without a token and the unchanged 401 path still handles it (refresh → `logOut`). Two `//` WHY comments (one replaces the old Vietnamese dedupe block comment, same meaning). |
| `src/composables/useCandidate.ts` | (2) `hasCachedData` was `length > 0`, so a legitimately empty list (no awards, etc.) counted as "not fetched" and refetched on every mount. It is now "the field is set on the candidate store" (`!= null`). A failed fetch never sets the field, so it is still retried next time. Checked against the live `GET candidate/:email` payload: none of the 9 `useCandidate` fields (`applications, awards, certificates, educations, experiences, generalInformation, profiles, projects, references`) is pre-set by it, so nothing is mistaken for cached. One `//` WHY comment. |
| `src/services/axios.spec.ts` | New test: `getToken` empty + refresh token → 2 parallel GETs → exactly 1 refresh, both GETs carry `Bearer new`, no 401 round trip. |
| `src/composables/useCandidate.spec.ts` | New test: `awards: []` cached → no fetch. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

**(3) Duplicate stats fetch: no diff here.** #311 attributes it to "the App.vue redirect mounts the page twice". That is the `onMounted` `router.push(current-page …)` removed by node `issue-317-reload-redirect` (SEALED, branch `fix/issue-317-reload-redirect`). `useVisitStats()` has exactly 2 callers, `PageHome.vue:67` and `PageVisits.vue:23`, one per page, so once the double mount is gone each page fetches once. **Criterion 3 depends on #317 being merged.** It is not re-measured here.

## Command
From the worktree root: `npm run test` · `npm run build` · `npm run typecheck` · `npx eslint src/services/axios.ts src/composables/useCandidate.ts`. Also `npx vitest run src/services/axios.spec.ts src/composables/useCandidate.spec.ts`, with each source file stashed in turn.

## Output
With the fix: `Tests  19 passed (19)`.
Red checks:
```
-- old src/services/axios.ts:
   × _axios up-front refresh after a reload > refreshes once before sending when only the refresh token is left, so no request 401s first
      Tests  1 failed | 18 passed (19)
-- old src/composables/useCandidate.ts:
   × useCandidate > does not refetch a list that was fetched and came back empty
      Tests  1 failed | 18 passed (19)
```
`npm run test`: `Tests  1 failed | 279 passed (280)`. The single failure is the pre-existing `VeeForm > VI | EN toggle > flags the hidden language…`, which also fails on `staging` (baseline recorded in `2026-10-25-issue-307-modal-save-close.md`). The existing 401-refresh, dedupe and NETWORK_ERROR specs still pass.
`npm run build`: `✓ built in 3.71s`
`npm run typecheck`: `grep -c "error TS"` → `90` (= baseline). `axios.ts` still has the same 4 pre-existing errors as `staging` (TS7034 `_refreshPromise`, TS7005 `_refreshPromise` (moved from the inline block into `refreshOnce`, line 64 → 47), TS7006 `body`, TS7006 `props`). `useCandidate.ts` has the same 3 as `staging`, shifted by +1 line.
`npx eslint …`: no output (clean).

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. No 401 burst after reload | axios spec: 1 refresh, both requests sent once with `Bearer new`; red on the old file |
| 2. Fetched empty list stays cached | useCandidate spec: `awards: []` → `handleBase` not called; red on the old file. Live payload check: no field pre-set. |
| 3. Stats once per page | No diff here. Caused by the App.vue double mount removed in SEALED node `issue-317-reload-redirect`, and 2 callers on 2 different pages. **Requires #317 merged.** Not re-measured in a browser. |
| Tests / build / typecheck / lint | 279 passed + 1 pre-existing failure · `✓ built in 3.71s` · 90 = baseline · eslint clean |
| Comments per code-comments.md | WHY comments, no `(#N)` |

**Manual browser check: BLOCKED.** The Playwright Chrome window is `visibilityState: "hidden"` (see the #308/#309 notes). The QC request log from the original audit hasn't been re-captured. Re-count requests after a reload at release.

## Supersedes: none
## Still open
- Criterion 3 is verified only by reasoning plus #317. Merge #317 before or with this branch, then re-count `visits/stats` requests in the network tab at release.

## Noticed, not done
- The API rate limit (100/window) is backend config; not touched.

## Seal gate
None (no commit/push). One read-only API call (login + `GET candidate/:email`) to check the payload keys.
