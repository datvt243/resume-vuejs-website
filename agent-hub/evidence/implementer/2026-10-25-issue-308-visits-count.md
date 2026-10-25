# 2026-10-25 - issue-308-visits-count

- Worker: implementer
- Version: 0.1.0
- Node: `issue-308-visits-count` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, operator via `/todo`): "backend đã done, hãy kiểm tra và tiến hành P2". This pass covers issue #308 "[QC][P2] Lượt xem: "Tổng 0 lượt từ trước tới nay", bảng chi tiết trống và thẻ Dashboard = 0 dù có 1.173 lượt/30 ngày".

## Hub bytes before: 82009
(Same measurement as the sibling `issue-307-modal-save-close` note, taken from a clean `staging` tree; 82287 after appending this row.)

## Branch
`fix/issue-308-visits-count`, created from up-to-date `staging` (`148b268`, v1.34.1) via `gh issue develop 308 --base staging --name fix/issue-308-visits-count` (linked to #308). It is checked out in a separate git worktree (`../resume-vuejs-website-wt308`, `node_modules` symlinked) because the main checkout holds the uncommitted, sealed #307 diff awaiting `/ship`.

## Acceptance criteria (from #308)
1. The all-time view count shows the real total, not 0.
2. The Visits detail table lists the visits.
3. The Dashboard "views" card shows the real count.
4. Spec for `useVisits` with the current envelope.

## Diff
| File | Why |
|---|---|
| `src/composables/useVisits.ts` | The callback read the old `{ count, visits }` shape (`data.count`/`data.visits` → `undefined` → `0`/`[]`). It now reads `data` as the list (`Array.isArray` guard → `[]` otherwise) and `meta.total` as the count, falling back to the list length. The header comment is updated to describe the current envelope. All 3 consumers read the same cache, so no other file changes: `PageHome.vue:48` `visitCount`, `PageVisits.vue:21` `visits` (table: `createdAt`/`location`/`ip` — present on each API item), and `PageVisits.vue:46` hint `dataList.length`. |
| `src/composables/useVisits.spec.ts` (new) | 3 tests: list and count from `data` + `meta.total`, cached on `candidateStore`. Fallbacks: no `meta` → length; non-array `data` → 0/`[]`. Cached count (incl. 0) → no refetch. Pattern copied from `useCandidate.spec.ts` (mocked `handleBase`/`useHelper`, real Pinia). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

## Command
From the worktree root, per `doctrine/MEMORY.md`: `npm run test` · `npm run build` · `npm run typecheck`. Also: `npx vitest run src/composables/useVisits.spec.ts`, plus a live API shape check (curl, test account from `.env`).

## Output
`npx vitest run src/composables/useVisits.spec.ts`:
```
 Test Files  1 passed (1)
      Tests  3 passed (3)
```
`npm run test`:
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 11ms
 Test Files  1 failed | 45 passed (46)
      Tests  1 failed | 276 passed (277)
```
The one failure **pre-exists on `staging`** (same test, recorded in `2026-10-25-issue-307-modal-save-close.md` with a `git stash` baseline run). `VeeForm` is not touched here.

`npm run build`: `✓ built in 3.60s`

`npm run typecheck`: `grep -c "error TS"` → `90` (= baseline); `grep useVisits` → no match.

Live API (`GET /api/v1/candidate/visits`, bearer), summarized by a node one-liner:
```
{"isArray":true,"len":1648,"meta":{"page":1,"limit":1648,"total":1648,"totalPages":1},"firstKeys":["_id","candidateId","ip","location","referrer","profileId","createdAt","updatedAt","__v"],"count_new":1648}
```
→ the old code's `data.count` is `undefined` (→ 0, the bug). The new code yields 1648, and the items have the fields the table renders.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. All-time count is the real total | spec "reads the list from data and the count from meta.total" (`count` 1375 from `meta.total`). Live: `count_new":1648`. |
| 2. Detail table lists visits | spec: `visits` = `data` array, cached as `visits`. Live items have `createdAt`/`location`/`ip`. |
| 3. Dashboard card | Same cached `visitCount` (`PageHome.vue:48`), set by the spec-covered callback |
| 4. Spec | `useVisits.spec.ts` · `Tests  3 passed (3)` |
| Tests / build / typecheck | `276 passed` + 1 pre-existing failure · `✓ built in 3.60s` · 90 = baseline |
| Comments per code-comments.md | Header comment updated to the current behaviour: WHAT the API returns, no `(#N)` ref |

**Manual browser check: BLOCKED.** A worktree dev server on :5174 served the new file (`curl …/useVisits.ts | grep -c "meta?.total"` → `1`). But the Playwright-controlled Chrome window reported `document.visibilityState: "hidden"`, so clicks never fired and no login request was sent. The API's CORS only allows `:5173`, which runs the #307 checkout. The UI was therefore not observed rendering 1648. The logic evidence is the spec plus the live shape check above; a click-through belongs in release re-testing.

## Supersedes: none
## Still open: none

## Noticed, not done
- `GET candidate/visits` returns every visit in one response (`limit` = `total` = 1648) and grows without bound. The frontend pages the table client-side. Worth a server-side page/limit later (performance), not part of #308.
- Pre-existing `VeeForm.spec.ts` failure (see sibling note).

## Seal gate
None in this pass (no commit/push). One read-only API call (login + GET) with the test account.
