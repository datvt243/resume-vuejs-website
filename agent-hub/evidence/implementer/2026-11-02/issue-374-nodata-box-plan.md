# 2026-11-02 - issue-374-nodata-box

- Worker: implementer · Version: 0.1.0
- Node: `issue-374-nodata-box` (new; earlier #374 nodes SEALED)
- Branch: `feature/issue-374-skill-badges`
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/374 (follow-up)
- Task (verbatim): "UI \"chưa có dữ liệu\" hãy design lại thành 1 box có border, để tránh nhìn thấy trống"

## Hub bytes before
84597

## Scope decision
`NoData` itself is left unchanged. Every list page (Education, Experience, Project, Award, Certificate, Reference, Application, Profile) already wraps it in `<div class="rounded-md border border-line bg-surface">`. LoadingGate and Visits use the same wrapper for errors. Bordering the component globally would double the border on those pages and in table empty rows (`TableDefault`, Visits). The bare default "Chưa có dữ liệu" (no title) sits outside a table only on the skills page: the `MainSkills` section and the professional-skills list. Those two now get the same wrapper. The picker's no-match state inside the modal stays bare.

## Acceptance criteria
1. The empty "Kỹ năng chính" and the empty professional-skills list render "Chưa có dữ liệu" inside a 1px bordered, rounded, surface-filled box. It is the same classes as the other list pages.
2. Nothing else changes. Tests, build and lint pass. Typecheck stays at or below 90, with none in changed files.

## Diff
| file | why |
|---|---|
| `src/components/MainSkills.vue` | `<NoData v-else />` → wrapped in `div.rounded-md.border.border-line.bg-surface` |
| `src/pages/dashboard/PageSkills.vue` | same for the professional list's `<NoData v-else />` |

## Command
`npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`. Live: Playwright, QA account (read only, nothing saved). The operator's own tab was in use on another page, so I didn't navigate it.

## Output
-       Tests  317 passed (317) | ✓ built in 3.68s | lint=0 | typecheck 90, `grep -E 'PageSkills|MainSkills'` exit 1 (no output)
- Live (QA, empty main skills): computed style of the wrapper `{"border":"1px solid","radius":"8px","bg":"rgb(255, 255, 255)"}`. Screenshot `.playwright-mcp/nodata-box.png` shows the bordered box with a folder icon and "Chưa có dữ liệu" next to the section heading.
- Not checked live: the empty professional list. Both accounts have 41–43 professional skills, and I didn't write to them to empty it. It's the same markup as the main-skills one.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 | Computed style and screenshot (main skills). The professional list uses the same classes (diff). |
| 2 | Outputs above |
| comments per code-comments.md | none added (markup only) |

## Supersedes
none

## Noticed, not done
- Remaining bare usages are `PageImportLinkedin` (titled "Không tìm thấy", within a group), `NotFound` and `PagePublicResume` (full page), and `PageHome`'s error. None of them shows the default "Chưa có dữ liệu". They weren't asked for.

## Seal gate
none (no commit/push)

## REOPEN fix (round 2) — answers `evidence/verifier/2026-11-02/issue-374-nodata-box-reopen.md`
No code change. I added spec coverage for both lists, empty and filled, without any account writes:
- `PageSkills.spec.ts` +2. The stubs render the professional tab and feed its `list` slot.
  - Empty items: "Chưa có dữ liệu" has a parent with `border border-line`.
  - One skill `{Vue, FE}`: there's no empty state, and the group heading `h3` = "FE".
- `MainSkills.spec.ts` +1.
  - Empty `modelValue`: the NoData parent is a `DIV` with `border border-line`.
  - `[{Vue}]`: the badge shows "Vue", and `.border-line .no-data` count = 0.
- `npx vitest run src/components/MainSkills.spec.ts src/pages/dashboard/PageSkills.spec.ts` → `✓ MainSkills.spec.ts (5 tests)`, `✓ PageSkills.spec.ts (4 tests)`, `Tests  9 passed (9)`
- Full:       Tests  320 passed (320) | ✓ built in 3.64s | lint=0 | typecheck 90, grep exit 1 (no output)
- Live with skills present (both lists filled, so no stray box): the round-1 owner screenshot `.playwright-mcp/main-skills-picker.png` was taken before this node and shows the badge list. Spec case "shows the grouped skills and no empty box" covers it on the current code.
