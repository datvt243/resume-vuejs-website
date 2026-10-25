# 2026-10-25 - issue-307-modal-save-close

- Worker: implementer
- Version: 0.1.0
- Node: `issue-307-modal-save-close` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, operator via `/todo`): "backend đã done, hãy kiểm tra và tiến hành P2" — this pass covers issue #307 "[QC][P2] Modal không đóng sau khi lưu — bấm Lưu lần 2 tạo bản ghi trùng; đóng vẫn báo "chưa lưu" (như #249)", plus a re-test of #306 (blank row after create), whose root cause was the API and is fixed there (resume-nodejs-api#319, v2.2.2).

## Hub bytes before: 82009
(`find NORTHSTAR.md CLAUDE.md README.md doctrine haven/diagrams/dev-loop.prime-mermaid.md haven/workers/implementer haven/workers/verifier -type f -exec cat {} + | wc -c`, before appending the node row.)

## Branch
`fix/issue-307-modal-save-close`, created from up-to-date `staging` (`148b268`, v1.34.1) via `gh issue develop 307 --checkout --base staging --name fix/issue-307-modal-save-close` (linked to #307).

## Acceptance criteria (from #307)
1. After a successful save (create, edit, duplicate) the modal closes.
2. A second click can't create a second copy.
3. Closing after a successful save doesn't warn about unsaved changes.
4. Applies to all 8 list pages (Award, Application, Certificate, Education, Project, Profile, Reference, Experience).

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/Page{Award,Application,Certificate,Education,Project,Profile,Reference}.vue` | +1 line `refModal.value?.hide()` in the `updateDoc` success callback, after `addRecordToList(data)`. `Modal.hide()` is the programmatic close, which skips the dirty guard by design (`Modal.vue` comment: "Programmatic `hide()` (e.g. after a successful save) skips this check"). The callback only runs on success (`handleBase`), so a failed save keeps the form open with the input intact. |
| `src/pages/dashboard/PageExperience.vue` | `refVeeForm.value?.markSaved()` → `refModal.value?.hide()`. Same behaviour as the other 7 pages. `markSaved` (#249) is no longer needed there: the modal is closed, and `VeeForm.loadDocument`/`reset()` clear `dirtyBaseline` on the next open. `refVeeForm` is still used (`reset()` at line 137), and `VeeForm.markSaved` stays exposed (covered by `VeeForm.spec.ts`). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

No shared composable added. The modal ref lives in each page, and each page's callback already differs, so a one-line call per page is the smallest change.

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npm run test`
- `npm run build`
- `npm run typecheck`
- Manual browser check: `npm run dev` (already running on :5173 from this repo, serving the edited file — `curl …/src/pages/dashboard/PageAward.vue | grep -o "refModal.value?.hide()"` → match), driven with Playwright against the production API (`.env.development.local`), test account from `.env`.

## Output
`npm run test` (tail, verbatim):
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 14ms
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 44 passed (45)
      Tests  1 failed | 273 passed (274)
```
The one failure **pre-exists**. `git stash` → `npm run test` on clean `staging` → `Tests  1 failed | 273 passed (274)`, same test (`AssertionError: expected 'VI' to contain '!'`). It isn't touched by this diff (VeeForm unchanged).

`npm run build`:
```
✓ built in 3.68s
```

`npm run typecheck`: `exit=2`, `grep -c "error TS"` → `90` (= baseline in `doctrine/MEMORY.md`). `grep` for the 8 changed pages in the error list → no match.

Browser (Playwright, 1440×900, `#/dashboard/award`, data marked `[QC]`). Script results, verbatim:
- Create: `{"saveDisabled":false,"reqs":["POST award/create"],"dialogVisible":0,"rows":["[QC] verify #307\n\nQC Org\n\n10/2026\n\nQ"]}` → one POST, modal closed, new row shows the real name/org/date (no blank `--/--` row → **#306 fixed** by API #319, no frontend change needed).
- Edit + duplicate: `{"editTitle":"Sửa: [QC] verify #307","afterEditDialog":0,"rowsAfterEdit":["[QC] verify #307 edited …"],"afterDupDialog":0,"rowsAfterDup":["[QC] verify #307 edited …","[QC] verify #307 copy …"],"swalAfterCreateEsc":0,"swalAfterEditEsc":0,"reqs":["PUT award/update","POST award/create"]}` → the edit is a PUT, not a new record; duplicate adds exactly one row; reopening create/edit and closing shows no "unsaved" Swal.
- Delete (cleanup): `{"reqs":["200 award/delete/6addaff1…","200 award/delete/6addb009…"],"remaining":0}`. After reload: "Chưa có giải thưởng nào". All `[QC]` data removed.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Modal closes after a successful create/edit/duplicate | `dialogVisible":0`, `afterEditDialog":0`, `afterDupDialog":0` |
| 2. No second copy | Create sent exactly `["POST award/create"]`. The modal is gone, so there is no second Save to click. The edit sent `PUT award/update` and the list stayed at 1 row (`rowsAfterEdit` length 1). |
| 3. No false "unsaved" prompt | `swalAfterCreateEsc":0`, `swalAfterEditEsc":0` |
| 4. All 8 pages | `git diff --stat`: the 8 `Page*.vue` files, 1 line each. **Browser-checked on Award only.** The other 7 have the identical line in the identical callback shape (`grep -n -A5 "await updateDoc("` before the edit). Not clicked through, to stay within the API rate limit (100 req). |
| #306 re-test | Create row shows real data. The deletes call `award/delete/<real id>` → 200, not `delete/undefined` → 400. |
| Tests / build / typecheck | `273 passed`, 1 pre-existing failure (same on `staging`) · `✓ built in 3.68s` · 90 errors = baseline |
| Comments per code-comments.md | No comments added or changed |

## Supersedes: none
## Still open
- #306 has no frontend diff. Close it together with #307 on release, since it is re-tested here.

## Noticed, not done
- `VeeForm.spec.ts` "flags the hidden language that has a validation error" fails on `staging` already (pre-existing, unrelated) → needs its own issue.
- Award description: Playwright `keyboard.type('QC description')` into CKEditor saved only `"Q"`. Likely an automation artifact (CKEditor re-render while typing fast), not verified as a product bug.
- Once, Esc pressed right after clicking into an input in the edit modal didn't close it; a second Esc did. Not reproduced, not investigated.
- On `#/` → login the app lands on `/dashboard/information` instead of the requested route (#317, already filed). Reload fires 401s before refresh (#311, already filed).

## Seal gate
None in this pass (no commit/push). Real API calls on the owner's account were limited to `[QC]` records, all deleted.
