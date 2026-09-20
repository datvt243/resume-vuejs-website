# 2026-09-20 — issue-8-jwt-localstorage-recheck-20260920

- Worker: implementer
- Version: 0.1.0
- Node: `issue-8-jwt-localstorage-recheck-20260920` (new node per LAI-13 —
  does not edit any of the 6 prior `issue-8-jwt-localstorage*` rows, all
  stay as recorded)
- Task (verbatim): "#8 recheck 2026-09-20 — backend CSRF fix landed:
  resume-nodejs-api#134 closed via commit 54cff07 (PR #140), sameSite
  flipped 'strict'->'none' + double-submit CSRF protection added, but
  only on backend staging (not yet on backend main), and frontend has
  not started its half (no withCredentials in src/services/axios.ts,
  still localStorage-driven, no CSRF header sent anywhere). Record as
  still BLOCKED (backend fix not released to main yet + frontend
  migration not started), queued for follow-up once backend main catches
  up." (operator, relayed from an earlier recheck conversation this same
  session)

## Hub bytes before
133772 (root=12393, doctrine=27207, active diagram=68055,
implementer bundle=14963, verifier bundle=11154 — categories per
`/hub-tokens`'s "per-session total" formula, measured directly with
`wc -c` this session, not copied from a prior note).

## Branch
`chore/issue-8-jwt-localstorage-recheck-20260920`, cut from `staging`
BEFORE writing this note. No `src/` file touched — hub bookkeeping only
(this note + diagram row + worker-runs.log line).

## Recheck performed — the blocker's shape changed again since 2026-09-19
1. Confirmed the anti-pattern is still present in this repo:
   `src/stores/auth.ts` still does `localStorage.getItem('token')` /
   `localStorage.setItem('token', val)`, same for `user`. Unchanged.
2. Confirmed `src/services/axios.ts` still has no `withCredentials: true`
   anywhere and still builds every request's `Authorization` header from
   `localStorage.getItem('token')`. No CSRF header is sent from anywhere
   in `src/`. Frontend has not started its half of the migration.
3. Checked the sibling backend repo (`resume-nodejs-api`) for activity
   since the 2026-09-19 recheck, which had just filed
   `resume-nodejs-api#134` (CSRF/SameSite=None follow-up) as still
   unimplemented. This time it IS implemented: `git show 54cff07` (merged
   via PR #140, closes #134) — read the real diff, not just the commit
   title:
   - `src/utils/authCookies.ts`: `sameSite` flipped from `'strict'` to
     `'none'` (the actual cross-site fix); now also issues/clears a
     non-httpOnly `csrfToken` cookie alongside the auth cookies.
   - `src/utils/csrf.ts` (new): CSRF token generation + cookie helpers +
     `requiresCsrfCheck`/`isCsrfTokenValid`.
   - `src/middlewares/verifyToken.middleware.ts`: now rejects a
     state-changing request authenticated purely via cookie when the CSRF
     header is missing/mismatched — covers every route already behind
     `verifyToken`.
   - `src/middlewares/csrf.middleware.ts` (new): standalone `verifyCsrf`
     for `POST /auth/refresh` and `POST /auth/logout`, which bypass
     `verifyToken`.
   - New `ErrorCode.CSRF_TOKEN_INVALID`; 2 new test suites
     (`utils/csrf.test.ts`, `middlewares/csrf.test.ts`) plus updates to
     `authCookies.test.ts`/`verifyToken.test.ts`. Commit message states
     `npm test`: 21/21 suites, 121/121 tests; `npm run build`: clean —
     read from the backend's own commit message, not independently
     re-run from this hub (out of scope — this hub only runs frontend
     commands per `doctrine/MEMORY.md`).
   This resolves the exact caveat the 2026-09-19 recheck flagged
   (`sameSite: 'strict'` never attaching cross-site between
   `datvt243.github.io` and `nodejs-resume-api-ts.onrender.com`) with a
   real CSRF mitigation alongside, not just a naive flip to `'none'`.
4. **New blocker found, not just "still missing": release gap.** Checked
   whether `54cff07` reached backend `main`, not just backend `staging`:
   `git merge-base --is-ancestor 54cff07 main` in the backend repo →
   `NO not on main yet`. Backend `main` (`198c9cf`, v1.1.1) is far behind
   backend `staging` (which already has #132 application-tracker, #134
   CSRF, #135/#136 fixes merged) — the CSRF fix is real but not yet
   deployed to the production API this frontend actually calls
   (`nodejs-resume-api-ts.onrender.com`, per `doctrine/MEMORY.md`).
   Building the frontend's `withCredentials`/CSRF-header/`localStorage`
   removal now would target a cookie behavior that isn't live in
   production yet — would break login for real users until the backend
   release catches up.
5. Frontend readiness gap (independent of the above): even once backend
   `main` catches up, `src/services/axios.ts` needs `withCredentials:
   true` added, a CSRF header attached to state-changing requests (read
   from the new non-httpOnly `csrfToken` cookie), and `src/stores/auth.ts`
   migrated off `localStorage` — none of that exists yet, confirmed in
   step 2. Not a fake/cosmetic diff opportunity: doing only one piece
   (e.g. `withCredentials` alone) without the CSRF header would just
   trade the current XSS-token-theft risk for CSRF-rejected requests,
   with no net security or functionality gain until backend `main` ships
   AND the header-sending piece lands together.

## Operator decision
Operator explicitly said "record the recheck finding and leave it
queued" — no new backend issue needed (the real fix already exists at
`resume-nodejs-api#134`, closed), no frontend diff attempted. This note
is purely documentation of the state change (blocker's shape moved from
"no fix exists" to "fix exists but not deployed to production + frontend
migration not started").

## Conclusion
**Still blocked, but closer than any prior recheck.** The backend-side
fix is code-complete and merged (not just proposed) — that's new. What
remains: (a) backend `main` needs a release picking up `54cff07`
(outside this hub's control — flagged for a future backend-side check,
not something this repo's `/release` can trigger), and (b) the frontend
migration itself (`withCredentials`, CSRF header, drop `localStorage`)
hasn't been started. No diff created here (would be a fake/premature diff
per the same reasoning applied in every prior recheck) — implementer
reports `blocked`, no verifier pass needed (nothing to verify — no diff,
no build claim). Issue #8 stays OPEN.

## Command
None run — no frontend code changed, nothing to build/test.

## Acceptance
| Criterion | Evidence |
|---|---|
| Confirmed the anti-pattern still exists (not stale) | `src/stores/auth.ts` — `localStorage` get/set of `token`/`user` still present |
| Confirmed frontend readiness gap unchanged | `src/services/axios.ts` — no `withCredentials`, still `localStorage`-driven, no CSRF header sent |
| Checked backend for real change since last recheck, read the actual diff not just the commit title | `54cff07` full diff read: `authCookies.ts`, `csrf.ts` (new), `csrf.middleware.ts` (new), `verifyToken.middleware.ts`, `AppError.ts` |
| Verified whether the fix actually reached production, not just backend `staging` | `git merge-base --is-ancestor 54cff07 main` in `resume-nodejs-api` → not an ancestor, confirmed backend `main` still at v1.1.1 |
| No fake/cosmetic frontend diff created | `git status --short` in this repo untouched by this note (only hub bookkeeping on this branch) |
| Operator decision recorded, not unilaterally chosen | Operator explicitly requested "record the recheck finding and leave it queued" |

## Noticed, not done
- Backend `main` release cadence is far behind backend `staging` (v1.1.1
  vs. staging's #140) — worth a future check on whether the backend repo
  has its own `/release`-equivalent gate, but that repo is out of this
  hub's `reads`/`writes` scope beyond read-only `git log`/`gh` checks.
- Once backend `main` ships `54cff07`, the frontend migration itself
  (`withCredentials`, CSRF header plumbing in `src/services/axios.ts`,
  removing `localStorage` from `src/stores/auth.ts`) is a real, scoped
  piece of work for a future `/worker implementer "#8"` pass — not
  attempted here per the operator's explicit "leave it queued" choice.

## Seal gate
No outward-facing action taken this session beyond this branch's own hub
bookkeeping commit (still pending `/ship`, per `CLAUDE.md`'s "merging to
`staging` is outward-facing" rule — not done automatically here). No
GitHub issue filed, no code changed, no build run.
