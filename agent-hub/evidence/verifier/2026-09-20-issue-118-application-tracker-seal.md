# 2026-09-20 — issue-118-application-tracker — SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-118-application-tracker`
- New PM status: SEALED (was sealed_pending_verifier)

## Isolation proof
Spawned via `/worker verifier "#118"` as a brand-new subagent with zero
prior turns — first tool calls in this transcript were reading the
verifier's own manifest/SOUL/recipe files and `agent-hub/CLAUDE.md`/
`doctrine/MEMORY.md`. No memory of whatever session wrote
`src/models/application.model.ts`, `src/pages/dashboard/PageApplication.vue`,
or the small edits to `routers/index.ts`/`LayoutDefault.vue`/
`initFontAwesomeIcon.js`/`tailwind.css` — the implementer pass is not in
this context window at all, only the note it left behind. Satisfies
`NeverVerifyOwnWork`.

## Reasoning
- **Branch (`NoMainEdit`)**: `git branch --show-current` =
  `feature/issue-118-application-tracker`. `git merge-base --is-ancestor
  staging HEAD` confirmed `staging` is an ancestor of HEAD (cut from
  `staging`, not `main`). Not `main`/`staging` itself. Clear.
- **No outward-facing action / Seal gate**: `git log staging..HEAD
  --oneline` = empty (zero new commits yet); `git status` shows every
  changed/new file still uncommitted. Matches the note's
  "sealed_pending_verifier, pending /ship" implicit state — nothing to
  seal-gate-approve at this step.
- **Diff scope matches the note exactly**: `git diff --stat staging` =
  `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` (+2, the PM row —
  pre-existing before my own edit), `src/pages/_layouts/LayoutDefault.vue`
  (+1), `src/plugins/initFontAwesomeIcon.js` (+2), `src/routers/index.ts`
  (+6), `src/styles/tailwind.css` (+10), plus untracked
  `src/models/application.model.ts` and `src/pages/dashboard/
  PageApplication.vue`. Exactly the file list the note claims, nothing
  extra. Read all 4 small diffs directly:
  - `LayoutDefault.vue`: one new sidebar entry `{ text: 'Ứng tuyển', name:
    'application', to: '/dashboard/application' }`, placed after
    "Người tham khảo" as claimed.
  - `initFontAwesomeIcon.js`: `faArrowUpRightFromSquare` added to both the
    import list and the `library.add(...)` call — nothing else touched.
  - `routers/index.ts`: one new child route object, same shape as every
    sibling route (`path`/`name`/`component`/`meta.requiresAuth`).
  - `tailwind.css`: two new badge classes, `.text-bg-warning` (black
    text) and `.text-bg-danger` (white text), inside the existing
    `.badge` block whose own comment invites this exact addition.
- **Backend collection independently confirmed** (not trusted from the
  note's prose) at `/Users/_david/Workspace/Project/resume/
  resume-nodejs-api`:
  - `git log` on that repo: PR `#139`
    ("132-application-tracker-collection-crud") merge commit `550512f`,
    `AuthorDate`/`CommitDate` = `Sun Sep 20 11:41:10 2026 +0700` — matches
    the note's claimed timestamp exactly, verified by running `git log`
    myself, not by trusting the note's date.
  - `src/models/application.model.ts`: Mongoose schema with `company`,
    `position`, `appliedDate` (Number), `status` (enum
    `APPLICATION_STATUSES = ['applied','interview','offer','rejected']`,
    default `'applied'`), `note`, `jobLink`, `candidateId`, `deletedAt`
    soft-delete — read directly, matches the note's description.
  - `src/candidate_profile/application/application.validate.ts`: Joi
    schema — `company`/`position` via the shared `joi.config.ts` helpers
    (`min(0).max(100).required()`), `appliedDate` required number,
    `status` required enum matching `APPLICATION_STATUSES`, `note`/
    `jobLink` optional with `.max(1000)`/`.max(500)`.
  - `src/routers/api/v1/application.route.ts`: full CRUD (`GET /`,
    `POST /create`, `PUT /update`, `DELETE /delete/:id`,
    `POST /restore/:id`), registered at
    `src/routers/api/v1/index.ts:34` (`router.use('/application',
    verifyToken, routeApplication)`).
  - `src/types/base.type.ts`: `Collections.APPLICATION = 'applications'`
    present.
  - All four pieces genuinely exist and were read directly — the
    collection is real, not just claimed.
- **Frontend model fields vs backend validation** — read
  `src/models/application.model.ts` (this repo) directly and compared
  field-by-field against the backend Joi schema above: `company`
  (max 100, required) matches `joi.config.ts`'s `company` helper;
  `position` (max 100, required) matches the `position` helper;
  `appliedDate` (yup number, required, `convertTo: 'date'`) matches
  `Joi.number().required()`; `status` (yup string required, options
  exactly `applied`/`interview`/`offer`/`rejected`) matches
  `APPLICATION_STATUSES` exactly; `jobLink` (max 500, optional, URL
  validated) matches `Joi.string().max(500)`; `note` (max 1000, optional)
  matches `Joi.string().max(1000)`. No mismatch found.
- **Icon registration**: `git diff staging -- src/plugins/
  initFontAwesomeIcon.js` confirms `faArrowUpRightFromSquare` is newly
  added in this diff (both import and `library.add`). `git show
  staging:src/plugins/initFontAwesomeIcon.js | grep faBriefcase` confirms
  `faBriefcase` was already registered on `staging` before this diff —
  the note's claim that only one new icon was needed is correct.
  `src/plugins/initFontAwesomeIcon.spec.ts` (read directly) is a dynamic
  scanner that walks every `.vue` file under `src/`, extracts every
  `icon="..."` string, and asserts each resolves in the registered
  FontAwesome library — `PageApplication.vue`'s `fa-briefcase` and
  `fa-solid fa-arrow-up-right-from-square` usages are both covered by
  this scan, and the suite passed (see below), so both genuinely resolve.
- **Re-ran independently** (see `## Re-run`):
  - `npm run build` → `✓ built in 3.73s`, new chunk
    `dist/assets/PageApplication-1pLHPm-a.js` at 5.08 kB / gzip 2.24 kB,
    only the pre-existing `VeeForm` (955 kB) chunk-size advisory. Matches
    the note exactly.
  - `npm run lint` → exit 0, no output. Matches.
  - `npm run test -- --run` → `Test Files 18 passed (18)`, `Tests 122
    passed (122)`. Matches the note's numbers exactly, including the
    note's claim that the previously-known `VeeForm.spec.ts` failures are
    now gone (confirmed — no failures anywhere in this run).
- **Forbidden states** (all 6, `agent-hub/CLAUDE.md`):
  - `ADHOC_WORK` — clear, went through implementer worker, node exists on
    the diagram.
  - `NO_EVIDENCE` — clear, implementer note exists and is complete for
    the feature claims (see one process gap noted under Missing).
  - `EDIT_UNVERIFIED` — clear, every claimed command output independently
    reproduced above, numbers match exactly.
  - `CODE_IN_HAVEN` — clear, `git status --porcelain agent-hub/` before my
    own PM-status edit showed only the diagram `.md` file touched, no
    `.vue`/`.js`/`.ts`/`.sh` leaked into `haven/`.
  - `DIAGRAM_DRIFT` — clear, the diagram diff (before my SEAL edit) was
    exactly the new `issue-118-application-tracker` row appended after
    the prior BLOCKED row, content matches the real code diff.
  - `MAIN_EDIT` — clear, see Branch above.
- **`AppendOnly`**: diagram diff (`git diff staging -- agent-hub/haven/
  diagrams/dev-loop.prime-mermaid.md`, checked before my own edit) added
  exactly one new row after the existing `issue-118-application-tracker-
  recheck-20260920` BLOCKED row — that prior row's text was not touched.
  My own SEAL edit changed only the new row's own status column
  (`sealed_pending_verifier` → `SEALED`) and appended verifier-confirmation
  prose to that same row in place — no other row touched, no reordering.
- **Proportionality (`SmallestDiff`)**: diff is exactly the files the
  feature needed — 2 new files (model + page), 4 minimal wiring edits
  (route, nav entry, 1 icon, 2 badge CSS classes). `useCandidate.ts`/
  `useDocument.ts`/`candidate` store confirmed untouched
  (`git diff --stat staging` has no entry for any of them) — matches the
  note's claim that the generic field-name handling needed zero changes.

## Missing
One minor process gap, not blocking: the implementer's note has no
`## Hub bytes before` line, which its own recipe
(`haven/workers/implementer/recipes/pick_next.md`, steps 7-8) requires.
This is a cost-tracking/bookkeeping field for `evidence/worker-runs.log`,
not one of the diagram node's feature-acceptance criteria — it does not
affect correctness of the shipped code, so it is not REOPEN-worthy on its
own, but is flagged here for the record. `hub_bytes_before` on the log
line below is therefore marked `unknown` rather than fabricated.

## Re-run
`partial` — re-ran `npm run build`, `npm run lint`, and `npm run test --
run` (full suite) from scratch myself, and independently re-derived the
backend collection's existence by reading the backend repo's source files
and running `git log` there directly (not trusting the note's dates).
Did not re-run a browser click-through — the note discloses no live
authenticated CDP tab was available this session, and nothing in this
node's risk profile (a same-pattern CRUD page mirroring `PageAward.vue`,
not outward-facing yet) calls for spending effort standing up a browser
session just to verify what the build/lint/test trio + direct diff/schema
reads already cover.

## Verdict
SEAL.
