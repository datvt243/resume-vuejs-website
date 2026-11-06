# 2026-11-05 - issue-399-form-lang-sync
Worker: implementer · Version: 0.1.0 · Node: `issue-399-form-lang-sync` (haven/diagrams/dev-loop.prime-mermaid.md)
Task (verbatim): "#399 Form VI | EN (ngôn ngữ nội dung): đồng bộ lựa chọn giữa các form và làm nổi bật lang đang chọn — Hiện trạng: ở trang Language đổi toggle sang EN để edit, khi qua Education edit thì toggle lại về VI. Nguyên nhân: src/components/veevalidate/VeeForm.vue:123 formLang = ref('vi') là state local của từng form, mỗi lần mount lại reset về vi. Yêu cầu: (1) Đổi VI/EN ở 1 form thì áp dụng chung cho mọi form khác (1 state chung, không reset khi chuyển trang). (2) Làm nổi bật hơn lang đang chọn (hiện chỉ bg-surface text-fg shadow-sm) theo token DESIGN.md, giữ aria-checked và dấu ! báo lỗi. (3) Không đụng VI | EN của header (i18n.global.locale). Branch: feature/issue-399-form-lang-sync" — issue #399 https://github.com/datvt243/resume-vuejs-website/issues/399

## Branch
`feature/issue-399-form-lang-sync` (off `staging` @ 8c637e4, created via `gh issue develop 399 --base staging`)

## Hub bytes before
84571

## Interpretation
- "1 state chung, không reset khi chuyển trang" = module-scope ref, same mechanism as `useCvLang`/`useTheme`. Not persisted to localStorage (issue asks for route-change survival only; a reload resets to VI). #400/#402 can import the same composable for their view modals.
- "Nổi bật hơn": selected item `bg-accent-subtle font-semibold text-accent shadow-sm` (was `bg-surface text-fg shadow-sm`). Chose accent-subtle over solid `bg-accent` so the red `!` error marker (`text-danger`) keeps contrast against a light tint instead of sitting on solid green.

## Diff
| file | why |
|---|---|
| src/composables/useFormLang.ts (new) | module-scope `formLang` ref shared by every VeeForm |
| src/components/veevalidate/VeeForm.vue | `const formLang = ref('vi')` → `const { formLang } = useFormLang()`; selected-class swap. `aria-checked`, `data-lang`, `!` marker, focus-visible classes untouched |
| src/components/veevalidate/VeeForm.spec.ts | `beforeEach` resets the shared ref to `vi` (state now outlives a mount); new test: EN chosen in form 1 → unmount → form 2 mounts with EN `aria-checked="true"` |

Header UI-language switch (`i18n.global.locale`, `setUiLang`) and `useCvLang` not touched — `git diff --stat` lists only the 3 files above.

## Command
`npx vitest run src/components/veevalidate/VeeForm.spec.ts` · `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- VeeForm spec: `✓ src/components/veevalidate/VeeForm.spec.ts (20 tests)` / `Tests  20 passed (20)`
- test: `Test Files  55 passed (55)` / `Tests  353 passed (353)` (was 352 on #394 → +1 new test)
- build: `✓ built in 4.42s`
- lint: `lint exit 0`
- typecheck: `grep -c "error TS"` = 90 (baseline 90); `grep -E "useFormLang|VeeForm"` on the typecheck output → no lines (none in changed files)

## Live check (npm run dev, localhost:5173, Playwright, qa.full@example.com — read-only, modal closed without saving)
1. `/dashboard/information`: clicked `[data-lang="en"]` → `aria-checked` `"true"`.
2. Navigated to `/dashboard/education`, opened Edit on the first row → toggle read:
   `vi:false bg=rgba(0, 0, 0, 0) color=rgb(161, 161, 170) w=400` / `en:true bg=rgba(0, 208, 149, 0.12) color=rgb(0, 208, 149) w=600` (dark) — new form opened on EN, i.e. state survived the route change + remount.
3. Same toggle with `data-bs-theme="light"`: `vi:false bg=rgba(0, 0, 0, 0) color=rgb(82, 82, 91)` / `en:true bg=rgb(236, 253, 245) color=rgb(4, 120, 87)`; group bg `rgb(244, 244, 245)`. #047857 on #ecfdf5 ≈ 5.2:1 (AA).
4. Screenshot `.playwright-mcp/issue-399-edu-dark.png` (1422px dark, gitignored): Education edit modal, EN chip green-tinted + bold, VI muted, English fields shown.
Not done: 375px screenshot (toggle is a 2-item inline-flex, width unchanged by this diff); real-key Tab pass (focus-visible classes unchanged).

## Acceptance
| Criterion | Evidence |
|---|---|
| (1) VI/EN choice shared across forms, not reset on route change | new spec test passes (20/20); live step 2: Education edit opened on EN after EN was picked on Information |
| (2) selected lang more prominent, DESIGN.md tokens, keeps aria-checked + `!` | class uses `accent-subtle`/`accent` tokens; live computed styles step 2–3; `flags the hidden language that has a validation error` + aria-checked assertions still pass |
| (3) header UI-language switch untouched | diff touches only the 3 files listed; no i18n/setUiLang change |
| DESIGN.md §10 token grep | `git diff -U0 -- src \| grep '^+' \| grep -nE "#[0-9a-fA-F]{3,6}\|\[[0-9.]+(rem\|px)\]\|opacity-[0-9]+\|--bs-"` → `exit=1` (no match) |
| lint/test/build/typecheck | see Output |
| comments per code-comments.md | useFormLang header (what it is vs the 2 other "lang" states) + 1 why-line on module scope; no issue-only refs inline |

## Supersedes
none (no other non-SEALED row cites #399)

## Still open
none

## Noticed, not done
- Choice is not persisted across a full reload (not requested). Easy follow-up: copy `useCvLang`'s localStorage watch.
- #400 / #402 (view modals) should import `useFormLang` to share this state — their own issues.

## Seal gate
none (no commit/push)
