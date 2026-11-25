# 2026-11-25 - issue-407-preview-a4-sheet

- Worker: implementer · Version 0.1.0
- Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-407-preview-a4-sheet` (IN_PROGRESS)
- Branch: `feature/issue-407-xem-truoc-xuat` (off `staging` @ `cc01f69`, synced with `git pull origin staging` → "Already up to date.", created + linked to #407 via `gh issue develop 407 --checkout --base staging`)
- Task: #407 "Xem trước / Xuất PDF: chỉnh UI preview giống bản PDF xuất ra" (`/todo "fix #407"`, label `enhancement` → feat)
- Status: **sealed_pending_verifier**
- Analyst pass 0: `evidence/analyst/2026-11-25/issue-407-preview-a4-spec.md` — spec_ready after operator answered Q16–Q19 (2026-11-25).

## Hub bytes before
102994

## Feature doc
`agent-hub/doctrine/features/cv-preview-export.md` — Behavior 24–31, "(#407)" acceptance / edge cases / out of scope. Open questions 16–19 all answered.

## Feature doc changed
None by the implementer (analyst wrote Behavior 24–31 this run).

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PagePreview.vue` | `#cv-print-area` is now `.cv-sheet` (210mm wide, min 297mm, 15mm padding, `--color-surface` bg, `--shadow-float`, `data-bs-theme="light"` so every token inside — incl. the `--bs-*` bridge, which is declared on `[data-bs-theme]` — resolves to light) inside `.cv-sheet-viewport` (scale-to-fit wrapper). `@page { size: A4; margin: 15mm; }` injected as a `<style>` in `<head>` on mount, removed on unmount. Keep-together (`.cv-sheet .cv-item { break-inside: avoid }`, `.cv-sheet .cv-section-title { break-after: avoid }`, `orphans/widows: 1` on the sheet) — scoped to `.cv-sheet`, so screen + print share it and the public page never gets it. Page-break hints: `measure()` collects keep-together blocks (title + first entry, or title + first line of a non-entry) via `getBoundingClientRect` ÷ applied scale, runs `pageBreaks()`, renders `.cv-page-break.no-print[aria-hidden]` dashed lines with `preview.pageN`. Re-measure: mount, `document.fonts.ready`, ResizeObserver on viewport + CV content, watch on cvData/theme/lang. Mobile: `scale = min(1, viewport width / sheet width)` → `transform: scale()` + wrapper height = sheet height × scale. Print: app header (`header:not(.cv-header)`), footer, `#app-sidebar`, `.no-print` hidden; `#app-sidebar ~ div` and `main` lose padding/min-height; sheet drops width/min-height/padding/shadow/transform. Removed dead `.dashboard-sidebar` / `.dashboard-layout` selectors. |
| `src/utilities/pageBreaks.ts` (new) | pure `pageBreaks(blocks, contentHeight, pageHeight)` + `PX_PER_MM`: walks keep-together blocks, moves a crossing block to the next page and carries the pushed-down space (`shift`) into later pages; a block that already starts a page and is taller than a page splits at page-height steps (Behavior 28). |
| `src/utilities/pageBreaks.spec.ts` (new) | 6 tests: ≤1 page → none, exact 1 page → none, plain flow, crossing block moves, shift carried to later block, tall block split, block exactly at page bottom. |
| `src/pages/dashboard/PagePreview.spec.ts` | new `A4 sheet` describe: CV inside light sheet, no hint for 1 page, hint labels `Trang 2`/`Trang 3` + `no-print` + `aria-hidden` (pageBreaks mocked via `vi.hoisted`), `@page` style added on mount / removed on unmount, `preview.pageN` in vi + en. |
| `src/i18n/index.ts` | `preview.pageN`: vi `Trang {n}`, en `Page {n}`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row appended (IN_PROGRESS). |

Not mine: `.claude/skills/todo/SKILL.md` was modified before this run (gitStatus at session start) — not touched. `agent-hub/doctrine/features/{INDEX,cv-preview-export}.md` edited by the analyst pass.

Bug fixed on the way (in scope of Behavior 27): the old print rule `body.cv-print-mode header` also matched the CV's own `<header class="cv-header">` (name/position/contact/intro), so the printed PDF had no CV header. Now `header:not(.cv-header)`; live PDF shows the header on page 1.

## Command
From repo root, copied from `doctrine/MEMORY.md`: `npm run test` · `npm run lint` · `npm run build` · `npm run typecheck`; per file `npx vitest run <path>`.

## Output
Final run (after review fixes):
```
npm run test
      Tests  513 passed (513)
npm run lint → exit 0 (eslint src --ext .js,.ts,.vue, no output)
npm run typecheck | grep -c 'error TS' → 75   (baseline 75)
npm run typecheck | grep -E "PagePreview|pageBreaks"
src/pages/dashboard/PagePreview.spec.ts(59,23): error TS2683: 'this' implicitly has type 'any' because it does not have a type annotation.
npm run build → ✓ built in 4.11s
npx vitest run src/pages/dashboard/PagePreview.spec.ts src/utilities/pageBreaks.spec.ts → Tests 14 passed (14)  (before the @page test was added; full suite above includes it)
```
The one typecheck line in a changed file is pre-existing: `git show staging:src/pages/dashboard/PagePreview.spec.ts | grep -n "mockImplementation(function"` → line 51 on staging (the anchor-click spy), shifted to 59 by my import/mock insert. Total 75 = baseline → nothing new. An intermediate run had 76 (my new test used `[...NodeList]`, TS2488) → switched to `Array.from`, back to 75.
First `@page` test version failed (`expected true to be false`): earlier tests in the file never unmount, so their `<style>` stays → test now compares counts before/after. Re-run green.

## Live check (dev server, QA account)
Nothing on :5173 → started `npm run dev -- --port 5173 --strictPort`; no debug Chrome → launched `--remote-debugging-port=9888` with `~/.chrome-debug-profile` (`document.visibilityState === 'visible'`). Logged in as `qa.full@example.com` (login POST only, no writes). App in **dark** mode (`html[data-bs-theme=dark]`). Vite stopped afterwards (`lsof :5173` → 0). Artifacts in the session scratchpad (`cv-*.pdf`, `r2-*.pdf`, `grid.png`, `grid2.png`, `desktop.png`, `mobile.png`, `hint.png`).
- Desktop 1440, dark app: sheet `793.70px` wide (210mm), bg `rgb(255, 255, 255)`, CV text `rgb(24, 24, 27)` (= light `--color-fg` #18181b), `box-shadow` = light `--shadow-float` value, content box `680.32px` (= 180mm). qa.full is 2596px tall → 2 hints ("Trang 2", "Trang 3"), sheet height 2732.9px.
- Print = preview, every theme × language: `page.pdf({ preferCSSPageSize: true })` (Chrome `Page.printToPDF`, no header/footer, scale default) for Classic/Modern/Compact × Tiếng Việt/English, then each PDF's page 2 and 3 tops screenshotted in Chrome's PDF viewer. Round 2 (after review fixes) results — preview hint → printed page start:
  - VI (all 3 themes): hint 1 → "Kinh nghiệm" = PDF p2 starts "KINH NGHIỆM"; hint 2 → "FASTCODING · VIETRY · ZAGO" = PDF p3 starts "FASTCODING · VIETRY · ZAGO".
  - EN (all 3 themes): hint 1 → "Experience" = PDF p2 "EXPERIENCE"; hint 2 → "Career break — Professional development" = PDF p3 starts with it.
  - Every page 2/3 starts with a section title or an entry head (no entry split); the section title on p2 sits with its first entry (Laidon Group). Page count 3 (PDF viewer "1 / 3" on round 1 Classic-VI; 2 hints in every combo). Modern accent prints in light `--color-success` green.
- Print media (`emulateMedia print`): app `<header>`s `display:none`, `.cv-header` `block`, `footer` none, `#app-sidebar` none, all `.no-print` none, sheet padding `0px`, shadow `none`, transform `none`. In the real PDF the CV starts at the page's left margin (emulation at 1440 width shows `left:144` from `.mx-auto.max-w-6xl` centering; at the real 180mm print width that max-width is inactive — PDF screenshots confirm).
- `@page` injection: present in `document.styleSheets` on the preview, gone after navigating to `#/dashboard`.
- Mobile 375px: `scrollWidth 375`, sheet 16 → 358.87 (inside viewport 16 → 359), `transform matrix(0.43199…)`, content width still 680px (same wrapping), wrapper height = scaled sheet height (1180.6), 2 hints.
- Public `#/resume/qa.full@example.com` (same SPA session, after visiting preview): no `.cv-sheet`, 0 hints, `.cv-preview` width 800 / max-width 800px, text `rgb(250, 250, 250)` (follows dark app, no forced light), `body.cv-print-mode` absent, `scrollWidth` 1440 @1440 and 375 @375. `CvResumeLayout.vue` / `PagePublicResume.vue` not in `git diff --stat`.

## Acceptance
| Criterion | Evidence |
|---|---|
| (#407) Live 1440 dark: ratio 210:297 (height grows by whole pages), bg white, light `--color-fg`, `shadow-float`, content 180mm | Live check bullet 1 (width 793.70 = 210mm; min-height 297mm, multi-page content → 2732.9) |
| (#407) `grep -n "@page" PagePreview.vue` shows `size: A4` + 15mm; `grep -rn "dashboard-sidebar\|dashboard-layout" src` empty | grep → line 131 `'@page { size: A4; margin: 15mm; }'`; second grep → no output |
| (#407) Live print: header, footer, sidebar, controls, hints `display:none`; CV at left margin | Live check "Print media" bullet + PDF screenshots |
| (#407) Live 3 themes × 2 langs: hints + 1 = printed pages; first block after each hint = first block of that page; no entry split; no page ends with a section title | Live check "Print = preview" bullet, 6 combos, round 2 |
| (#407) Live 375: `scrollWidth <= 375`, whole sheet visible, same wrapping | Mobile bullet |
| (#407) Public page unchanged at 1440 + 375 | Public bullet (DOM assertions; no before/after pixel diff — the shared files are untouched and no global rule matches outside `.cv-sheet`/`body.cv-print-mode`; the only global, `@page`, is now removed on unmount) |
| (#407) `PagePreview.spec.ts`: CV in sheet; hint labels use `preview.pageN`, none for 1 page; key in vi + en | `A4 sheet` describe, 5 tests green |
| Theme/lang/profile/data change → hints recompute; resize → scale recompute | watch + ResizeObserver; live: switching all 6 combos re-measured (round 2 hint texts per combo) |
| i18n vi + en, DESIGN.md tokens | `preview.pageN` both; colors only via tokens (`--color-surface`, `--color-fg`, `--color-line-strong`, `--shadow-float`, `bg-surface`, `text-fg-3`) |
| lint, build, test pass; typecheck no new errors | Output section |
| comments per `doctrine/standards/code-comments.md` | why-only comments (PAGE_HEIGHT derivation, block/flow JSDoc, scale undo, `@page` injected because Vue keeps component styles, orphans/widows granularity, print layout reset, sheet = paper); no `(#N)` refs in source; existing Vietnamese comment kept verbatim |

## Review
`/code-review medium` (forked skill), 8 findings:
1. `@page` in unscoped `<style>` persists after leaving the page → **fixed**: injected `<style>` on mount, removed on unmount; spec + live check.
2. Flow content modeled as breaking at any px, Chrome breaks at line boxes with orphans/widows 2 → **fixed (mitigated)**: `orphans: 1; widows: 1` on the sheet, so the hint is off by < 1 line in flow content; residual drift noted below.
3. Title + "first line" vs Chrome orphans 2 → **fixed** by the same `orphans: 1`.
4. `offsetTop` depends on no positioned ancestor → **fixed**: `getBoundingClientRect` relative to content, ÷ applied scale (`offsetHeight / rect.height`).
5. ResizeObserver on the min-height sheet misses reflows (font load) → **fixed**: observe the CV content element + `document.fonts.ready.then(measure)`.
6. Deep watch traverses all CV data → **fixed**: `deep` dropped (`cvData` computed returns a new object on change).
7. Template uses imported `t()` not `$t()` → **not changed**: every existing template string in this file uses `t()`; matching the file (Preferred: read like surrounding code). Noted below.
8. Altitude: JS re-implements fragmentation; suggests Paged.js / multicol → **not done**: new dependency + rewrite; the spec (Q17 B, operator) asked for measured hints. Drift risk recorded below.
Security: no `v-html`/input added; `pageStyle` text is a constant.

## Dead ends
- `@page` in the component's unscoped `<style>` (first version): ruled out by review finding 1 — Vue never removes injected component styles, so the rule outlived the page. Replaced by the mount/unmount-injected `<style>`.
- Typing the spec spy as `function (this: HTMLAnchorElement)` alone (REOPEN round 1): `npm run lint` → `PagePreview.spec.ts 58:85 error 'this' is defined but never used ... no-unused-vars` (base ESLint rule misreads the TS `this` parameter). Kept the typing + one `eslint-disable-next-line no-unused-vars` with the reason.
- "Before" screenshots from a `staging` worktree with no env: public page showed "Không tìm thấy hồ sơ" (API base unset; copying `.env*` is blocked by a deny rule). Ran the worktree Vite with `VITE_API_URL=https://nodejs-resume-api-ts.onrender.com/` on the command line instead (variable name from `src/config/api.config.js:1`).
- First "after" 1440 capture reported `scrollHeight 900` (taken while the route was still rendering); re-captured after a 2s settle → 2674, same as before.

## Supersedes
none (`grep "#407\|issue-407" haven/diagrams/dev-loop.prime-mermaid.md` → only this node)

## Still open
none

## Noticed, not done
- Hints approximate Chrome's fragmentation: a flow paragraph crossing a page edge shifts later content by < 1 line, not modeled; a later CSS change in `CvResumeLayout.vue` (new keep-together rule, new section type) can make hints drift silently. Only the live 6-combo PDF compare catches it.
- Entry taller than one page: implemented as the spec says (moves to a new page, then splits every 267mm); Chrome's real behavior for an oversized `break-inside: avoid` block not checked live (qa.full has none).
- `qa.empty` (empty CV) not checked live; the unit test covers "no hint for 0/1-page content".
- Printing with "Background graphics" on would paint the app's dark `bg-bg` around the white sheet content area; default print has backgrounds off. Not handled.
- `PagePreview.vue` template uses imported `t()` throughout instead of `$t()` (CLAUDE.md i18n rule) — pre-existing pattern.
- CV name `h2.cv-name` renders at body size on screen and in print (Tailwind preflight resets h2) — pre-existing, same in both.
- Follow-up from Q19 (document.title = CV file name while printing) — listed in the feature doc's Out of scope; GitHub issue not created.

## Seal gate
Outward-facing actions this run: login POSTs to the prod API with `qa.full@example.com` only (no writes). No commit / push / merge — that is `/ship`, not run.

## REOPEN round 1 fixes
Verifier note: `evidence/verifier/2026-11-25/issue-407-preview-a4-sheet-reopen.md` — (1) typecheck error in a touched file (`PagePreview.spec.ts(59,23) TS2683`), (2) no before/after screenshot compare of the public page, (minor) no `## Dead ends`.

1. `src/pages/dashboard/PagePreview.spec.ts`: anchor-click spy typed `function (this: HTMLAnchorElement)` and reads `this.href`/`this.download` directly (drops the `as unknown as` cast), plus `// eslint-disable-next-line no-unused-vars -- the base rule reads a TS \`this\` type annotation as an unused parameter`.
   ```
   npm run typecheck | grep -c 'error TS' → 74   (baseline 75 → one fewer)
   npm run typecheck | grep -E "PagePreview|pageBreaks|i18n/index" → (no lines)
   npm run lint → exit 0
   npm run test → Tests  513 passed (513)
   npm run build → ✓ built in 4.61s
   ```
2. Public page pixel compare, `#/resume/qa.full@example.com`, logged in as `qa.full@example.com`, dark app, full-page screenshots:
   - Before: `git worktree add --detach <scratchpad>/wt-staging staging` (`cc01f69`), `node_modules` symlinked, `VITE_API_URL=https://nodejs-resume-api-ts.onrender.com/ npx vite --port 5173 --strictPort` → `public-before-1440.png`, `public-before-375.png`.
   - After: this branch, `npm run dev -- --port 5173 --strictPort`, visited `#/dashboard/preview` first (worst case: preview CSS loaded in the SPA) then the public page → `public-after-1440.png`, `public-after-375.png`.
   - Diff: both PNG pairs drawn to canvas in Chrome, RGB compared per pixel:
     `{"1440":{"size":[1440,2675],"diffPixels":0,"total":3852000},"375":{"size":[375,4045],"diffPixels":0,"total":1516875}}`
   - Worktree removed (`git worktree list` → only the main checkout), Vite stopped (`lsof :5173` → 0).
3. `## Dead ends` added above.

Acceptance rows updated by this round:
| Criterion | Evidence |
|---|---|
| (#407) Public page looks the same before and after (screenshot compare at 1440px and 375px) | 0 differing pixels at 1440×2675 and 375×4045 (item 2) |
| lint, build, test pass; typecheck no errors in changed files | item 1: 74 total, none in `PagePreview.spec.ts` / `PagePreview.vue` / `pageBreaks.*` / `i18n/index.ts` |

## Doctrine proposal: Typecheck row baseline: 75 → 74
`doctrine/MEMORY.md` Typecheck `baseline: 75 errors` → `74` — this round removed the pre-existing `PagePreview.spec.ts` TS2683 (item 1 output: 74). Not edited by the implementer; for the verifier to confirm/apply on SEAL.
