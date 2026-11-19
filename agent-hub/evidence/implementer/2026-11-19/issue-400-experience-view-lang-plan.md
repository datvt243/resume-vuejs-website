# 2026-11-19 - issue-400-experience-view-lang

- Worker: implementer · Version: 0.1.0
- Node: `issue-400-experience-view-lang` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS)
- Task (verbatim): "#400 Experience: modal view chỉ xem được 1 ngôn ngữ — bổ sung nút chuyển VI | EN" — Modal xem chi tiết Experience (nút 👁 trên card) chỉ hiển thị VI. AC: toggle VI | EN trong modal view cùng kiểu toggle trong VeeForm; field localized hiển thị theo lang chọn, fallback như getLocalizedText; dùng chung state lang với #399 nếu #399 đã xong; text/aria-label qua i18n (vi+en), theo DESIGN.md.
- Status: sealed_pending_verifier

## Branch
`feature/experience-modal-view` (created by `gh issue develop 400 --base staging`, linked to #400; `git branch --show-current` → `feature/experience-modal-view`)

## Hub bytes before: 100249

## Feature doc: `doctrine/features/cv-timeline-sections.md` (Behavior #8, AC tagged #400, Q7 answered by operator 2026-11-19: break label/title stay UI language)

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PageExperience.vue` | import `useFormLang`; `viewDescription` passes `formLang.value` to `getLocalizedText`; VI \| EN radiogroup at top of the View modal, markup/classes copied from `VeeForm.vue` toggle, `aria-label="$t('form.contentLang')"`, writes the shared `formLang`. Break type label / title untouched (Q7). |
| `src/pages/dashboard/PageExperience.spec.ts` | new test `switches the view description VI \| EN on the shared form language` (VI shown → click EN → "Desc" + `formLang === 'en'` → EN empty falls back to VI); shared-state reset in `finally`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row added (IN_PROGRESS). |

(`doctrine/features/*` changes are the analyst's pass-0 edits, not this diff.)

## Command
From `doctrine/MEMORY.md`, repo root:
- `npx vitest run src/pages/dashboard/PageExperience.spec.ts`
- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run typecheck`

## Output (final run, after all edits)
```
npx vitest run src/pages/dashboard/PageExperience.spec.ts
 Test Files  1 passed (1)
      Tests  5 passed (5)

npm run test   → exit 0
 Test Files  58 passed (58)
      Tests  380 passed (380)

npm run lint   → exit 0   (eslint src --ext .js,.ts,.vue, no output)
npm run build  → exit 0   ✓ built in 4.06s
npm run typecheck → exit 2; `grep -c "error TS"` = 78 (baseline 78); `grep "error TS" | grep -c PageExperience` = 0
```
First spec attempt failed honestly: `expected 'Desc' to be 'Mô tả'` at the fallback step — the test mutated the raw stub object (not reactive). Fixed in the test (fresh mount for the fallback case), not in the component.

Dev server: `curl http://localhost:5173/resume-vuejs-website/src/pages/dashboard/PageExperience.vue` → `200`, transformed source contains `useFormLang`, `form.contentLang`, `VIEW_LANGS`.

Live check (Chrome on CDP 9888 via Playwright MCP, `npm run dev`, logged in as `qa.minimal@example.com`, read-only — no save), `#/dashboard/experience`, first entry's "Xem chi tiết":
```
{ "aria": "Ngôn ngữ nội dung", "before": "vi=true,en=false",
  "descVi": "Sản phẩm: SimpleMDG — nền tảng Master Data Governa",
  "afterEn": "vi=false,en=true",
  "descEn": "Product: SimpleMDG — Master Data Governance platfo",
  "formToggle": "vi=false,en=true",      ← after clicking Sửa in the view
  "formAfterVi": "vi=true,en=false" }
then Hủy → reopen View:
{ "viewToggle": "vi=true,en=false", "desc": "Sản phẩm: SimpleMDG — nền tảng Master Data Governa", "swal": false }
```
Vite started for this check was stopped afterwards.

## Acceptance
| Criterion | Evidence |
|---|---|
| (#400) spec covers VI shown / click EN → "Desc" + `formLang==='en'` / EN empty → "Mô tả" | `PageExperience.spec.ts` new test; `Tests  5 passed (5)` |
| (#400) Manual: View EN → Edit → form on EN; form VI → View on VI | Live check above: `formToggle: vi=false,en=true`, then `viewToggle: vi=true,en=false` |
| (#400) `grep -n "contentLang" src/pages/dashboard/PageExperience.vue` hits | `257: <div ... role="radiogroup" :aria-label="$t('form.contentLang')">` |
| lint + build pass | `lint exit 0`, `✓ built in 4.06s` |
| Existing doc AC `npx vitest run src/pages/dashboard/PageExperience.spec.ts` passes | `Tests  5 passed (5)` |
| Same look as VeeForm toggle | classes/role/`aria-checked`/`data-lang` copied verbatim from `VeeForm.vue` toggle (minus the error `!`, there is no form in the view) |
| Break label/title stay UI language (Q7) | those template lines untouched in the diff |
| i18n vi+en | only text added is `form.contentLang` (existing key, vi+en per analyst note); no new keys |
| Typecheck ≤ baseline, none in changed files | 78 = baseline 78; 0 in PageExperience |
| comments per code-comments.md | 2 added: `// shares the forms' VI \| EN toggle, so the view and the forms stay on one language` (why, no issue ref — the `(#399)` ref was removed per "Delete" rule); spec `// EN empty → falls back to VI (fresh mount: the stub list isn't reactive)` (why) |

## Supersedes: none
`grep -n "#400" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row.

## Still open: none

## Review
`/code-review medium` on the uncommitted diff, 7 findings:
1. Test leaks shared state if an expect fails → **fixed** (reset moved to `finally`), spec re-run green.
2. EN selected + EN empty silently shows VI → **false positive**: Behavior #8 / issue AC explicitly require fallback like `getLocalizedText`.
3. Toggle markup duplicated from VeeForm → Noticed, not done (spec asks for the same toggle; extracting a shared component is a refactor beyond SmallestDiff — natural point is #402/#444).
4. Not using `<SegmentedControl>`; selected style differs from DESIGN.md §5.7 → Noticed, not done: Behavior #8 requires "same look and behavior as the VeeForm toggle"; VeeForm's toggle already uses this style, so changing it is one cross-cutting decision for both.
5. Toggle placed above the whole `dl` though only description changes → Noticed, not done (placement not specified; mirrors VeeForm placement at top).
6. `l.toUpperCase()` labels not via i18n → Noticed, not done (copies VeeForm; language codes, same in both UI languages).
7. role=radio without arrow-key roving → Noticed, not done (copies VeeForm; a11y fix belongs to the shared toggle).

## Noticed, not done
- Findings 3–7 above: suggest one node to extract a shared content-language toggle (`<SegmentedControl>` per DESIGN.md §5.7, keyboard pattern) used by VeeForm + view modals.
- GitHub issue #399 still OPEN although its node is SEALED (`issue-399-form-lang-sync`).

## Seal gate: none (no commit/push/merge/real write; live check was read-only login + view)
