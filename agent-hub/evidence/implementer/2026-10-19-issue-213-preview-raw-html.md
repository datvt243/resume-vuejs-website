# 2026-10-19 - issue-213-preview-raw-html

- Worker: implementer
- Version: 0.1.0
- Node: `issue-213-preview-raw-html` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at end of table, `IN_PROGRESS`)
- Task (verbatim): #213 [BUG] Xem trước CV hiển thị thẻ HTML thô ở phần giới thiệu — https://github.com/datvt243/resume-vuejs-website/issues/213 (body: `CvResumeLayout.vue:129` renders `data.introduction` via `{{ text(...) }}` while it is CKEditor HTML; check `edu.description` :161, `pj.description` :190 and `ce.description` :214 too; fix with `v-html="sanitizeHtml(text(...))"`, keeping sanitize)

## Hub bytes before: 179436

## Branch
`fix/issue-213-preview-raw-html`, created from freshly pulled `staging` via `gh issue develop 213 --checkout --base staging` (linked to #213). Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/components/cv/CvResumeLayout.vue` | 4 fields switch from `<p>{{ text(x) }}</p>` to `<div v-html="sanitizeHtml(text(x))">`: `data.introduction`, `edu.description`, `pj.description`, `ce.description`. All 4 are CKEditor fields. `information.model.ts:67`, `education.model.ts:32`, `project.model.ts:64` and `certificate.model.ts:41` all use `defaultDescription`, which sets `type: 'ckediter'` (`types/model.type.ts:73`). This is the same pattern the file already uses for `careerGoal`, `exp.description` and `aw.description`. `<p>` became `<div>` because CKEditor output already contains `<p>`, and `<p>` inside `<p>` is invalid. Class names are unchanged, so the CSS (`.cv-introduction`, `.cv-item-desc`) still applies. |
| `src/components/cv/CvResumeLayout.spec.ts` | Fixture gains HTML `introduction` (plus a `<script>`), and HTML descriptions for education, project and certificate. The test asserts they render as elements, and that `alert(2)` is stripped. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

## Command
From repo root:
- `npx vitest run src/components/cv/CvResumeLayout.spec.ts`, run with the fix and again with the `.vue` change stashed, to show the spec catches the bug.
- `npm run test`
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script.
- Manual observation: Playwright on the logged-in `npm run dev` tab, `#/dashboard/preview`.

## Output
Spec with the fix:
```
      Tests  5 passed (5)
```
Spec with the `.vue` change stashed (old code):
```
AssertionError: expected '<div data-v-058be5cc="" class="cv-pre…' not to contain 'alert(2)'
      Tests  2 failed | 3 passed (5)
```
`npm run test`:
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 21ms
 Test Files  1 failed | 34 passed (35)
      Tests  1 failed | 227 passed (228)
```
This `VeeForm.spec.ts` failure is already present on clean `origin/staging` (see `evidence/implementer/2026-10-19-issue-212-form-select-dark.md`). This diff doesn't touch VeeForm.

`npm run build`:
```
✓ built in 4.03s
```
Manual observation of the real account data on Xem trước (not an automated test):
```
{"introTag":"DIV","introHasP":true,"rawTagsVisible":false,"descCount":8}
```
`rawTagsVisible:false` means there is no literal `<p>` or `&lt;p&gt;` in the print area's text. The screenshot `.playwright-mcp/shots/fix213-preview.png` (local only) shows the introduction rendered as plain prose. Before the fix, prod `vp-preview-1440.png` showed `<p>I am a Frontend Developer …</p>` as literal text. The console's 401s on `candidate/visits`, `candidate/<email>` and `profile/` come from the expired access token and axios's automatic refresh. The data loaded, and these errors are unrelated to this diff.

## Acceptance
| Criterion | Evidence |
|---|---|
| Introduction renders HTML, no raw `<p>` | spec `.cv-introduction strong` = `Dat`; live `rawTagsVisible:false` |
| Education / project / certificate descriptions render HTML | spec asserts `<strong>CS</strong>`, `<strong>Vue</strong>`, `<strong>SAA</strong>` inside `.cv-item-desc` |
| Still sanitized (public CV shows other people's data) | spec: no `alert(2)` from the injected `<script>`; output goes through the existing `sanitizeHtml` |
| Spec catches the regression | fails 2/5 with the fix stashed |
| Build green | `✓ built in 4.03s` |
| No new test failure | only the flaky `VeeForm.spec.ts`, already failing on `staging` |
| Comments per code-comments.md | no comments added |

## Noticed, not done
- Plain-text values (older data saved before CKEditor) are now parsed as HTML. They are sanitized, so a literal `<` or `&` could render differently, but there is no XSS risk.
- The PDF export (`download-pdf`) is rendered by the backend, not this component, so it is not covered here.
- `VeeForm.spec.ts` is flaky on `staging` and needs its own issue.

## Seal gate
None in this pass (no commit/push). Ship via `/ship` after verifier SEAL.
