# Evidence — issue-118-application-tracker

**Task:** Operator: "#118" via `/todo`. [GitHub issue #118](https://github.com/datvt243/resume-vuejs-website/issues/118)
("Application tracker — theo dõi nơi đã nộp CV").

## Why this is unblocked now (was BLOCKED_ON_BACKEND since 2026-09-18)
While rechecking issue #116 this same session, found backend PR
`resume-nodejs-api#139` ("132-application-tracker-collection-crud") merged
at **2026-09-20 11:41:10 +07**, adding the exact collection issue #118's
own scope note asked for. Verified directly, not from the PR title alone:
- `src/models/application.model.ts` (backend repo): Mongoose schema —
  `company`, `position`, `appliedDate` (Number), `status` (enum
  `APPLICATION_STATUSES = ['applied','interview','offer','rejected']`,
  default `'applied'`), `note`, `jobLink`, `candidateId`, soft-delete
  `deletedAt`.
- `src/candidate_profile/application/application.validate.ts`: Joi schema
  matching the model — `company`/`position` required, max 100 (same
  `joi.config.ts` helpers used by other sections), `appliedDate` required
  number, `status` required enum, `note`/`jobLink` optional with max
  length.
- `src/routers/api/v1/application.route.ts` + registered in
  `src/routers/api/v1/index.ts:34` (`router.use('/application',
  verifyToken, routeApplication)`) — full CRUD: `GET /`, `POST /create`,
  `PUT /update`, `DELETE /delete/:id`, `POST /restore/:id` (soft-delete
  pattern from issue #121), identical shape to `education.route.ts`.
- `Collections` enum in `src/types/base.type.ts` now has `APPLICATION =
  'applications'`.

**Correction of the record:** the prior node
`issue-118-application-tracker-recheck-20260920` (committed 12:04:17,
*after* PR #139 merged at 11:41:10) concluded "none of [the 8 commits]
touch the `application` collection" — that was **wrong/stale**, most
likely a local clone that hadn't pulled the latest `staging` at check
time. Not editing that row (LAI-13) — recorded here as the correction.
This session's own findings were independently re-derived directly against
the backend source tree, not inferred from the prior node's conclusion.

## What was implemented (frontend only, matches issue's own scope note)
Mirrors the existing `useCandidate` + `useDocument` + `VeeForm` pattern
used by every other CRUD section (issue's own suggestion), specifically
following `award.model.ts`/`PageAward.vue`'s shape (simple `ItemTemplate`
list, no separate `Item.vue` wrapper — issue's own text says "đơn giản").

- `src/models/application.model.ts` (new): `company`, `position` (text,
  required, max 100 — matches backend Joi), `appliedDate` (date, required),
  `status` (select: Đã nộp/Phỏng vấn/Offer/Từ chối → applied/interview/
  offer/rejected, matches backend enum exactly), `jobLink` (text, optional,
  url-validated — same pattern as `award.model.ts`'s `link` field),
  `note` (textarea, optional, max 1000).
- `src/pages/dashboard/PageApplication.vue` (new): list + create/edit/
  duplicate/delete modal, byte-for-byte structural mirror of
  `PageAward.vue`'s script (same `isDuplicating` `_id`-preserving trick
  from issue #60, same handler names). Added a small `statusMeta` map for
  a colored status badge next to each item (not in Award's pattern, but
  the issue's own scope explicitly asks for status visibility: "trạng
  thái... dùng lại TableDefault.vue nếu phù hợp" — kept the existing
  `ItemTemplate` list instead of introducing `TableDefault`/kanban, since
  the issue itself calls the list "đơn giản" and a full kanban board would
  be a much larger diff for the same information). Also shows an external
  link icon to `jobLink` when present.
- `src/routers/index.ts`: new child route `dashboard/application` →
  `PageApplication.vue`, same shape as every sibling route.
- `src/pages/_layouts/LayoutDefault.vue`: added `{ text: 'Ứng tuyển', name:
  'application', to: '/dashboard/application' }` to the sidebar nav array,
  placed after "Người tham khảo" (last CRUD section) and before "Xem
  trước / Xuất PDF".
- `src/plugins/initFontAwesomeIcon.js`: registered `faArrowUpRightFromSquare`
  (used for the jobLink external-link button) — checked the
  `fontawesome-icon-registration-gaps` trap FIRST and confirmed
  `faBriefcase` (used for the item icon) was already registered from an
  earlier node, so only the one new icon needed adding.
- `src/styles/tailwind.css`: added `.text-bg-warning` / `.text-bg-danger`
  badge color variants — the file's own comment on the `.badge` block
  explicitly invites this ("Add more colors on demand following the same
  pattern if a future page needs one"), colors/text-contrast copied from
  the existing `.btn-warning`/`.btn-danger` variants (warning = black
  text, danger = white text, matches Bootstrap's real convention already
  used elsewhere in this file).

No backend/model changes needed — used only what `#139` already shipped.
No changes to `useCandidate.ts`/`useDocument.ts`/`candidate.store.ts` —
the generic `getCandidateByField`/`setCandidateByField` path already
handles an arbitrary new field name with zero changes (confirmed by
reading `candidate.ts` directly).

**Known pre-existing quirk, not introduced/fixed here:** `useCandidate.ts`'s
`sortData()` sorts every list by `b.startDate - a.startDate`, hardcoded to
a field name only Education/Experience/Project actually have. Application
records have no `startDate`, so this comparator returns `NaN` for every
pair — items stay in whatever order the backend returned (Award/
Certificate/Reference already have this exact same behavior today, since
none of them have `startDate` either — confirmed by reading their models).
Not a new bug, not fixed here (out of scope, would touch a shared
composable used by 8 other sections for a cosmetic ordering concern).

## Branch
`feature/issue-118-application-tracker` off `staging`. Isolated from an
unrelated uncommitted `agent-hub` diff (this session's own #116 recheck)
that was sitting on `staging`'s working tree before this branch was cut —
stashed first (`git stash push -u -m "On
chore/issue-116-multi-profile-recheck-20260920: ...: hub bookkeeping,
pending /ship"`) so the two tasks' diffs stay isolated, same precedent as
`issue-119-cv-theme-templates`. That stash will be popped and shipped
separately once this task is sealed.

**Side note for the operator (not part of this task):** found a second,
older dangling stash (`stash@{1}` after the push above,
`On chore/issue-116-multi-profile-recheck-20260920: ...: hub bookkeeping,
pending /ship`, dated 2026-09-20 11:40:23) from an earlier session that
ran the same "#116" recheck and was apparently never shipped. It predates
backend PR #139 by ~47 seconds so its conclusion (blocked) was correct at
the time, but it's now redundant/superseded by this session's own fresh
#116 recheck. Left untouched — not this task's scope to clean up.

## Verification
- `npm run build` → clean, `✓ built in 4.35s`. New chunk
  `PageApplication-1pLHPm-a.js` (5.08 kB, gzip 2.24 kB) built successfully.
  Only the pre-existing chunk-size advisory (unrelated, `VeeForm` chunk).
- `npm run lint` → exit 0, no output.
- `npm run test -- --run` → **18 test files passed (18), 122 tests passed
  (122)** — full green, including `src/plugins/initFontAwesomeIcon.spec.ts`
  (the icon-registration regression guard — confirms both `faBriefcase`
  and the newly-added `faArrowUpRightFromSquare` resolve correctly).
  Notably the previously-known pre-existing `VeeForm.spec.ts` failures
  (documented in every node since `issue-60-duplicate-item`) are **gone**
  — full suite is clean, not just "same pre-existing failures" this time;
  must have been fixed in a session between `issue-119-cv-theme-templates`
  (2026-09-18) and now that this diagram doesn't have a dedicated node for
  (out of scope to chase here, noted for awareness).
- `git diff --stat staging`: `LayoutDefault.vue` (+1),
  `initFontAwesomeIcon.js` (+2), `routers/index.ts` (+6),
  `tailwind.css` (+10), plus new `application.model.ts` and
  `PageApplication.vue` — matches the file list above exactly, no
  unrelated files touched.
- **No live authenticated browser tab was available this session** — the
  only reachable CDP tab (`localhost:4034`, another repo's stale preview)
  has no server listening behind it anymore (`lsof -i :4034` empty,
  `curl` returned nothing). Verified via build/lint/test trio instead of a
  click-through, disclosed rather than implied — same pattern as
  `issue-119-cv-theme-templates`/`issue-121-qr-code-public-link` when no
  browser tab was available.
