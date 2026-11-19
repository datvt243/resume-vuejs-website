# 2026-11-19 - issue-402-project-view-modal

- Worker: implementer · Version: 0.1.0
- Node: `issue-402-project-view-modal` (`haven/diagrams/dev-loop.prime-mermaid.md`, sealed_pending_verifier)
- Task (verbatim): "#402 Project: bổ sung chế độ View (xem chi tiết read-only)" — Trang Project chưa có chế độ xem chi tiết (read-only). Card ProjectItem chỉ có edit / duplicate / delete. Bổ sung tính năng View giống Experience. AC: card có nút view (`ItemActions viewable`, `action="view"`); bấm view mở modal read-only hiển thị đủ field (tên, thời gian, mô tả HTML đã sanitize, …); modal có nút Edit (`Button action="update"`) chuyển sang form edit; toggle VI | EN cho field localized (cùng hướng #400, dùng chung state lang #399); text/aria-label qua i18n (vi + en), theo DESIGN.md.
- Status: sealed_pending_verifier

## Branch
`feature/project-modal-view` (created by `gh issue develop 402 --checkout --base staging --name feature/project-modal-view`, linked to #402, off freshly pulled `staging`; `git branch --show-current` → `feature/project-modal-view`)

## Hub bytes before: 100642
(measured with the `evidence/README.md` command right after adding this node's diagram row — ~400 bytes above the true pre-row value.)

## Feature doc: `doctrine/features/cv-timeline-sections.md` (Behavior #9, AC/edge cases tagged #402 — analyst pass 0, `evidence/analyst/2026-11-19/project-view-modal-spec.md`, spec_ready, no open questions)

## Diff
| File | Why |
|---|---|
| `src/components/project/ProjectItem.vue` | emit `onView`; `ItemActions` gets `viewable` + `@view="emits('onView', {...model})"` (same as `ExperienceItem.vue:53`). |
| `src/pages/dashboard/PageProject.vue` | View modal copied from `PageExperience.vue` (#400 pattern): `viewDoc`, `viewDate` (`isWorking` → `common.present`), shared `useFormLang().formLang` VI \| EN radiogroup (`aria-label form.contentLang`), `viewDescription = sanitizeHtml(getLocalizedText(description, formLang))`; `dl` rows name / position / technology joined ", " / dates / link / description; "—" for empty position, technology, link; link is `<a target="_blank" rel="noopener">` only when it matches `^https?://` (else shown as plain text); footer `Button action="update"` `common.edit` → `editFromView` (hide view, `showModalEditDoc`). |
| `src/i18n/index.ts` | new `field.link` — vi `Liên kết`, en `Link`. |
| `src/pages/dashboard/PageProject.spec.ts` | list mock now has one project; stubs for Button/ListTransition/ProjectItem/Modal (as in `PageExperience.spec.ts`); 2 new tests (view fields + link attrs + Edit → `document._id === 'p1'`; toggle EN → "Desc" + `formLang==='en'`, EN empty → VI fallback, `<script>`/`onerror` stripped, `javascript:` link not rendered as href). Existing save-payload test unchanged except shared `mountPage()`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row added. |

(`doctrine/features/cv-timeline-sections.md` changes are the analyst's pass-0 edits, not this diff.)

## Command
From `doctrine/MEMORY.md`, repo root:
- `npx vitest run src/pages/dashboard/PageProject.spec.ts`
- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run typecheck`

## Output (final run, after all edits)
```
npx vitest run src/pages/dashboard/PageProject.spec.ts
 Test Files  1 passed (1)
      Tests  3 passed (3)

npm run test   → exit 0
 Test Files  58 passed (58)
      Tests  382 passed (382)

npm run lint   → exit 0   (eslint src --ext .js,.ts,.vue, no output)
npm run build  → exit 0   ✓ built in 4.44s
npm run typecheck → `grep -cE "error TS"` = 78 (baseline 78); `grep -E "PageProject|ProjectItem|i18n/index"` → no lines
```
Honest note: the very first `npm run test` (before the link-guard edit) reported `Tests  1 failed | 381 passed (382)`; I did not capture which test. Three immediate re-runs gave `382 passed (382)`, as did the final run above; the only stderr error seen in the noise is the pre-existing jsdom `Not implemented: navigation` from `src/components/QrCode.spec.ts` (not a failure). Treated as a flaky test, not caused by this diff — flagged under Noticed.

## Live check
Vite started by me on 5173 (`npx vite --port 5173 --strictPort`), own CDP window in the 9888 debug Chrome (`document.visibilityState === 'visible'`), logged in as `qa.full@example.com` (read-only — no save), `#/dashboard/project`:
```
{ "user": "qa.full@example.com", "eyes": 3, "eyeLabel": "Xem chi tiết SimpleMDG",
  "viText": "SimpleMDG\nVI\nEN\nTên dự án\nSimpleMDG\nVị trí\nFrontend Developer\nCông nghệ sử dụng\nSAPUI5, TypeScript, JavaScript, OData, JSONModel, Jest\nNgày bắt đầu - Ngày kết thúc\n12/2024 - Hiện tại\nLiên kết\n—\nMô tả\n\nNền tảng Master Data Governance ...\n\nĐóng\nSửa",
  "enDesc": "Master Data Governance platform that standardizes master data across SAP systems; ...",
  "link": [],                       ← this project has no link → "—"
  "afterEdit": "Sửa: SimpleMDG\nVI\nEN\nTên dự án\nVị trí\nCông nghệ sử dụng\n...",
  "apiReqs": [] }                   ← no /api/ request while viewing/toggling/opening edit
```
Screenshot (EN selected): scratchpad `project-view.png` — blue eye icon on each card, modal with toggle, label/value rows, footer Đóng + orange Sửa. Window closed and the Vite I started was stopped afterwards (port 5173 free).
Not checked live: a project with a real link (qa.full's first project has none) — covered by the spec instead.

## Acceptance
| Criterion | Evidence |
|---|---|
| (#402) spec: P1/Dev/"Vue, TS"/Present date/link href+`_blank`/"Mô tả"; EN → "Desc" + `formLang==='en'`; EN empty → "Mô tả"; `<script>`/`onerror=` stripped; Edit → `document._id` = project `_id` | `PageProject.spec.ts` 2 new tests; `Tests  3 passed (3)` |
| (#402) `grep -n "viewable" src/components/project/ProjectItem.vue` hits, card emits `onView` with a copy | `63: ItemActions(:label="item.title" viewable ... @view="emits('onView', {...model})" ...)` |
| (#402) Manual QA: blue eye on each card, view shows all fields, Edit → pre-filled form, shared toggle, no network request | Live check above (`eyes: 3`, `afterEdit` = "Sửa: SimpleMDG" form, `apiReqs: []`, toggle is the same `useFormLang` ref as forms — spec asserts `formLang.value === 'en'` after clicking in the view) |
| (#402) new keys in vi + en; lint + build pass | `field.link` added to both `vi` and `en`; `lint exit 0`; `✓ built in 4.44s` |
| Edge: technology/link empty → "—"; `isWorking` + `endDate` null → `MM/YYYY - Present` | template `|| '—'` on position/technology/link; spec project has `endDate: null, isWorking: true` → `01/2022 - Hiện tại` asserted; live "12/2024 - Hiện tại", "Liên kết —" |
| Edge: legacy plain-string description | `getLocalizedText` handles strings (same helper as Experience view) — not separately tested |
| Typecheck ≤ baseline, none in changed files | 78 = baseline 78; 0 in changed files |
| comments per code-comments.md | `PageProject.vue`: section header `view details (read-only)` + `// shares the forms' VI \| EN toggle, so the view and the forms stay on one language` (copied from PageExperience, why); spec: `// fresh mount: the stub list isn't reactive`, `// imported data skips the yup url() check — never render a javascript: href` (why) |

## Supersedes: none
`grep -n "#402" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row.

## Still open: none

## Review
`/code-review medium` not invoked as a skill; done inline over the touched files in full + callers (`ItemActions.vue`, `PageExperience.vue` reference):
1. **Security, fixed:** `viewDoc.link` bound straight to `href` — yup `.url()` only guards the form; imported CV data (JSON/LinkedIn import) can carry `javascript:` → now only `^https?://` renders as an anchor, else plain text. Spec asserts no `a[href^="javascript"]`.
2. `technology?.join` assumes an array (legacy string would throw) → same assumption as existing `showModalEditDoc`/card `#sub` slot in this page; not changed (SmallestDiff).
3. Toggle markup now duplicated in 3 places (VeeForm, Experience view, Project view) → Noticed, not done (same as #400 review finding 3).
4. `viewDoc` holds the card's shallow copy, not a reactive list item — view doesn't live-update after an edit save; matches Experience behavior, modal is closed by Edit anyway.

## Noticed, not done
- Shared content-language toggle component (VeeForm + 2 view modals) per DESIGN.md §5.7 — suggest one node (also covers #444 Education view).
- One unexplained, non-reproducing failure in the first full `npm run test` run (see Output) — possible flaky spec; worth watching.
- `PageApplication.vue` renders `jobLink` as `href` without an http(s) guard (same class as Review #1) — not in scope.
- Feature doc Behavior #8 (#400) still reads "not yet implemented/sealed" though SEALED (analyst note).

## Seal gate: none (no commit/push/merge/real write; live check was a read-only QA login + view)
