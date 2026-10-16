# 2026-10-16 - issue-183-cold-start-wakeup

- Worker: implementer
- Version: 0.1.0
- Node: `issue-183-cold-start-wakeup` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table, `IN_PROGRESS`)
- Task (from issue #183): "[ENHANCEMENT] Đánh thức server sớm + báo cold start thay vì spinner treo". The backend runs on Render free tier, so a cold start takes ~30s and the spinner hangs with no explanation. Proposal: (1) ping a light (health) endpoint as soon as the app loads to wake the server early; (2) if a request takes > ~3s, show "Server đang khởi động, vui lòng đợi ~30 giây".

## Hub bytes before: 175022

## Branch
`feature/issue-183-cold-start-wakeup`, created off `origin/staging` (`ad35ea2`, fetched and pulled this session) via `gh issue develop 183 --checkout --base staging --name feature/issue-183-cold-start-wakeup`. Never on `main`/`staging` while editing.

## Starting state (read, not assumed)
- `src/components/Spinner.vue` (the global overlay provided by `App.vue`, used by `handleBase` and `services/auth.ts`) already had a 30s countdown ring plus "Server-free nên lần gọi API đầu tiên có thể mất đến 30 giây". It appeared **immediately on every request**, so even a 200ms save flashed a "wait 30s" message. Point (2) of the issue is therefore a *delay* on an existing notice, not a new notice.
- Backend `../resume-nodejs-api` `origin/main` `src/server.ts:68`: `app.get('/health', …)` returns `{status, timestamp, uptime}`. It is registered after `cors(...)` and commented "exempt from rate limiting". No auth.
- `VITE_API_URL` ends with `/` (`.env.*`: `https://nodejs-resume-api-ts.onrender.com/`), so the ping URL is `${API}health`, the same root the axios instance uses.

## Diff
| File | Why |
|---|---|
| `src/services/wakeServer.ts` (new) | `wakeServer(api = API)`: `fetch(\`${api}health\`, { mode: 'no-cors', cache: 'no-store' })`, both outcomes resolve to `undefined`. Plain `fetch`, not `_axios`/`handleBase`: no spinner, no toast, no auth header and no 401-refresh interceptor for a ping. `no-cors` because the response is never read; only reaching the server matters. JSDoc gives the WHY. |
| `src/main.ts` | +import, `wakeServer()` called once after `app.mount('#app')` (fire-and-forget, never awaited, so it doesn't delay the first render). |
| `src/components/Spinner.vue` | `COLD_START_NOTICE_AFTER = 3`. `isColdStart = computed(() => COLD_START_SECONDS - secondsLeft.value >= COLD_START_NOTICE_AFTER)`, reusing the existing 1s countdown tick, no extra timer. Before 3s: a plain `.spinner-border text-success` inside the same overlay. From 3s: the existing countdown ring (already counting from show(), so it reads 27), headline "Server đang khởi động, vui lòng đợi ~30 giây" (the issue's wording), one-line explanation, existing overtime line unchanged. The notice block gets `role="status" aria-live="polite"`. Header `Description` extended by one sentence (WHY of the delay). show/hide/countdown logic unchanged. |
| `src/components/Spinner.spec.ts` (new) | 5 tests, fake timers: hidden until show(); plain spinner only, no notice at 0s and 2s; notice + countdown "27" at 3s; hide() at 1s then show() again starts fresh (no ring); overtime text after 31s. |
| `src/services/wakeServer.spec.ts` (new) | 2 tests: calls `fetch('<api>health', {mode:'no-cors', cache:'no-store'})`; a rejected fetch resolves `undefined` (no unhandled rejection). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | +1 row (node, `IN_PROGRESS`). |

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npx vitest run src/components/Spinner.spec.ts src/services/wakeServer.spec.ts`
- `Spinner.spec.ts` against `git show HEAD:src/components/Spinner.vue` (restored afterwards; `git diff --stat` confirms the 37-line diff is back)
- `npm run test`
- `npm run lint`
- `npm run build`
- Typecheck: CANNOT RUN (pending add-typecheck-script)
- Pre-existing failure check: `git stash -u` → `npx vitest run src/components/veevalidate/VeeForm.spec.ts` on clean `ad35ea2` → `git stash pop`

## Output
New specs, final code:
```
 ✓ src/services/wakeServer.spec.ts (2 tests) 3ms
 ✓ src/components/Spinner.spec.ts (5 tests) 20ms
      Tests  7 passed (7)
```
`Spinner.spec.ts` against the OLD Spinner (proves the tests exercise the change):
```
   × Spinner > shows only a plain spinner for the first 3 seconds, no cold-start notice 11ms
   × Spinner > switches to the cold-start notice + countdown once the request has been pending 3 seconds 3ms
   × Spinner > hide() before 3 seconds never shows the notice, and the next show() starts fresh 2ms
      Tests  3 failed | 2 passed (5)
```
(the 2 passing tests are "renders nothing until show()" and the overtime message, which are unchanged behaviour and should pass on both)

`npm run test` (final code):
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 14ms
 Test Files  1 failed | 31 passed (32)
      Tests  1 failed | 209 passed (210)
TEST EXIT 1
```
That failure is **pre-existing, not from this diff**: on clean `staging` `ad35ea2` (changes stashed): `AssertionError: expected 'VI' to contain '!'`, `Tests  1 failed | 14 passed (15)`. It's the same failure already recorded in `evidence/implementer/2026-10-16-issue-158-import-cv-pdf.md` on `4f353d0`. This diff touches no VeeForm file. All 7 new tests pass.

`npm run lint`:
```
> eslint src --ext .js,.ts,.vue
LINT EXIT 0
```
`npm run build`:
```
✓ 1398 modules transformed.
✓ built in 3.55s
BUILD EXIT 0
```
Typecheck: CANNOT RUN (pending add-typecheck-script)

CSS check: the new pre-3s state uses `.spinner-border` without `-sm`. That class is defined in `src/styles/tailwind.css:1046` (Bootstrap was removed), so it is not an unstyled class.

## Manual / visual check
**Not done.**
- No browser screenshot of the overlay.
- No live request to the real Render `/health`: a real API call is a seal-gate action, and the endpoint was confirmed from backend source instead.

The rendered-DOM states (pre-3s / 3s / overtime) are covered by the mounted-component spec. Opaque `no-cors` fetch behaviour in a real browser is standard, but I didn't observe it here.

## Acceptance
| Criterion | Status | Evidence |
|---|---|---|
| Ping a light health endpoint on app load | ✓ | `main.ts` → `wakeServer()` → `GET ${API}health`; `wakeServer.spec.ts` test 1; endpoint exists on backend `origin/main` `server.ts:68` |
| Ping never breaks the app / shows errors | ✓ | both fetch outcomes → `undefined`; spec test 2; not routed through `handleBase`, so no toast/spinner/logout |
| Request > ~3s shows "Server đang khởi động, vui lòng đợi ~30 giây" | ✓ | `Spinner.spec.ts` test 3 (exact text, countdown 27) |
| Quick requests don't show the cold-start notice | ✓ | `Spinner.spec.ts` tests 2 + 4; both fail on old Spinner |
| Build green | ✓ | `BUILD EXIT 0` |
| Lint green | ✓ | `LINT EXIT 0` |
| Tests | ✓ for this diff | 7/7 new pass; 1 pre-existing VeeForm failure proven on clean `ad35ea2` |
| Typecheck | CANNOT RUN | pending add-typecheck-script |
| Comments per code-comments.md | ✓ | `wakeServer.ts`: one `/** */` JSDoc on the exported function (WHY: wake during login, why `no-cors`, why errors are ignored). `Spinner.vue`: header `Description` +1 sentence (WHY of the delay) inside the existing `/** */`. No issue refs, no `//` stacks. Specs: none. |

## Noticed, not done
- `VeeForm.spec.ts:253` pre-existing failure (see above). Still needs its own node; `ci.yml` doesn't run `npm run test`, so CI stays green regardless.
- `App.vue` `onMounted` wraps the candidate fetch in `try { … } catch (err) { throw new Error(...) }`. The re-throw makes the catch pointless. Out of scope.

## Status
`sealed_pending_verifier`
