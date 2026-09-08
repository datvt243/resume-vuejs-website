# 2026-09-08 — issue-56-public-resume-page

- Worker: implementer
- Version: 0.1.0
- Node: `issue-56-public-resume-page` (new node, via `/todo`)
- Task (verbatim): "#56" (operator)

## Hub bytes before
100045 (root=7714, doctrine=27207, active diagram=39007, implementer
bundle=14963, verifier bundle=11154)

## Branch
`feature/issue-56-public-resume-page` (checked out from `staging`).

## Backend investigation
[Issue #56](https://github.com/datvt243/resume-vuejs-website/issues/56)
("Trang public xem CV qua link chia sẻ, read-only") itself says the
scope needs "backend hỗ trợ endpoint public theo slug." Checked the
sibling backend repo (`resume-nodejs-api`) directly before assuming that:
it turns out the public endpoint **already exists**, built for a
different feature and left unwired on the frontend:
- `GET /api/me/:email` (`src/routers/index.ts:59`, `fnGetAboutMe` in
  `src/candidate_me/index.ts`) — mounted OUTSIDE the `verifyToken`-gated
  `/api/v1/*` router tree, genuinely public, no auth header needed.
  Returns the full aggregated candidate doc (general info + all 6 CV
  sections) as JSON.
- Gated server-side by `Candidate.isPublic` (`src/models/candidate.model.ts`,
  default `true`) — `fnGetAboutMe` returns the exact same "Email không
  tồn tại" response for BOTH "not found" and "private" (confirmed by
  reading the handler directly), so a private profile can't be
  distinguished from a non-existent one from the outside.
- `POST /api/me/:email/visit` (`fnRecordVisit`) — already-built visit
  recorder. Its own swagger doc on `candidate.route.ts:77` literally says
  "recorded via `POST /api/me/{email}/visit`", and the SEALED
  `dashboard-visit-count-integration` node's own evidence already
  predicted this: "called when someone views the public share-link
  profile, which doesn't exist in this frontend yet, issue #56." Grepped
  the whole frontend `src/` — nothing calls this endpoint yet, so the
  existing "Lượt truy cập" dashboard feature has been silently inert
  since it shipped (nothing was ever incrementing it through the app).
- `src/pages/_layouts/Header.vue:31,39` already builds a raw link to
  `${host}api/me/${email}` (opens the bare JSON, not a rendered page) —
  confirms the intent existed, just never got a real frontend page.

Conclusion: **no backend work needed** — issue #56's own stated
precondition is already satisfied by a different, earlier feature. This
task is frontend-only.

## Diff
| File | Why |
|---|---|
| `src/routers/index.ts` | New route `/resume/:email` → `PagePublicResume.vue`, no `meta.requiresAuth` (same precedent as `NotFound.vue`, the only existing unauthenticated non-auth route) |
| `src/pages/public/PagePublicResume.vue` (new) | The read-only public CV page |

Deliberately did **not** touch `src/pages/dashboard/PagePreview.vue` (the
existing SEALED authenticated CV-preview page, issue #55) even though the
new page's template/CSS closely mirrors it — extracting a shared
component would touch an already-shipped feature for a same-session
convenience, bigger blast radius than the task needs. Copied the
markup/CSS instead (smallest diff to the file actually in scope).

### Design decisions
1. **Data fetch**: calls `_axios({ method: 'get', customURL:
   'api/me/:email' })` directly — NOT `handleBase`/`useCandidate`/
   `useDocument`. Those assume an authenticated dashboard context: they
   prefix `api/v1/`, and `handleBase`'s error path calls
   `authStore().logOut()` on `invalidToken` and shows a toast — both
   wrong for an anonymous visitor on a public page hitting a route that
   was never behind auth to begin with. `_axios`'s `customURL` param
   already exists precisely to bypass the `subURL` prefix, so no change
   to `services/axios.ts`/`services/base.ts` was needed.
2. **Layout**: no `meta.requiresAuth`, matching `NotFound.vue`'s existing
   precedent. `App.vue` picks the whole app's layout
   (`LayoutDefault`/`LayoutAuth`) by the VIEWER's own login state, not by
   route — a pre-existing app-wide behavior (confirmed by reading
   `App.vue` directly), not something this diff introduces or changes.
   An anonymous visitor gets `LayoutAuth` (plain Header/Footer shell,
   already used for login/register/forgot-password); a visitor who
   happens to be logged into their OWN unrelated account would see the
   page wrapped in their own dashboard shell — a known pre-existing
   layout-selection quirk, not new here, logged below.
3. **Visit recording**: fires `POST api/me/:email/visit` after a
   successful fetch, fire-and-forget (`.catch(() => {})`, doesn't block
   rendering). This is what actually completes the visit-tracking
   feature — verified end-to-end against the real deployed backend (see
   Command section).
4. **Rich-text (CKEditor) fields — deliberately NOT using `v-html`**:
   confirmed via a real `curl` against the live backend
   (`votan.it@gmail.com`, a real account, credentials from the repo's own
   gitignored `.env` `ACCOUNT_TEST_EMAIL`) that `introduction`,
   `description`, `career`, `careerGoal` are genuine CKEditor-authored
   HTML (e.g. `"<p>I am a Frontend Developer...</p>"`,
   `"<ul><li>Contributed to AiHR...</li></ul>"`). Vue's `{{ }}`
   interpolation escapes this to literal tags rather than rendering
   it — same behavior already shipped in `PagePreview.vue` (issue #55,
   SEALED) and in `ConvertToText`/`ConvertToTruncate`
   (`src/components/convert/part/`, both use `h('span', value)`, which
   Vue treats as escaped text, not raw HTML). Considered switching to
   `v-html` for this new page, but that would introduce a NEW
   unauthenticated stored-XSS surface: unlike `PagePreview.vue` (only the
   account owner, authenticated, ever views their own content —
   effectively self-XSS at most), this page is reachable by anyone with
   the link, so a candidate who crafts raw `<script>`/HTML directly via
   the API (bypassing CKEditor's own toolbar restrictions) could attack
   third-party visitors who open their share link. Matches the same risk
   class already flagged as issue #5 (`Toasts.vue` `v-html`). No
   sanitizer library exists in this project's dependencies, and adding
   one is a bigger, separate decision. Kept plain interpolation — same
   (already-shipped) escaped-tags display limitation as `PagePreview.vue`,
   not a new regression, and NOT a new security surface. Logged below as
   "Noticed, not done."

## Command
```
npm run build
npm run lint
npm run test -- --run
```

## Output
```
$ npm run build
✓ 1362 modules transformed.
...
dist/assets/PagePublicResume-D2dVOBd9.css           1.25 kB │ gzip:   0.44 kB
...
dist/assets/PagePublicResume-lDrCJ98e.js            7.79 kB │ gzip:   2.41 kB
...
✓ built in 5.97s
```
```
$ npm run lint
> resume-vuejs-website@1.8.0 lint
> eslint src --ext .js,.ts,.vue
(exit 0, no output)
```
```
$ npm run test -- --run
 Test Files  1 failed | 12 passed (13)
      Tests  2 failed | 90 passed (92)
```
Both failures are the same pre-existing named `BUG (real, verified...)`
cases in `VeeForm.spec.ts` every recent SEALED node has confirmed
pre-date their own diff. Confirmed here too: `git diff staging --stat --
src/components/veevalidate/` is empty on this branch.

## Manual verification (UI/route diff — no browser-automation tool this
session, same disclosed gap as `issue-55-cv-preview-print`)
1. `npm run dev` → started clean (`VITE v5.3.2 ready in 216 ms`).
2. `curl` on the running dev server for the new module
   (`src/pages/public/PagePublicResume.vue`) → HTTP 200, real compiled ES
   module returned (`import { createHotContext }...`), no compile error.
3. `curl` the hash-route shell (`/#/resume/votan.it@gmail.com`) → HTTP
   200 (SPA shell; hash routing is client-side, so this only confirms the
   server itself serves cleanly, not the rendered DOM — disclosed, not
   claimed as more than it is).
4. **Real backend contract check** against the deployed backend
   (`https://nodejs-resume-api-ts.onrender.com`), using the repo's own
   test account (`votan.it@gmail.com`, from `.env`'s
   `ACCOUNT_TEST_EMAIL`, same account prior sessions already used for
   live verification):
   - `curl .../api/me/votan.it@gmail.com` → real `success:true` payload,
     confirmed every field my template reads (`firstName`, `lastName`,
     `email`, `phone`, `address`, `introduction`, `generalInformation.*`,
     `experiences[]`, `educations[]`, etc.) is actually present in the
     real response shape.
   - `curl -X POST .../api/me/votan.it@gmail.com/visit` → real
     `{"success":true,"message":"Ghi nhận lượt ghé thăm thành công"}` —
     confirms the visit-recording call this page makes actually works
     end-to-end (same verification depth as
     `dashboard-visit-count-integration`'s own precedent).
5. Dev server killed after (`pkill -f vite`), no stray process left
   running.

No local backend running (`.env.development` points at
`localhost:3001`, not started) — the live-backend curl checks above
substitute for it, matching what the sibling `dashboard-visit-count-integration`
node already established as acceptable evidence depth for this class of
diff.

## Acceptance
| Criterion | Evidence |
|---|---|
| Public route, no login required | `src/routers/index.ts` new `/resume/:email` route has no `meta.requiresAuth`, mirrors `NotFound.vue`'s existing precedent |
| Fetches via a public (no-token) endpoint | `_axios({ method:'get', customURL:'api/me/:email' })`, confirmed public by reading backend routing (`src/routers/index.ts` mounts it outside `verifyToken`) and by a real anonymous `curl` returning real data |
| Read-only display, reuses existing display conventions | Template mirrors `PagePreview.vue`'s section layout; no edit controls, no form |
| Private/nonexistent profile handled gracefully | `notFound` state shown on `!res.success`, same wording for both cases (backend itself doesn't distinguish) |
| Backend endpoint's own purpose (visit recording) actually wired | `POST api/me/:email/visit` fired on load, verified end-to-end via real `curl` |
| Build green | `✓ built in 5.97s`, `PagePublicResume` code-split as its own lazy chunk |
| Lint clean | exit 0, no output |
| No regression in tests | `90 passed`, 2 pre-existing `VeeForm.spec.ts` failures unrelated (confirmed `git diff staging --stat -- src/components/veevalidate/` empty) |

## Noticed, not done
1. **CKEditor HTML fields shown as literal escaped tags** — pre-existing
   in `PagePreview.vue` (issue #55, SEALED) and
   `ConvertToText`/`ConvertToTruncate` (`src/components/convert/part/`),
   not introduced here, not fixed here (would touch already-shipped
   files, separate task, and — for the public-page case specifically —
   fixing it via `v-html` needs a real sanitizer decision first, not a
   quick swap). Worth a dedicated follow-up node; candidate for a new row
   in `doctrine/domains/PROJECT.md`'s Traps table.
2. **Layout-by-viewer-login-state, not by-route** — `App.vue` picks
   `LayoutDefault`/`LayoutAuth` globally by `store.isAuthenticated`, not
   per-route. Pre-existing (already affects `NotFound.vue` identically),
   not introduced here. A logged-in visitor opening someone else's
   `/resume/:email` link sees it wrapped in their OWN dashboard shell —
   functionally fine (still read-only, still shows the right data) but
   visually inconsistent with the anonymous-visitor experience. Not
   fixed here — would mean changing `App.vue`'s core layout-selection
   logic, out of scope and bigger blast radius than this task.
3. **`current-page` localStorage quirk** — the router's global
   `beforeEach` writes ANY visited path (except `/`) to
   `localStorage['current-page']`, used to redirect after a future login
   on the same browser. Applies to `/resume/:email` the same as every
   other route already; not new, not fixed here.
4. Dashboard has no UI toggle for `isPublic` yet (issue #56's own
   "Cân nhắc" section suggested this) — the backend field defaults to
   `true` and already works, but there's no way for the candidate to
   turn OFF public sharing from this app. Left out: the issue frames it
   as an optional "consider," not required scope, and it's a separate,
   self-contained diff (`PageAccountSettings.vue`, `useDocument`
   patch to `candidate/update`). Worth its own follow-up node.

## Seal gate
No outward-facing commit/push/merge was done — only local branch +
files. The `curl` calls against the live deployed backend are read
(`GET`) plus one real `POST` to the visit-recording endpoint, on the
repo's own already-used test account, matching the exact verification
depth `dashboard-visit-count-integration`'s SEALED evidence already
established as acceptable without a separate approval pause. Merging
this branch into `staging` still requires `/ship` + operator approval —
not done here.
