# 2026-11-05 - issue-398-languages-view-edit
Worker: implementer · Version: 0.1.0 · Node: `issue-398-languages-view-edit` (haven/diagrams/dev-loop.prime-mermaid.md)
Task (verbatim): "#398 Languages: bổ sung chế độ xem (view) và chỉnh sửa (edit). Trang Ngoại ngữ (src/pages/dashboard/PageLanguages.vue) hiện chỉ render thẳng form VeeFormGeneralInformationUpdate (luôn ở trạng thái edit). Yêu cầu: View: mặc định hiển thị danh sách ngoại ngữ dạng read-only (ngôn ngữ + trình độ), có NoData khi trống. Edit: nút edit (Button action=update) chuyển sang form chỉnh sửa hiện tại; Lưu/Hủy quay lại view (hủy khi có thay đổi → confirmDiscardChanges). Giữ dữ liệu ở general-information.foreignLanguages như hiện tại; text qua i18n (vi + en); theo DESIGN.md. Branch: feature/issue-398-languages-view-edit" — issue #398 https://github.com/datvt243/resume-vuejs-website/issues/398

## Branch
`feature/issue-398-languages-view-edit` (off `staging` @ a7e5df6, created via `gh issue develop 398 --base staging`)

## Hub bytes before
84551

## Interpretation
- The "current edit form" is not a single form with page-level Save/Cancel: `VeeFormGeneralInformationUpdate` is a table + per-item modal, and every add/edit/delete PATCHes immediately. So edit mode has no unsaved page-level state to discard. Mapping used:
  - "Lưu" → the modal's own Save (persists one item; stays in edit mode so several items can be edited in one go).
  - "Hủy khi có thay đổi → confirmDiscardChanges" → already done by `Modal.vue` (its dirty-guard calls `confirmDiscardChanges` when a dirty VeeForm is closed — `src/components/Modal.vue:91-94`). Not duplicated.
  - "quay lại view" → header **Đóng / Close** button (`common.close`) returns to the read-only list.
- View reads `candidate.getGeneralInformation.foreignLanguages` (store), not the `useCandidate` result ref, because the edit form writes its saves back to the store via `setGeneralInformation` — so the list is up to date after closing edit mode without a refetch.
- Empty state: `NoData` with an **Thêm / Add** button (`action="add"`) that opens edit mode; the header Edit button is hidden when the list is empty. Wrapped in `LoadingGate` (skeleton while loading, error + retry on a failed load), same as other list pages.
- Level shown as a neutral badge via the field's own option keys (`option.languageLevel.*`); an unknown/legacy free-text level is shown as stored.
- No new i18n keys: reuses `common.edit`, `common.close`, `common.add`, `common.noData` (NoData default title), `generalInfo.foreignLanguagesDescription`.

## Diff
| file | why |
|---|---|
| src/pages/dashboard/PageLanguages.vue | `isEditing` ref; header Edit (`action="update"`, `fa-square-pen`) / Close buttons; read-only `<ul>` list with level badge; `LoadingGate` + `NoData` empty state; form rendered only when editing |
| src/pages/dashboard/PageLanguages.spec.ts (new) | view list + translated level + legacy level fallback; Sửa → form shown, list hidden; Đóng → back to list; empty → NoData, no Edit button, Thêm opens form |

## Command
`npx vitest run src/pages/dashboard/PageLanguages.spec.ts` · `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- First full `npm run test` run caught `initFontAwesomeIcon.spec.ts` → `Unregistered icons found: pages/dashboard/PageLanguages.vue -> "pen"`; switched to the registered `fa-square-pen` (same icon `ItemActions` uses for edit).
- test: `Test Files  56 passed (56)` / `Tests  355 passed (355)` (staging base: 353 → +2 new)
- build: `✓ built in 4.81s`
- lint: `eslint src --ext .js,.ts,.vue` — no errors printed
- typecheck: `grep -c "error TS"` = 90 (baseline 90); `grep -c PageLanguages` = 0

## Live check — NOT done
`npm run dev` on localhost:5173 (logged in as qa.full@example.com) loaded `/dashboard/languages`, but the prod API returned **HTTP 429** on `auth/refresh` and `general-information/` (console log `.playwright-mcp/console-2026-11-05T15-57-09-550Z.log`), so the page correctly showed the LoadingGate error state ("Không tải được dữ liệu" + "Thử lại"); retry also got 429. Screenshot timed out (shared debug browser tab). The route compiles and mounts; view/edit toggling is covered by the component spec instead. A live re-check once the rate limit clears is recommended.

## Acceptance
| Criterion | Evidence |
|---|---|
| View by default: read-only list (language + level) | spec `shows a read-only list…`: `['EnglishKhá', 'JapaneseN3']`, no `.edit-form` on mount |
| NoData when empty | spec `empty list shows NoData…`: `.no-data` exists |
| Edit button (`Button action="update"`) switches to the current form | PageLanguages.vue header button `action="update"`; spec: click Sửa → `.edit-form` exists, list gone |
| Save/Cancel back to view; discard confirm on changes | see Interpretation — modal Save persists per item, Modal.vue dirty-guard already calls `confirmDiscardChanges`; Đóng returns to view (spec) |
| Data stays in `general-information.foreignLanguages` | form component + its props unchanged; view reads the same field |
| i18n vi + en | only existing keys used (listed above); no hardcoded strings in the diff |
| DESIGN.md tokens | `git diff -U0 -- src \| grep '^+' \| grep -nE "#[0-9a-fA-F]{3,6}\|\[[0-9.]+(rem\|px)\]\|opacity-[0-9]+\|--bs-"` → `exit=1`; list uses `border-line`/`divide-line`/`bg-surface`/`text-fg`, `badgeClass()` (§5.6), `NoData` (§5.8), `LoadingGate` (§5.9) |
| lint/test/build/typecheck | see Output |
| comments per code-comments.md | header line on view vs edit mode; 1 why-line on reading the store; 1 on the legacy-level fallback |

## Supersedes
none (no other non-SEALED row cites #398)

## Still open
none

## Noticed, not done
- Prod API rate-limits this dev session (429) — live check pending.
- Untracked `.claude/commands/issue-create.md` in the working tree is unrelated to this task; not touched.

## Seal gate
none (no commit/push/API write)

---
## Round 2 — response to REOPEN `evidence/verifier/2026-11-05/issue-398-languages-view-edit-reopen.md`

### Diff added this round (still 2 files, `src/pages/dashboard/PageLanguages.vue` + its spec)
| change | why |
|---|---|
| Edit / Close merged into ONE `Button` (label/icon/action bound to `isEditing`) instead of `v-if`/`v-else-if` | keyboard pass (below) found that pressing Enter on Sửa unmounted it and dropped focus to `<body>` |
| name span `min-w-0 break-words`, badge `shrink-0` | web-design-guidelines "flex children need min-w-0 / long content" — an unbroken long name could overflow the row |

### §10 visual check — API stubbed
The prod API still returned 429, so every request to `nodejs-resume-api-ts.onrender.com` / `localhost:3001` was answered by Playwright `page.route` (no real API call; stub `auth/refresh` → token pair, `general-information/` → `{ _id, foreignLanguages: [...] }`). Data included a 79-char spaced name, a legacy level `"B1 (legacy)"`, and later a 66-char unbroken name. Stubs removed afterwards (`page.unrouteAll`). Dev server: localhost:5173, working tree of this branch.

Screenshots (`.playwright-mcp/`, gitignored), each opened and reviewed:
| file | observed |
|---|---|
| issue-398-view-1440-dark.png | header: reload + orange "Sửa"; bordered list, 4 rows, neutral level badges right-aligned; long name on one line |
| issue-398-view-1440-light.png | same layout, light tokens, badges legible |
| issue-398-view-375-dark.png | long name wraps to 3 lines (row h=97), badge stays right, no overlap |
| issue-398-edit-1440-dark-focus.png | edit mode: existing FormSection + table + Thêm; "Đóng" button with visible 2px focus ring |
| issue-398-empty-1440-dark.png / issue-398-empty-375-dark.png | dashed NoData box "Chưa có dữ liệu" + description + green "Thêm"; no Edit button in header |
| issue-398-longword-375-dark.png | unbroken 66-char name breaks inside its column, badge "B1 (legacy level text)" intact |

Measured (DOM, per screenshot): `documentElement.scrollWidth > innerWidth` = false at 1440 dark, 1440 light, 375 dark, edit 375, empty 375; no element in the page with `scrollWidth > clientWidth` (non-visible overflow); name/badge rects don't overlap in any row; long-word rows `clientWidth 341 = scrollWidth 341`.

### Keyboard pass (real key presses, 1440 dark)
- From the h1: Tab → "Tải lại" (outline solid 2px) → "Sửa" (solid 2px) → next focusable is the footer link — the list is read-only, so no stops inside it (correct).
- Round 1 code: Enter on "Sửa" → edit form shown, but `document.activeElement` = `<body>` (**bug, fixed above**).
- After the fix: Enter on "Sửa" → form shown, focus on the same button now labelled "Đóng" (solid 2px); Tab → "Thêm" (solid 2px); Shift+Tab, Enter → back to the list (4 items), focus on "Sửa".

### web-design-guidelines pass (fetched `vercel-labs/web-interface-guidelines` command.md)
- `PageLanguages.vue` list row — flex child without `min-w-0`/`break-words` → **fixed**.
- Icon-only reload button has `aria-label` ✓; actions are `<button>` ✓; empty state handled ✓; focus visible ✓.
- Not applied: "Title Case" (DESIGN.md §1.6 mandates sentence case — repo rule wins); "URL reflects state" for edit mode (no other dashboard page does it; not requested).

### Re-run gates (after both fixes)
- test: `Test Files  56 passed (56)` / `Tests  355 passed (355)`
- lint: `lint exit=0`
- build: `✓ built in 4.22s`
- typecheck: `grep -c "error TS"` = 90 (baseline 90); `grep -c PageLanguages` = 0
- token grep on `git diff -U0 -- src` → `token grep exit=1` (no match)

### Noticed, not done (round 2)
- Edit mode shows "Ngoại ngữ" twice (page h1 + the form component's own FormSection title) — same as before this change (the form was always under the h1); not touched.
- Entering edit from the empty state's "Thêm" unmounts that button, so focus goes to `<body>`; low impact (one Tab reaches the page again). Also: deleting the last language in edit mode and pressing Đóng hides the toggle (empty list → no Edit button).
