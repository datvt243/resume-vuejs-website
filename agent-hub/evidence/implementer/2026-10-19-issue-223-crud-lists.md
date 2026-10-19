# 2026-10-19 - issue-223-crud-lists

- Worker: implementer
- Version: 0.1.0
- Node: `issue-223-crud-lists` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended right after `issue-222-forms`, the last row of the contiguous table, `IN_PROGRESS`)
- Task (verbatim): #223 [UI] Phase 8 — CRUD list pages (DESIGN.md §4.4, §5.6). Pages: Học vấn, Kinh nghiệm, Dự án, Giải thưởng, Chứng chỉ, Người tham khảo, Ứng tuyển, Profile CV. Components: global/ItemTemplate.vue, components/{education,experience,project}/. Page header with one primary 'Thêm …' (e.g. 'Thêm kinh nghiệm') replacing the icon '+' and Reload buttons. Items are rows inside one card divide-y divide-line (currently a big card per item): title, subtitle text-sm text-fg-2 (no italics), date text-xs text-fg-3, actions on the right; drag handle inside the row. Edit/delete/duplicate actions: icon-only ghost <button> with aria-label (currently <a href='javascript:void(0)'> red/yellow/blue). Status badges on Ứng tuyển / profile per §5.6 (drop rounded-pill). Create/edit modal: sentence-case title, footer right-aligned (Hủy then Lưu); Profile CV modal: drop h6.text-uppercase.opacity-75. Empty state uses new NoData with a 'Thêm …' action. Fix 375px horizontal overflow on Kinh nghiệm (654px) and check the other pages. Presentation only — no API/store/composable/routing/validation changes; keep data-* specs query. One PR into staging. Screenshots before/after 1440 light, 1440 dark, 375 dark. lint+test+build green; DESIGN.md §10. Part of #211. URL: https://github.com/datvt243/resume-vuejs-website/issues/223

## Hub bytes before: 191562
(Measured right after appending this node's PM row. It also includes a foreign, uncommitted `issue-116-multi-profile-recheck-20260920` row — see "Noticed, not done".)

## Branch
`feature/issue-223-crud-lists` — created from freshly pulled `staging` (`579418c`, #239 / #222 merged) via `gh issue develop 223 --checkout --base staging --name feature/issue-223-crud-lists`. Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/components/global/ItemTemplate.vue` | pug card (`p-[1.5rem]`, 120px icon, italic `.item-note`, green `.item-title`) → HTML row `item flex flex-wrap items-start gap-3 px-4 py-3 sm:flex-nowrap`: 32px icon/image tile `bg-surface-2 text-fg-3`, title `text-base font-medium text-fg`, subtitle `text-sm text-fg-2`, date `text-xs tabular-nums text-fg-3`, `#sub` slot, description `line-clamp-2 break-words text-sm text-fg-2` (sanitized `v-html` unchanged), actions slot `ms-auto` (wraps under the text at 375). Scoped `:deep(*) { margin: 0 }` on the preview so rich-text block margins don't leave a gap. Removed the 3 pug `eslint-disable` lines (no longer pug). `.item` class kept (PageApplication.spec queries it). |
| `src/components/global/ItemActions.vue` (new, auto-registered) | Three ghost icon `Button`s: Sửa / Nhân bản / Xóa, `aria-label` = verb + item name, `title` = verb, `deleteDisabled` prop, emits `edit` / `duplicate` / `delete`. |
| `src/styles/tailwind.css` | Deleted `.item .image`, `.item-title` (hex `#00d095`, `capitalize`), `.item-note` (italic, opacity), `.item:not(:last-child)` — only `ItemTemplate` used them. `.post-content` untouched. |
| `src/components/{education/EducationItem,experience/ExperienceItem,project/ProjectItem}.vue` | `.btn-group` of `a.btn-outline-{danger,warning,primary}` with `href="javascript:void(0)"` → `ItemActions` emitting the same `onEdit` / `onDuplicate` / `onDelete` payloads; Project keeps `deleteDisabled` = `!model._id` (was `.disabled` class). |
| `src/components/veevalidate/VeeForm.vue` | + `#cancel` slot rendered before "Hủy"/submit, so modal footers read Hủy → Lưu (the `#button` slot stays after submit for the auth pages). |
| `src/pages/dashboard/Page{Education,Experience,Project,Award,Certificate,Application,Profile}.vue` | Header: one primary `Button` "Thêm học vấn" / "Thêm kinh nghiệm" / "Thêm dự án" / "Thêm giải thưởng" / "Thêm chứng chỉ" / "Thêm đơn ứng tuyển" / "Thêm profile" (icon-only `+` and reload `Button`s in a `.btn-group` removed; now-unused `getData` dropped from the `useCandidate` destructuring — lint). List: `ListTransition` gets `m-0 list-none divide-y divide-line rounded-md border border-line bg-surface p-0`. Empty: `NoData` with a specific title (+ one-line description on 4 pages) and a secondary "Thêm …" action, inside a card. Modal: create title "Thêm …" (was "Thêm mới Học vấn" etc.), submit "Lưu" (was Thêm mới/Cập nhật/Nhân bản), `button-position="end"`, ghost "Hủy" with `data-bs-dismiss="modal"` in `#cancel` (was `btn btn-secondary mx-[1rem]` "Đóng" after submit). Root `mb-[1.5rem]` gone. Drag pages: hint `text-xs text-fg-3` "Kéo thả để sắp xếp. Thứ tự chỉ lưu trên trình duyệt này." (was `opacity-50`), handle `aria-hidden`, inside the row (`li` is the row, `ps-2`; scoped `:deep(.item) ps-0`), drag/drop handlers untouched. Award/Certificate/Application/Profile: inline action `<a>`s → `ItemActions`, delete still calls `deleteDoc({ ...item }, '<field>', …)` then `removeRecordById(res.data._id)` (same as before, written as an arrow). Project: tech line `text-xs text-fg-2` "Công nghệ: …", hidden when empty. |
| `src/pages/dashboard/PageApplication.vue` | §5.6 badges: `inline-flex h-5 items-center gap-1.5 rounded-sm px-2 text-xs font-medium` + subtle bg per status (neutral / warning / success / danger) with a 6px dot; profile badge neutral with a layer icon (was `badge rounded-pill text-bg-*`). Profile public / PDF / job links stay `<a target="_blank">` (spec) but use ghost icon `buttonClass` + `aria-label` + `title`. |
| `src/pages/dashboard/PageProfile.vue` | 3-sentence `opacity-75` paragraph → `Heading` description (one sentence). Modal sections: `h6.text-uppercase.opacity-75` → `text-sm font-medium` label with `tabular-nums text-fg-3` count; "Chọn tất cả" / "Bỏ chọn" ghost sm `Button`s; empty section → `text-sm text-fg-3` line (no nested NoData); `opacity-60` → `text-fg-3`; `mb-[1rem]`/`mb-[0.5rem]` → `mb-4`/`mb-2`. |
| `src/pages/dashboard/PageReference.vue` | Same header / modal changes; table row `Dropdown` → `ItemActions` in the name cell; empty → card `NoData` "Chưa có người tham khảo nào" + action (TableDefault only renders when there are rows), `height-auto` (no dropdown to make room for any more). |
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` | Its modal gets the same footer: "Hủy" in `#cancel`, "Lưu", title "Thêm …" / "Sửa: …" in lowercase. |
| `src/pages/dashboard/PageApplication.spec.ts` | Stub `ItemActions` (unresolved-component warning otherwise). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row (only this row is mine — see below). |

Not touched: API calls, `deleteDoc` / `updateDoc` / `useManualOrder` / stores, routing, models, validation. Delete confirmation copy lives in `useDocument` (composable) — not changed.

## Command
From repo root:
- `npx vitest run src/pages src/components`
- `npx vitest run src/pages/dashboard/PageApplication.spec.ts`
- `npm run lint`
- `npm run test`
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
```
first lint after removing reload buttons: ✖ 8 problems (8 errors) — 'getData' is assigned a value but never used (8 pages) → removed from destructuring
npm run lint:   lint_exit=0
pages+components (one parallel run): Tests 2 failed | 104 passed (106) — VeeForm "BUG (real, verified): clicking submit after touching+clearing…" + the pre-existing VI|EN test
  → VeeForm.spec.ts alone, 3 runs: "Tests 1 failed | 16 passed (17)" each time, verbose list shows the BUG test ✓ — one-off flake, not reproduced
PageApplication.spec.ts: Tests 4 passed (4) (no unresolved-component warning after the stub)
npm run test:   FAIL src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
                Test Files  1 failed | 35 passed (36)
                Tests  1 failed | 239 passed (240)      (same pre-existing failure as #220/#221/#222)
npm run build:  ✓ built in 3.68s
```
(Final runs, after every edit.)

DESIGN.md §10 grep (`#hex`, `[Npx|rem]`, `opacity-N`, plus `rounded-pill`, `javascript:void`) over every changed `.vue` + `ItemActions.vue` → one hit, `PageProfile.vue:8` comment text `resume-nodejs-api#133` (issue ref, not a color).

Manual observation (Playwright on the port-9888 debug Chrome, existing `npm run dev`, logged-in session; scripted loop over the 8 routes; not an automated test). Before = `git stash push -- src/` + HMR, then `git stash pop`. Theme via `data-bs-theme` on `<html>`.
```
Before 375 scrollWidth: education 616, experience 603, project 788, award/certificate/reference/application/profile 375; javascript: links: education 3, experience 15, project 6, profile 3
After (all 8): header primary button = "Thêm học vấn" / "Thêm kinh nghiệm" / "Thêm dự án" / "Thêm giải thưởng" / "Thêm chứng chỉ" / "Thêm người tham khảo" / "Thêm đơn ứng tuyển" / "Thêm profile"; javascript: links 0; 375 scrollWidth 375 on every page
Rows: education 1, experience 5, project 2, profile 1 inside ul.divide-y; actions are BUTTONs, e.g. "Sửa Laidon Group", "Nhân bản Laidon Group", "Xóa Laidon Group" (15 on experience)
Empty (no data in this account): award "Chưa có giải thưởng nào", certificate "Chưa có chứng chỉ nào", reference "Chưa có người tham khảo nào", application "Chưa có đơn ứng tuyển nào"
Experience row heights after the preview-margin fix: [132,132,132,112,132] (uneven 150–170 with trailing gaps before it)
Real click "Sửa Laidon Group" → modal title "Chỉnh sửa: Laidon Group", footer ["Hủy","Lưu"], justify flex-end; click "Hủy" → modal closed (no save)
Console errors: HTTP 401s on candidate/visits/list endpoints = expired access token → app refresh-and-retry, rows then loaded
```
Screenshots (local, gitignored, `.playwright-mcp/`): `223-before-<page>-{1440-dark,1440-light,375-dark}.png` and `223-after-<page>-{…}.png` for all 8 pages, plus `223-after-experience-modal-1440-light.png`.

## Acceptance
| Criterion | Evidence |
|---|---|
| One primary "Thêm …" in the header, no `+`/reload icons | live header buttons on all 8 pages |
| Rows in one `divide-y` card; subtitle `text-sm text-fg-2` no italics; date `text-xs text-fg-3`; actions right; drag handle in the row | `ItemTemplate.vue`, drag `li` markup; `ul.divide-y` present; screenshots |
| Edit/delete/duplicate = ghost icon `<button>` with `aria-label` | live action list; `javascript:` links 0 |
| Application/profile badges per §5.6, no `rounded-pill` | `PageApplication.vue` diff; grep (no data in this account to see them live) |
| Modal: sentence-case title, footer right, Hủy then Lưu; Profile modal without `h6.text-uppercase.opacity-75` | live modal check; `PageProfile.vue` diff |
| Empty state `NoData` + "Thêm …" | live empty titles on 4 pages |
| 375 overflow fixed (Experience) and other pages checked | before/after scrollWidth for all 8 |
| Presentation only; `data-*`/spec hooks kept | `.item` + `a[target=_blank]` kept; handlers/composables unchanged; spec 4/4 |
| lint + build green, no new test failure | outputs above |
| Comments per code-comments.md | `ItemActions` doc block + `label` prop note, `ItemTemplate` preview-margin note, drag-page `:deep(.item)` note, Application "§5.6 badges" label. No new issue refs. |

## Noticed, not done
- **Foreign uncommitted hub changes in this working tree, not mine**: `agent-hub/evidence/implementer/2026-09-20-issue-116-multi-profile-recheck.md` (untracked) and an `issue-116-multi-profile-recheck-20260920` row appended to the diagram after a blank line (outside the table). Appeared during this session; left untouched and to be kept out of this branch's commit.
- Award / Certificate / Application / Reference have no data in this account, so their populated rows and the Application badges were not seen live (markup + spec only).
- Delete confirmation copy ("Xóa … này?" with "Xóa"/"Hủy", §4.4) comes from `useDocument.deleteDoc` → `confirmDelete` — composable, out of scope.
- `PageImportLinkedin.vue` modals still use "Đóng" in `#button` (not in this issue's page list; Phase 9 #224 covers "Nhập CV").
- Item dates use "MM/YYYY - MM/YYYY" with a hyphen (formatted in the item components / utilities).
- VeeForm "BUG … touching+clearing" test flaked once in a parallel run (passed in 3 isolated runs and in the final full run).

## Seal gate
None in this pass (no commit/push; the only modal interaction was "Hủy" — no API write). Ship via `/ship` after verifier SEAL.
