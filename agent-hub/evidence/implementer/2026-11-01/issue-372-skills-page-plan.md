# 2026-11-01 - issue-372-skills-page

- Worker: implementer · Version: 0.1.0
- Node: `issue-372-skills-page` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Branch: `feature/issue-372-skills-page` (off synced `staging` @ 3280d40, via `gh issue develop 372`)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/372
- REOPEN rounds: 1 (fixed, see bottom)
- Task (verbatim): "hiện tại phần skills đang ở page thông tin chung, gồm softSkill và personal-Skill, hãy tách ra page riêng, chia 2 tabs, tab mặc định là kỹ năng chuyên môn, hãy tạo component cho Tab để tái sư dụng"

## Hub bytes before
85209

## Acceptance criteria
1. Professional skills (incl. skill groups) and personal skills are no longer on General information; foreign languages + job preferences stay there.
2. New page `/dashboard/skills`, reachable from the sidebar, with 2 tabs: "Kỹ năng chuyên môn" (default) and "Kỹ năng cá nhân".
3. Tabs is a reusable component (`src/components/global/Tabs.vue`, auto-registered), following DESIGN.md §5.7: underline with a 2px `fg` indicator, and the selected tab kept in the URL query. ARIA tabs semantics (tablist/tab/tabpanel, aria-selected/controls/labelledby, roving tabindex, arrow keys).
4. i18n: new strings in vi + en. Tests, build and lint pass. Typecheck stays at or below the 90-error baseline, with none in changed files.

## Diff
| file | why |
|---|---|
| `src/components/global/Tabs.vue` | New reusable tabs: `v-model` value, `tabs` [{value,label}], panel = slot named by value; ARIA + ArrowLeft/Right wrap; ids from a module counter (Vue 3.4.31 has no `useId`, marked `shortcut:`). |
| `src/components/global/Tabs.spec.ts` | Selected panel + aria wiring; click/arrow-key emits incl. wrap. |
| `src/pages/dashboard/PageSkills.vue` | New page: `useCandidate('generalInformation')`, provides `candidate` `_id` (needed by `VeeFormGeneralInformationUpdate`), skill-group tags patch via `updatePatchDoc` on `general-information`; tab in `route.query.tab` (`personal` else `professional`). Field configs moved verbatim from General information. |
| `src/pages/dashboard/PageGeneralInformation.vue` | Removed the two skill sections, GroupTags, `skillsGroup`/`handleUpdateGroup`, `professionalSkillFields`, unused `toRef`/`updatePatchDoc`. |
| `src/routers/index.ts` | `skills` child route. |
| `src/pages/_layouts/LayoutDefault.vue` | Sidebar item "Kỹ năng" after "Thông tin chung" (`fa-solid fa-code`, already registered). |
| `src/i18n/index.ts` | `nav.skills` vi "Kỹ năng" / en "Skills"; tab labels reuse `generalInfo.professionalSkills`/`personalSkills`. |
| `.eslintrc.cjs` | `Tabs` added to `vue/multi-word-component-names` ignores, same as the other single-word global components (Button, Heading…). |
| `.claude/CLAUDE.md` | `<Tabs>` added to the Global Components list. |

## Command
- `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`
- Live: Playwright on the operator's Vite (logged in, owner account → read-only): `#/dashboard/skills`, `#/dashboard/general-information`

## Output
- test: `Test Files  51 passed (51)` / `Tests  310 passed (310)` (+2 Tabs tests)
- build: `✓ built in 3.70s`
- lint: first run `error  Component name "Tabs" should always be multi-word`; after adding `Tabs` to the ignores → `lint=0`
- typecheck: `90`; grep `Tabs|PageSkills|PageGeneralInformation|LayoutDefault|routers` → no output
- Live:
  ```
  s0 (#/dashboard/skills): tabs "Kỹ năng chuyên môn=true,Kỹ năng cá nhân=false", panel h2 "Kỹ năng chuyên môn", 25 rows
  click 2nd tab: hash "#/dashboard/skills?tab=personal", "…chuyên môn=false,…cá nhân=true", panel "Kỹ năng cá nhân", 5 rows
  ArrowRight on 2nd tab: hash "?tab=professional", professional selected, focus "Kỹ năng chuyên môn"
  sidebar: ["Thông tin chung","Kỹ năng"]
  general-information h2s: ["Mong muốn công việc","Ngoại ngữ","Thêm ngoại ngữ"]
  ```
  Screenshot `.playwright-mcp/skills-page.png`: underline tabs, skill-group tags + table in professional tab.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Removed from General information | Live h2 list (no skill sections) |
| 2. Page + sidebar + default tab | Live s0 + sidebar list |
| 3. Reusable Tabs, DESIGN §5.7, ARIA, URL | `Tabs.spec.ts` (2 passing); live s1/s2 hash + focus; screenshot |
| 4. i18n / checks | `Tests 310 passed` (includes the i18n key-parity/used-keys spec); build ✓; lint 0; typecheck 90, none in changed files |
| comments per code-comments.md | Doc blocks for Tabs/PageSkills explain intent; 1-line WHY on the query-backed tab; `shortcut:` on the id counter |

Not checked live: add/edit/delete a skill or skill group. The logged-in account is the owner's real CV, which is read-only, so I made no writes. Those calls go through `VeeFormGeneralInformationUpdate`, which is unchanged, and its existing spec is among the 310 passing. The group patch now takes `_id` from `candidate.getGeneralInformation._id` instead of the form document (same id).

## Supersedes
none

## Noticed, not done
- Field configs for skills still live in the page (as before), not in a `models/*.model.ts`.

## Seal gate
none (no commit/push)

## REOPEN fix (round 2) — answers `evidence/verifier/2026-11-01/issue-372-skills-page-reopen.md`
No code change; both missing proofs added.

1. Typecheck grep now includes `i18n/index`:
   - `npm run typecheck 2>&1 | grep -c 'error TS'` → `90`
   - `npm run typecheck 2>&1 | grep -E 'Tabs|PageSkills|PageGeneralInformation|LayoutDefault|routers|i18n/index'` → no output, `grep-exit=1`
2. Skill-group save, live with QA account `qa.full@example.com` in a separate Playwright `browser.newContext()` (operator's owner session untouched), on the dev server at `http://localhost:5173/resume-vuejs-website/` against the prod API. Login → sidebar "Kỹ năng" → add tag `QA-372` → reload → remove tag:
   ```
   {"at":".../#/dashboard/skills","before":[]}
   {"method":"PATCH","url":"https://nodejs-resume-api-ts.onrender.com/api/v1/general-information/update","sentId":"6adf411a2987df4de8b08a4c","sentGroup":["QA-372"],"status":200,"savedId":"6adf411a2987df4de8b08a4c","savedGroup":["QA-372"]}
   {"afterReload":["QA-372"],"at":".../#/dashboard/skills"}
   {"cleanup":200,"group":[]}
   ```
   So the `_id` sent (from `candidate.getGeneralInformation._id`) is the document's real id (`savedId` equals `sentId`). The group persists across a reload. Removing a tag also saves (200), and the QA data was left as it was found (empty group list).
   Side observation, not from this diff: `page.goto('#/dashboard/skills')` right after login lands on `#/dashboard/information`, because the post-login redirect wins. Navigating through the sidebar link works.
