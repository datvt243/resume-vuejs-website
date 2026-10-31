# 2026-10-31 — issue-353-stale-header-email

- Worker: implementer · Version: 0.1.0
- Node: `issue-353-stale-header-email` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row — new, slug not in archive)
- Task (verbatim, issue title): "#353 [QC][P3] Sau khi đăng nhập, header hiện email của người dùng trước trong lúc tải". Operator ran `/todo "fix các issue P3"` (sequential: #353 → #354 → #356, ship each after SEAL).

## Hub bytes before: 2583911 (`find agent-hub -name '*.md' -o -name '*.yaml' | xargs cat | wc -c`)

## Branch
`fix/issue-353-stale-header-email` (off `staging` @ `1908b1d`, via `gh issue develop 353`).

## Acceptance criteria
1. After login as B in a tab whose `localStorage.user` still holds A, the header never shows A: B's user is in the store before `isAuthenticated` flips.
2. A spec asserts the order (user set before the candidate request), and it fails without the fix.
3. Test/build/lint pass; typecheck stays at the baseline.

## Root cause
`handleLogin` (`src/services/auth.ts`) called `setTokens()`, then awaited `GET candidate/<email>`, and only then called `setUser()`. `isAuthenticated` (`stores/auth.ts`) is `!!_user.email && !!_refreshToken`, so it turned true as soon as the tokens were set, with the stale `localStorage` user. The header's `mesUser` falls back to `store.getUser.email` while the candidate is empty (`candidateStore` isn't persisted), so it showed A for the length of the candidate request.

## Diff
| file | why |
|---|---|
| `src/services/auth.ts` | `store.setUser({ ...user })` moved from after the candidate fetch to right after `setTokens()`, plus a 1-line why-comment |
| `src/services/auth.spec.ts` | the `setUser` mock is hoisted (`setUserMock`) so it's shared across `authStore()` calls. New `handleLogin success` test: the candidate request sees `setUser` already called once, with B's user |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row (appended) |

Failure path: if the candidate fetch throws, `catch` still runs `setTokens()` (tokens cleared), so `isAuthenticated` is false. B's user stays in `localStorage` as display-only data, which is the same state a later logout would leave. Not a regression.

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npx vitest run src/services/auth.spec.ts`: `Tests  5 passed (5)`
- Same spec with the `auth.ts` change stashed: `AssertionError: expected false to be true` / `Tests  1 failed | 4 passed (5)`
- `npm run test`: `Test Files  50 passed (50)` / `Tests  305 passed (305)`
- `npm run build`: `✓ built in 3.73s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS`, the same as the baseline. `src/services/auth.ts` has 17 errors both with and without the diff (same codes, lines shifted by +1/+2: TS7006/TS18046/TS2339). They pre-exist and aren't new.

## Manual observation
Not done live. It needs two real logins against the prod API. The spec pins the ordering that causes the bug.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. New user set before isAuthenticated can show a stale one | `setUser` now immediately follows `setTokens` (same synchronous tick, before any await) |
| 2. Spec, red without the fix | stash run above |
| 3. test/build/lint/typecheck | as listed above |
| Comments per code-comments.md | One `//` why-comment added in `auth.ts` above `setUser`. No `(#N)` ref. Nothing else touched. |

## Supersedes: none
## Still open: none for #353

## Noticed, not done
- `setUser` uses `Object.assign(_user, val)`, so a key A had and B lacks would survive in the in-memory `_user` (localStorage gets B only). Both users come from the same `auth/login` shape, so it doesn't happen in practice. A `clearUser()` first would make it airtight.

## Seal gate
none (no commit/push; no data written)
