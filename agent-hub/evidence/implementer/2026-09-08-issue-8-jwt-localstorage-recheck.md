# 2026-09-08 — issue-8-jwt-localstorage-recheck-20260908

- Worker: implementer
- Version: 0.1.0
- Node: `issue-8-jwt-localstorage-recheck-20260908` (new node per LAI-13 —
  does not edit `issue-8-jwt-localstorage`, `-recheck-20260825`,
  `-recheck-20260830`, or `-recheck-20260902`, all four stay
  `BLOCKED_ON_BACKEND` as-is)
- Task (verbatim): "#8" (operator, via `/todo`)

## Hub bytes before
98977 (root=7714, doctrine=27207, active diagram=37939,
implementer bundle=14963, verifier bundle=11154 — categories per
`/hub-tokens`' "per-session total" formula)

## Branch
None — no code change was made (nothing to branch for; see conclusion).

## Recheck performed
1. Confirmed the anti-pattern is still present in this repo: read
   `src/stores/auth.ts` directly — `localStorage.getItem('token')` /
   `localStorage.setItem('token', val)` (lines 13, 44), same for `user`
   (lines 12, 39). Unchanged since the 2026-09-02 recheck.
2. Checked the sibling backend repo
   (`/Users/_david/Workspace/Project/resume/resume-nodejs-api`) for real
   activity since 2026-09-02 that could unblock this — there IS real
   activity (`git log --oneline -15`, `staging` branch): Docker support
   (`feat(docker): add Dockerfile + docker-compose...`, #114), a prod-port
   fix (`fix(prod): respect LOCAL_PORT + anchor public write paths to
   __dirname`, #115), a release bump to v1.3.0, and several agent-hub/CI
   chores. Also found (via `git log -- src/auth/auth.controller.ts
   src/utils/helper-auth.ts`) an auth-related commit at the boundary of
   the last recheck: `03bcb66 feat(auth): add logout-all endpoint to
   revoke all sessions (#74)`, dated Sep 2 18:23:53 2026 — checked it
   directly rather than assuming the 2026-09-02 note already covered it.
3. Re-checked the specific precondition (backend sets
   `Set-Cookie: ...; HttpOnly; Secure; SameSite=Strict` and stops
   returning the token in the response body):
   - `grep -i "cookie" package.json` in the backend → zero matches (no
     `cookie-parser` dependency).
   - `grep -rn "res\.cookie\|httpOnly\|Set-Cookie" src/` in the backend →
     zero matches anywhere in `src/`, including the new logout-all
     endpoint and Docker-related config.
   - `src/utils/helper-auth.ts:19`'s `req.cookies[fieldName]` read
     fallback is still present, still dead code (no `cookie-parser`
     middleware wired anywhere to populate `req.cookies`).
   - Read `src/auth/auth.controller.ts` directly (`authLogin`,
     `authRefreshToken`): both still return the token via
     `formatReturn(res, { ..., data: ... })` (JSON body only), no
     `res.cookie` call anywhere in the file — confirmed by full read,
     not just grep.
4. Conclusion: the new logout-all-sessions feature adds session
   *revocation* (a blacklist/`sessionRevocation` check), not a new
   *storage* mechanism for the token — it doesn't touch how the token is
   issued or where the client stores it. Docker support and the prod-port
   fix are infra-only, unrelated to auth. The dead `req.cookies` read
   fallback and the missing `cookie-parser`/`res.cookie` wiring are
   byte-for-byte the same state observed on 2026-09-02.

## Conclusion
Same as all four prior findings (2026-08-20, 2026-08-25, 2026-08-30,
2026-09-02): **still blocked on backend**. No frontend diff is possible
without the backend adding real httpOnly-cookie support. Not creating a
fake/cosmetic frontend diff to show activity — that would violate
`SmallestDiff`/honesty over `NORTHSTAR.md`'s "no unproven 'should be
done'" rule. Issue #8 stays OPEN, diagram node stays
`BLOCKED_ON_BACKEND`.

## Command
None run — no code changed, nothing to build/test.

## Acceptance
| Criterion | Evidence |
|---|---|
| Confirmed the anti-pattern still exists (not stale) | `src/stores/auth.ts:12,13,39,44` — `localStorage` get/set of `user`/`token` still present |
| Checked backend for real change since last recheck, not assumed stale | `resume-nodejs-api` `git log --oneline -15` on `staging` — Docker support, prod-port fix, v1.3.0 release, agent-hub chores; specifically checked the one auth-touching commit (`03bcb66`, logout-all endpoint) directly |
| Confirmed the precondition (httpOnly cookie) is still unmet | `grep -i "cookie" package.json` → no match; `grep -rn "res\.cookie\|httpOnly\|Set-Cookie" src/` → no match; `auth.controller.ts` read in full, still returns token in JSON body only |
| No fake/cosmetic diff created | `git status --short` in frontend repo — untouched by this note |

## Noticed, not done
Nothing new outside scope — same dead `req.cookies[fieldName]` fallback
in `helper-auth.ts:19` already logged in prior rechecks, still inert,
still not this repo's (frontend's) code to fix even if it were live.

## Seal gate
No outward-facing action, no diff — nothing to ship. Per `/todo`'s rule
for a `blocked` implementer result: stop immediately, report to the
operator, do not loop, no verifier pass needed (nothing to verify — no
diff, no build claim).
