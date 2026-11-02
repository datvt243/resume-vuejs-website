# 2026-11-01 - issue-374-skill-edit-rename

- Worker: implementer · Version: 0.1.0
- Node: `issue-374-skill-edit-rename` (new node; previous #374 nodes SEALED)
- Branch: `feature/issue-374-skill-badges` (same unshipped #374 branch)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/374 (follow-up)
- Task (verbatim, 2 operator messages):
  1. "thêm phần chỉnh sửa skill, press vào skill để mở popup edit"
  2. "về nút xóa nhóm, khi nhóm bị xóa thì xóa toàn bộ skills của nhóm đó luôn, bổ sung đổi tên nhóm"

## Hub bytes before
85557

## Acceptance criteria
1. Clicking a skill name opens the add/edit modal titled "edit", pre-filled with that skill's name, exp and group. Saving replaces that list item (no duplicate), and the modal closes on success.
2. After an edit, opening "Thêm" (top or per-group) gives a blank form again, with the group preset when opened from a group.
3. Rename group: pencil button opens a prompt pre-filled with the name. An empty name or another existing group's name is rejected. Saving renames the tag (if it is one) and moves every skill of the group, in one PATCH. The UI updates without a reload.
4. Delete group still deletes the group and all its skills. This behavior is unchanged from `issue-374-skill-group-actions` and re-verified here.
5. i18n keys in vi + en, with no concatenation. Tests, build and lint pass. Typecheck stays at or below 90, with none in changed files.

## Diff
| file | why |
|---|---|
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` | `editIndex` ref + `showModalEditDoc(index)`: assigns the item into `document` with a placeholder `_id` (`edit-<i>`). Items have no `_id` (API shape `{name,exp,group}`), and VeeForm's `loadDocument` resets id-less docs. The placeholder also switches the modal title to `form.editTitle`. `showModalCreateDoc` clears `editIndex` and `document._id`. The create branch of `handleUpdate` replaces `list[editIndex]` instead of appending when editing. On success it resets `editIndex` and hides the modal. The `list` slot also exposes `edit`. The `_id` never reaches the API, because VeeForm only submits declared fields (name/exp/group), as the QA payload below confirms. |
| `src/pages/dashboard/PageSkills.vue` | Skill name is a `<button>` (`aria-label` `generalInfo.editSkill`) → `edit(skill.index)`. `renameGroup(group)`: Swal text prompt (pattern from the component's existing type-delete prompt, `buttonClass` actions) with `inputValidator` (required / `groupExists` against `groupNames`). PATCH `professionalSkillsGroup` (tag renamed) + `professionalSkills` (group moved), then `setGeneralInformation` in place. Pencil `fa-square-pen` (already registered) button before the trash, `ms-auto` moved to it. |
| `src/i18n/index.ts` | `generalInfo.editSkill`, `renameGroup`, `renameGroupTitle`, `groupExists` (vi+en). |

## Command
- `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`
- Live: Playwright. The owner account was read-only: I opened prompts and modals and cancelled them, nothing saved. Writes went only to `qa.full@example.com` in a separate `browser.newContext()`.

## Output
- test `Tests  311 passed (311)` · build `✓ built in 3.95s` · `lint=0` · typecheck `90`, `grep -E 'PageSkills|VeeFormGeneralInformationUpdate|i18n/index'` → no output (`grep-exit=1`)
- Owner (read-only):
  ```
  {"edit":{"title":"Sửa: kỹ năng chuyên môn","name":"TypeScript","exp":"3","group":"Languages"},
   "addAfterEdit":{"title":"Thêm kỹ năng chuyên môn","name":"","exp":"","group":"SAP"},
   "rename":{"title":"Đổi tên nhóm SAP","value":"SAP"},"dupMsg":"Đã có nhóm với tên này"}
  ```
  (duplicate test: typed "Vue ecosystem" into SAP's rename, then Cancel; screenshots `.playwright-mcp/skill-edit.png`, `.playwright-mcp/skill-rename.png`)
- QA:
  ```
  {"added":["QA-r: QA-skill· 1 năm"]}
  {"loaded":"QA-skill|1|QA-r","edit":200,"countAfterEdit":44,"saved":["QA-skill2:4:QA-r"],"modalOpen":false,"ui":["QA-r: QA-skill2· 4 năm"]}
  {"rename":200,"tags":["QA-r2"],"saved":["QA-skill2:QA-r2"],"ui":["QA-r2: QA-skill2· 4 năm"],"chips":["QA-r2"]}
  {"del":200,"count":43,"tags":[],"ui":[],"chips":[]}
  {"afterReload":[],"chips":[],"badges":43}
  ```
  After the edit there were 44 skills (43 + 1), so the edit replaced the skill rather than duplicating it. The QA account was restored to 43 skills with no tags.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 | owner `edit` values + title; QA `loaded`, `countAfterEdit 44`, `saved QA-skill2:4:QA-r`, `modalOpen false` |
| 2 | owner `addAfterEdit` blank + preset SAP |
| 3 | owner `rename` prefill + `dupMsg`; QA rename 200, tag + skill moved, UI/chips updated without reload |
| 4 | QA del 200, count back to 43, tags [] |
| 5 | outputs above |
| comments per code-comments.md | 1-line WHYs: placeholder `_id`, rename does tag + skills in one save |

## Supersedes
none

## Noticed, not done
- The owner account went from 43 to 41 skills (HTML5/CSS3/SCSS merged) earlier in the session, not by this session. I've asked the operator about it (see the `issue-374-skill-name-emphasis` note).
- Editing changes only that skill. Moving it to another group via the select works through the same replace path, but I didn't run it as a separate live case.

## Seal gate
none (no commit/push). QA writes only, restored.

## REOPEN fix (round 2) — answers `evidence/verifier/2026-11-01/issue-374-skill-edit-rename-reopen.md`
No code change. Added the missing live proof for criterion 3's empty-name rejection.
- Owner account, read-only. I opened the SAP rename prompt, filled `''`, then `'   '`, pressed confirm, then Cancel. A request listener captured every PATCH/PUT during the run:
  ```
  {"empty":{"msg":"Vui lòng nhập","promptOpen":true},"spaces":{"msg":"Vui lòng nhập","promptOpen":true},"patches":[],"headings":["Languages","Vue ecosystem","SAP"]}
  ```
  Both inputs were rejected with the validation message, the prompt stayed open and no write request went out. The group name is unchanged.
