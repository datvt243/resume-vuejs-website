# 2026-11-22 — issue-444-441-education-view-languages-edit
Worker: implementer · Version: 0.1.0 · Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-444-441-education-view-languages-edit` (IN_PROGRESS)
Branch: `feature/issue-444-441-education-view-languages-edit` (off `staging` @ 4cb9ebc, linked to #444 via `gh issue develop`; #441 named in branch)
Task: /todo #444 and #441 — #444 "Education: add a read-only "View" modal like Experience" (dates, school, major, sanitized description, Edit button, vi/en) · #441 "Languages: allow editing an existing language" (click a row → same modal pre-filled; save patches the full `foreignLanguages` list).

## Hub bytes before: 100329
(measured with the evidence/README.md command after the analyst pass, before the diagram row was added; analyst only touched `doctrine/features/`, which the count excludes)

## Feature doc
- `doctrine/features/cv-timeline-sections.md` Behavior #11 + #444 acceptance criteria/edge cases
- `doctrine/features/cv-languages.md` Behavior #6 + #441 acceptance criteria/edge cases
Analyst spec: `evidence/analyst/2026-11-22/issue-444-441-spec.md` (spec_ready, open questions answered by operator 2026-11-07). Feature doc changed by implementer: no.

## Diff
| File | Why |
|---|---|
| `src/components/education/EducationItem.vue` | `viewable` on `ItemActions` + emits `onView` with a copy of the entry (same as ExperienceItem/ProjectItem) |
| `src/pages/dashboard/PageEducation.vue` | read-only View modal: title + school + major via `getLocalizedText(field, formLang)`, dates `MM/YYYY - MM/YYYY|Hiện tại`, `sanitizeHtml` description, shared `useFormLang` VI\|EN radiogroup, footer Edit → `showModalEditDoc(viewDoc)`. Same markup/idiom as PageExperience/PageProject |
| `src/components/table/TableDefault.vue` | optional `onRowClick` prop (`@row-click`): row click → `onRowClick(modelValue index)`; ignored on buttons/links/inputs/labels and when text is selected; `cursor-pointer` only when a listener is bound |
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` | default table: `@row-click="showModalEditDoc"` + icon-only Edit button (`action="update"`, aria-label `generalInfo.editSkill` = "Sửa {name}"/"Edit {name}") before Delete; actions col `w-12`→`w-24`; `showModalEditDoc` sets `document._id = null` before assigning so VeeForm's deep watch reloads even when the same row is reopened after a cancelled edit (review finding 1) |
| `src/pages/dashboard/PageEducation.spec.ts` | 2 new tests (#444) |
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts` | 2 new tests (#441) with the real `TableDefault`; VeeForm mock now declares its props |

Coverage claim — the default table of `VeeFormGeneralInformationUpdate` (where Edit/row-click were added) is used only by Languages:
`grep -rn "VeeFormGeneralInformationUpdate" src --include="*.vue"` → PageSkills.vue (2 uses) + PageLanguages.vue; `grep -rn "#list" src/pages` → `PageSkills.vue:245: <template #list=...>` (Skills replaces the table via the `list` slot, so only Languages renders the default table). `TableDefault` row click is opt-in (no other consumer passes `@row-click`).

No new i18n keys (reused `common.edit`, `common.present`, `form.contentLang`, `field.school|major|startDate|endDate|description`, `generalInfo.editSkill` — all present in vi + en: `src/i18n/index.ts:349/889` editSkill, `:72/612` present, `:176-177/716-717` school/major).

## Command
From repo root (doctrine/MEMORY.md): `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`; plus `npx vitest run <files>`.

## Output (final run, after review fixes)
```
✓ built in 4.06s
 Test Files  65 passed (65)
      Tests  447 passed (447)
LINT_EXIT=0
TC_EXIT=2
78            <- grep -c "error TS" (baseline 78)
0             <- grep -cE "PageEducation|EducationItem|TableDefault|VeeFormGeneralInformationUpdate" in typecheck output
```
Targeted run (before review fixes):
```
 ✓ src/components/table/TableDefault.spec.ts (7 tests)
 ✓ src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts (6 tests)
 ✓ src/pages/dashboard/PageEducation.spec.ts (3 tests)
 ✓ src/pages/dashboard/PageLanguages.spec.ts (2 tests)
 Test Files  4 passed (4)
      Tests  18 passed (18)
```
After review fixes: `npx vitest run src/components` → `Test Files 16 passed (16) / Tests 108 passed (108)`; `npx eslint` on the 2 fixed files → `LINT_OK`.

Dev-server compile check (Vite started by me on :5173, then stopped): all 5 changed/affected SFCs served `200` (PageEducation, EducationItem, TableDefault, VeeFormGeneralInformationUpdate, PageLanguages).

## Live check (Playwright over CDP, isolated Chrome profile, prod API, QA account `qa.full@example.com` — `localStorage.user` email confirmed)
#444 `/dashboard/education`:
```
eyeLabel: "Xem chi tiết Trường Cao đẳng Kỹ thuật Cao Thắng"
viewText (VI): "Trường Cao đẳng Kỹ thuật Cao Thắng\nVI\nEN\nTên trường\nTrường Cao đẳng Kỹ thuật Cao Thắng\nChuyên ngành\nCông nghệ Thông tin\nNgày bắt đầu - Ngày kết thúc\n09/2011 - 07/2014\nMô tả\n\nCao đẳng, Công nghệ Thông tin\n\nĐóng\nSửa"
viewTextEn: "... Mô tả\n\nCollege Diploma, Information Technology ..." (school/major unchanged = EN empty → VI fallback)
reqsOnView: []   (no /api/v1/ request while opening/toggling the view)
after Edit: visible dialog "Sửa: Trường Cao đẳng Kỹ thuật Cao Thắng ... Cao đẳng, Công nghệ Thông tin ... Hủy Lưu"
```
#441 `/dashboard/languages` (Edit mode):
```
before: ["english\nCơ bản"]
row click → title "Sửa: ngoại ngữ", pre-filled {lang:"english", level:"basic"}
change to intermediate → Hủy → click row again → {lang:"english", level:"basic"}   (cancelled edit dropped — review fix 1)
save intermediate → PATCH general-information/update {"_id":"6adf411a2987df4de8b08a4c","foreignLanguages":[{"language":"english","level":"intermediate"}]}
rowsAfter: ["1\t\nenglish\n\t\nTrung bình\n\t"]
row Edit button aria-label "Sửa english"; focus + Enter → modal {lang:"english", level:"intermediate"}
restore basic → PATCH {...,"foreignLanguages":[{"language":"english","level":"basic"}]}; rowsRestored: ["1\t\nenglish\n\t\nCơ bản\n\t"]
```
QA data restored to its original value. Vite and the Chrome I launched were stopped (`lsof :5173` / `:9888` → 0 listeners).

## Acceptance
| Criterion | Evidence |
|---|---|
| (#444) PageEducation.spec: VI shows "ĐH A","CNTT", "…- Hiện tại", "Mô tả"; EN click shows "Univ A","IT","Desc" + `formLang==='en'`; EN-empty description → "Mô tả"; `<script>`/`onerror` stripped; Edit → `document._id==='ed1'` | `PageEducation.spec.ts` tests "shows the entry in the shared VI \| EN language and jumps to edit" + "falls back to VI when EN is empty and strips unsafe HTML"; `PageEducation.spec.ts (3 tests)` ✓ |
| (#444) `grep -n "viewable" src/components/education/EducationItem.vue` hits; emits `onView` with a copy | `EducationItem.vue` pug line `ItemActions(:label="item.title" viewable @view="emits('onView', {...model})" ...)` |
| (#444) Manual: eye button, read-only modal, Edit → pre-filled form, shared toggle, no request on View | Live check #444 above (`eyeLabel`, `viewText`/`viewTextEn`, `reqsOnView: []`, dialog after Edit). Toggle shared: the view binds `useFormLang().formLang` (same singleton as VeeForm/Experience); spec asserts `formLang.value === 'en'` after click |
| (#441) spec: edit row 0 pre-filled English/basic; submit expert → `updatePatchDoc` with `[{English,expert},{French,advanced}]`; Delete click doesn't open edit | `VeeFormGeneralInformationUpdate.spec.ts` "clicking a row opens the modal pre-filled, and save patches that row in place" + "the row Edit button opens the same form; Delete does not" (spec lives with the component, which the criterion allows: "or a `VeeFormGeneralInformationUpdate` spec") |
| (#441) Manual: row click → pre-filled; save → one PATCH with full list, same length; list shows new level; Tab/Enter on row Edit opens same modal | Live check #441 above (PATCH bodies, `rowsAfter`, `kb`) |
| (#441) Sorted table edits the clicked row | `rowClick` passes `props.modelValue.indexOf(doc)` (unsorted index), same as `tbodyMore`'s `doc.index`, already covered for sort by `TableDefault.spec.ts` "sorts asc → desc → off … tbodyMore still gets the original index" |
| New i18n keys in vi+en | none added (keys reused, lines cited under Diff) |
| lint / build / test pass; typecheck ≤ 78, none in changed files | Output: `LINT_EXIT=0`, `✓ built in 4.06s`, `Tests 447 passed (447)`, `78` errors / `0` in changed files |
| Comments per code-comments.md | 4 new `//` one-liners, each a WHY (row-click guard, `@row-click` binding, `_id = null` reload trick, shared toggle — the last copied from PageExperience); no issue refs, no restating |

## Supersedes: none
`grep -n "444\|441" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row.

## Review
`/code-review medium` on the working-tree diff → 8 findings:
1. Reopening the same row after a cancelled edit shows the abandoned values (VeeForm deep watch not triggered by identical assign) — **fixed** (`document._id = null` first); verified live (`afterCancel` = basic).
2. Row click fires on other interactive content — **fixed** (guard extended to `input, select, textarea, label`). Clicking empty padding of the actions cell opening edit = intended (it is part of the row).
3. Text selection opens the modal — **fixed** (`!window.getSelection()?.toString()`).
4. `$t('field.startDate') - $t('field.endDate')` concatenation — kept: identical to the existing PageExperience/PageProject view label; spec says "same pattern". → Noticed, not done.
5. `--/--` for missing dates — `formatDate` placeholder, same as Experience/Project views and the card; spec edge case only covers `isCurrent` + null endDate (handled). → Noticed, not done.
6/7. VI|EN toggle / whole view modal duplicated a 3rd time — cleanup, out of scope (SmallestDiff). → Noticed, not done.
8. `viewDoc` snapshot stale after save — reviewer rates low risk; each View click re-emits a fresh copy. False positive for current behavior.

## Noticed, not done
- View modal (toggle + dl + Edit footer) is now copied in PageExperience, PageProject, PageEducation — candidate for a shared `ItemViewModal` / `SegmentedControl` reuse.
- "Start - End" label concatenates two translated fragments in all three views — needs one `field.period`-style key.
- The cancelled-edit fix also covers PageSkills (same `showModalEditDoc`). The Experience/Education/Project pages' own `showModalEditDoc` may have the same issue when the same doc is reopened after a cancel; not checked.
- Existing Delete aria-label concatenates `t('common.delete')` + name (pre-existing).

## Seal gate: none
No commit/push/merge. The two live PATCHes went to the QA account (allowed for writes per operator memory) and were reverted.
