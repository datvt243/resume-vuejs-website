# 2026-09-19 — issue-8-jwt-localstorage-recheck-20260919

- Worker: implementer
- Version: 0.1.0
- Node: `issue-8-jwt-localstorage-recheck-20260919` (new node per LAI-13 —
  does not edit any of the 5 prior `issue-8-jwt-localstorage*` rows, all
  stay `BLOCKED_ON_BACKEND` as-is)
- Task (verbatim): "Check on issue #8's JWT/cookie blocker" (operator)

## Hub bytes before
120555 (root/doctrine/active-diagram/implementer-bundle/verifier-bundle,
per `/hub-tokens`' "per-session total" formula).

## Branch
`chore/issue-8-jwt-localstorage-recheck-20260919`, cut from `staging`
BEFORE writing this note.

## Recheck performed — real progress found, but still not usable end-to-end
1. Confirmed the anti-pattern is still present in this repo: `src/stores/auth.ts`
   still does `localStorage.getItem('token')`/`localStorage.setItem('token', val)`,
   same for `user`. Unchanged.
2. Checked the sibling backend repo (`resume-nodejs-api`) for activity
   since the last recheck (2026-09-08) — this time there IS a directly
   relevant commit: `e3d2297 feat(auth): httpOnly cookie support for JWT
   auth (#119)` (merged via PR #126, 2026-09-18), backend issue #119 now
   CLOSED. Read the real diff, not just the commit message:
   - `src/utils/authCookies.ts` (new): `setAuthCookies`/`clearAuthCookies`,
     options `{ httpOnly: true, secure: true, sameSite: 'strict', path: '/' }`.
   - `src/auth/auth.controller.ts`: `authLogin`/`authRefreshToken` now
     call `setAuthCookies` alongside the EXISTING response-body
     `token`/`tokenRefresh` (explicitly "dual, transitional" per the
     commit) — nothing removed from the JSON response yet.
     `authLogout`/`authLogoutAll` call `clearAuthCookies`.
   - `cookie-parser` added + wired in `src/server.ts` before routes.
   - `src/config/cors.config.ts`: `origin: '*'` replaced with a
     `CORS_ORIGIN`-driven allow-list + `credentials: true` (required for
     cookies to be usable cross-origin at all) — fails closed (`false`)
     in production when `CORS_ORIGIN` is unset, reflects caller origin in
     dev.
3. **Real blocker found, not just "still missing":** read the backend's
   OWN evidence note for this change
   (`resume-nodejs-api/agent-hub/evidence/implementer/2026-09-17/add-httponly-cookie-jwt-auth-diff.md`,
   "Noticed, not done" section) — the implementer explicitly flagged:
   "if `resume-vuejs-website` and this API are ever deployed on different
   eTLD+1 domains..., `sameSite: 'strict'` will prevent the browser from
   ever sending the cookie cross-site, and the frontend integration will
   not work at all." This caveat applies DIRECTLY to this app's real
   deployment: frontend on GitHub Pages (`datvt243.github.io`), backend
   on Render (`nodejs-resume-api-ts.onrender.com`) — confirmed different
   domains/sites. A `SameSite=Strict` cookie is never attached to a
   cross-site `fetch`/XHR request by the browser, independent of any
   CORS `credentials`/allow-list configuration — CORS and `SameSite` are
   separate, both-must-pass browser checks.
4. Confirmed the frontend side is nowhere close to ready to consume even
   a working cookie: `src/services/axios.ts` has no `withCredentials: true`
   anywhere, and still builds every request's `Authorization` header from
   `localStorage.getItem('token')`. Migrating would ALSO need this
   frontend change, not just a backend one.
5. Checked for a pre-existing backend issue tracking the SameSite/CSRF
   fix the implementer's own note recommended (`gh issue list --repo
   datvt243/resume-nodejs-api --state all --search "CSRF OR SameSite OR
   csrf"`) → only backend issue #119 itself (now closed) matched — no
   dedicated CSRF/SameSite follow-up existed yet.

## Operator decision
Presented the finding + 2 options via `AskUserQuestion`: (a) file a
backend CSRF/SameSite issue + keep this node blocked, (b) just record the
finding, file nothing. Operator chose (a).

## Outward-facing action taken (per operator's explicit choice)
Filed `datvt243/resume-nodejs-api#134` — "CSRF protection for httpOnly
auth cookies + SameSite=None (cross-site cookie doesn't reach the
deployed frontend)". Proposal: flip `sameSite` from `'strict'` to
`'none'` in `authCookies.ts` (requires real CSRF protection first/
alongside — a double-submit cookie or per-session CSRF token, since
`SameSite=None` re-opens the CSRF vector `Strict` was incidentally
blocking); confirm `CORS_ORIGIN` gets set to the real production
frontend origin on Render (infra config, not code — currently unverified
from either repo); once that lands, the frontend can add `withCredentials: true`
and drop `localStorage`. Referenced the backend implementer's own
suggested node name (`add-csrf-protection-auth-cookies`) as a starting
point. This is filing an issue only — no backend code was written (out
of this hub's scope).

## Conclusion
**Still blocked — but the shape of the blocker changed.** Cookie support
now exists server-side (real progress since the last 5 rechecks), but
it's unusable from this app's actual cross-site deployment as currently
configured (`sameSite: 'strict'`), and the frontend hasn't started its
half of the migration either (`withCredentials`, dropping `localStorage`).
A tracking issue now exists for the remaining backend piece
(`resume-nodejs-api#134`). Issue #8 stays OPEN, this node is
`BLOCKED_ON_BACKEND`. Not creating a fake/cosmetic frontend diff (adding
`withCredentials: true` now would do nothing useful — the cookie still
wouldn't be sent, and removing `localStorage` now would break login in
production) — that would violate `SmallestDiff`/honesty over
`NORTHSTAR.md`'s "no unproven 'should be done'" rule.

## Command
None run — no frontend code changed, nothing to build/test.

## Acceptance
| Criterion | Evidence |
|---|---|
| Confirmed the anti-pattern still exists (not stale) | `src/stores/auth.ts` — `localStorage` get/set of `token`/`user` still present |
| Checked backend for real change since last recheck, read the actual diff not just the commit title | `e3d2297` full diff read: `authCookies.ts`, `auth.controller.ts`, `cors.config.ts`, `server.ts` |
| Did not stop at "cookie support now exists" — verified whether it actually WORKS for this app's real topology | Cross-checked `sameSite: 'strict'` against the app's real deployment (GitHub Pages frontend vs Render backend, confirmed different sites) and against the backend's own evidence note's caveat |
| Confirmed the frontend's own readiness gap too | `src/services/axios.ts` — no `withCredentials`, still `localStorage`-driven |
| Checked for a pre-existing backend issue before filing a new one | `gh issue list --repo datvt243/resume-nodejs-api --state all --search "CSRF OR SameSite OR csrf"` — only #119 itself (closed) |
| Operator decision recorded, not unilaterally chosen | `AskUserQuestion` — operator picked "file backend issue + mark blocked" |
| No fake/cosmetic frontend diff created | `git status --short` in the frontend repo untouched by this note (only hub bookkeeping) |

## Noticed, not done
- Backend issue #134 itself is unassigned/unimplemented — this session
  did not touch the backend repo's code.
- Production `CORS_ORIGIN` env var state on Render is unverified from
  either repo — flagged in the filed issue, not something this hub can
  check directly.

## Seal gate
Filing a GitHub issue on a sibling repo is an outward-facing action —
done only after explicit operator approval via `AskUserQuestion`. No
diff in THIS repo, no commit/push/merge here beyond this branch's hub
bookkeeping (still pending `/ship`). No verifier pass needed (nothing to
verify — no diff, no build claim).
