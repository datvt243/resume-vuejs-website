# 2026-10-31 — issue-356-editor-datepicker-i18n

- Worker: implementer · Version: 0.1.0
- Node: `issue-356-editor-datepicker-i18n` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row — new, slug not in archive)
- Task (verbatim, issue title): "#356 [QC][P3] CKEditor và datepicker vẫn tiếng Anh ở chế độ VI; ô ngày không có accessible name". Last of the operator's `/todo "fix các issue P3"` run (#353 → PR #361, #354 → PR #362).

## Hub bytes before: 2597590 (`find agent-hub -name '*.md' -o -name '*.yaml' | xargs cat | wc -c`)

## Branch
`fix/issue-356-editor-datepicker-i18n` (off `staging` @ `fb7f455`, via `gh issue develop 356`).

## Acceptance criteria
1. In VI mode, the CKEditor toolbar, the editable's aria-label and its `lang` are Vietnamese. In EN mode they're English, and a header VI | EN switch updates an open editor without losing its content.
2. The date picker's clear button is labelled in the UI language, and the visible date label is associated with the real `<input>`, which gives it an accessible name.
3. Test/build/lint pass; typecheck stays at the baseline. A live check covers the CKEditor part, since CKEditor can't run in jsdom.

## Diff
| file | why |
|---|---|
| `src/components/ckeditor/CKEditor.vue` | `editorConfig` is now a computed with `language: i18n.global.locale.value`. `translations: [vi]` is spread in only in VI mode (see the gotchas below). The `.ck-wrapper` div is keyed by language so the editor remounts on a switch; the model is a `v-model`, so the content carries over. Two 1-line why-comments. |
| `src/components/veevalidate/part/FrmDatePicker.vue` | `:uid="props.name"` makes the picker render `<input id="dp-input-<name>">`, and `<label :for>` now points at that id instead of the wrapper div. Also `:locale` follows the UI language, and `:aria-labels="{ clearInput: t('form.clearDate') }"` (the picker merges partial labels over its defaults, `...e ?? {}` in `vue-datepicker.js`). 1-line why-comment. |
| `src/i18n/index.ts` | `form.clearDate`: vi `Xóa ngày`, en `Clear date` |
| `src/components/veevalidate/part/FrmDatePicker.spec.ts` | new: the label text is `Ngày bắt đầu`, its `for` resolves to an `INPUT`, and `[aria-label="Xóa ngày"]` exists |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row (appended) |

## Gotchas found while verifying live (each one was a real failure, then fixed)
1. Keying `<CKEditor.component>` itself broke the remount (`NotFoundError: Failed to execute 'insertBefore'`, `[Vue warn] Unhandled error during execution of scheduler flush`). ClassicEditor moves its DOM next to the textarea, so Vue loses its anchor. Keying the wrapper div instead fixed it.
2. With `translations: [vi]` always loaded, EN mode still showed Vietnamese labels: CKEditor falls back to the only loaded translation whatever `language` says. Fixed by loading vi only in VI mode.
3. `translations: []` in EN made editor creation throw `TypeError: Reduce of empty array with no initial value` at `_unifyTranslations`. Fixed by leaving the key out instead.
4. `ariaLabels.input` is not applied to the `<input>` in vue-datepicker 9.0.2 (its `<input>` only gets `id: dp-input-${uid}`). I briefly passed it and then removed it. The accessible name comes from the `<label for>` association.

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npx vitest run src/components/veevalidate/part/FrmDatePicker.spec.ts`: `Tests  1 passed (1)`
- Same spec with `FrmDatePicker.vue` and `i18n/index.ts` stashed: `AssertionError: expected 'DIV' to be 'INPUT'` / `Tests  1 failed (1)`
- `npm run test`: `Test Files  51 passed (51)` / `Tests  307 passed (307)`
- `npm run build`: `✓ built in 3.88s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS`, the same as the baseline. 0 in `CKEditor.vue` / `FrmDatePicker.vue` / `i18n/index.ts`.

## Manual observation (real app, not an automated test)
Dev server on `localhost:5173` (the only origin the prod API's CORS allows; an already-running Vite from this repo folder, serving this working tree). Prod API, debug Chrome on :9888 via Playwright MCP, account `qa.full@example.com`. I only opened the Education "Thêm học vấn" modal and closed it with discard, so nothing was saved. On the final code:
- VI: toolbar `Đoạn văn / Đậm / Nghiêng / Danh sách đánh số`, editable aria-label `Vùng chỉnh sửa của trình chỉnh sửa: main. Nhấn ⌥0 để được trợ giúp.`, both editors `uiLanguage: vi` with `lang="vi"`, date labels `Ngày bắt đầu`/`Ngày kết thúc` with `for=dp-input-startDate|endDate` resolving to `INPUT`, clear button `Xóa ngày`.
- Header switch to EN with the modal open: `uiLanguage: en`, toolbar `Paragraph / Bold / Italic / Numbered List`, aria-label `Editor editing area: main. …`, `Start date`/`End date`, `Clear date`, no console errors.
- Content kept: typed `Giữ nội dung`, waited, switched EN → `Giữ nội dung`, switched back to VI, same text.
Not checked: the month names inside the picker's open overlay (`locale` set, not looked at), and other forms (Experience/Project/Nhập CV/Thông tin cơ bản). Those use the same two components, so they get the same behavior.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. CKEditor in UI language, live switch, content kept | live observation above |
| 2. Clear button label, label → real input | spec, red without the fix; live `for` → `INPUT`, `Xóa ngày`/`Clear date` |
| 3. test/build/lint/typecheck + live check | as listed above |
| Comments per code-comments.md | Three `//` why-comments added (2 in `CKEditor.vue`, 1 in `FrmDatePicker.vue`). No `(#N)` refs. No template comment, which would make `CKEditor.vue` multi-root in dev and break attrs fallthrough. |

## Supersedes: none
## Still open: none for #356

## Noticed, not done
- The picker's other aria labels (`nextMonth`, `prevYear`, `toggleOverlay`, `openMonthsOverlay`, …) are still English. The issue named only the clear button and the input name.
- Text typed less than the editor's v-model debounce before a language switch could be lost, because the remount reads the model. A user switching language mid-keystroke is unlikely. Seen once in a test that switched with no pause; with a pause, no loss.

## Seal gate
none (no commit/push; no data written — login + open/close modal only)
