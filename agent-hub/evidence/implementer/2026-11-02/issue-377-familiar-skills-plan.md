# 2026-11-02 - issue-377-familiar-skills

- Worker: implementer · Version: 0.1.0
- Node: `issue-377-familiar-skills`
- Branch: `feature/issue-377-familiar-skills` (off synced `staging` @ `d26c203`, via `gh issue develop 377`)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/377
- Task (verbatim): "backend đang bổ sung FamiliarSkills, hãy chờ, xong thì update cho repo này tương tự mainSkills"

## Hub bytes before
84915

## Backend contract (read, not assumed)
- `../resume-nodejs-api` `origin/main` = `25f41e5 Merge pull request #351 … release/v2.4.0`.
- `generalInformation.validate.ts` on origin/main: `familiarSkills: Joi.array().items({ name: Joi.string() })`. There is **no max**, unlike mainSkills (max 5).
- Model: `{ type: [personalSkills], default: [] }`.
- Prod deploy: a background curl poll (QA token, PATCH `familiarSkills: []` = the default value) got `07:22 status=400`, then `07:24 status=200`.

## Acceptance criteria
1. A "Kỹ năng quen thuộc" section sits above the Tabs, below "Kỹ năng chính". It has badges and × to remove. Empty state is the bordered box.
2. "Thêm" opens "Chọn kỹ năng quen thuộc", picking from the professional skills with name search and group filter, pre-checked from the saved list. There is no limit: nothing is disabled, and the counter reads "Đã chọn n".
3. Save sends a PATCH with `{ _id, familiarSkills: [{ name }] }` and nothing else. The store updates in place. The popup closes on success and stays open on failure. Main skills behave as before.
4. i18n keys in vi + en. Tests, build and lint pass. Typecheck stays at or below 90, with none in changed files.

## Diff
| file | why |
|---|---|
| `src/components/MainSkills.vue` → `PickedSkills.vue` (git mv) | Generalized. `title`, `description` and `pickTitle` are now props. `max` defaults to 0, meaning no limit: the disable rule becomes `!!max && …`, and the counter uses `generalInfo.selectedCount` when there is no max. |
| `src/components/MainSkills.spec.ts` → `PickedSkills.spec.ts` | Renamed. `mountComponent` takes `max`. +1 test: with `max 0`, nothing is disabled after ticking 3, and the counter key is `selectedCount`. |
| `src/pages/dashboard/PageSkills.vue` | `saveMainSkills` → `savePicked(field, list)` (same body, keyed by field). Two `<PickedSkills>`: main (max 5, same texts as before) and familiar (no max). |
| `src/pages/dashboard/PageSkills.spec.ts` | Stub renamed to `PickedSkills`, main tests unchanged. +1 test: the familiar instance has title "Kỹ năng quen thuộc", `max` undefined, saves `{ familiarSkills }` only (no `mainSkills` key), and `setGeneralInformation({ familiarSkills })`. |
| `src/i18n/index.ts` | `generalInfo.familiarSkills`, `familiarSkillsDescription`, `familiarSkillsPick`, `selectedCount` (vi+en). |

Not in this diff: `DESIGN.md` and `src/components/global/NoData.vue` show as modified in the working tree. That's an uncommitted change from outside this session (a dashed border on NoData), which I left untouched. It will be excluded from this node's commit.

## Command
- `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`
- Live: Playwright, as `qa.full@example.com` in a separate `browser.newContext()` (owner untouched)

## Output
- `npx vitest run src/components/PickedSkills.spec.ts src/pages/dashboard/PageSkills.spec.ts` → `PickedSkills.spec.ts (6 tests)`, `PageSkills.spec.ts (5 tests)`, `Tests  11 passed (11)`
- Full: `Tests  322 passed (322)` | `✓ built in 3.79s` | `lint=0` | typecheck `90`, `grep -E 'PageSkills|PickedSkills|i18n/index'` → no output (`grep-exit=1`)
- Live, read-only, before deploy: h2 order `["Kỹ năng chính","Kỹ năng quen thuộc","Kỹ năng chuyên môn"]`, description "Kỹ năng bạn đã từng dùng, chọn từ kỹ năng chuyên môn.", popup title "Chọn kỹ năng quen thuộc", 7 ticked gives "Đã chọn 7" with 0 disabled, writes []. Screenshots: `.playwright-mcp/familiar-picker.png`, `.playwright-mcp/familiar-section.png`.
- Live, before Render deploy: `{"status":400,"keys":["_id","familiarSkills"],… "\"familiarSkills\" is not allowed"}`, modalOpen 1, ui []. This is the failure path: the popup stays open and nothing is added.
- Live save after deploy:
  ```
  before [] (main [])
  SAP + "ui5" → SAPUI5, UI5 Tooling ticked; then 5 more → "Đã chọn 7"
  Lưu: {"status":200,"keys":["_id","familiarSkills"],"req":[7 names],"saved":[same 7]}, modalOpen 0, ui 7
  reload: same 7; main still []
  reopen: preChecked 7, "Đã chọn 7"
  × SAPUI5: 200, saved 6, ui 6
  cleanup (untick all, Lưu): 200, saved []; reload: [], empty box 1, main [], professional 43
  ```
  The QA account was restored: no familiar skills, no main skills, 43 professional skills.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 | h2 order, badges after save, × 200, empty box after cleanup |
| 2 | popup title, SAP + ui5 filter, preChecked 7, "Đã chọn 7" with 0 disabled; spec max 0 |
| 3 | live keys `["_id","familiarSkills"]` 200 + reload; 400 path keeps the popup open; page spec (no `mainSkills` key, store call); main specs unchanged and passing |
| 4 | outputs above |
| comments per code-comments.md | updated doc block on PickedSkills; 1-line WHY on `max` 0 and `savePicked` |

## Supersedes
none

## Noticed, not done
- The same skill can be both a main skill and a familiar skill. Nothing was asked about that.
- Neither list is rendered in the CV preview or PDF (not requested).

## Seal gate
none (no commit/push). QA writes only, restored.
