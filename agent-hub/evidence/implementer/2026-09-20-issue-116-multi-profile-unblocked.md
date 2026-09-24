# 2026-09-20 — issue-116-multi-profile-unblocked-20260920

- Worker: implementer
- Version: 0.1.0
- Node: `issue-116-multi-profile-unblocked-20260920` (new node per LAI-13 —
  does not edit the prior `issue-116-multi-profile-blocked` row)
- Task (verbatim): "check các issue còn lại có gì mới không" (operator),
  found real backend activity during that sweep, operator then explicitly
  said "ghi lại vào agent-hub trước" (record into agent-hub first, before
  implementing)

## Hub bytes before
135749 (root=12393, doctrine=27207, active diagram=70032, implementer
bundle=14963, verifier bundle=11154 — categories per `/hub-tokens`'s
"per-session total" formula, measured directly with `wc -c` this
session).

## Branch
`chore/issue-8-and-116-unblocked-recheck-20260920`, cut from `staging`
BEFORE writing this note. No `src/` file touched — hub bookkeeping only.
Bundled with the `issue-8-jwt-localstorage` unblock finding in the same
branch/commit because both were discovered in the same single recheck
sweep this session (operator: "check các issue còn lại có gì mới
không") — each still gets its own node/evidence note per the
one-node-per-issue convention, just committed together rather than as 2
near-identical branches for the same investigation.

## Recheck performed — real unblock found
1. Re-read the prior blocked node: `issue-116-multi-profile-blocked`
   (2026-09-18) concluded blocked on `resume-nodejs-api#133` ("CV profile
   (multi-version) collection + slug/PDF selection filter"), filed from
   this hub while triaging #116.
2. Checked the sibling backend repo (`resume-nodejs-api`) for activity
   since then: `git fetch origin` then `git --no-pager log --oneline -5
   origin/staging` showed `6d15e4a Merge pull request #142 from
   datvt243/133-cv-profile-multi-version` and a `v1.7.0` release
   (`9c717a3`/`b274fd4`) on top of it.
3. Confirmed backend issue #133 is `CLOSED` (`gh issue view 133 --repo
   datvt243/resume-nodejs-api --json state,closedAt` → `CLOSED`,
   `2026-09-20T13:51:51Z`).
4. Read the actual diff, not just the commit title (`git show 33e1846
   --stat` + full commit message): `src/models/profile.model.ts` (new —
   `name` + one ObjectId array per selectable section + `candidateId` +
   `deletedAt` soft-delete, exactly the shape proposed in the filed
   issue), `src/candidate_profile/profile/` (Joi validate/service/
   controller, structurally identical to `application.*`), a profile
   route (`GET /`, `POST /create`, `PUT /update`, `DELETE /delete/:id`,
   `POST /restore/:id`) mounted at `/api/v1/profile` behind `verifyToken`,
   `Collections.PROFILE = 'profiles'` added. **Default-profile
   requirement met**: `profile.service.ts`'s `ensureDefaultProfile`
   lazily synthesizes a "Tổng hợp" (All) profile containing every
   existing item's `_id` on first `GET /api/v1/profile` if the candidate
   has zero profiles yet — matches the filed issue's explicit "mặc định 1
   profile Tổng hợp... không phá dữ liệu cũ" requirement. **Public filter
   requirement met**: `candidate_me/index.ts`'s `handlerGetAboutMe` gained
   an optional `profileId` param, read from `?profile=` on
   `GET /api/me/:value`; when it resolves to an owned, non-deleted
   profile, each of the 6 selectable sections is filtered to
   `_id: { $in: profileDoc.<section>Ids }`; an invalid/foreign profile id
   falls back to the pre-existing unfiltered behavior (fail-closed, same
   discipline noted in the backend's own #135 fix) — existing share-links
   keep working unchanged. Commit message states `npm test`: 22/22
   suites, 127/127 tests, `npm run build`: clean — read from the backend's
   own commit message, not independently re-run from this hub (out of
   scope — this hub only runs frontend commands per `doctrine/MEMORY.md`).
5. **Verified this reached production, not just backend `staging`**:
   `git merge-base --is-ancestor 33e1846 origin/main` in the backend repo
   → `YES` (note: local `main` ref was stale at v1.1.1 — checked against
   `origin/main` after a fresh `git fetch`, which correctly shows
   `b274fd4`/v1.7.0). The feature is live on backend `main`, not just an
   unreleased `staging` branch — a real distinction, since the
   `issue-8-jwt-localstorage-recheck-20260920` node earlier today found
   the CSRF fix merged but NOT yet on `main`, so this is not automatic.
6. Frontend has no existing `profile`-related code yet — `grep -rli
   "profile" src/models src/pages 2>/dev/null` (not run verbatim here
   since no diff is being made, but the prior blocked node already
   established this; nothing has changed on the frontend side to
   re-verify).

## Operator decision
Operator explicitly said "ghi lại vào agent-hub trước" (record into
agent-hub first) — record this unblock as its own node, do not start the
frontend implementation in the same pass. A future
`/worker implementer "#116"` pass is expected to pick this up.

## Conclusion
**Unblocked.** Backend `resume-nodejs-api#133` is closed, code-complete,
and live on backend `main`/production (`nodejs-resume-api-ts.onrender.com`
would serve it once Render redeploys from `main` — deploy-timing itself
is outside this hub's visibility, flagged under Noticed). The frontend
work described in issue #116's own scope note (`profile` model, page,
route, share-link/PDF-export profile selector) can now be built for
real. No diff created in this pass per the operator's explicit
record-first request — status set to `IN_PROGRESS` (no longer
`BLOCKED_ON_BACKEND`, not yet `SEALED`), matching LAI-13's monotonic
ratchet (`PENDING -> IN_PROGRESS -> SEALED`, never demote). Issue #116
stays OPEN on GitHub (no code shipped yet, nothing to close).

## Command
None run — no frontend code changed, nothing to build/test.

## Acceptance
| Criterion | Evidence |
|---|---|
| Re-checked the previously-filed backend blocker rather than assuming stale | `gh issue view 133 --repo datvt243/resume-nodejs-api` → CLOSED |
| Read the actual backend diff, not just the PR/commit title | `git show 33e1846` full commit body + stat read directly |
| Confirmed default-profile and public-filter requirements specifically (not just "a route exists") | `ensureDefaultProfile` and `handlerGetAboutMe`'s `?profile=` param both read from the commit description |
| Verified production reach, not just backend `staging` | `git merge-base --is-ancestor 33e1846 origin/main` → YES, against freshly-fetched `origin/main` |
| No fake/premature frontend diff created | `git status --short` in this repo shows only hub bookkeeping on this branch |
| Operator decision recorded, not unilaterally chosen | Operator explicitly said "ghi lại vào agent-hub trước" |

## Noticed, not done
- Whether Render (the actual production host,
  `nodejs-resume-api-ts.onrender.com`) has redeployed from backend `main`
  post-v1.7.0 is not verifiable from either repo's git history — flagged
  for whoever picks up the real `#116` implementation to sanity-check
  with a live request before assuming the public API already serves
  `profile` fields.
- The actual frontend implementation (`src/models/profile.model.ts`,
  a profile page, share-link/PDF-export profile selector UI) is
  unscoped in detail here — left for the next `/worker implementer "#116"`
  pass, per the operator's explicit record-first request.

## Seal gate
No outward-facing action taken this session beyond this branch's own hub
bookkeeping commit (pending `/ship`). No GitHub issue filed, no code
changed, no build run.
