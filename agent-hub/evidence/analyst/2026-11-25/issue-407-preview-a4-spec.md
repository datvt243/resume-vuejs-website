# Analyst spec — #407 preview looks like the printed PDF

## Task (verbatim)
GitHub issue #407 (enhancement): "Xem trước / Xuất PDF: chỉnh UI preview giống bản PDF xuất ra". Preview (/dashboard/preview) differs from the PDF from window.print(); only @media print (body.cv-print-mode) hides header/sidebar/.no-print and makes #cv-print-area full width. Expected: preview shown as one A4 sheet (size, margins, font, spacing as printed). AC: A4 sheet 210×297mm, white, light shadow on surface, margins match print; one style for screen + @media print, @page size/margin; page-break hints match PDF; all useCvTheme themes + VI/EN match; mobile scales to fit, no horizontal scroll; public CV page (shared CvResumeLayout) unaffected; DESIGN.md; new text via i18n vi + en.

## Doc
`agent-hub/doctrine/features/cv-preview-export.md` — Behavior 24–31, criteria/edge cases/out of scope tagged (#407), Open questions 16–19, Changelog row. INDEX row updated. Status of 24–31: draft.

## Which PDF
Export PDF = `window.print()` (Behavior #4). Server "Download CV" (`useDownloadCv.ts`, `download-pdf`) is a separate backend renderer (Open question 1, operator: intended) → out of scope. Not ambiguous.

## Sources read
PagePreview.vue, PagePreview.spec.ts, CvResumeLayout.vue, useCvTheme.ts, PagePublicResume.vue, LayoutDefault.vue, Header.vue, Footer.vue, src/styles/tailwind.css (tokens), src/i18n/index.ts (preview keys), DESIGN.md §0.3, §2.2–2.4, §3, §4.

## Code map
- `src/pages/dashboard/PagePreview.vue:72-74` handlePrint → `window.print()`.
- `src/pages/dashboard/PagePreview.vue:87-91` adds/removes `body.cv-print-mode`.
- `src/pages/dashboard/PagePreview.vue:119-121` `#cv-print-area` wrapper around `CvResumeLayout` — where the sheet goes.
- `src/pages/dashboard/PagePreview.vue:124-143` unscoped `@media print` block. Finding: `.dashboard-sidebar` / `.dashboard-layout` match nothing (sidebar is `aside#app-sidebar` in LayoutDefault.vue:105; content column `lg:pl-60` at :149, `main px-4 py-4 lg:px-6 lg:py-6`, `.mx-auto.max-w-6xl` :152). No `@page` anywhere in src.
- `src/components/cv/CvResumeLayout.vue:138` root `.cv-preview.block-container` + theme class; `:267-376` scoped styles (`max-width: 800px`, rem sizes, Modern uses `--bs-success`, borders `--bs-border-color-translucent`). Shared with public page — don't put sheet rules here.
- `src/pages/public/PagePublicResume.vue:119` the other CvResumeLayout consumer.
- `src/styles/tailwind.css:30` `--shadow-float` light; `:42-60` `[data-bs-theme='dark']` tokens (dark is app default) — print today inherits dark text tokens.
- `src/pages/_layouts/Header.vue:79` root is `<header>`; `Footer.vue:13` root `<footer>` (current element selectors do match).
- `src/i18n/index.ts:576-583` (vi) / `:1163-1170` (en) `preview.*` — new `preview.pageN` goes here.

## Questions + answers (operator, 2026-11-25, via coordinator)
- Q16 margin → `@page { size: A4; margin: 15mm }` all sides; sheet padding 15mm. Applied to Behavior 24, 25.
- Q17 page splitting → Option B: keep each entry / section title with first entry together; hints computed by measuring entries. Applied to Behavior 28, criteria, edge case.
- Q18 dark mode → sheet always white / light tokens on screen and print. Behavior 26 unchanged.
- Q19 document.title → out of scope; recorded as follow-up in Out of scope (no GitHub issue created).
All questions answered → spec_ready.

## Isolation proof
Spawned with only the issue text + bundle paths; no implementer reasoning or diff. Code read directly at HEAD cc01f69 on feature/issue-407-xem-truoc-xuat; no app code changed.
