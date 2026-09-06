# 2026-09-06 — issue-58-avatar-upload

- Worker: implementer
- Version: 0.1.0
- Node: `issue-58-avatar-upload`
- Task (verbatim): "#58" via `/todo`, resolved from `gh issue view 58` —
  [ENHANCEMENT] Upload ảnh đại diện (avatar).

## Hub bytes before: 93393

## Branch
`feature/issue-58-avatar-upload`, checked out from `staging` BEFORE any
file was touched this time (learned from `issue-59`'s process slip last
session — checked `git branch --show-current` and branched first, no
repeat).

## Scope decision — verified against real backend + real frontend gaps
Issue's own text says avatar needs "backend hỗ trợ endpoint upload file/
ảnh" and claims "field type 'file' support đã có sẵn trong modelItem" on
the frontend. Verified both claims directly rather than trusting them:

1. **Backend (`resume-nodejs-api`)**: `grep -ri avatar src/` → zero
   hits, anywhere. The only image-upload middleware that exists
   (`uploadImagesMiddleware`, issue #72) is mounted at
   `POST /:collection/:id/images` for project/certificate/award only —
   it appends to an `images[]` array on a SPECIFIC sub-document record,
   identified by `:id`. A candidate-level single avatar has no `:id` to
   attach to and isn't an array — this endpoint can't be reused or
   trivially extended for this shape without real backend design work.
   No `avatar` field exists on the `Candidate` model either.
2. **Frontend "already supported" claim — only half true**: `type: 'file'`
   IS one of `modelItem`'s `inputType` union members (in
   `src/types/model.type.ts`), and `award.model.ts` has a commented-out
   `images` field using it — but `VeeForm.vue`'s `objComponent` renderer
   map (`{checkbox, currency, select, ckediter, date, text...}`) has **no
   entry for `'file'` at all**. No `FrmFile.vue` component exists
   anywhere in `src/components/veevalidate/part/`. The type is declared,
   nothing renders it.

Given both are real, verified gaps (not assumed), scoped this node down
to what's actually safe and real to ship:
- Did NOT add `avatar` to `information.model.ts` or build a `FrmFile.vue`
  wired into `VeeForm.vue`. Reason: if `avatar` became a tracked
  `VeeForm`/`document` field, its value (a `File` object or blob URL,
  never a real saved value) would flow into `handleUpdate`'s submitted
  payload on every basic-info save. The backend's Joi validation
  (`Joi.object()`, default `unknown(false)` — same fact already
  established independently in `issue-63`'s evidence) would then reject
  the ENTIRE update request over one unknown key — turning "add an
  avatar picker" into "silently break saving your name/phone/address."
  Confirmed this risk is real by re-reading `src/candidate/
  candidate.validate.ts` in the backend repo directly — `schemaCandidate`
  still has no `avatar` field.
- Built a standalone avatar-picker + local-preview block in
  `PageInformation.vue`, completely OUTSIDE `VeeForm`/`document` — its
  own local `ref`s, never touches `updateDoc`'s payload. Mirrors the
  EXACT pattern this codebase already uses and accepts for the same
  class of problem: `PageHome.vue`'s "Đính kèm CV" section already does
  select-file → show name → toast disclosing "chưa gửi lên server", for
  a different (CV) file. Not inventing a new pattern, reusing an
  established one.

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PageInformation.vue` | New "Ảnh đại diện" block: avatar circle (real `candidate.getCandidate.avatar` if the backend ever sets it, initials fallback — matches `PageHome.vue`'s existing avatar-circle exactly), "Chọn ảnh" button + hidden file input, local preview via `URL.createObjectURL` (revoked on unmount and on re-select to avoid leaking blob URLs), honest disclosure text. Zero changes to `formFields`/`document`/`handleUpdate`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | New PM status row, `IN_PROGRESS`. |

No `information.model.ts`, no `VeeForm.vue`, no backend touched.

## Command
`npm run build` (repo root, exact command from `doctrine/MEMORY.md`)

## Output
```
dist/assets/PageInformation-BrAKGA2E.js             3.69 kB │ gzip:   1.83 kB
...
✓ built in 5.72s
```
`PageInformation` chunk grew from ~2.09kB → 3.69kB (new UI block, no
surprise). Same pre-existing >500kB chunk warning as every prior SEAL.

```
npm run lint
> resume-vuejs-website@1.7.0 lint
> eslint src --ext .js,.ts,.vue
(no output, exit 0)
```

```
npm run test -- --run
 Test Files  1 failed | 10 passed (11)
      Tests  2 failed | 82 passed (84)
```
No new test file (no existing test precedent for `PageInformation.vue`
or any dashboard page component, same as every prior UI-only page diff
this session). The 2 failures are the same pre-existing
`VeeForm.spec.ts` failures established as unrelated across the last 3
SEALed nodes — this branch made zero changes to
`src/components/veevalidate/` or `src/models/information.model.ts`
(confirmed via `git diff staging --stat`, both empty).

## Manual verification (UI diff — per `implement.md` step 7)
Same disclosed limitation as the last 2 sessions: no authenticated login
possible (fresh CDP tab against the dev server, no cached token —
checked again this session, same result). Substitute evidence:
- `npm run dev` + curl against Vite's transform endpoint:
  `PageInformation.vue` → HTTP 200, zero compile errors.
- Read the actual compiled render output: confirmed `$setup.avatarUrl`
  is really bound to the `<img>` `src`, and `triggerAvatarPicker`/
  `handleSelectAvatar` are present in the component's real
  `__returned__` setup bindings — the actual artifact the browser would
  run, not source code that merely looks right.
- Confirmed via `git diff staging --stat -- src/models/information.model.ts
  src/components/veevalidate/` (both empty) that the payload-leak risk
  this design was built to avoid genuinely cannot occur — the new code
  has no path into `handleUpdate`'s submitted `values`.

## Acceptance
| Criterion | Evidence |
|---|---|
| Node on diagram before code | `issue-58-avatar-upload` row added, `IN_PROGRESS`, before `PageInformation.vue` was touched |
| Branch dedicated, not `main`/`staging`, branched BEFORE code this time | `git branch --show-current` → `feature/issue-58-avatar-upload`; no repeat of `issue-59`'s slip |
| Both scope-narrowing claims verified, not assumed | Backend `grep`, backend route file read, `VeeForm.vue`'s renderer map read directly, `award.model.ts`'s commented field read directly |
| No payload-leak risk introduced | `git diff staging --stat` empty for `information.model.ts` and `src/components/veevalidate/` |
| Reuses an existing accepted pattern, not a new one | Directly mirrors `PageHome.vue`'s "Đính kèm CV" block (same file-select/disclose shape) |
| Build green | `✓ built in 5.72s` |
| Lint clean | exit 0, no output |
| No test regressions | Same pre-existing `VeeForm.spec.ts` failures, confirmed unrelated |

## Noticed, not done
- If the operator wants the REAL feature (persisted avatar), the next
  step is backend work: add `avatar` to the `Candidate` model + a
  dedicated `PATCH /candidate/avatar` (or similar) endpoint accepting a
  single image upload, separate from the existing per-record
  `images[]` middleware. Out of scope for this repo/this node.
- Did not wire this page's local preview into `PageHome.vue`'s avatar
  circle — it's local-only state that resets on navigation/reload since
  nothing is persisted, so cross-page sharing would be misleading (looks
  saved when it isn't). Kept scoped to the one page where it's set.

## Seal gate
No outward-facing action taken in this pass (no commit, no push, no
merge). Merging this branch into `staging` is a separate `/ship` step,
pending operator approval.
