# 2026-11-15 - issue-443-list-date-sort
- Worker: implementer · Version: 0.1.0
- Node: `issue-443-list-date-sort` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS)
- Task: "#443 Timeline sections: re-sort the list after saving or duplicating — New or duplicated Experience / Education / Project entries are appended to the end of the list until reload (the date sort runs only on load). Expected: after a successful save, the list is re-sorted by the same rule as on load. + #447 Lists: sort awards by issue date and applications by applied date — The shared list sort uses `startDate`. Awards only have `issueDate` and applications only `appliedDate`, so both lists come in API order. Expected: Awards newest `issueDate` first. Applications newest `appliedDate` first."

## Branch
`fix/issue-443-list-date-sort` (cut from `staging` @ `2ffe103` via `gh issue develop 443 --base staging`). Covers #443 and #447. `/ship` auto-appends `Closes #443` only, so the commit message must add `Closes #447`.

## Hub bytes before
99521, measured after appending this node's diagram row (~350 bytes). The pre-row value was not captured.

## Feature doc
`doctrine/features/cv-timeline-sections.md`, `doctrine/features/cv-simple-sections.md`, `doctrine/features/job-applications.md`

## Feature doc changed
- cv-timeline-sections Behavior #1: "sorted by start date, newest first." → adds "re-sorted after each save (new, edited or duplicated entry)". Operator: open question 2 answer (2026-11-07) "Bug: re-sort after save — #443".
- cv-simple-sections Behavior #1: adds "newest first by date (award: `issueDate`, certificate: `startDate`; references have no date and keep API order), re-sorted after each save". Operator: open question 2 answer "Bug: sort by issueDate — #447".
- job-applications Behavior #1: adds "newest `appliedDate` first, re-sorted after each save". Operator: open question 3 answer "Bug: newest applied first — #447".
- One `## Changelog` row per doc.

## Diff
| File | Why |
|---|---|
| `src/composables/useCandidate.ts` | `sortData` sorts by `startDate ?? issueDate ?? appliedDate ?? 0` (desc); `addRecordToList` re-sorts after add/replace |
| `src/composables/useCandidate.spec.ts` | new tests: awards by `issueDate`, applications by `appliedDate`, re-sort after add and after update (list and store) |
| 3 feature docs + diagram row | see above |

Root cause is the one shared `sortData` / `addRecordToList` in `useCandidate`, so this one edit covers all list pages. Callers of `addRecordToList`: PageAward, PageReference, PageApplication, PageProject, PageEducation, PageCertificate, PageProfile, PageExperience, PageImportLinkedin. Lists without any of the three date fields (references, profiles) give every item key 0. `Array.prototype.sort` is stable, so their order is unchanged and new items still append at the end. The existing test "addRecordToList syncs a record without _id into candidateStore" still expects the dateless new record last, and it passes. Experience/Education/Project with a saved manual order (`useManualOrder`) still put entries missing from the saved order at the end (Behavior #4 unchanged). Among themselves those entries now follow date order.

## Command
From `doctrine/MEMORY.md`, repo root: `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck`. Plus `npx vitest run src/composables/useCandidate.spec.ts` with and without the source fix (red/green).

## Output
Green (fix in place):
```
 ✓ src/composables/useCandidate.spec.ts (16 tests) 21ms
      Tests  16 passed (16)
```
Red (`git stash push src/composables/useCandidate.ts`, specs kept):
```
   × useCandidate > sorts awards by issueDate descending 5ms
   × useCandidate > sorts applications by appliedDate descending 1ms
   × useCandidate > addRecordToList re-sorts the list after adding or updating a record 1ms
      Tests  3 failed | 13 passed (16)
```
`npm run test`:
```
 Test Files  56 passed (56)
      Tests  375 passed (375)
```
`npm run build`: `✓ built in 4.37s`
`npm run lint`: exit 0
`npm run typecheck`: 78 `error TS` lines on the branch and 78 on `staging` (stashed run). The two lists are identical once line/col are stripped (`SAME_ERRORS`). Errors in the touched file are pre-existing: `useCandidate.ts` TS7006 ×2 (`e` params in `removeRecordById` / `addRecordToList`) and TS7053, shifted by the inserted lines. 78 ≤ baseline 78.

Live check: not done. The change is composable logic with no template or route change. Pages render the `dataList` ref this composable returns, and the unit tests assert that ref directly. A live check would need writes to a QA account.

## Acceptance
| Criterion | Evidence |
|---|---|
| #443: after a successful save (new / edited / duplicated) the list is re-sorted by the load rule | test "addRecordToList re-sorts…" red→green: `['a','c','b']` after add, `['b','a','c']` after update, store matches |
| #447: awards newest `issueDate` first | test "sorts awards by issueDate descending" red→green |
| #447: applications newest `appliedDate` first | test "sorts applications by appliedDate descending" red→green |
| Existing startDate sort and dateless lists unchanged | existing tests "sorts fetched list results by startDate descending", "addRecordToList syncs a record without _id…" pass; `Tests 375 passed (375)` |
| matches cv-timeline-sections / cv-simple-sections / job-applications Behavior #1 (as updated) | diff above |
| Build / lint / typecheck | `✓ built in 4.37s`; lint exit 0; typecheck 78 = staging 78 |
| comments per code-comments.md | one new `//` line saying why the fallback keys exist; no issue refs |

## Supersedes
none (`grep "#443\|#447"` on the active diagram: no other rows)

## Review
Inline medium review (the source diff is 5 lines). I read `useCandidate.ts` in full and checked every `addRecordToList` caller listed above.
- Mixed lists: none. Each `useCandidate` instance holds one collection.
- Date values are numeric timestamps (`+new Date(...)` in PageAward:51 / PageApplication:89, yup `number()` in the models), so subtraction is valid.
- `startDate: null` on an item → `??` falls through to 0. Same as before: `null - x` was numeric too.
No correctness findings.

## Noticed, not done
- Delete (`removeRecordById`) keeps order: filtering a sorted list stays sorted, so no change is needed there.

## Seal gate
none: no commit, push or external call. No live check, so no API calls.
