# 2026-10-25 - issue-312-load-login-errors

- Worker: implementer
- Version: 0.1.0
- Node: `issue-312-load-login-errors` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, operator): "xong hết thì tiếp tục P3-P4". This pass covers issue #312 "[QC][P3] Lỗi tải dữ liệu (429/mạng) hiển thị như dữ liệu rỗng; đăng nhập luôn báo chung "Đăng nhập thất bại"".

## Hub bytes before: 82257
(Same tree state as the sibling #310/#314–#317 notes: clean `staging` `3c06ad3`.)

## Branch
`fix/issue-312-load-login-errors`, created from up-to-date `staging` (`3c06ad3`) via `gh issue develop 312 --base staging --name fix/issue-312-load-login-errors`. It is checked out in the git worktree `../rv-wt312` (`node_modules` symlinked).

## Acceptance criteria
#312 lists three parts. This node scopes them as:
- **A.** A failed list/stat load must not look like "no data yet": the user gets a visible error with the reason. A full in-page error state with a "Thử lại" button is **left open** (see `## Still open`).
- **B.** A failed login shows the specific reason (wrong credentials / too many requests / server unreachable) instead of always "Đăng nhập thất bại". The generic text stays as the fallback.
- **C.** A hung request ends: axios gets a timeout and then follows the existing network-error path.

## Diff
| File | Why |
|---|---|
| `src/services/base.ts` | `handleBase` accepts an optional `toastError` (defaults to `toast`). `_helper.error` uses it, so a fetch that turns the success toast off (`toast: null`) can still report a failure. The logout-on-token-error logic is unchanged. One `//` WHY comment. Existing callers are unaffected (default = `toast`). |
| `src/composables/useCandidate.ts`, `useVisits.ts`, `useVisitStats.ts` | These are the 3 silent fetches (`grep "toast: null"` → exactly these). Each now takes `toast` from `useHelper()` and passes `toastError: toast`: errors toast, successes stay silent. They feed every list page, the Visits page and the Dashboard. |
| `src/services/auth.ts` | The `handleLogin` catch shows the API's message: new envelope `error.message`, or legacy `{ success:false, message }`. The `_axios` no-response body (`NETWORK_ERROR`, `t('error.network')`) has the same shape. A non-API error such as a JS `TypeError` still gets `t('error.loginFailed')`, so internals never reach the user. `err` is cast to a narrow body type, which keeps typecheck at the baseline. |
| `src/services/axios.ts` | `axios.create({ …, timeout: 90_000 })`. A request that never answers rejects with no response, and `_axios` maps that to the existing `NETWORK_ERROR` body. 90 s is above the Render free-tier cold start (~30–60 s, see CLAUDE.md), so a waking server isn't cut off. `wakeServer` is a separate `/health` call. One `//` WHY comment. |
| `src/services/base.spec.ts` | New test: `toast: null` + `toastError` → error toasts, success doesn't. |
| `src/services/axios.spec.ts` | New test: the adapter sees `timeout === 90_000`. |
| `src/services/auth.spec.ts` (new) | Three tests: new-envelope reason, legacy-body reason, `TypeError` → generic `t('error.loginFailed')`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

## Command
From the worktree root: `npm run test` · `npm run build` · `npm run typecheck` · `npx eslint` on the changed files. Also `npx vitest run src/services/`, once with each of `base.ts`/`axios.ts`/`auth.ts` stashed in turn.

## Output
`npx vitest run src/services/` with the fix: `Tests  19 passed (19)`.
Red checks (each source file stashed alone):
```
-- old base.ts:  × handleBase > reports a failure through toastError when the success toast is off (silent fetch)
-- old axios.ts: × _axios timeout > gives every request a timeout so a hung call ends in the network error
-- old auth.ts:  × handleLogin errors > shows the API reason from the new envelope
                 × handleLogin errors > shows the API reason from the legacy body
                 Tests  2 failed | 1 passed (3)
```
(The fallback test passes on the old code too, as expected: old code always showed the generic text.)
`npm run test`: `Tests  1 failed | 282 passed (283)`. The single failure is the pre-existing `VeeForm > VI | EN toggle > flags the hidden language…`, which also fails on `staging` (baseline recorded in `2026-10-25-issue-307-modal-save-close.md`).
`npm run build`: `✓ built in 3.71s`
`npm run typecheck`: the first run gave `93`, with 3 new `TS2339` errors at `auth.ts(57,…)` (`err` typed `{}`). After the narrow cast, `grep -c "error TS"` → `90` (= baseline).
`npx eslint src/services src/composables/useCandidate.ts src/composables/useVisits.ts src/composables/useVisitStats.ts`: no output (clean).

## Acceptance
| Criterion | Evidence |
|---|---|
| A. A failed load is visible, with the reason | base spec: `toastError` gets `{ message: 'Too many requests', bg: 'danger' }` on a rejected silent fetch and isn't called on success. The 3 silent fetches pass `toastError: toast` (diff). |
| B. Login shows the specific reason | auth spec: `error.message` / legacy `message` shown, `TypeError` → generic. Red on the old `auth.ts`. |
| C. Hung request ends | axios spec `timeout === 90_000`. The no-response → `NETWORK_ERROR` mapping is covered by the existing spec "rejects with the new-shape NETWORK_ERROR body when there is no response". |
| Tests / build / typecheck / lint | 282 passed + 1 pre-existing failure · `✓ built in 3.71s` · 90 = baseline · eslint clean |
| Comments per code-comments.md | Three `//` WHY comments, no `(#N)` |

**Manual browser check: BLOCKED.** The Playwright Chrome window is `visibilityState: "hidden"` (see the #308/#309 notes).

## Supersedes: none
## Still open
- #312 A, full version: an in-page error state (DESIGN.md) with a "Thử lại" button that re-runs the fetch, distinct from the empty state. It needs a design decision on where it lives (`LoadingGate` vs each page) plus an error flag from `useCandidate`. The PR for this branch says "Refs #312", so the issue stays open for that.

## Noticed, not done
- `useDownloadCv` also goes through `_axios`, so the PDF download now has the 90 s cap too. Generation on a cold server has been well under that in practice, but it's worth watching.

## Seal gate
None (no commit/push).
