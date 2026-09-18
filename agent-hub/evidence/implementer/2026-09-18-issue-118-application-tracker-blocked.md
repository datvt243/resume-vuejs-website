# 2026-09-18 — issue-118-application-tracker-blocked (blocked)

- Worker: implementer
- Version: 0.1.0
- Node: `issue-118-application-tracker-blocked` (new node)
- Task (verbatim): "#118" (operator, via "Pick up the next issue — #118 or #122")

## Hub bytes before
116761 (root/doctrine/active-diagram/implementer-bundle/verifier-bundle,
per `/hub-tokens`' "per-session total" formula).

## Branch
`chore/issue-118-application-tracker-blocked`, cut from `staging` BEFORE
writing this note (learned from this same session's earlier process
slip on the `issue-120` recheck node — branch first even for a
diff-less/blocked outcome).

## Also considered #122, ruled out first
[ENHANCEMENT] "Gợi ý nội dung CV bằng AI (tối ưu ATS)" explicitly
self-flags in its own body: "Cần thảo luận thêm trước khi lên kế hoạch —
không tự triển khai chỉ từ issue này" (needs more discussion before
planning — do not implement from this issue alone). It also requires a
new backend AI-proxy endpoint, an unresolved cost/privacy decision (flags
issue #8's still-open JWT-localStorage gap as a reason to be cautious
about a new sensitive-data flow), and is explicitly "Large, depends on
business/cost decisions." Not picked up — this is a product decision for
the operator, not something to implement or even scope from the issue
text alone.

## Investigation (issue #118)
1. Read GitHub issue #118 (`gh issue view 118`,
   `datvt243/resume-vuejs-website`): "[ENHANCEMENT] Application tracker —
   theo dõi nơi đã nộp CV". Scope note explicitly names the intended
   implementation: `application.model.ts` (company, position,
   appliedDate, status enum, note, job-posting link) + `PageApplication.vue`
   "theo đúng pattern hiện có (`useCandidate` + `useDocument` + `VeeForm`,
   giống Education/Experience)" + route `/dashboard/application`. Its own
   estimate ("~4-8 giờ, theo đúng pattern CRUD sẵn có") assumes the
   backend collection already exists or is trivial, without flagging a
   backend dependency the way issue #120 did.
2. Checked the sibling backend repo
   (`/Users/_david/Workspace/Project/resume/resume-nodejs-api`) directly,
   same cross-repo-check habit as prior nodes (issue-8/issue-117/issue-120):
   - `ls src/models/` → `award`, `candidate`, `certificate`, `education`,
     `experience`, `generalInformation`, `project`, `reference`, `visit`
     — no `application` model.
   - `ls src/routers/api/v1/` → `auth`, `award`, `candidate`,
     `certificate`, `education`, `experience`, `generalInformation`,
     `project`, `reference` — no `application` route.
   - `grep -n "APPLICATION" src/types/base.type.ts` → not present in the
     `Collections` enum (only `EDUCATION = 'educations'` and its
     siblings).
   - `gh issue list --repo datvt243/resume-nodejs-api --state all
     --search "application OR tracker OR job"` → 0 results — no backend
     issue tracked this either, before this session.
3. Conclusion: `useDocument({ collection: 'application' })` would call
   `api/v1/application/...`, which does not exist server-side —
   confirmed the same class of gap as `issue-120`
   (`issue-120-import-cv-pdf-linkedin` node), not assumed.
4. Considered a local-only (`localStorage`) alternative, same shape as
   `issue-57-manual-reorder`'s workaround, and rejected it for THIS
   feature: issue #57 was a low-stakes UI preference (item display
   order) where losing it on a cleared browser is a minor inconvenience.
   Application-tracking records (which companies, what status, notes) are
   real user data the person is actively relying on to manage their job
   search — losing it to a cleared cache/different device is a much
   bigger loss than a stale sort order, and the issue's own text
   explicitly names `useDocument` (the backend-synced composable), not a
   local-only pattern, as the intended shape. Building a local-only
   stand-in would silently misrepresent the feature's durability and
   deviate from what was actually asked.
5. Per NORTHSTAR's "no unproven 'should be done'" + `SmallestDiff`, did
   not stub a frontend page with nothing real to call.

## Operator decision
Presented 3 options via `AskUserQuestion`: (a) file a backend issue +
mark blocked here, (b) build a local-only substitute deviating from the
issue's stated pattern, (c) mark blocked without filing anything.
Operator chose (a).

## Outward-facing action taken (per operator's explicit choice)
Filed `datvt243/resume-nodejs-api#132` — "Application-tracker collection
(CRUD for job applications, matches Education/Experience pattern)".
Concrete proposal: new `src/models/application.model.ts` (Mongoose,
mirrors `education.model.ts`'s shape/soft-delete convention),
`src/candidate_profile/application/application.validate.ts` (Joi,
mirrors `education.validate.ts`), matching controller + route file
(`GET /`, `POST /create`, `PUT /update`, `DELETE /delete/:id`, `POST
/restore/:id` via `BaseController`, same as `education.route.ts`), plus
a new `APPLICATION = 'applications'` entry in the `Collections` enum.
This is filing an issue only — no backend code was written (out of this
hub's scope; the backend repo has its own governance).

## Conclusion
**Blocked on backend.** The feature requires a NEW backend collection
that does not exist. A tracking issue now exists
(`resume-nodejs-api#132`). Issue #118 stays OPEN on the frontend repo,
this node is `BLOCKED_ON_BACKEND`. Revisit once #132 lands.

## Command
None run — no frontend code changed, nothing to build.

## Acceptance
| Criterion | Evidence |
|---|---|
| Confirmed the backend gap directly, not assumed | `ls src/models/`, `ls src/routers/api/v1/`, `grep -n "APPLICATION" src/types/base.type.ts` — all empty for `application` |
| Checked for a pre-existing backend issue before filing a new one | `gh issue list --repo datvt243/resume-nodejs-api --state all --search "application OR tracker OR job"` — 0 results |
| Considered the local-only alternative explicitly, with reasoning for rejecting it | See "Investigation" step 4 above |
| Operator decision recorded, not unilaterally chosen | `AskUserQuestion` — operator picked "file backend issue + mark blocked" |
| No fake/cosmetic frontend diff created | `git status --short` in the frontend repo untouched by this note (only hub bookkeeping) |
| #122 correctly ruled out with a citable reason | Issue #122's own body: "Cần thảo luận thêm trước khi lên kế hoạch — không tự triển khai chỉ từ issue này" |

## Noticed, not done
- Backend issue #132 itself is unassigned/unimplemented — this session
  did not touch the backend repo's code (different repo, different
  hub/governance).

## Seal gate
Filing a GitHub issue on a sibling repo is an outward-facing action —
done only after explicit operator approval via `AskUserQuestion` (see
"Operator decision" above), not unilaterally. No diff in THIS repo, no
commit/push/merge here beyond this branch's hub bookkeeping (still
pending `/ship`). Per `/todo`'s rule for a `blocked` implementer result:
no verifier pass needed (nothing to verify — no diff, no build claim).
