# 2026-09-20 — issue-8-jwt-localstorage-unblocked-20260920

- Worker: implementer
- Version: 0.1.0
- Node: `issue-8-jwt-localstorage-unblocked-20260920` (new node per LAI-13
  — does not edit any of the 7 prior `issue-8-jwt-localstorage*` rows,
  including this same session's own
  `issue-8-jwt-localstorage-recheck-20260920`)
- Task (verbatim): "check các issue còn lại có gì mới không" (operator),
  found real backend activity during that sweep, operator then explicitly
  said "ghi lại vào agent-hub trước" (record into agent-hub first, before
  implementing)

## Hub bytes before
135749 (root=12393, doctrine=27207, active diagram=70032, implementer
bundle=14963, verifier bundle=11154 — categories per `/hub-tokens`'s
"per-session total" formula, same measurement used for the
`issue-116-multi-profile-unblocked-20260920` node written in the same
branch/session — both share this number since no other hub file changed
between the two).

## Branch
`chore/issue-8-and-116-unblocked-recheck-20260920`, cut from `staging`
BEFORE writing this note. No `src/` file touched — hub bookkeeping only.
Bundled with the `issue-116-multi-profile` unblock finding in the same
branch/commit — both discovered in the same recheck sweep this session.

## What changed since the earlier-today recheck
This SAME session already wrote
`issue-8-jwt-localstorage-recheck-20260920`
(`evidence/implementer/2026-09-20-issue-8-jwt-localstorage-recheck.md`,
already shipped via PR #145) concluding: the CSRF/SameSite=None fix
(`resume-nodejs-api#134`, commit `54cff07`) was real and merged, but only
on backend `staging` — `git merge-base --is-ancestor 54cff07 main`
(against a STALE local `main` ref, not re-fetched) returned "not an
ancestor" at that time.

During this later "check remaining issues" sweep, re-ran the same check
after a fresh `git fetch origin`:
1. `git --no-pager log --oneline -5 origin/staging` (backend) showed new
   activity past the earlier check: `b9fee46 Merge pull request #144 from
   datvt243/release/v1.7.0`, `9c717a3 chore(release): bump version to
   v1.7.0`, on top of the already-known `6d15e4a`/`ccb58bf` commits.
2. `git merge-base --is-ancestor 54cff07 origin/main` → **YES** (this
   time checked against `origin/main` after a fresh fetch, not the stale
   local `main` ref that caused the earlier false negative — the earlier
   note's "not on main yet" conclusion was correct AT THE TIME it was
   written; a real release happened in the gap between the two checks
   this same session).
3. `git rev-parse main origin/main` confirmed the discrepancy directly:
   local `main` was still `198c9cf` (v1.1.1, badly stale, never fetched
   this session before now), `origin/main` is `b274fd4` (v1.7.0) —
   documented here as a process note, not a defect in the earlier note
   (that note's conclusion matched the real state of `origin/main` at
   the time it ran; the state has since moved).
4. The CSRF fix's actual content is unchanged from the earlier note's
   description (`sameSite: 'none'` + double-submit CSRF token +
   `verifyToken` rejecting cookie-auth'd state-changing requests missing
   the CSRF header) — not re-read here since nothing about the diff
   itself changed, only its release status.

## Frontend readiness — still unchanged
Re-confirmed (same as the earlier-today note): `src/services/axios.ts`
still has no `withCredentials: true` anywhere, still builds
`Authorization` from `localStorage.getItem('token')`, no CSRF header sent
from anywhere in `src/`; `src/stores/auth.ts` still does
`localStorage.getItem`/`setItem('token'/'user')`. Frontend migration has
not started.

## Operator decision
Operator explicitly said "ghi lại vào agent-hub trước" (record into
agent-hub first) — record this release-status change as its own node
(per LAI-13, not editing the earlier-today node whose "not on main yet"
conclusion is now stale), do not start the frontend migration in the
same pass.

## Conclusion
**Unblocked on the backend side.** The CSRF/SameSite=None fix is now live
on backend `main` (production branch), not just `staging` — the
release-gap blocker flagged by this session's own earlier recheck no
longer applies. What remains is purely the frontend migration:
`withCredentials: true` in `src/services/axios.ts`, reading the
non-httpOnly `csrfToken` cookie and attaching it as a header on
state-changing requests, and removing the `localStorage` token/user
storage from `src/stores/auth.ts` — a real, scoped, buildable piece of
work now, not still blocked. Status set to `IN_PROGRESS` (no longer
`BLOCKED_ON_BACKEND`, not yet `SEALED`), matching LAI-13's monotonic
ratchet. No diff created in this pass per the operator's explicit
record-first request. Issue #8 stays OPEN on GitHub (no code shipped
yet, nothing to close).

## Command
None run — no frontend code changed, nothing to build/test.

## Acceptance
| Criterion | Evidence |
|---|---|
| Re-checked release status rather than trusting this same session's earlier (now-stale) conclusion | `git fetch origin` + `git merge-base --is-ancestor 54cff07 origin/main` → YES, against a fresh fetch, not the stale local `main` ref used earlier |
| Disclosed the earlier note's local-ref staleness as a process note, not silently corrected | See "What changed" section, point 3 |
| Confirmed frontend readiness gap unchanged since the earlier-today check | `src/services/axios.ts` — no `withCredentials`, still `localStorage`-driven, no CSRF header sent |
| No fake/premature frontend diff created | `git status --short` in this repo shows only hub bookkeeping on this branch |
| Operator decision recorded, not unilaterally chosen | Operator explicitly said "ghi lại vào agent-hub trước" |

## Noticed, not done
- Whether Render (the actual production host) has redeployed from
  backend `main` post-v1.7.0 is not verifiable from git history alone —
  same caveat as the `issue-116-multi-profile-unblocked-20260920` node
  written in this same branch; flagged for whoever picks up the real
  frontend migration to sanity-check with a live request first.
- The actual frontend migration (`withCredentials`, CSRF header
  plumbing, dropping `localStorage`) is unscoped in detail here — left
  for a future `/worker implementer "#8"` pass, per the operator's
  explicit record-first request.

## Seal gate
No outward-facing action taken this session beyond this branch's own hub
bookkeeping commit (pending `/ship`). No GitHub issue filed, no code
changed, no build run.
