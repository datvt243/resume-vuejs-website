# 2026-11-01 - issue-374-main-skills

- Worker: implementer · Version: 0.1.0
- Node: `issue-374-main-skills` (new; earlier #374 nodes SEALED)
- Branch: `feature/issue-374-skill-badges` (same unshipped #374 branch, skills page)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/374 (follow-up)
- Task (verbatim, 2 operator messages):
  1. "ở backend vừa bổ sung MainSkill, lưu tối đa 55 skill, hãy bổ sung vào phần skill, đặt ngoài và phía trên Tab"
  2. "kỹ năng chính sẽ chọn từ personal-skills, press button thêm sẽ mở popup để chọn, có tính năng filter theo nhóm và search theo tên"

## Hub bytes before
85561

## Interpretation (stated to operator)
- Max is **5**, not 55. Backend repo `../resume-nodejs-api` commit `ef79e0a feat(general-information): add mainSkills (max 5)`: `mainSkills: Joi.array().items({ name: Joi.string() }).max(5)`, model `[personalSkills]` sub-schema (`{ name }`).
- Source list is the **professional** skills, because "filter theo nhóm" only makes sense for them: personal skills have no group.

## Acceptance criteria
1. "Kỹ năng chính" section sits outside and above the Tabs, and shows the saved main skills as badges, each with a × to remove it.
2. "Thêm" opens the popup "Chọn kỹ năng chính". It lists the professional skills (name · group), has a name search and a group filter (all groups by default), and starts from the saved selection.
3. At most 5 can be ticked: the remaining checkboxes are disabled at 5/5, and a live "Đã chọn n/5" counter is shown.
4. Saving sends a PATCH with `{ _id, mainSkills: [{ name }] }` and updates the store in place (`setGeneralInformation`). The popup closes only on success.
5. i18n keys exist in vi + en, there's a new spec, and tests/build/lint pass. Typecheck stays at or below 90, with none in changed files.

## Diff
| file | why |
|---|---|
| `src/components/MainSkills.vue` (new) | Section + picker modal. `selected` is a list of names, copied from `modelValue` on open. `options` = skills filtered by group + case-insensitive name search. Checkboxes are disabled when `selected.length >= max` and the box is unchecked. `save` prop returns success, so the modal hides only on true. × saves `modelValue` without that name. |
| `src/components/MainSkills.spec.ts` (new) | Filter by group + search. Starts from the saved selection, max disables the rest, saves names in order, hides. A failed save keeps it open. |
| `src/pages/dashboard/PageSkills.vue` | `<MainSkills>` above `<Tabs>` (`skills`, `groupNames`, `MAIN_SKILLS_MAX = 5`). `saveMainSkills` uses `updatePatchDoc` + in-place `setGeneralInformation`, and returns whether it saved. |
| `src/i18n/index.ts` | `generalInfo.mainSkills`, `mainSkillsDescription` ({max}), `mainSkillsPick`, `mainSkillsCount` ({count}/{max}), `searchSkill`, `allGroups` (vi+en). |

An earlier draft in this node used `VeeFormGeneralInformationUpdate` with a free-text form and a `max` prop. The operator's second message replaced it, and I removed it. `VeeFormGeneralInformationUpdate.vue` is unchanged by this node.

## Command
- `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`
- Live: Playwright on the operator's Vite (prod API). The owner account was read-only: I opened the picker, filtered, searched, ticked, then closed it.

## Output
- `npx vitest run src/components/MainSkills.spec.ts` → `Tests  3 passed (3)`
- test `Test Files  52 passed (52)` / `Tests  314 passed (314)` · build `✓ built in 3.80s` · `lint=0` · typecheck `90`, `grep -E 'PageSkills|MainSkills|VeeFormGeneralInformationUpdate|i18n/index'` → no output (`grep-exit=1`)
- Owner (read-only):
  ```
  {"title":"Chọn kỹ năng chính","all":41,"count0":"Đã chọn 0/5",
   "sap":["SAPUI5 · SAP","SAP Fiori · SAP","XML Views & Fragments · SAP","OData (ODataModel) · SAP","JSONModel · SAP","UI5 Tooling · SAP"],
   "sapFio":["SAP Fiori · SAP"],"count5":"Đã chọn 5/5","sixthDisabled":true,"closed":true,
   "writes":["POST .../api/v1/auth/refresh"]}
  ```
  The only non-GET request was the token refresh, so no data was written. The section heading comes before the tablist in the DOM (`aboveTabs: true`). Screenshot: `.playwright-mcp/main-skills-picker.png`.
- Save against the API (QA `qa.full@example.com`, separate context), using the earlier draft's save path, which sends the same PATCH shape:
  ```
  {"status":400,"keys":["_id","mainSkills"],"mainSkills":[{"name":"QA-main1"}]}
  toast: "Dữ liệu không hợp lệ - \"mainSkills\" is not allowed"; professional skills still 43
  ```
  **The production API does not accept `mainSkills` yet.** The backend change is on the backend's staging, not its `main` (backend `origin/main` head is `f6b756e … release/v2.2.4`). The request matches the backend Joi shape (`{ name }` items). Nothing was saved, so the QA account needed no cleanup.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 | aboveTabs true; screenshot; × path in the component |
| 2 | owner title, 41 options, SAP filter, "fio" search |
| 3 | count5 "Đã chọn 5/5", sixthDisabled true; spec |
| 4 | spec (save called with [{name}]; hide only on success; no hide on failure); request shape from the QA 400 above. **Not proven live: a 200 save.** This is blocked until the backend release. |
| 5 | outputs above |
| comments per code-comments.md | doc block on MainSkills; 1-line WHY on MAIN_SKILLS_MAX and the save-result prop |

## Supersedes
none

## Noticed, not done
- Shipping this frontend before the backend `mainSkills` release means every "Lưu" in the picker gets a 400 toast. The backend should be released first.
- Main skills are stored by name only. Renaming or deleting a professional skill doesn't update `mainSkills`, so an old name stays as a badge until it's removed with ×.
- Not rendered in the CV preview/PDF (not requested; the backend exports don't render it either).

## Seal gate
none (no commit/push). No data writes succeeded; QA got only rejected requests.

## REOPEN fix (round 2) — answers `evidence/verifier/2026-11-01/issue-374-main-skills-reopen.md`
1. **Live save on the current code path** (`PageSkills.saveMainSkills`). The QA account `qa.full@example.com` ran in a separate context. I ticked the first 2 options in the picker and pressed Lưu:
   ```
   {"before":[]}
   {"picked":["JavaScript (ES6+)","TypeScript"],
    "save":{"status":400,"keys":["_id","mainSkills"],"req":[{"name":"JavaScript (ES6+)"},{"name":"TypeScript"}],
            "err":"...\"mainSkills\" is not allowed..."},
    "modalOpen":1,"ui":[]}
   ```
   - The request body is exactly `{ _id, mainSkills: [{ name }] }`.
   - On rejection the popup stays open and no badge is added, so `saveMainSkills` returned false.
   - Nothing was saved, so nothing needed cleanup.
   - Backend state: `git fetch` in the backend repo shows `origin/main` = `f6b756e … release/v2.2.4`. `ef79e0a` (mainSkills) is only on `origin/staging`, `origin/release/v2.3.0` and feature branches. The operator says the release is in progress.
2. **New `src/pages/dashboard/PageSkills.spec.ts`** (2 tests):
   - With `updatePatchDoc` mocked to succeed, `save` resolves true, the payload has `mainSkills: [{ name: 'Vue' }]`, and `candidate.setGeneralInformation` gets called with `{ mainSkills: [{ name: 'Vue' }] }`. Props `skills` and `max: 5` are also checked.
   - When the success callback never runs (an API error), `save` resolves false.
3. **`MainSkills.spec.ts` +1 test:** clicking × on a badge saves the list without that name (`[{Vue},{Node}]` → `[{Node}]`).
- Checks: test `Test Files  53 passed (53)` / `Tests  317 passed (317)`; build `✓ built in 4.04s`; `lint=0`; typecheck `90`; `grep -E 'PageSkills|MainSkills|i18n/index'` → no output (`grep-exit=1`).
- Still not proven live: a 200 save. It's blocked until backend `release/v2.3.0` reaches `main` and Render deploys it.
