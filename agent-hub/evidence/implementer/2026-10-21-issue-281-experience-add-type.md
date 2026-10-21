# 2026-10-21 - issue-281-experience-add-type
- Worker: implementer · Version: 0.1.0
- Node: `issue-281-experience-add-type` in `haven/diagrams/dev-loop.prime-mermaid.md`
- Task (verbatim): "update phần experience, khi Add experience sẽ yêu hỏi là thêm mới experience hay career break. design lại UI phù hợp với experience hay career break" — issue #281

## Hub bytes before: 195030

## Branch
`feature/issue-281-experience-add-type` (off `staging`, linked to #281 via `gh issue develop`)

## Diff
| file | why |
|---|---|
| `src/pages/dashboard/PageExperience.vue` | `isCareerBreak` ref (`null` = chooser step). Add opens modal on a 2-card chooser (briefcase / calendar icon, title + description); picking one sets the type, resets the doc to defaults and reveals the form (VeeForm stays mounted via `v-show` so `refVeeForm.reset()` works). `formFields` is now a computed over the model: `isCareerBreak` field hidden (`showIf: () => false`) with default = the choice; `isCurrent` label → `field.isOnBreak` for a break. Modal title moved to a `modalTitle` computed (chooser / add experience / add career break / edit / duplicate). Edit + duplicate set the type from the doc and skip the chooser. |
| `src/i18n/index.ts` | new keys in both `vi` and `en`: `crud.experience.{addBreak,chooseType,typeExperience,typeExperienceDescription,typeBreak,typeBreakDescription}`, `field.isOnBreak` |
| `src/pages/dashboard/PageExperience.spec.ts` | new — chooser shown first; picking Career break gives break title, `document.isCareerBreak=true`, hidden checkbox, break label; editing an existing break skips the chooser |

## Command
`npm run test` · `npm run build` · `npx eslint <changed files>` · Typecheck: CANNOT RUN (per doctrine/MEMORY.md)

## Output
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 42 passed (43)
      Tests  1 failed | 272 passed (273)
✓ built in 3.60s
LINT_OK
```
New spec alone: `✓ src/pages/dashboard/PageExperience.spec.ts (2 tests)`.
The 1 failing test is pre-existing: on base (`git stash`, clean staging) the same run reported `Tests  1 failed | 270 passed (271)` with the same VeeForm test failing. Diff does not touch VeeForm.

## Acceptance
| Criterion | Evidence |
|---|---|
| Add asks "experience or career break?" first | spec: `h2` = `Bạn muốn thêm gì?`, 2 `[data-type]` cards |
| Form fits the chosen type | spec: title `Thêm khoảng nghỉ việc`, `isCareerBreak` default true + hidden, `isCurrent` label `field.isOnBreak`; experience path keeps company/position via existing `showIf` |
| Edit/duplicate unaffected by chooser | spec test 2 |
| i18n keys in vi + en | `src/i18n/index.ts` diff (7 keys each side) |
| Build green | `✓ built in 3.60s` |
| Comments per code-comments.md | 2 one-line why-comments, English, match surrounding density |

## Manual UI check (REOPEN round 1 — DESIGN.md §10)
Addresses `evidence/verifier/2026-10-21-issue-281-experience-add-type-reopen.md`.
Real browser (Playwright MCP) against the running `npm run dev` (port 5173, cwd = this repo, serving this branch's working tree). Login blocker handled by **mocking**, not a test account: seeded `localStorage.user` + `sessionStorage.refreshToken='fake'` and `page.route()` answered every API request (onrender.com / localhost:3001) with `{ success: true, data: [2 fixture entries: 1 job, 1 career break] }`. No real API call, no real data touched. Theme via `data-bs-theme` on `<html>` (same attribute `useTheme.ts` sets). UI language EN.

| §10 item | Result |
|---|---|
| Token grep `grep -nE "#[0-9a-fA-F]{3,6}|\[[0-9.]+(rem|px)\]|opacity-[0-9]+" src/pages/dashboard/PageExperience.vue` | no output, `grep exit=1` |
| §3–§5, one primary action per view | chooser = 2 equal option cards (no primary button); form keeps the single Save primary. Segmented VI/EN unchanged. |
| States | empty list → existing NoData Add button opens the same chooser (same `showModalCreateDoc`); chooser has no loading/error state (no request); long text: card descriptions wrap (375px screenshot) |
| Keyboard pass (1440 light, modal open) | `Tab→Close outline=solid`, `Tab→typeExperience outline=solid`, `Tab→typeBreak outline=solid`, `Tab→Close outline=solid` (focus trapped in modal, logical order, visible ring). `Enter` on typeBreak → `chooser cards visible=0, labels=Career break type / Start date / End date / I am currently on this break / Description` |
| Screenshots 1440 light / 1440 dark / 375 dark | `/private/tmp/claude-501/-Users--david-Workspace-Project-resume-resume-vuejs-website/bf9d29fb-ec12-4799-96c8-7839b9ec0e45/scratchpad/281/281-chooser-<w>-<theme>.png`, `281-break-*.png`, `281-exp-*.png` (9 files). Reviewed: no overflow/overlap/clipping; cards side by side at 1440, stacked at 375. `overflowX=false` at all 3 sizes (`scrollWidth > innerWidth` check). A round floating icon bottom-right is a browser extension overlay, not app UI. |
| lint/test/build | see Output above (lint clean on changed files; full `npm run lint` has pre-existing errors per doctrine/MEMORY.md) |
| Web Interface Guidelines pass | cards are real `<button type="button">`, focus-visible outline token, icons `aria-hidden`, text labels on every control |

## Noticed, not done
- `VeeForm.spec.ts` "flags the hidden language that has a validation error" fails on staging already.
- Editing can no longer convert an existing entry between experience and career break (checkbox hidden). Intentional for this design; delete + re-add if needed.

## Seal gate
none (no commit/push)

## Follow-up (operator request after SEAL, same branch) — not re-verified by a verifier pass
Task (verbatim): "update lại Icon của career break, sắn tiện update thêm color cho 3 button edit, del ... muốn xem infor của exp phải press vào edit, hãy bổ sung tính năng view detail"

| file | why |
|---|---|
| `src/plugins/initFontAwesomeIcon.js` | register `faMugHot` |
| `src/pages/dashboard/PageExperience.vue` | career break icon = mug-hot (chooser card + list row); read-only detail modal (`dl`: type or company/position, date range, full description) with Edit shortcut |
| `src/components/global/ItemActions.vue` | edit `!text-info`, duplicate `!text-success`, delete `!text-danger` (+ subtle hover bg); opt-in `viewable` prop → eye button emitting `view`. Shared by all CRUD pages, so the colors apply app-wide; only Experience opts into `viewable` |
| `src/components/experience/ExperienceItem.vue` | passes `viewable`, emits `onView` |
| `src/i18n/index.ts` | `common.view` vi + en |
| `src/pages/dashboard/PageExperience.spec.ts` | + detail view test (shows break type + dates, Edit opens the form) |

Output: `Tests  1 failed | 272 passed (273)` (same pre-existing VeeForm failure) → after the new test, spec file `3 passed`; `✓ built in 3.61s`; eslint on changed files clean; token grep on changed files: no output.
Browser (isolated Playwright context, API mocked — the shared browser tab had a real logged-in session, left untouched): `overflowX=false` at 1440 light/dark and 375 dark; computed colors in dark: view rgb(161,161,170), edit rgb(96,165,250), duplicate rgb(74,222,128), delete rgb(248,113,113); Tab in view modal: Đóng → Đóng → Sửa; Sửa → "Sửa: Nghỉ việc tạm thời — Du lịch". Screenshots: `/private/tmp/claude-501/-Users--david-Workspace-Project-resume-resume-vuejs-website/bf9d29fb-ec12-4799-96c8-7839b9ec0e45/scratchpad/281/281b-{list,view}-<w>-<theme>.png`.

## Follow-up 2 — job title above company (operator: "ok, do it")
`ExperienceItem.vue`: `title = position || experienceTitle()`, `subTitle = position ? company : ''`. `PageExperience.vue` view modal: title = position (fallback experienceTitle), Position row before Company. Lint clean; `Tests  1 failed | 273 passed (274)` (same pre-existing VeeForm failure); `✓ built in 3.66s`. Browser (isolated context, mocked API): rows `Frontend Dev | Acme | 01/2020 - 01/2022 | …` and `Nghỉ việc tạm thời — Du lịch | 01/2022 - 07/2022 | …`; view `Frontend Dev :: Vị trí, Tên công ty, …`.
