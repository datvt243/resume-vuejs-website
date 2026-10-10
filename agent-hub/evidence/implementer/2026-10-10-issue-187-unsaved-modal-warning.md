# 2026-10-10 - issue-187-unsaved-modal-warning

- Worker: implementer
- Version: 0.1.0
- Node: `issue-187-unsaved-modal-warning` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table, `IN_PROGRESS`)
- Task (verbatim, from issue #187): "[ENHANCEMENT] Cảnh báo khi đóng modal form chưa lưu — Đóng modal thêm/sửa (nút Đóng, click ra ngoài, Esc) khi form đang nhập dở → mất dữ liệu không cảnh báo. Đề xuất: Dùng `meta.dirty` của VeeValidate trong `VeeForm.vue`; khi modal sắp đóng mà form dirty → confirm \"Bạn có thay đổi chưa lưu, vẫn đóng?\"."

## Hub bytes before: 173447

## Branch
`feature/issue-187-unsaved-modal-warning`, created off `origin/staging` (`3294f1c`, fetched and pulled this session) via `gh issue develop 187 --checkout --base staging --name feature/issue-187-unsaved-modal-warning`. Never on `main`/`staging` while editing.

## Diff
| File | Why |
|---|---|
| `src/components/Modal.vue` | `provide('modalDirtyGuard', {register, unregister})`, a Set of `isDirty` getters. New `requestClose()`: if any getter returns true → `await confirmDiscardChanges()`, closes only on confirm. Esc, `[data-bs-dismiss="modal"]` clicks (header X, footer "Đóng", consumer "Đóng" buttons in VeeForm's `#button` slot) and backdrop click now call `requestClose()`. Programmatic `hide()` (pages call it after a successful save) is unchanged, so it never asks. `confirming` flag: Swal's Esc listener is on `window`, after our `document` listener, so without it the same Esc keypress would re-fire `Swal.fire` instead of dismissing. |
| `src/components/veevalidate/VeeForm.vue` | `inject('modalDirtyGuard', null)` → registers `isDirty` (unregisters on unmount). No-op outside a Modal (login, PageInformation...). `isDirty` = a snapshot of field values taken on the form's first `focusin` differs from current values. Baseline cleared when `document` loads and in `reset()`. |
| `src/lib/swal.lib.js` | `confirmDiscardChanges()` → `Promise<boolean>`, title "Bạn có thay đổi chưa lưu, vẫn đóng?", buttons "Vẫn đóng"/"Ở lại", same btn classes as `confirmDelete`. |
| `src/components/Modal.spec.ts` (new) | 8 tests mounting the real `Modal` + real `VeeForm` + real `FrmInput` (swal mocked; other Frm* stubbed because the barrel pulls CKEditor, same workaround as `VeeForm.spec.ts`). |

Zero consumer page changes; all 10 `<Modal>` + `<VeeForm>` pairs pick it up via provide/inject.

### Deviation from the issue's suggestion (`meta.dirty`), on purpose
- Edit flow: VeeForm loads a record with `setValues()`, which doesn't move vee-validate's initial values, so `meta.dirty` would already be `true` the moment an edit modal opens. That means confirming on every edit close.
- `FrmCkediter` (CKEditor normalizes HTML) and `FrmDatePicker` month mode (`checkValue`/`convertToNumber` round-trip) rewrite their value on mount, which also flips dirty without user input.
- Switching the watch to `resetForm({values})` would fix the first issue but clears errors and changes validation timing on load, a wider behavior change.
- So: snapshot on first `focusin` (after mount-time normalization has settled), compare per field with `?? ''` so `undefined`/`null`/`''` compare equal. Typing then reverting = clean.

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npx vitest run src/components/Modal.spec.ts` (×8, stability)
- Same, with `Modal.vue`, `VeeForm.vue`, `swal.lib.js` checked out at `HEAD` (restored from a scratchpad copy afterwards, `git diff --stat` confirmed restored)
- `npm run test` (several runs), and the same on base via `git stash`
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN — pending add-typecheck-script

## Output
New spec, real fix (8 consecutive runs):
```
      Tests  8 passed (8)
```
New spec, original code at `HEAD`:
```
   × Modal unsaved-changes guard > asks before closing a dirty form and stays open when the user cancels 7ms
   × Modal unsaved-changes guard > closes a dirty form once the user confirms (dismiss button) 5ms
   × Modal unsaved-changes guard > a second Escape while the confirm is open does not stack another confirm 4ms
      Tests  3 failed | 5 passed (8)
```
(The 5 that pass on base are the "should NOT ask" cases, which the old code satisfies trivially.)

`npm run test` on this branch:
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
      Tests  1 failed | 175 passed (176)
```
This failure is pre-existing. Six `npm run test` runs on base (`git stash`, this diff removed) each print the same `FAIL … VI | EN toggle > flags the hidden language that has a validation error`. `VeeForm.spec.ts` alone fails it 3/3 both with and without this diff. It isn't deterministic: one full run on this branch out of ~10 passed it. Another single run on this branch showed `2 failed | 174 passed`; I didn't capture the second name and couldn't reproduce it in 6 more runs. Disclosed, not explained.

`npm run build`:
```
✓ built in 3.62s
```
`npm run lint`: exit 0. (First run flagged 2 errors in the new spec, `no-extra-semi` + an unused arg name; fixed, rerun clean.)

No live browser check this session: no debug browser on :9888, no dev server, and the dashboard needs a logged-in backend session. The integration spec uses real Modal/VeeForm/FrmInput DOM, but the real SweetAlert2 popup (mocked here) wasn't observed, and neither were the CKEditor/datepicker normalization paths that motivated the focus-snapshot. Those were read from source, not observed.

## Acceptance
| Criterion | Evidence |
|---|---|
| Dirty form + Esc → confirm; cancel keeps modal open | spec "asks before closing a dirty form and stays open when the user cancels" (fails on base) |
| Dirty form + "Đóng"/X (`data-bs-dismiss`) → confirm; confirm closes | spec "closes a dirty form once the user confirms (dismiss button)" (fails on base) |
| Clean form closes without asking | specs "closes without asking when the form is untouched", "focusing a field without changing it…", "typing a change then reverting it counts as clean" |
| Save-then-close never asks | spec "programmatic hide() (after save) never asks, even when dirty" |
| Loading another record resets dirty state | spec "loading a different document clears the unsaved state" |
| No stacked confirms on repeated Esc | spec "a second Escape while the confirm is open…" (fails on base) |
| Click outside → confirm | Backdrop `@click` routes through `requestClose()`. Not separately tested, see Noticed #1. |
| Build green | `✓ built in 3.62s` |
| Lint clean | exit 0 |
| comments per code-comments.md | `Modal.vue`: one `/** */` (why programmatic hide skips the check) + one `//` (why the `confirming` flag). `VeeForm.vue`: one `/** */` (why not `meta.dirty`). Spec: two short `//` (why barrel mocked, why auto-unmount). All WHY, no issue refs. |

## Noticed, not done
1. Probably dead: "click outside" may never actually close the modal. `.modal` is Bootstrap's full-viewport fixed layer (z-index 1055) above the teleported `.modal-backdrop` (1050), so a click outside the dialog lands on `.modal` itself, whose `onRootClick` only handles `[data-bs-dismiss]`. Inferred from CSS, not observed live. If confirmed, outside-click is a no-op today (the guard still covers it if someone wires it later).
2. `VeeForm.spec.ts` "VI | EN toggle > flags the hidden language that has a validation error" fails on base `staging` (`3294f1c`) most runs. It came in with #182, worth its own issue.
3. Unsaved edits survive a confirmed close and reopening the same record unchanged: the `document` watch doesn't fire, so VeeForm keeps the typed values. This predates this diff. The guard now reports it honestly as dirty on the next close.

## Seal gate
none — no commit/push/merge/real API call taken.

---

## Round 2 — after verifier REOPEN (`evidence/verifier/2026-10-10-issue-187-unsaved-modal-warning-reopen.md`)
REOPEN reasons: (1) click-outside path unverified (`EDIT_UNVERIFIED`); (2) missing `## Seal gate` section (added above).

### Observed (not inferred): outside-click never reached the backdrop
Headless Chrome (`/Applications/Google Chrome.app`, `--headless=new --window-size=1280,800`) rendering the project's real shipped CSS (`cat dist/assets/*.css` after `npm run build`; Bootstrap package is gone, `.modal`/`.modal-backdrop` rules now come from `tailwind.css`) with the same markup `Modal.vue` renders (`.modal.draggable.show` display:block + `.modal-backdrop.show` after it), `document.elementFromPoint(5,5)`:
```
RESULT elementFromPoint(5,5)=.modal.draggable.show | z(.modal)=1055 z(.modal-backdrop)=1050 | dialog.left=240px
```
So a click outside the dialog lands on the `.modal` root. The backdrop's `@click` could never fire, and before this diff `onRootClick` only handled `[data-bs-dismiss]`, so **outside-click was a no-op on `staging`**. The issue's "click ra ngoài" path didn't exist. That's what Bootstrap's own Modal JS did (`backdrop: true`) before the Vue-native rewrite.

### Diff added this round
| File | Why |
|---|---|
| `src/components/Modal.vue` | `onRootClick`: `else if (e.target === refModal.value && mousedownOnRoot) requestClose()`. New `onRootMousedown` records whether the press started on the root (`@mousedown` on the `.modal` div), the same rule as Bootstrap, so a text selection dragged out of the dialog doesn't close it. One `/** */` explains why (root is above the backdrop; drag-select). The backdrop `@click` is kept (harmless, and correct if the layering ever changes). |
| `src/components/Modal.spec.ts` | +4 tests: outside click on dirty form → confirm + close; outside click on clean form → closes without asking; mousedown inside + click on root → stays open; click inside `.modal-body` → stays open. |

**Behavior change to flag for the operator:** clicking outside a modal now closes it (with the confirm when dirty). On `staging` it did nothing.

### Commands + output (round 2)
`npx vitest run src/components/Modal.spec.ts` ×5:
```
      Tests  12 passed (12)
```
Same spec with `Modal.vue`/`VeeForm.vue`/`swal.lib.js` at `HEAD` (restored after; `git diff --stat` shows them modified again):
```
   × Modal unsaved-changes guard > asks before closing a dirty form and stays open when the user cancels 7ms
   × Modal unsaved-changes guard > closes a dirty form once the user confirms (dismiss button) 4ms
   × Modal unsaved-changes guard > a second Escape while the confirm is open does not stack another confirm 4ms
   × Modal unsaved-changes guard > a click outside the dialog (on the .modal layer) asks on a dirty form 4ms
   × Modal unsaved-changes guard > a click outside closes a clean form without asking 5ms
      Tests  5 failed | 7 passed (12)
```
`npm run test` ×3:
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
      Tests  1 failed | 179 passed (180)
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
      Tests  1 failed | 179 passed (180)
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
      Tests  2 failed | 178 passed (180)
```
Both are `VeeForm.spec.ts` tests that fail on base too. "VI | EN toggle" failed in all 6 base runs (round 1). "typing then clearing" is the already-documented flaky test (see `2026-10-10-issue-181-delete-confirm-message.md`), which also identifies round 1's unexplained second failure.
`npm run build`: `✓ built in 3.94s`. `npm run lint`: exit 0. Typecheck: CANNOT RUN — pending add-typecheck-script.

### Acceptance — revised rows
| Criterion | Evidence |
|---|---|
| Click outside → confirm on dirty form | spec "a click outside the dialog (on the .modal layer) asks on a dirty form" (fails on HEAD, passes on branch). Target `.modal` root confirmed as the real hit target by the headless-Chrome `elementFromPoint` above |
| Click outside on clean form closes | spec "a click outside closes a clean form without asking" (fails on HEAD) |
| No accidental close (drag-select / inside click) | specs "a drag that starts inside the dialog…", "a click inside the dialog body…" |
| comments per code-comments.md | +1 `/** */` in `Modal.vue` (why root, why mousedown check). WHY only, no issue refs |

Noticed #1 from round 1 is now resolved: it was observed, then fixed in scope.
