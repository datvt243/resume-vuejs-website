# 2026-10-10 - issue-180-usecandidate-cleanup

- Worker: implementer
- Version: 0.1.0
- Node: `issue-180-usecandidate-cleanup` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table)
- Task (verbatim, from issue #180): "[LOW] Code Quality: useCandidate — updateField điều kiện ngược, sortData mutate store" — `src/composables/useCandidate.ts`: `updateField` (line 95) inverted condition `if (_f === '')` → never writes; not called anywhere → delete or fix. `sortData` (line 106) `data.sort()` sorts the Pinia store array in place (state mutation outside an action); should be `[...data].sort()`. `addRecordToList` (lines 75-78) early `return` on the no-`_id` branch, doesn't sync into the store.

## Hub bytes before: 170859

## Branch
`fix/issue-180-usecandidate-cleanup` — created off `origin/staging` (`85d062a`, fetched this session) via `gh issue develop 180 --base staging --name fix/issue-180-usecandidate-cleanup`, checked out in a separate git worktree (`../wt-180`, `node_modules` symlinked from the main checkout) because the main checkout holds #179's still-uncommitted sealed diff. Never on `main`/`staging` while editing.

## Diff
| File | Why |
|---|---|
| `src/composables/useCandidate.ts` | `updateField`: `=== ''` → `!== ''` (fixed rather than deleted — it is part of the returned API; deleting is a larger, API-changing diff). `sortData`: `[...data].sort(...)` so the cached store array is never reordered in place. `addRecordToList`: dropped the no-`_id` early return; `_findIndex` is `-1` when there's no `_id`, so the record is pushed and then synced via the existing `setCandidateByField` call. |
| `src/composables/useCandidate.spec.ts` | 3 new tests: cached list sorted without reordering the store array; no-`_id` record synced into the store (cached path); `updateField` writes into the store. |

## Command
From the worktree root, per `doctrine/MEMORY.md`:
- `npx vitest run src/composables/useCandidate.spec.ts`
- Same, with `useCandidate.ts` reverted to `HEAD`; then with only the `sortData` fix applied (file restored from backup afterwards)
- `npm run test`
- `npx vitest run src/components/veevalidate/VeeForm.spec.ts` (flakiness check, see Output)
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN (no script; `vue-tsc` incompatible — see MEMORY.md)

## Output
Spec, real fix:
```
 ✓ src/composables/useCandidate.spec.ts (11 tests) 173ms
      Tests  11 passed (11)
```
Spec, original `useCandidate.ts`:
```
   × useCandidate > sorting a cached list does not reorder the array held in candidateStore 49ms
   × useCandidate > updateField writes the given values into candidateStore 5ms
      Tests  2 failed | 9 passed (11)
```
Spec, only `sortData` fixed (shows the `addRecordToList` bug was masked by `sortData` returning the store's own array):
```
   × useCandidate > addRecordToList pushes a brand-new record (no _id) 89ms
   × useCandidate > addRecordToList syncs a record without _id into candidateStore 7ms
   × useCandidate > updateField writes the given values into candidateStore 14ms
      Tests  3 failed | 8 passed (11)
```
`npm run test`:
```
   × VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit 1300ms
   × VeeForm > clicking submit on a pristine form calls submitFn anyway, because pristine meta.valid is true 355ms
   × VeeForm > BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn 680ms
 Test Files  1 failed | 21 passed (22)
      Tests  3 failed | 147 passed (150)
```
The 3 `VeeForm.spec.ts` failures are the pre-existing flaky tests already documented in `evidence/implementer/2026-10-09-issue-176-178-sanitize-html.md` and `2026-10-10-issue-177-forced-logout-redirect.md`. This diff touches neither `VeeForm.vue` nor its spec (`git diff --quiet HEAD -- …VeeForm.vue …VeeForm.spec.ts` → "VeeForm untouched"). Re-running that spec alone 3× on this branch gave `1–2 failed | 9–10 passed (11)` each time, and the same range on the #179 branch — flaky regardless of diff.

`npm run build`:
```
✓ built in 4.14s
```
`npm run lint`: exit 0.

No browser click-through this session — the composable is covered by real Pinia store tests; disclosed, not implied.

## Acceptance
| Criterion | Evidence |
|---|---|
| `updateField` actually writes | spec "updateField writes the given values into candidateStore" passes; fails on original code |
| `sortData` no longer mutates the store array | spec "sorting a cached list does not reorder the array held in candidateStore" passes; fails on original code |
| `addRecordToList` syncs no-`_id` records into the store | specs "pushes a brand-new record (no _id)" + "syncs a record without _id into candidateStore" pass; fail when only `sortData` is fixed |
| No regression in useCandidate | `Tests  11 passed (11)` (8 existing + 3 new) |
| Build green | `✓ built in 4.14s` |
| Lint clean | exit 0 |
| comments per code-comments.md | no comments added/changed |

## Noticed, not done
- `VeeForm.spec.ts` flakiness reproduces on every branch (1–3 random failures per run) — worth its own issue.
- `sortData` uses 2-space indent while the rest of the file uses 4 — untouched (SmallestDiff).

## Seal gate
none — no commit/push/merge in this pass. Commit + PR into `staging` is `/ship`'s step.
