# 2026-09-25 — issue-8-jwt-httponly-cookie-migration (verdict)

- Worker: verifier
- Node: `issue-8-jwt-httponly-cookie-migration`
- New PM status: SEALED

## Isolation proof
Launched as a brand-new subagent whose entire task prompt began "You are
becoming the VERIFIER worker for the resume-vuejs-website agent-hub... This
is a fresh session with no memory of any prior conversation — that's
required, because the implementer must never verify their own work
(NeverVerifyOwnWork rule)." Before this session's first tool call, nothing
about the diff, the branch, or the evidence note existed in context — every
fact used below (note content, node text, diff hunks, grep/test/lint/build
output) was independently fetched in this session via Read/Bash, not
recalled from a prior implementer pass. No implementer-role tool calls
(writing `src/*` edits) occurred in this session before this verify pass.

## Reasoning
Read the note first (`evidence/implementer/2026-09-25-issue-8-jwt-httponly-cookie-migration.md`),
then the diagram node (line 216 of `dev-loop.prime-mermaid.md`), then
independently opened the actual diff and re-ran every command — per the
task's explicit instruction that this is exactly the class of
security-sensitive change where `EDIT_UNVERIFIED` matters most.

- **Branch / `NoMainEdit`**: `git branch --show-current` → `fix/issue-8-jwt-httponly-cookie-migration`.
  `git merge-base staging fix/issue-8-jwt-httponly-cookie-migration` ==
  `git rev-parse staging` (`7cdfffe`) — cut cleanly from `staging`, one
  commit ahead (`6819fa1`). Not `main`, not `staging`. Matches the note's
  `## Branch` line.
- **`withCredentials: true`**: confirmed directly in the diff —
  `src/services/axios.ts`: `axios.create({ baseURL: API, withCredentials: true })`.
- **CSRF header, recomputed on retry (not stale)**: confirmed in the diff —
  a request interceptor on `instanceAxios` attaches `getCsrfHeader()` for
  every non-`SAFE_METHODS` (`get/head/options`) dispatch. The 401 handler's
  retry path calls `return instanceAxios(originalRequest)`, which re-enters
  the same interceptor chain — so the header is recomputed at retry time,
  not carried over stale from the original failed request. The refresh
  call itself (`axios.post(...auth/refresh...)`) also passes a freshly
  computed `getCsrfHeader()` plus `withCredentials: true`.
- **`localStorage` token/tokenRefresh removed**: `src/stores/auth.ts` diff
  removes `_token`/`_refreshToken` refs and all `localStorage`
  get/set/removeItem calls for `token`/`tokenRefresh`; `isAuthenticated`
  now derives from `!!_user?.email`. Independently ran
  `grep -rn "getToken\|setToken\|getRefreshToken\|setRefreshToken" src/`
  and `grep -rn "localStorage.*['\"]token" src/` myself — both empty
  (exit 1 / no matches). Also grepped `tokenRefresh` across `src/` —
  empty. Remaining `localStorage` uses in `src/` are unrelated (`user`,
  `theme`, `cv-manual-order`, `cv-theme`) — none are the JWT.
- **Backend cookie actually invalidated on logout**: `src/stores/auth.ts`
  `logOut()` is now `async`, calls
  `axios.post(\`${API}${subURL}auth/logout\`, {}, { withCredentials: true, headers: getCsrfHeader() })`
  in a try/catch before clearing local state (best-effort, matches the
  note's framing that only the backend can invalidate an httpOnly cookie).
- **Test file actually mocks axios, meaningful assertions**: read
  `src/stores/auth.spec.ts` directly. `vi.mock('axios', () => ({ default:
  { post: vi.fn() } }))` at the top of the file — module-level mock,
  applied before `authStore` is imported, so `logOut()`'s real
  `axios.post` call is intercepted, no real network call in the test
  environment. Assertions are substantive, not trivial: call count ==1,
  URL contains `auth/logout`, options `toMatchObject({ withCredentials:
  true })`, and a separate test asserts local state still clears when the
  mocked call rejects (`mockRejectedValue`) — covers the best-effort
  contract, not just the happy path.
- **No dangling references to removed accessors**: same grep sweep above,
  run independently in this session (not copy-pasted from the note),
  confirms zero hits anywhere in `src/`.
- **PDF-download URL builders**: `src/pages/home/PageHome.vue` and
  `src/pages/_layouts/Header.vue` diffs confirmed — both dropped
  `?token=${auth.getToken}` (an accessor that no longer exists post-diff)
  and now hit `.../download-pdf` with no query param, relying on the
  `SameSite=None` cookie riding along on the plain `<a href>` navigation.
  Consistent with the rest of the diff — `auth.getToken` genuinely doesn't
  exist anymore, so leaving these unchanged would have been a real broken
  reference, not a hypothetical one.
- **Build/lint/test all green — independently re-run, not trusted from the
  note**:
  - `npm run test -- --run` (repo root) →
    `Test Files  18 passed (18)` / `Tests  127 passed (127)` — matches the
    note's quoted numbers exactly, reproduced fresh in this session.
  - `npm run lint` (repo root) → exit 0, no output — matches.
  - `npm run build` (repo root) → `✓ built in 3.32s` (note quoted 3.34s —
    trivial run-to-run timing variance, same build, same only-warning:
    the pre-existing `VeeForm` chunk-size advisory, nothing new).
- **Forbidden states scan (all 6)**:
  - `ADHOC_WORK` — no, has a diagram node + went through `/worker
    implementer`.
  - `NO_EVIDENCE` — no, evidence note exists and matches the diff.
  - `EDIT_UNVERIFIED` — no, every claim above was independently
    re-derived in this session (grep/diff/test/lint/build), not trusted
    from the note's prose.
  - `CODE_IN_HAVEN` — no, `git diff --stat` shows only `src/*` code files
    plus the note itself and a 2-line diagram append; no code under
    `haven/`.
  - `DIAGRAM_DRIFT` — no, the diagram diff (`git diff staging
    fix/issue-8-jwt-httponly-cookie-migration -- agent-hub/haven/diagrams/dev-loop.prime-mermaid.md`)
    shows exactly one new row appended AFTER the prior
    `issue-8-jwt-localstorage-unblocked-20260920` row and before the
    table's closing "Any regression must be a new node" note — no
    existing row edited, reordered, or moved. Row content matches what the
    diff actually does.
  - `MAIN_EDIT` — no, see branch check above.
- **Proportionality (`SmallestDiff`)**: the diff touches exactly the files
  the migration requires — the axios instance, the auth store, the login
  service, the two PDF-download URL builders that referenced the removed
  `getToken`, and their tests. No untasked trap opportunistically fixed
  alongside.
- **Seal gate**: note correctly states no merge into `staging`/`main` has
  happened yet — this evidence covers the implementer pass only, branch
  pushed not merged. That outward-facing step is `/ship`, separate from
  this verify pass. Nothing to approve here beyond the PM status flip,
  which is the verifier's own action per `RatchetOnly`.
- **Disclosed limitation, correctly not penalized**: the note's "Noticed,
  not done" section flags no live browser click-through and unverifiable
  `CORS_ORIGIN` on Render. Per the task's own framing this is a disclosed
  limitation of an otherwise-internally-consistent diff, not grounds for
  REOPEN — the code changes themselves are correct and self-consistent
  given that constraint.

## Re-run
`full` — re-ran `npm run test -- --run`, `npm run lint`, and `npm run
build` from scratch in this session rather than trusting the note's quoted
numbers. Reason: this is a security-sensitive, end-to-end auth-mechanism
change (JWT storage + CSRF + cross-site cookie behavior) — matches the
"outward-facing / higher risk than an ordinary diff" exception in
`verify_seal.md`'s Re-run scope, and was explicitly instructed by the
operator's task for this session. All three independently matched the
note's claims (test: 18/127 exact match; lint: exit 0 match; build:
3.32s vs 3.34s, same single pre-existing warning, no new errors).
