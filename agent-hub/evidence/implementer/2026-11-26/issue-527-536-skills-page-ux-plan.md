# 2026-11-26 - issue-527-536-skills-page-ux

- Worker: implementer · Version: 0.1.0
- Node: `issue-527-536-skills-page-ux` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS, new row appended)
- Branch: `fix/issue-527-536-skills-page-ux` (off `staging` @ `82fedcf`, synced with `git pull origin staging` → "Already up to date.", created via `gh issue develop 527 --checkout --base staging`; one branch for both issues, the operator ran `/todo "fix #527 #536"`)
- Task: "fix #527 + #536 (one branch fix/issue-527-536-skills-page-ux). #527 Skills: first 'Thêm' opens an empty main-skills picker with no way forward — when there are no professional skills, the picker's empty state says so ('Chưa có kỹ năng chuyên môn') and offers a button that closes the modal and focuses the skill-group input (or disable both Thêm buttons with reason tooltip). Acceptance: a new user can tell from the UI that professional skills come first and can get there in one click. #536 Skills page: (a) five buttons all labelled just 'Thêm' — make each visible label name what it adds, e.g. 'Thêm kỹ năng chính'; (b) 'Kỹ năng chuyên môn' appears twice (tab + h2 directly below) — drop the duplicate; (c) 'Nhập tên nhóm' input has only placeholder, visible 'Nhóm kỹ năng' text not linked — associate with for/id (WCAG 1.3.1); (d) empty states on Skills and Languages are bare 'Chưa có dữ liệu' — use title + sentence + CTA like other list pages (DESIGN.md §5.8)."

## Hub bytes before: 103026

## Feature doc: doctrine/features/cv-skills.md
The Behavior section stays true: the picker, tabs, groups and saves are unchanged. This diff adds labels and empty states, and nothing contradicts Behavior #1–6. The doc was not edited.

## Prior fixes
- `6db6d94` fix(skills): keep main/familiar skills in sync and ask to save General information first. Touches `PageSkills.vue`/`VeeFormGeneralInformationUpdate.vue`; separate logic, not affected.
- `669e6ed` feat(layout): stack form section header (#538). Last change to `FormSection.vue`; this diff keeps that layout.
- `d7f9721`, `b33c787`: Languages view/edit toggle; the view-mode empty state from there is kept and given a title.
(`git log --oneline -n 6 -- <the 6 touched src files>`)

## Diff
| File | Why |
|---|---|
| `src/components/PickedSkills.vue` | New `addText` prop is the visible label of the open-picker button (#536a). New `need-skills` emit. With no professional skills, the picker body is a `NoData` titled `professionalSkillsEmpty` with the `pickNeedsSkills` sentence and an "Thêm kỹ năng chuyên môn" button that hides the modal and emits `need-skills`. Save is hidden then (#527). The chip-list empty state now has a title and sentence, plus the same CTA when there are no professional skills (#536d, #527) |
| `src/pages/dashboard/PageSkills.vue` | Passes `add-text` (`mainSkillsPick` / `familiarSkillsPick`, existing keys "Chọn kỹ năng chính/quen thuộc"). `goToSkillGroups()` switches to `?tab=professional`, waits for the render, then focuses `#skill-group-input`. It's wired to `@need-skills` and to the professional empty-state CTA. The per-group button's visible text changes from `common.add` to `generalInfo.addSkill`; its aria-label is unchanged. Both tabs pass `in-tab` plus `add-text`. The personal tab gets an `#empty` NoData |
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` | `inTab` prop: FormSection gets no title, since the tab already says it (#536b). The modal title still uses `heading`. `addText` prop for the add button (falls back to `common.add`). An optional `#empty` slot with `{ add }` renders instead of the list or table when the field is empty |
| `src/components/global/FormSection.vue` | `title` becomes optional (`default: ''`). The `h2` is rendered only when there is a title, and the description's `mt-1` only follows a title. Every other caller still passes a title |
| `src/components/GroupTags.vue` | Required `inputId` prop. The "Nhóm kỹ năng" `<p>` becomes `<label :for>` and the input gets `:id` (#536c). The only caller is `PageSkills.vue` (`grep -rn "GroupTags" src` → `PageSkills.vue:8` import, `:257` usage) |
| `src/pages/dashboard/PageLanguages.vue` | The view-mode empty state gets the `languagesEmpty` title and an "Thêm ngoại ngữ" CTA. The edit-mode form gets `add-text` plus an `#empty` NoData (#536d) |
| `src/i18n/index.ts` | 12 new `generalInfo.*` keys in both `vi` and `en`. EN `addSkillToGroup` changes "Add a skill to {name}" → "Add skill to {name}" so that the visible text "Add skill" sits inside the accessible name (WCAG 2.5.3, from the review) |
| `src/components/PickedSkills.spec.ts` | Uses the `addText` label. The NoData stub renders its slot. New #527 test |
| `src/pages/dashboard/PageSkills.spec.ts` | `replace` is hoisted so the test can assert on it. The stub gets the `addText` prop. New #527 test for the labels and for `need-skills` → tab plus focus |
| `src/pages/dashboard/PageLanguages.spec.ts` | Button text `Thêm` → `Thêm ngoại ngữ` |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | New node row |

Not mine: `.claude/skills/todo/SKILL.md` was already modified in the working tree before this branch existed (the operator's edit, carried over).

## Command (doctrine/MEMORY.md, repo root)
`npm run test` · `npm run lint` · `npm run typecheck` · `npm run build`

## Output (final run, after the review's EN-label fix)
```
 Test Files  70 passed (70)
      Tests  527 passed (527)
lint=0
tc=2
74            ← grep -c "error TS" on the typecheck output
0             ← grep -cE "PickedSkills|PageSkills|PageLanguages|GroupTags|FormSection|VeeFormGeneralInformationUpdate|i18n/index" on it
✓ built in 3.76s
build=0
```
Typecheck: 74 errors, at or under the baseline of 75 (doctrine/MEMORY.md), none in a changed file.
Targeted run before that: `npx vitest run src/components/PickedSkills.spec.ts src/pages/dashboard/PageSkills.spec.ts src/pages/dashboard/PageLanguages.spec.ts src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts`. The first run failed on my own FormSection typo (`:class="{ 'mt-1': title } text-fg-2"` → "Error parsing JavaScript expression"). I fixed it and the suite was green after that (see Dead ends).

## Live check (npm run dev, debug browser :9888, Playwright; the tab was `visibilityState: hidden`, so clicks were `element.click()` via evaluate)
Read only, no writes to any account.
- `qa.full@example.com`, `#/dashboard/skills`:
  - buttons: `"Chọn kỹ năng chính"`, `"Chọn kỹ năng quen thuộc"`, `"Thêm kỹ năng chuyên môn"`, and per group `"Thêm kỹ năng [Thêm kỹ năng vào nhóm Languages]"` …
  - `main h2`: `["Kỹ năng chính","Chọn kỹ năng chính","Kỹ năng quen thuộc","Chọn kỹ năng quen thuộc","Thêm kỹ năng chuyên môn"]`. No "Kỹ năng chuyên môn" h2. The others are the main/familiar section headings plus the hidden modals' titles.
  - `label[for=skill-group-input]` → `"Nhóm kỹ năng -> true"` (the input with that id exists).
  - personal tab: button `"Thêm kỹ năng cá nhân"`, no "Kỹ năng cá nhân" h2.
- `qa.empty@example.com`:
  - `#/dashboard/skills?tab=personal` empties: `"Chưa chọn kỹ năng nào | Kỹ năng ở đây được chọn từ kỹ năng chuyên môn. Hãy thêm kỹ năng chuyên môn trước. | Thêm kỹ năng chuyên môn"` (×2) and `"Chưa có kỹ năng cá nhân | Kỹ năng mềm bạn muốn nhà tuyển dụng thấy. | Thêm kỹ năng cá nhân"`.
  - Clicked "Chọn kỹ năng chính". The modal reads `"Chọn kỹ năng chính | Chưa có kỹ năng chuyên môn | Kỹ năng ở đây được chọn từ kỹ năng chuyên môn. Hãy thêm kỹ năng chuyên môn trước. | Thêm kỹ năng chuyên môn | Đóng"` (no Save).
  - Clicked its "Thêm kỹ năng chuyên môn". Result: `{"url":"#/dashboard/skills?tab=professional","focused":"skill-group-input","modalOpen":false}`, so one click lands on the group input from the Personal tab.
  - professional empty state: `"Chưa có kỹ năng chuyên môn | Tạo một nhóm kỹ năng, rồi thêm kỹ năng vào nhóm. | Thêm nhóm kỹ năng"`.
  - `#/dashboard/languages`: `"Chưa có ngoại ngữ | Ngôn ngữ và trình độ của bạn. | Thêm ngoại ngữ"`.
- Vite was started by me for this check (pid 54681) and killed afterwards. The debug browser tab is left logged in as `qa.empty` (it was `qa.full` before).

## Acceptance
| Criterion | Evidence |
|---|---|
| #527: no professional skills → the picker's empty state says so and has a button that closes the modal and focuses the group input | Live: modal text `"… Chưa có kỹ năng chuyên môn | Kỹ năng ở đây được chọn từ kỹ năng chuyên môn …"`, then after the click `focused:"skill-group-input", modalOpen:false`. Spec: `PickedSkills.spec.ts` "#527: with no professional skills…" (hide called, `need-skills` emitted once) and `PageSkills.spec.ts` "#527 … need-skills opens the Professional tab with the group input focused" (`replace` called with `{ query: { tab: 'professional' } }`, `document.activeElement` is the input). Both are within `Tests 527 passed (527)` |
| #527: the UI tells a new user that professional skills come first | Live empty-state text on the page itself, before the picker opens: `"Kỹ năng ở đây được chọn từ kỹ năng chuyên môn. Hãy thêm kỹ năng chuyên môn trước."` plus the CTA |
| #536a: every "Thêm" button names what it adds | Live `qa.full` button list above: "Chọn kỹ năng chính", "Chọn kỹ năng quen thuộc", "Thêm kỹ năng chuyên môn", "Thêm kỹ năng" (per group, aria-label names the group), "Thêm kỹ năng cá nhân". The icon-only GroupTags add keeps `aria-label="Thêm thẻ"`; it was never a "Thêm"-text button |
| #536b: no duplicate "Kỹ năng chuyên môn" heading under the tab | Live `main h2` list has no "Kỹ năng chuyên môn" / "Kỹ năng cá nhân" |
| #536c: the "Nhóm kỹ năng" text is the input's label | Live `label[for=skill-group-input]` → "Nhóm kỹ năng", and the input with that id exists |
| #536d: Skills and Languages empty states have title + sentence + CTA (DESIGN.md §5.8) | Live `qa.empty` empties listed above (main, familiar, professional, personal, languages) |
| matches `features/cv-skills.md` Behavior #1–6 | Existing `PageSkills.spec.ts`, `PickedSkills.spec.ts`, `VeeFormGeneralInformationUpdate.spec.ts` still pass (inside 527/527); no save/patch logic touched |
| i18n: every new key in `vi` and `en` | `grep -n addLanguage src/i18n/index.ts` → `383` (vi), `984` (en); the 12 keys were added as one block next to `foreignLanguagesDescription` in both locales |
| comments per code-comments.md | Each new comment is one line on a why (`// ties the title to the input as its label`, `// the surrounding tab already shows heading…`, `// no professional skills to pick from…`, `// '' when a tab or heading right above already names the section`, `// main/familiar skills are picked from professional skills…`) |

## Supersedes: none
`grep -n "527\|536" haven/diagrams/*.md` returned nothing before this row was added.

## Review
I did the `/code-review medium` pass inline: the touched files in full, plus the callers of `FormSection` (title still passed everywhere), `GroupTags` (only `PageSkills`) and `VeeFormGeneralInformationUpdate` (`PageSkills`, `PageLanguages`, and others without `inTab`/`addText`/`#empty`, which get the old behavior).
- Fixed: the EN per-group button showed "Add skill" while its aria-label was "Add a skill to {name}". The visible text wasn't inside the accessible name (WCAG 2.5.3). The key is now "Add skill to {name}"; VI "Thêm kỹ năng vào nhóm {name}" already contained "Thêm kỹ năng".
- False positive: `router.replace` to the same query when the user is already on Professional. It resolves with a duplicated-navigation failure value and doesn't reject, so the focus still runs.
- Accepted: an empty Personal/Languages list shows the header add button and the empty-state CTA, both labelled the same. This is the same pattern as the other list pages' `NoData` CTA (`PageReference.vue:115`).

## Noticed, not done
- `doctrine/domains/PROJECT.md:90` Trap "`GroupTags.vue:20` `tags.value.push(...)` mutates the `modelValue` prop" is stale. `GroupTags.vue` now copies (`[...tags.value, …]`) and emits. The row has no sha anchor, so it needs correcting per `doctrine/INDEX.md`. Left for the verifier/operator.
- Languages: the view-mode CTA "Thêm ngoại ngữ" opens edit mode, where the user clicks "Thêm ngoại ngữ" again to get the form (two clicks). The edit-mode toggle predates this diff.
- `cv-skills.md` Behavior #2 says "Add opens a picker". The button now reads "Chọn kỹ năng chính/quen thuộc"; the behavior is the same. A wording update to the doc could go with the next analyst pass.

## Dead ends
- First targeted vitest run: `SyntaxError: Error parsing JavaScript expression: Unexpected token, expected "," (1:19)` at `FormSection.vue:24`, caused by my own bad edit (`:class="{ 'mt-1': title } text-fg-2"`). I moved `text-fg-2` into the static `class` and it was green after that.
- First live login attempts timed out (`locator.fill` / `locator.click`, 30s) because the debug tab was `visibilityState: hidden` and an account was already logged in. I switched to DOM `element.click()` via `evaluate`.

## Seal gate: none
No commit, push or real API write. Live checks only read the two QA accounts.
