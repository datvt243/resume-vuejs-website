# 2026-10-21 - issue-260-texteditor-list-style

- Worker: implementer
- Version: 0.1.0
- Node: `issue-260-texteditor-list-style` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at the end of the table, `IN_PROGRESS`)
- Task (verbatim operator prompt): "kiểm tra lại TextEditor, tôi thấy phần hiện list ko rõ ràng lắm" — check the TextEditor again, the list display isn't clear. Issue #260 "[BUG] TextEditor (CKEditor): danh sách (bullet/numbered) hiển thị không rõ ràng". https://github.com/datvt243/resume-vuejs-website/issues/260

## Hub bytes before: 200908
From the previous `worker-runs.log` line's `hub_bytes_after`.

## Branch
`fix/issue-260-texteditor-list-style`, created from freshly pulled `staging` (`ffcc305`) via `gh issue develop 260 --checkout --base staging --name fix/issue-260-texteditor-list-style` (linked to #260). Not `main`, not `staging`.

## Root cause
Measured in the running dev server (Kinh nghiệm → edit an item, first `.ck-content`, dark mode), before the fix:
```
{ "tag": "UL", "listStyle": "disc", "pl": "0px", "ml": "0px", "mb": "12.6px", "liDisplay": "list-item", "liMb": "0px" }
```
Tailwind's preflight sets `ul, ol { padding: 0; list-style: none }`. CKEditor's `ckeditor5.css` gives `.ck-content` lists back `disc` but no padding, so the outside markers sit left of the editable's content box and are clipped (the editable has `overflow-y: auto`, which also clips x). Result: no visible bullets, items with 0 gap — the list reads as run-on paragraphs (screenshot `260-before-dark.png`). Numbered lists use the same rules (`ol` has no padding either).

## Diff
| File | Why |
|---|---|
| `src/components/ckeditor/custom.scss` | Appended `.ck-content` list rules: `ul, ol { padding-left: 1.5rem; margin: 0 0 0.75rem }`, `ul { list-style: disc }`, `ol { list-style: decimal }`, nested `li ul { list-style: circle }`, nested lists `margin: 0.25rem 0 0`, `li + li { margin-top: 0.25rem }`, `li::marker { color: var(--color-fg-3) }` (DESIGN.md token, both themes). Scoped to `.ck-content` so the rest of the app keeps preflight. One-line why-comment above the block. |

`git diff --stat`: `src/components/ckeditor/custom.scss | 27 ++++++++++++++++++++++++++-` (the `-1` is the file's missing trailing newline after the last `}`).

## Command
From repo root:
- `npm run test`, `npm run build`, `npm run lint`
- `npx vitest run src/components/veevalidate/VeeForm.spec.ts` ×3 (to classify the failing test)
- Typecheck: CANNOT RUN — pending add-typecheck-script
- Manual check in a real browser (Playwright MCP) against the running `npm run dev` on :5173: Kinh nghiệm → edit an item (logged-in session), computed styles + screenshots in dark and light. No content was edited or saved.

## Output
After the fix (same element):
```
{ "listStyle": "disc", "pl": "24px", "li2mt": "4px", "marker": "rgb(139, 139, 148)", "docScroll": 1425 }
```
Light mode (`data-bs-theme="light"` set on `<html>` for the check, then put back to `dark`): marker `rgb(113, 113, 122)`, text `rgb(24, 24, 27)`.
Screenshots (gitignored `.playwright-mcp/`, show personal CV text — not committed): `260-before-dark.png` (no bullets, items run together), `260-after-dark.png`, `260-after-light.png` (bullets visible, small gap between items, text wraps under the item, not under the bullet).

`npm run test`:
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn
 Test Files  1 failed | 39 passed (40)
      Tests  1 failed | 254 passed (255)
```
`npx vitest run src/components/veevalidate/VeeForm.spec.ts` ×3: each run `Tests  1 failed | 18 passed (19)`, failing `VI | EN toggle > flags the hidden language that has a validation error` (the known `staging` failure). So VeeForm.spec.ts has one failing test per run, but which one depends on the run (full suite vs file alone). This diff is SCSS only and touches no JS/TS — it cannot change a VeeForm spec outcome.

`npm run build`: `✓ built in 5.13s`

`npm run lint`: `eslint src --ext .js,.ts,.vue` printed no errors.

## Acceptance
| Criterion | Evidence |
|---|---|
| Bullet markers visible in the editor | `listStyle: disc`, `pl: 24px` (was `0px`); `260-after-dark.png`, `260-after-light.png`. |
| Items readable as separate list items | `li + li` `marginTop: 4px` (was `0px`); screenshots. |
| Works in light and dark | marker colour from `--color-fg-3`: dark `rgb(139,139,148)`, light `rgb(113,113,122)`. |
| Numbered lists get the same fix | Same rule covers `ol` (`list-style: decimal`, same padding). Not observed live — no numbered list in the existing data, and I did not add one to avoid editing real content. |
| No layout overflow | `docScroll 1425` at 1440 viewport. |
| Build green, no new test failures | `✓ built in 5.13s`; 254 passed, 1 VeeForm failure that also fails without this diff. |
| Comments per code-comments.md | One why-comment on the new block. No `(#N)` refs. |

## Noticed, not done
- `VeeForm.spec.ts` is flaky beyond the known line-287 failure: in the full suite this run, the `BUG (real, verified): clicking submit after touching+clearing…` test failed instead. Run alone, line 287 fails 3/3. Worth its own issue.
- `custom.scss` still themes CKEditor's chrome from the legacy `--bs-*` bridge and hard-coded hsl values (toolbar hover/active colours, `--ck-color-link-default`, focus border) instead of DESIGN.md tokens. Out of scope.
- How saved descriptions with lists render elsewhere (ExperienceItem card, CvResumeLayout) was not checked here; CvResumeLayout has its own styles.

## Seal gate
None — no commit, push or API write.
