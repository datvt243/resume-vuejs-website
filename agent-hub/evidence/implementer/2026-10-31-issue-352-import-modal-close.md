# 2026-10-31 — issue-352-import-modal-close

- Worker: implementer · Version: 0.1.0
- Node: `issue-352-import-modal-close` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row — new, slug not in archive)
- Task (verbatim, issue title): "#352 [QC][P2] Nhập CV: modal không đóng sau khi lưu — bấm Lưu lần nữa tạo bản ghi trùng". Operator ran `/todo #352`.

## Hub bytes before: 2577631 (`find agent-hub -name '*.md' -o -name '*.yaml' | xargs cat | wc -c`, same method as the previous notes)

## Branch
`fix/issue-352-import-modal-close` (off `staging` @ `72dc202`, via `gh issue develop 352`).

## Acceptance criteria
1. On `#/dashboard/import-linkedin`, a successful education or experience save closes its modal, so a second Save can't POST a duplicate.
2. A spec asserts it, and the spec fails without the fix.
3. Test/build/lint pass; typecheck stays at the baseline.

## Root cause
`handleSaveEducation` / `handleSaveExperience` in `src/pages/dashboard/PageImportLinkedin.vue` never called `hide()` in the `updateDoc` success callback. `PageEducation.vue:92` and `PageExperience.vue:103` do. `Modal.vue`'s `hide()` skips the unsaved-changes guard (comment at `Modal.vue:77`, "e.g. after a successful save"), so no confirm dialog appears.

## Diff
| file | why |
|---|---|
| `src/pages/dashboard/PageImportLinkedin.vue` | `refModalEdu.value?.hide()` / `refModalExp.value?.hide()` at the end of each success callback, matching `PageEducation.vue:92` |
| `src/pages/dashboard/PageImportLinkedin.spec.ts` | the `useDocument` mock's `updateDoc` now delegates to `updateDocMock`. The Modal stub has `show`/`hide` methods (`hide` → `hideMock`). The `VeeForm: true` stub became `VeeFormStub` (props `submitFn`, renders nothing). New test: call each form's `submitFn` with a successful `updateDoc` → `updateDocMock` called 2×, `hideMock` 2× |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row (appended) |

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npx vitest run src/pages/dashboard/PageImportLinkedin.spec.ts`: `Tests  7 passed (7)`
- Same spec with the `.vue` change stashed: `AssertionError: expected "spy" to be called 2 times, but got 0 times` / `Tests  1 failed | 6 passed (7)`. The test catches the bug.
- `npm run test`: `Test Files  50 passed (50)` / `Tests  304 passed (304)`
- `npm run build`: `✓ built in 3.74s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS`, the same as the baseline. 0 in `PageImportLinkedin.*`.

## Manual observation
Not done live. Reproducing it means a real `POST education/create` / `experience/create`, which is a write to the prod API (Seal Gate), so I left it to QC on a QA account. Coverage is the spec above, which mounts the real page with stubbed Modal/VeeForm.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Modal closes after a successful save | `hide()` in both success callbacks; spec `hideMock` 2× |
| 2. Spec asserts it, red without the fix | stash run above |
| 3. test/build/lint/typecheck | as listed above |
| Comments per code-comments.md | No comments added or changed in either file. |

## Supersedes: none
## Still open: none for #352

## Noticed, not done
- The modal still has no guard against a double-click on Save before the first POST resolves. That needs `VeeForm`'s submit disabled while saving, which is outside this issue.

## Seal gate
none (no commit/push; no data written)
