# 2026-11-01 - issue-374-skill-group-actions

- Worker: implementer · Version: 0.1.0
- Node: `issue-374-skill-group-actions` (`haven/diagrams/dev-loop.prime-mermaid.md`). This is a new node, because `issue-374-skill-badges` is already SEALED (LAI-13).
- Branch: `feature/issue-374-skill-badges`. It's the same branch, since #374 is unshipped. The diff below is cumulative on top of the sealed badge work.
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/374 (follow-up)
- Task (verbatim, 4 operator messages):
  1. "tên nhóm cho to rõ, đi kèm button "add", press vào button nhóm (x) đó thì sẽ mở popup thêm skill với nhóm là nhóm x đó, và bổ sung tính năng xóa nhóm, nếu backend chưa có API xóa nhóm thì hãy tạo issue cho backend"
  2. "thêm line tách biệt các nhóm"
  3. "phần thêm nhóm kỹ năng, đổi placehoder thành Nhập tên nhóm"
  4. "popup khi press add và add thành công thì close đi"

## Hub bytes before
85531

## Backend issue: not needed
A group is not a backend entity. It is the `professionalSkillsGroup` string array plus each skill's `group` string, both on the `general-information` document. Deleting a group is a single PATCH on the existing `api/v1/general-information/update` with both arrays. The live test below shows the API accepts it (200). So I did not open a backend issue. The API does reject a skill with an empty group (`400 … group không được để trống`, seen in round 1), so deleting a group must delete its skills too. The confirm dialog says how many.

## Acceptance criteria
1. Group names are bigger/clearer (`h3` `text-md font-semibold`), each next to an "Add" button (`common.add`; accessible name `generalInfo.addSkillToGroup`).
2. A group's "Add" opens the add-skill popup with Nhóm preset to that group. The section-level "Thêm" opens it with no preset.
3. Delete group: confirm with name + skill count, then one PATCH removing the group from `professionalSkillsGroup` and its skills from `professionalSkills`. The UI updates without a reload, and the result persists after a reload.
4. Visual separators between groups.
5. The GroupTags input placeholder is "Nhập tên nhóm" / "Enter a group name".
6. The add popup closes after a successful add.
7. No stale data. After any save on the page (group tag add/remove, skill add/delete, group delete), the list, tag chips and the next group-delete payload reflect the latest server state.
8. i18n keys in vi + en, with no concatenation. Tests, build and lint pass. Typecheck stays at or below 90, with none in changed files.

## Diff (this node, on top of the sealed badge work)
| file | why |
|---|---|
| `src/pages/dashboard/PageSkills.vue` | Group header row: `h3 text-md font-semibold` + ghost `Button` "Thêm" (`addToGroup`) + ghost trash `Button` (`deleteGroup`, `ms-auto`), only for named groups. `presetGroup` ref feeds the `group` field `default`; `addToGroup` sets it, waits a tick, calls slot `add()`, waits one more tick (the modal open re-runs the form reset on the next flush; verified empirically: clearing after one tick left the select empty), then clears it. `deleteGroup` uses `confirmDelete` + one `updatePatchDoc`. Group select options = `groupNames` (tags + group names skills use, via `groupSkills`), `group` now `required` (matches the API). `info`/`skills` computed from the shared document; `skillsGroup` watches `info.professionalSkillsGroup`. Both page saves (`handleUpdateGroup`, `deleteGroup`) now use `candidate.setGeneralInformation` (in-place) instead of `setCandidateByField({ generalInformation: [data] })`. List container `divide-y divide-line px-4`, sections `py-4`. Empty-state condition is now `items.length || skillsGroup.length`. |
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` | The `list` slot also exposes `add` (= `showModalCreateDoc`). After a successful create PATCH it calls `refModal02.value?.hide()`. This also applies to personal skills and foreign languages, the other two users of this component. |
| `src/utilities/index.ts` + spec | `groupSkills` keeps tag groups even when empty. The no-group bucket only shows when it has skills. The spec is updated for that. |
| `src/i18n/index.ts` | `generalInfo.addSkillToGroup`, `deleteGroup`, `deleteGroupTitle`, `deleteGroupText` (vi+en, `{name}`/`{count}`). `form.newTag` → "Nhập tên nhóm" / "Enter a group name" (grep: only used by `GroupTags.vue`, only used on this page). |

**Stale-data root cause (found live, fixed):** `useCandidate`'s `result` and the store share the same document object. `handleUpdateGroup` (shipped in #372) replaced the store's object via `setCandidateByField`, which split them. After that, the in-place updates from the component's per-skill add and delete only reached the store. The page's list, tag chips and `skills` stayed stale. This is a data-loss risk, because a group delete would PATCH a stale `professionalSkills`. Live round 1 showed it: after a group delete with 200, the group stayed on screen until a reload. The fix keeps every save on this page in place.

## Command
- `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck` (grep over every changed src file)
- Live: Playwright, operator's Vite. The owner account is read-only (I only opened and cancelled modals). Writes only as `qa.full@example.com` in a separate `browser.newContext()`.

## Output
- test: `Tests  311 passed (311)`; `npx vitest run src/utilities/index.spec.ts` → `Tests  21 passed (21)`; `npx vitest run src/components/veevalidate` → `Tests  22 passed (22)`
- build: `✓ built in 3.77s` · lint: `lint=0` · typecheck: `90`, `grep -E 'PageSkills|VeeFormGeneralInformationUpdate|utilities/index|i18n/index'` → no output (`grep-exit=1`)
- Owner (read-only):
  - headings `"Languages 16px 600 | Thêm kỹ năng vào nhóm Languages / Xóa nhóm Languages"`, …
  - preset: `{"SAP":"SAP","Backend":"Backend","headerAdd":""}`
  - select options `",Languages,Vue ecosystem,SAP,…,Familiar with"` (before this node: tags only, which were empty)
  - dividers: `["Languages borderTop=0px","Vue ecosystem borderTop=1px","SAP borderTop=1px"]`
  - screenshots `.playwright-mcp/skill-groups.png`, `.playwright-mcp/skill-group-add.png`
- QA, final run after all fixes:
  ```
  {"placeholder":"Nhập tên nhóm","chips":[]}
  {"tag":200}  {"emptyGroup":["QA-374d: "],"chips":["QA-374d"]}
  {"name":"QA-374s","preset":"QA-374d","add":200,"modalOpenAfterSave":false}
  {"name":"QA-374t","preset":"QA-374d","add":200,"modalOpenAfterSave":false}
  {"afterAdds":["QA-374d: QA-374s · 3 năm, QA-374t · 1 năm"]}
  {"dialogText":"Nhóm và 2 kỹ năng trong nhóm sẽ bị xóa. Không thể hoàn tác.","del":200,"sentSkillCount":43,"savedTags":[],"savedCount":43,"afterDeleteNoReload":[],"chips":[]}
  {"afterReload":[],"chips":[],"badges":43}
  ```
  The skill count after the group delete (`sentSkillCount 43`) is the 43 originals plus 2 added minus the 2 in the deleted group, so the payload used fresh data. The QA account was restored: 43 skills, no tags.
- Earlier QA run, before the in-place fix: `"afterDeleteNoReload":["QA-374d: QA-374s · 3 năm"],"tagChips":["QA-374d"]` (stale until reload). This is the bug the fix addresses.
- Console: only the existing `[intlify] Detected HTML in 'Vui lòng nhập vào <code …>"delete"</code> …'` warning (`confirm.typeDelete`, not from this diff), plus earlier 429s from `candidate/visits` caused by repeated reloads.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 | owner headings 16px/600 + aria names |
| 2 | owner preset map; QA `preset: "QA-374d"` |
| 3 | QA dialogText, del 200, `afterDeleteNoReload: []`, `afterReload: []` |
| 4 | divider borderTop 1px from the 2nd group; screenshot |
| 5 | QA `placeholder: "Nhập tên nhóm"` |
| 6 | QA `modalOpenAfterSave: false` ×2 |
| 7 | QA chips/list update without reload; `sentSkillCount 43` correct |
| 8 | Outputs above; i18n key-parity spec in the 311 |
| comments per code-comments.md | 1-line WHYs: shared-document in-place rule, preset tick, group delete removes skills, group options include used names, slot contract |

## Supersedes
none

## Noticed, not done
- `PageGeneralInformation.vue` still uses `setCandidateByField({ generalInformation: [data] })` after its own save. That splits the same way, but within that page only. On its next mount, `useCandidate` re-reads the store, so the skills page is unaffected.
- `VeeFormGeneralInformationUpdate.vue` `showModalCreateDoc` loops over the list items instead of the fields when it presets `document`. This is odd but harmless, and was already there.
- The `confirm.typeDelete` i18n message contains HTML (an intlify warning). It was already there.
- The table-row delete label concatenation in `VeeFormGeneralInformationUpdate.vue` was already there (noted on the previous node).

## Seal gate
none (no commit/push). Writes went only to the QA test account, which I restored.
