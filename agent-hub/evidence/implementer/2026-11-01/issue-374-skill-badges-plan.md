# 2026-11-01 - issue-374-skill-badges

- Worker: implementer · Version: 0.1.0
- Node: `issue-374-skill-badges` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Branch: `feature/issue-374-skill-badges` (off synced `staging` @ 72d8a5e, via `gh issue develop 374`)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/374
- Task (verbatim): "Kỹ năng chuyên môn đổi UI hiển thị, show theo group Nhóm, gồm tên nhóm và list các skill là badge (gồm tên skill, exp, và icon 'x' để xóa)"

## Hub bytes before
85369

## Acceptance criteria
1. The professional-skills tab shows skills grouped by their `group`. Each group has a heading with its name, then its skills.
2. Each skill is a badge showing its name, its experience (years) and an × button.
3. × deletes that skill through the existing delete flow: Swal "type delete" confirm, then PATCH of `professionalSkills` without it. The badge disappears and stays gone after a reload.
4. Every skill appears exactly once. Skills with no group appear under "Chưa phân nhóm". The personal-skills tab and foreign languages still use the table.
5. i18n keys exist in vi and en. Tests, build and lint pass. Typecheck stays at or below 90 with no errors in changed files.

## Diff
| file | why |
|---|---|
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` | New scoped slot `list` (`items`, `remove(index)`) wrapping the existing `TableDefault` as its fallback, so other users (personal skills, foreign languages) are unchanged. `remove` calls the same `handleUpdate({ index }, 'delete')` the table row uses. The table block is only re-indented. |
| `src/utilities/index.ts` | Pure `groupSkills(items, groups)`. Groups in tag order come first, then other group names in order of first use, then skills with no group (`name: null`). Empty groups are dropped, and each skill keeps its `index` in the stored list. |
| `src/utilities/index.spec.ts` | `groupSkills` case: tag order, non-tag group, missing/empty group, empty tag dropped, indexes, empty input. |
| `src/pages/dashboard/PageSkills.vue` | `#list` slot on the professional instance: card → section per group (`h3` name, or `generalInfo.ungrouped` for null) → `ul` of `badgeClass()` badges: name, `· {n} năm` when `exp`, `<button aria-label="Xóa <name>">` with `fa-xmark` → `remove(skill.index)`; `NoData` when empty. |
| `src/i18n/index.ts` | `generalInfo.ungrouped` ("Chưa phân nhóm" / "Ungrouped"), `generalInfo.skillYearsShort` ("{n} năm" / "{n} yr"). |

First version grouped by tags only. Live on the owner account it put every skill under "Chưa phân nhóm", because that account has skill `group` values but an empty tag list. I changed `groupSkills` to also use the skills' own group names, and the spec covers that case.

## Command
- `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck` (grep includes every changed src file)
- Live: Playwright on the operator's Vite. Read-only on the owner account. Writes only as `qa.full@example.com` in a separate `browser.newContext()`.

## Output
- test: `Test Files  51 passed (51)` / `Tests  311 passed (311)` (`npx vitest run src/utilities/index.spec.ts` → `Tests  21 passed (21)`)
- build: `✓ built in 3.79s`
- lint: `lint=0`
- typecheck: `90`; `grep -E 'PageSkills|VeeFormGeneralInformationUpdate|utilities/index|i18n/index'` → no output, `grep-exit=1`
- Live, owner (read-only), sections in the professional tab:
  ```
  Languages (5): JavaScript (ES6+) · 4 năm, TypeScript · 3 năm, HTML5 · 10 năm
  Vue ecosystem (6) … SAP (6) … Testing & Code Quality (4) … Performance (4) … Architecture & Practices (7) … Backend (2) … Tools & Workflow (5) … AI-assisted Development (2) … Familiar with (2)
  ```
  That's 43 badges in total, the same as the earlier table (25 rows were visible on its first page). Each × has an aria-label like `Xóa JavaScript (ES6+)`. Screenshot: `.playwright-mcp/skill-badges.png`.
- Live, QA account (writes):
  ```
  tag QA-374g: 200
  add skill: {"add":200,"saved":["QA-374:2:QA-374g"]} → badge "QA-374 · 2 năm" under heading "QA-374g"
  delete via × (aria "Xóa QA-374") + Swal "delete": {"del":200,"stillInResponse":false,"count":43,"afterDelete":[]}
  reload: {"afterReload":[]}
  cleanup tag: {"cleanupTag":200,"tags":[]}
  ```
  The QA account was left as it was found: 43 skills, no tags.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Grouped with names | Owner live section list; QA "QA-374g" heading |
| 2. Badge: name, exp, × | Live text `JavaScript (ES6+) · 4 năm` + aria-label; screenshot |
| 3. × deletes via existing flow | QA live del 200, not in response, gone after reload |
| 4. Every skill once / ungrouped / other users unchanged | `groupSkills` spec; 43 badges = 43 skills; slot fallback keeps table for personal skills + foreign languages (no `#list` there) |
| 5. i18n / checks | Outputs above |
| comments per code-comments.md | One 1-line template comment on the slot contract (WHY `remove` exists); JSDoc on `groupSkills` describes ordering contract |

## Supersedes
none

## Noticed, not done
- **Already broken, not caused by this diff:** you can't add a professional skill until at least one skill-group tag exists. The "Nhóm" select only lists `professionalSkillsGroup` tags, but the API rejects an empty group (`400 VALIDATION_ERROR professionalSkills[43].group không được để trống`). Both the owner and QA accounts have no tags, so there the select only shows "Vui lòng chọn". Possible fix: build the options from tags plus the group names the skills already use, and mark `group` required in yup. This needs a separate issue.
- Running Prettier on these two files would reformat them completely (they were already off-style). I reverted that and kept the diff minimal.

## Seal gate
none (no commit/push). Writes went only to the QA test account, and its data was restored.

## REOPEN fix (round 2) — answers `evidence/verifier/2026-11-01/issue-374-skill-badges-reopen.md`
- `PageSkills.vue`: the × aria-label was built by string concatenation (`` `${$t('common.delete')} ${skill.name}` ``). It now uses `$t('generalInfo.deleteSkill', { name: skill.name })`. New key `generalInfo.deleteSkill` in vi (`'Xóa {name}'`) and en (`'Delete {name}'`).
- `grep -n "common.delete')} \${skill" src/pages/dashboard/PageSkills.vue` → no output (`concat-left=1`)
- test `Tests  311 passed (311)` (includes the i18n key-parity/used-keys spec) · build `✓ built in 3.71s` · `lint=0` · typecheck `90`, `grep -E 'PageSkills|VeeFormGeneralInformationUpdate|utilities/index|i18n/index'` → no output (`grep-exit=1`)
- Live after a reload (owner account, read-only): first × aria-labels are `["Xóa JavaScript (ES6+)","Xóa TypeScript","Xóa HTML5"]`
- Noticed, not done: `VeeFormGeneralInformationUpdate.vue`'s table-row delete button already had the same concatenation (`` `${t('common.delete')} ${doc.name || ...}` ``) before this diff. This diff doesn't change that line, so I didn't fix it here.
