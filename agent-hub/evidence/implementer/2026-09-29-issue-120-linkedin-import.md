# 2026-09-29 — issue-120-linkedin-import

- **Worker:** implementer
- **Version:** 0.1.0
- **Node:** `issue-120-linkedin-import` (new node, LAI-13 — does not edit any prior `issue-120-import-cv-pdf-linkedin*` row)
- **Task:** "Pick up the next issue — #120 or #122" (operator, via `/todo`)

## Hub bytes before: 148884

## Triage: #120 vs #122
Ruled out #122 first: its own issue text self-flags "⚪ Cần thảo luận thêm
trước khi lên kế hoạch — không tự triển khai chỉ từ issue này" (needs more
discussion before planning — don't implement from this issue alone) —
same class of gap as `issue-118-application-tracker-blocked`'s triage of
#122, which ruled it out for the identical reason. Picked #120.

#120 ("Import CV từ file PDF hoặc LinkedIn export") had been rechecked
5 times (`issue-120-import-cv-pdf-linkedin*` rows, 2026-09-17 through
2026-09-26) and stayed `BLOCKED_ON_BACKEND` — the last recheck
(2026-09-26) found backend PR #145 (LinkedIn-export parsing endpoint)
merged but only on backend `staging`, not `main`. Re-checked fresh rather
than trusting that 3-day-old finding:

```
cd resume-nodejs-api && git fetch origin
git merge-base --is-ancestor 0f4b729 origin/main && echo YES || echo NO
→ YES
```

Backend `main` is now at `v1.8.1` (commit `f557772`) — PR #145 shipped in
the gap. Read the real endpoint source directly, not the PR title:
`src/candidate/parseLinkedInExport.service.ts` (`parseLinkedInExportZip`),
`src/middlewares/uploadLinkedInExport.middleware.ts` (multer, in-memory,
`.zip` only, 20MB), `src/candidate/candidate.controller.ts:111-141`
(`fnParseLinkedInExport`), and the route
`POST /api/v1/candidate/parse-linkedin-export` in
`src/routers/api/v1/candidate.route.ts:111` — stateless, bearer-auth,
returns `{ educations: [...], experiences: [...] }` with field names
(`school`/`major`/`startDate`/`endDate`/`isCurrent`/`description` and
`company`/`position`/`startDate`/`endDate`/`isCurrent`/`description`)
that match this repo's `education.model.ts`/`experience.model.ts` exactly
— confirmed by reading both model files directly.

**Scope narrowed, disclosed not hidden:** only the LinkedIn-ZIP half of
#120 is now backed. PDF text-extraction has no backend endpoint anywhere
(`resume-nodejs-api#141`'s own body says so, and its "Notes" section
explicitly deprioritizes the PDF path as a stretch/follow-up) — no
frontend work attempted for PDF import. Issue #120 itself allows this
split ("PDF CV cũ **hoặc** file export từ LinkedIn").

## Branch
`feature/issue-120-linkedin-import` (off `staging`).

**Process note (not a code defect):** the first edit (`src/services/axios.ts`'s
FormData fix, see Diff below) was written before checking out a branch —
caught immediately after the edit, before any second file was touched.
Recovered cleanly: confirmed `git diff main staging -- src/services/axios.ts`
was empty (the file hadn't diverged between the two branches), then ran
`git checkout -b feature/issue-120-linkedin-import staging`, which carried
the uncommitted edit onto the new branch normally (no stash needed, no
commit ever touched `main`). Disclosed per the same precedent as
`issue-59-profile-completion`'s process note.

## Diff
| File | Why |
|---|---|
| `src/services/axios.ts` | `_axios()` hardcoded `Content-Type: application/json` on every request — would have broken the new multipart file upload (forces JSON content-type over a `FormData` body, stripping the browser's own multipart boundary). Now skips the forced header when `data instanceof FormData`, letting axios/the browser set the correct `multipart/form-data; boundary=...` header. No other request path changes behavior (still gets the same JSON header as before). |
| `src/pages/dashboard/PageImportLinkedin.vue` (new) | Upload the LinkedIn export `.zip`, call the new endpoint, list parsed Education/Experience entries. Each entry has a "Thêm" button that pre-fills the corresponding **existing** `education.model.ts`/`experience.model.ts`-driven `<VeeForm>` (reused as-is, not reimplemented) inside a `<Modal>` for the user to review/edit before submitting for real via the existing `useDocument.updateDoc`/`useCandidate.addRecordToList` — matches issue #120's own explicit requirement ("map vào form để user review và sửa trước khi lưu — không tự động lưu thẳng"). Reused the exact `_id`-kept-truthy-then-nulled-before-save workaround from `issue-60-duplicate-item` (`VeeForm.vue`'s `watch(document)` calls `reset()` whenever `_id` is falsy, which would otherwise wipe the just-prefilled values — confirmed by reading `VeeForm.vue` directly, not assumed). |
| `src/routers/index.ts` | New child route `dashboard/import-linkedin` → `PageImportLinkedin.vue`, same shape as every sibling dashboard route. |
| `src/pages/_layouts/LayoutDefault.vue` | New sidebar nav entry ("Nhập CV từ LinkedIn"), same shape as the other `routers` array entries — no icon needed (this nav list renders text only, confirmed by reading the template, not assumed). |

No `VeeForm.vue`, `education.model.ts`, `experience.model.ts`,
`useDocument.ts`, or `useCandidate.ts` changes — all reused unmodified.

## Command
```
npm run build
```

## Output
```
dist/assets/PageImportLinkedin-JPAF7uJx.js          5.56 kB │ gzip:   2.31 kB
...
(!) Some chunks are larger than 500 kB after minification. Consider: ...
✓ built in 4.12s
```
(full output tail included the same pre-existing `VeeForm` chunk-size
advisory as every prior build — not new)

```
npm run lint
```
→ exit 0, no output.

```
npm run test -- --run
```
→
```
 Test Files  19 passed (19)
      Tests  131 passed (131)
```
Same file/test count as the last SEALED node (`issue-116-multi-profile-frontend`)
— this diff added no new `.spec.ts` (see "Noticed, not done" below), and
correctly caused zero regressions.

## Manual verification (no automated test for the new page — disclosed)
No live authenticated browser tab available this session
(`curl :9888/json/list` → only an extension background/service-worker
page, no app tab, same recurring gap as `issue-118`/`issue-116` notes).
Instead: started `npm run dev`, curled all 4 touched/new files through it:

```
src/pages/dashboard/PageImportLinkedin.vue -> 200
src/routers/index.ts -> 200
src/pages/_layouts/LayoutDefault.vue -> 200
src/services/axios.ts -> 200
```

All 200, real transformed output, no compiler-error overlay — confirms
runtime compile, not just build-time. A manual click-through (real
LinkedIn export ZIP → parse → prefilled modal → save) is recommended
before fully trusting the UX end-to-end; the `FormData`/Content-Type fix
in particular can only be fully proven by a real network request, which
this session couldn't make (no authenticated session, no real LinkedIn
export file on hand).

## Acceptance
| Criterion | Evidence |
|---|---|
| Backend LinkedIn-parse endpoint is live in production (`main`), not just `staging` | `git merge-base --is-ancestor 0f4b729 origin/main` → `YES`, backend at `v1.8.1` |
| Frontend field names match the backend's real response shape | Read `parseLinkedInExport.service.ts`'s `ParsedEducation`/`ParsedExperience` interfaces + `education.model.ts`/`experience.model.ts` directly — identical field names |
| Parsed data goes through the existing model-driven form for review before saving (issue's own explicit requirement) | `PageImportLinkedin.vue`'s `openEducationModal`/`openExperienceModal` populate `document` then `refModal.show()`; save only happens on the form's own submit button (`VeeForm`'s existing Yup validation still applies) |
| No `VeeForm`/model/composable regression | `npm run test -- --run` → `19 passed (19)` files, `131 passed (131)` tests, same numbers as the last SEALED node |
| Build green | `✓ built in 4.12s`, new `PageImportLinkedin` chunk present |
| Lint clean | exit 0, no output |
| Branch is not `main`/`staging` | `feature/issue-120-linkedin-import`, cut from `staging` |

## Noticed, not done
- **No dedicated `.spec.ts` for `PageImportLinkedin.vue`'s prefill/save
  logic.** Out of scope for the smallest-diff rule here — no other
  `Page*.vue` in this codebase has component-level tests either (only
  `VeeForm.vue` does, per `doctrine/domains/PROJECT.md`'s open
  issue #7 trap) — would be a bigger, separate testing-infrastructure
  task, not specific to this feature.
- **`haven/diagrams/dev-loop.prime-mermaid.md` (the active, non-archived
  diagram) is now ~88KB** (`wc -c` = 87846, measured while computing
  `Hub bytes before`) — well past the 15KB threshold the last archiving
  pass (`agent-hub-archive-pass-4`, 2026-09-06) tried to keep it under.
  Every node added since then (`issue-118`, `issue-116-*` x2,
  `issue-8-*` x3, `docs-readme-roadmap-sync`, etc.) was appended in full,
  none archived. Recommend a follow-up `/hub-tokens` + archiving pass —
  did not do it here, out of scope for this task and risks conflicting
  with any other in-flight branch's own diagram append (`AppendOnly`
  only protects position, not size).
- PDF import (the other half of issue #120) remains fully unimplemented,
  frontend and backend both — a new node should recheck this once/if a
  backend PDF-parse endpoint is ever filed (no such issue exists in
  `resume-nodejs-api` yet, confirmed via `gh issue list` search during
  the earlier `issue-120-import-cv-pdf-linkedin-recheck-20260926` node
  and unchanged since).

## Seal gate
None taken — no commit/push/merge/deploy this session. Working tree is
dirty/uncommitted on `feature/issue-120-linkedin-import`
(`git diff --stat staging`: 4 files, 221 insertions / 3 deletions). Merge
into `staging` is a separate outward-facing step (`/ship`), pending
operator approval.
