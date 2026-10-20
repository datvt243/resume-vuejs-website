# 2026-10-20 - issue-249-experience-unsaved-warning

- Worker: implementer
- Version: 0.1.0
- Node: `issue-249-experience-unsaved-warning` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at the end of the table, `IN_PROGRESS`)
- Task (verbatim): #249 [BUG] Kinh nghiệm: sửa + lưu xong, đóng modal vẫn báo "chưa lưu" — Sau khi sửa một mục Kinh nghiệm và bấm Lưu thành công, đóng modal vẫn hiện cảnh báo thay đổi chưa lưu. Mong đợi: lưu thành công → form sạch → đóng modal không hỏi xác nhận. Repro: /dashboard/experience → sửa mục → Lưu → đóng modal. Original operator prompt: "sau khi edit experience và lưu, sau đó close vẫn bị báo "chưa lưu"". https://github.com/datvt243/resume-vuejs-website/issues/249

## Hub bytes before: 188717

## Branch
`fix/issue-249-experience-unsaved-warning`, created from freshly pulled `staging` via `gh issue develop 249 --checkout --base staging --name fix/issue-249-experience-unsaved-warning` (linked to #249). Not `main`, not `staging`.

## Root cause
- `Modal.vue` `requestClose()` asks `confirmDiscardChanges()` whenever any registered VeeForm `isDirty()` is true.
- VeeForm `isDirty()` compares the current values to `dirtyBaseline`, a snapshot taken on the form's first `focusin`. The baseline was only cleared in `loadDocument()` / `reset()`. `onSubmit()` never refreshed it.
- `PageExperience.vue` `handleUpdate()` does not hide the modal after a successful save, and `addRecordToList` doesn't touch `document`, so the `watch(document)` → `loadDocument` path never runs either. Result: after a save the baseline is still the pre-edit values → "dirty" → prompt on close.
- `handleBase` (`services/base.ts`) catches the axios error and only calls the callback on success, so `submitFn` resolves the same way on a failed save. Re-baselining inside `onSubmit()` unconditionally would hide unsaved edits after a failed save (data-loss risk). So the reset is triggered from the success callback instead.

## Diff
| File | Why |
|---|---|
| `src/components/veevalidate/VeeForm.vue` | New `markSaved()` sets `dirtyBaseline` to the current snapshot; exposed via `defineExpose` next to `reset`. One-line why-comment: call from the save-success callback, since `submitFn` also resolves on failure. |
| `src/pages/dashboard/PageExperience.vue` | `updateDoc` success callback calls `refVeeForm.value?.markSaved()` after `addRecordToList(data)`. |
| `src/components/veevalidate/VeeForm.spec.ts` | +1 test: with a provided `modalDirtyGuard`, focus + edit → dirty; `markSaved()` → clean; a further edit → dirty again. |

`git diff --stat`: 3 files changed, 26 insertions(+).

## Command
From repo root:
- `npm run test`
- `npm run build`
- `npm run lint`
- Baseline for the failing test: `npx vitest run src/components/veevalidate/VeeForm.spec.ts` ×5 with the diff, then `git stash` → ×3 without it → `git stash pop`
- Typecheck: CANNOT RUN — pending add-typecheck-script

## Output
`npm run test`:
```
 Test Files  1 failed | 37 passed (38)
      Tests  1 failed | 249 passed (250)
```
The one failure is `VeeForm > VI | EN toggle > flags the hidden language that has a validation error` (`VeeForm.spec.ts:287`, `expect(wrapper.find('[data-lang="vi"]').text()).toContain(…`).

VeeForm.spec.ts alone, with the diff (×5): `Tests  1 failed | 18 passed (19)` every run.
VeeForm.spec.ts alone, diff stashed (×3): `Tests  1 failed | 17 passed (18)` every run. The same test fails on the base branch without this diff, so it is not introduced here. PR #246 also notes a VeeForm.spec.ts failure on `staging`.

`npm run build`: `✓ built in 3.69s`

`npm run lint`: the `eslint src --ext .js,.ts,.vue` run printed no errors (output ended after the command banner).

## Acceptance
| Criterion | Evidence |
|---|---|
| A successful save makes the form read as clean, so closing the modal does not prompt | New spec: `markSaved()` → `isDirty()` false. PageExperience calls it in the `updateDoc` success callback. Spec count went from 18 to 19 in VeeForm.spec.ts with only the pre-existing failure. |
| A failed save still prompts on close (no lost edits) | `markSaved()` is only called from the `handleBase` success callback (`.then(res => { callback?.(res) ... })`); `.catch` never calls it. Not covered by an automated test. |
| Editing again after a save prompts again | New spec: second `setValue('Dat 2')` → `isDirty()` true. |
| Build green | `✓ built in 3.69s` |
| No new test failures | 249 passed, 1 failed; that failure also fails 3/3 without the diff. |
| Comments per code-comments.md | One one-line why-comment on `markSaved()`, matching the surrounding comment style in VeeForm.vue. |

Manual UI check: NOT done. Reproducing needs a logged-in account with experience data on the Render backend; no click-through or screenshot was taken. The evidence is the unit test plus the code path above.

## Noticed, not done
- Same bug pattern likely on the other CRUD pages that keep the modal open after save (Education, Project, Award, Certificate, Reference, Application, Profile — none call `hide()` after `updateDoc`). Out of scope for #249; each would need the same one-line `markSaved()` call.
- Duplicate flow (`PageExperience.vue`): after saving a duplicate, `isDuplicating` is reset but `document._id` still holds the original record's id, so a second "Lưu" in the same modal would PUT over the original record. Not verified at runtime.
- `VeeForm.spec.ts:287` (VI | EN error flag) fails on `staging` without this diff.
- `dev-loop.prime-mermaid.md`: the `issue-116-multi-profile-recheck-20260920` row sits after a blank line below the table, so it renders outside the table. Left as is.

## Seal gate
None — no commit, push or API call made. Commit/PR is left to `/ship`.
