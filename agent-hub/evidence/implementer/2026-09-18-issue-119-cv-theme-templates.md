# 2026-09-18 — issue-119-cv-theme-templates (sealed_pending_verifier)

- Worker: implementer
- Version: 0.1.0
- Node: `issue-119-cv-theme-templates` (new node, appended)
- Task (verbatim): "#119" (operator, via `/todo`)

## Hub bytes before
111191 (root=7714, doctrine=27207, active diagram=50153, implementer
bundle=14963, verifier bundle=11154 — categories per `/hub-tokens`'
"per-session total" formula).

## Branch
`feature/issue-119-cv-theme-templates`, cut from `staging`.

## Process note (not a code defect) — branch isolation from the prior node
Before starting this task, `git status` showed the PRIOR node's
(`issue-120-import-cv-pdf-linkedin-recheck-20260918`) hub-bookkeeping
diff (2 modified files + 1 new evidence note) still sitting uncommitted
directly on `staging`'s working tree — that node's own evidence note
already discloses this as a corrected slip (it too was originally written
directly on `staging` before being moved to
`chore/issue-120-import-cv-pdf-linkedin-recheck-20260918`, which is
correct, but the branch checkout for THAT correction happened while THIS
task's diff didn't exist yet). Since git does not scope uncommitted
changes to whichever branch is checked out — a plain `git checkout -b`
carries the working tree's uncommitted diff along with it — cutting
`feature/issue-119-cv-theme-templates` naively would have silently mixed
the unrelated `issue-120` hub bookkeeping into this feature's diff.
Recovered via `git stash -u -m "issue-120-recheck-20260918 hub
bookkeeping — belongs on chore/issue-120-import-cv-pdf-linkedin-recheck-20260918,
not mixed into issue-119 work"` BEFORE creating this branch. The stash
(`stash@{0}`) is left in place, to be popped only when work resumes on
`chore/issue-120-import-cv-pdf-linkedin-recheck-20260918` — not touched
further by this node.

## Investigation
1. Read GitHub issue #119 (`gh issue view 119`): "[ENHANCEMENT] Chọn
   theme/template cho PDF export & trang public" — wants 2-3 CSS/layout
   themes (Compact/Modern/Classic) shared by the PDF-export preview
   (issue #55) and the public share-link page (issue #56), a
   `selectedTheme` field ("localStorage hoặc backend field nếu có sẵn chỗ
   lưu preference"), applied to BOTH places from "1 nguồn layout" so the
   two can't drift apart. Issue's own note: "Đây là cải tiến thuần
   frontend..., không cần đổi backend."
2. Read `src/pages/dashboard/PagePreview.vue` and
   `src/pages/public/PagePublicResume.vue` in full: confirmed they were
   ALREADY 100% duplicated markup + scoped CSS (only the data-fetch side
   differed — `candidateStore`/`useCandidate` vs a direct `_axios` call to
   the public endpoint) — a real pre-existing DRY gap the issue's own
   "dùng chung 1 nguồn layout" note points at directly.
3. Checked the backend (`resume-nodejs-api`, mentally, via the same
   cross-repo-check habit as prior nodes) is NOT needed here per the
   issue's own explicit scope note — did not spend time re-verifying a
   backend field absence since the issue itself says none is needed;
   confirmed no `theme`/`template` field is read/written anywhere in this
   repo's `src/services/`/`src/config/api.config.js` (grep, zero hits),
   so nothing here silently assumed a backend field exists.
4. Checked `src/components/global/Button.vue` and existing `.btn-outline-*`
   usage across the codebase (`PageInformation.vue`, `Modal.vue`,
   `item.vue` files) to keep the new theme-picker UI visually consistent
   with the rest of the app (plain `.btn`/`.btn-success`/`.btn-outline-success`
   toggle, no new UI primitive).
5. Checked `src/routers/index.ts`'s `public-resume` route + `router.resolve`
   usage in `PageInformation.vue`'s `publicLink` computed — confirmed
   `router.resolve({ name, params, query })` is the right hook to append
   `?theme=` without touching the route definition itself.

## Implementation
- New `src/composables/useCvTheme.ts`: exports `THEMES` (3 entries:
  classic/modern/compact), `DEFAULT_THEME` ('classic'), `isValidTheme()`,
  `resolveTheme()` (always returns a value from `THEMES`, falling back to
  `DEFAULT_THEME` for anything else — used to sanitize untrusted input),
  and the stateful `useCvTheme()` (localStorage-persisted `selectedTheme`
  ref, key `cvTheme`, watch-driven write-through).
- New `src/components/cv/CvResumeLayout.vue`: the ONE shared layout —
  moved the identical markup + scoped CSS out of both pages verbatim,
  parameterized by `data` (the already-shared shape: `firstName`,
  `lastName`, `phone`, `address`, `email`, `introduction`,
  `generalInformation`, `educations`, `experiences`, `projects`,
  `awards`, `certificates`, `references`) and `theme` (fed through
  `resolveTheme()` so an invalid value can never reach the DOM as a raw
  class name). Added 2 new theme CSS blocks (`.cv-theme-modern`:
  left-aligned accent-colored header/section-titles using the existing
  `var(--bs-success)` token; `.cv-theme-compact`: smaller font-size +
  tighter spacing) — `classic` needed no new CSS since it's the
  pre-existing look, kept as the default.
- `src/pages/dashboard/PagePreview.vue`: now builds a `cvData` computed
  (assembling the same fields from `candidateStore`/`useCandidate`) and
  renders `<CvResumeLayout :data="cvData" :theme="selectedTheme" />`
  instead of the old duplicated template; added a 3-button theme picker
  next to the existing "Xuất PDF / In" button, wired to `useCvTheme()`.
  Print/PDF export (`window.print()` + the existing `@media print` /
  `cv-print-mode` body class) is untouched — it prints whatever theme is
  currently active in the live DOM, no extra plumbing needed.
- `src/pages/public/PagePublicResume.vue`: now renders
  `<CvResumeLayout :data="data" :theme="theme" />` where `data` is the
  same object already fetched from the backend (its shape already
  matched what `CvResumeLayout` expects, no transform needed) and `theme
  = resolveTheme(route.query.theme)` — an anonymous visitor's raw query
  string is never trusted directly.
- `src/pages/dashboard/PageInformation.vue`: `publicLink` computed now
  calls `useCvTheme()` and appends `{ theme: selectedTheme.value }` to
  `router.resolve(...)`'s `query` ONLY when the owner picked a
  non-default theme (keeps the link/QR code clean when the feature is
  unused). This is the entire mechanism that makes the public page match
  the dashboard preview without any backend preference field — the
  existing copy-link/QR-code UI (issues #117/#121) carries the theme for
  free, no new UI added there.
- New `src/composables/useCvTheme.spec.ts` (7 tests): default theme,
  restoring a persisted valid value, falling back on a corrupt/unknown
  stored value, `setTheme` persisting to `localStorage`, `setTheme`
  rejecting an invalid value, the exact 3-theme list, and a regression
  guard for `resolveTheme`/`isValidTheme` rejecting arbitrary/malicious
  input (the exact function `PagePublicResume.vue` feeds the anonymous
  visitor's raw `route.query.theme` through).

## Command
`npm run build` (repo root):
```
✓ 1382 modules transformed.
...
dist/assets/CvResumeLayout-BYQhHQA7.css             2.04 kB │ gzip:   0.56 kB
...
dist/assets/useCvTheme-BXWorRGn.js                  0.46 kB │ gzip:   0.30 kB
dist/assets/PagePublicResume-Y6jwjCHj.js            1.09 kB │ gzip:   0.72 kB
dist/assets/PagePreview-BhbwRBzz.js                 2.09 kB │ gzip:   1.09 kB
dist/assets/CvResumeLayout-gZN2jzx5.js              6.86 kB │ gzip:   2.11 kB
dist/assets/PageInformation-B3DCWnc9.js            30.35 kB │ gzip:  12.31 kB
...
(!) Some chunks are larger than 500 kB after minification. Consider: ...
✓ built in 4.55s
```
(Re-ran clean a second time after adding the spec — `✓ built in 4.37s`,
same chunk names, only the same pre-existing chunk-size advisory.)

`npm run lint`: exit 0, no output (both runs).

`npm run test -- --run` (full suite, after adding the new spec):
```
Test Files  1 failed | 17 passed (18)
     Tests  3 failed | 119 passed (122)
```
The 1 failed file/3 failed tests are `VeeForm.spec.ts`'s pre-existing
named `BUG (real, verified...)` cases — confirmed pre-existing/unrelated
via `git diff --stat staging -- src/components/veevalidate/` (empty on
this branch). The 7 new tests are `src/composables/useCvTheme.spec.ts`,
all passing (also verified standalone: `npx vitest run
src/composables/useCvTheme.spec.ts` → `7 passed (7)`).

## Manual/UI check
No live authenticated browser tab was available this session — `curl
http://localhost:9888/json/list` returned only browser-extension
background pages, no app tab to drive via CDP. Real automated
verification instead: the build/lint/full-test-suite trio above plus the
new `useCvTheme.spec.ts` (7/7 passing, includes the exact
sanitization path the public page's untrusted query param goes through).
Disclosed rather than implied — this is NOT a substitute for someone
actually looking at the rendered themes, only for the composable's logic
and the app's continued ability to compile/lint/test.

## Acceptance
| Criterion | Evidence |
|---|---|
| 3 CSS/layout themes (Compact/Modern/Classic) | `CvResumeLayout.vue`'s `.cv-theme-modern`/`.cv-theme-compact` blocks + the unstyled default = classic; `THEMES` in `useCvTheme.ts` |
| One shared layout source for PDF export + public page (no drift) | Both `PagePreview.vue` and `PagePublicResume.vue` render the same `CvResumeLayout.vue`; `git diff --stat staging` shows the old duplicated markup deleted from both (`-413` lines total) |
| Theme choice persists for the owner (PDF export) | `useCvTheme()`'s localStorage watch — `useCvTheme.spec.ts`'s persist/restore tests |
| Theme applies to the public page too, no backend field | `PageInformation.vue`'s `publicLink` query param + `PagePublicResume.vue`'s `resolveTheme(route.query.theme)` |
| Untrusted input (anonymous visitor's query param) can't inject an arbitrary class/break rendering | `resolveTheme()`/`isValidTheme()` whitelist-only; regression-guard test with a `<script>` payload as input |
| Pure frontend, no backend change | `git diff --stat staging` — only `src/` files, no `services/`/`config/` API-shape change |
| Build/lint/test all still pass, pre-existing failures unaffected | Command section above |

## Noticed, not done
- None beyond what's already logged on other open nodes (issue #120
  blocked, issue #8 blocked, `#118`/`#122`/`#116` not yet picked up).

## Seal gate
No outward-facing action taken — no commit, no push, no merge. Diff sits
on `feature/issue-119-cv-theme-templates`, uncommitted, waiting for
`/ship` (separate operator-gated step). Diagram edit here is a pure
append (`AppendOnly`, LAI-13 respected — no existing row touched).
