# 2026-10-21 - issue-252-api-response-standard

- Worker: implementer (v0.1.0)
- Node: `issue-252-api-response-standard` (`haven/diagrams/dev-loop.prime-mermaid.md`, appended IN_PROGRESS at the end of the PM table)
- Task (via `/todo #252`): issue [#252](https://github.com/datvt243/resume-vuejs-website/issues/252) "[ENHANCEMENT] Đồng bộ xử lý response/lỗi theo API Response & Error Standard của backend". Its body lists 6 change points + 4 acceptance boxes. A follow-up comment adds: commit `API-STANDARD.md` unchanged.
- Status: `sealed_pending_verifier`

## Hub bytes before: 199404
Measured right after appending this node's row. Same set as prior notes: `NORTHSTAR.md`, `CLAUDE.md`, all of `doctrine/`, the active diagram, all of `haven/workers/`.

## Branch
`feature/issue-252-api-response-standard`, created with `gh issue develop 252 --base staging` from `staging` `f8ba8ee` (after fetch and pull, "Already up to date").

## Diff
| File | Why |
|---|---|
| `src/services/axios.ts` | Item 1 (C3): exports `TOKEN_ERROR_CODES` (`NO_TOKEN`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `TOKEN_REVOKED`) and `errorCodeOf(body)` = `body.error?.code ?? body.errorCode`. The 401 interceptor only refreshes when the code is in that set **or there is no code at all**. A legacy code-less 401 may still be an expired token, and skipping refresh there would log users out after every reload on the old backend (C6). So `INVALID_CREDENTIALS` / `VALIDATION_ERROR` 401s no longer refresh. `auth/refresh` is posted through plain `axios`, not the instance, so it was never intercepted. Item 4: the network fallback is now `{ success:false, error:{ code:'NETWORK_ERROR', message: t('error.network') } }`. |
| `src/services/base.ts` | Item 2 (C1): in `.then`, `res.success === false` goes to `__helper.error(res)`, and neither the callback nor the success toast runs. Item 3 (C2/C6): `message = err.error?.message ?? err.message`, `errors = err.error?.details ?? err.errors`. A detail entry renders as `mess?.message ?? mess`, so the new `{field,message}[]`, the legacy object and the legacy string[] all work. The `invalidToken` flag is gone; logout now happens when `TOKEN_ERROR_CODES.includes(errorCodeOf(err))`. |
| `src/types/api.type.ts` | Item 5: `SuccessResponse<T>` (`success:true`, `message`, `data`, `meta?`), `ErrorDetail`, `ErrorResponse` (`error?` plus legacy `message?`/`errors?`/`errorCode?`). `Response<T>` is kept as an alias of `SuccessResponse<T>`, because its 6 existing imports are all `handleBase` success-callback params, which now only ever get the success shape. |
| `src/composables/useAuthRedirect.ts` | Comment only: `invalidToken` → "a token error code" (it described the removed flag). |
| `src/services/base.spec.ts` (new) | Same toast for the legacy `{message, errors:{…}}` fixture and the new `{error:{message, details:[{field,message}]}}` fixture. 2xx `success:false` → error toast, no callback. `success:true` → callback + success toast. Logout on the new `TOKEN_REVOKED` and on legacy `errorCode:'INVALID_TOKEN'`. 6 tests. |
| `src/services/axios.spec.ts` (new) | Real `_axios` + interceptor through a fake axios adapter. 400 `VALIDATION_ERROR` and 401 `INVALID_CREDENTIALS` (new and legacy shape) → 0 refresh calls, no logout, rejects with the body. 401 `TOKEN_EXPIRED` and a 401 legacy body with no code → exactly 1 refresh, then the retry resolves. No response → `NETWORK_ERROR` shape. 6 tests. |

Item 6 (C4 lists): nothing to change. `grep -rnE "data\.items|\.pagination|limit" src` finds no list reads of `data.items`/`pagination` and no `?limit=` callers. The list callers (`useCandidate`) already read `data` as an array; an extra `meta` key doesn't break that.

`API-STANDARD.md` (issue comment): already committed on `staging` in `45b5101` ("chore: add shared API-STANDARD.md…"), so it is tracked and unchanged, and there is nothing to add. `git status` was clean at start.

## Command
From repo root, per `doctrine/MEMORY.md`: `npx vitest run src/services/`, `npm run test`, `npm run build`, `npm run lint`. Typecheck: CANNOT RUN — pending add-typecheck-script.
Regression check: `git stash push src/services/axios.ts src/services/base.ts` → `npx vitest run src/services/` → `git stash pop`. This runs the new specs against the old code.

## Output
New specs on new code:
```
 ✓ src/services/wakeServer.spec.ts (2 tests) 3ms
 ✓ src/services/base.spec.ts (6 tests) 3ms
 ✓ src/services/axios.spec.ts (6 tests) 9ms
      Tests  14 passed (14)
```
New specs on old code (they detect the bug):
```
   × handleBase > shows message + field errors from the new error body 4ms
   × handleBase > treats a 2xx body with success:false as an error 0ms
   × handleBase > logs out on a new token error code 0ms
   × handleBase > logs out on a legacy token error code 0ms
   × _axios 401 interceptor > 401 INVALID_CREDENTIALS (new) does not refresh or log out 3ms
   × _axios 401 interceptor > 401 INVALID_CREDENTIALS (legacy) does not refresh or log out 1ms
   × _axios 401 interceptor > rejects with the new-shape NETWORK_ERROR body when there is no response 4ms
      Tests  7 failed | 7 passed (14)
```
Full suite:
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 14ms
 Test Files  1 failed | 41 passed (42)
      Tests  1 failed | 268 passed (269)
```
The single failure is the known pre-existing one (cited in the #271/#266/#262/#251 notes). Baseline at #271 was `1 failed | 256 passed (257)`; +12 = the 2 new spec files.
`npm run build`: `✓ built in 3.78s`
`npm run lint`: no problems; output ends at `> eslint src --ext .js,.ts,.vue`.
`grep -rn invalidToken src | grep -v i18n`: no output.

## Acceptance
| Criterion | Evidence |
|---|---|
| Validation error (400) doesn't call `auth/refresh` and doesn't log out; 401 `TOKEN_EXPIRED` still refreshes | `axios.spec.ts`: 400/401-`INVALID_CREDENTIALS` cases assert `refreshCalls() === 0` and no `logOut`; `TOKEN_EXPIRED` asserts 1 refresh + retried result. All pass. The `INVALID_CREDENTIALS` cases fail on the old code. |
| 2xx with `success:false` → error toast, no success callback | `base.spec.ts` "treats a 2xx body with success:false as an error" passes; fails on the old code |
| Toast correct for both legacy `{message, errors}` and new `{error:{message, details}}` bodies, vitest for both fixtures | `base.spec.ts` `it.each` legacy/new, both produce `'Dữ liệu không hợp lệ\n- Bắt buộc '`. The new-shape case fails on the old code. |
| No more reading `invalidToken` | grep above is empty; `base.ts` uses `errorCodeOf` + `TOKEN_ERROR_CODES` |
| Network fallback in the new shape, still readable by item 3 | `axios.spec.ts` NETWORK_ERROR case; `base.ts` reads `err.error?.message` |
| `SuccessResponse` / `ErrorResponse` types | `src/types/api.type.ts` |
| No regressions | `1 failed \| 268 passed (269)`, only the known failure; `✓ built in 3.78s`; lint clean |
| Comments per code-comments.md | Short `//` / `/** */` WHY comments only (token-code set, both-shapes read, code-less legacy 401 keeps refreshing, detail entry shapes, the fake adapter in the spec). The API-STANDARD rule IDs (C1/C3/C6) are cited as the source of the rule, not as issue refs. |

## Noticed, not done
- Item 3 "Nếu được, map `details[].field` vào lỗi từng input của VeeValidate" is optional ("if possible") and **not done**. `handleBase` has no handle to the form's `setFieldError`, so this would need plumbing through `useDocument` → every `VeeForm` caller. Field errors still show in the toast. It's worth a follow-up issue.
- When the refresh itself fails, the interceptor rejects with the refresh request's error, not the original. `_axios` then surfaces the refresh body (e.g. `TOKEN_REVOKED`), and `base.ts` calls `logOut()` a second time, which is harmless. This was pre-existing and isn't changed here.
- `handleLogin` (`services/auth.ts`) always shows the generic `error.loginFailed` toast and ignores the backend message. Out of scope.
- `PageImportLinkedin.vue:89` reads `err.message` for its own toast. With the new shape that would be `undefined` for API errors. It needs a look when phase 5 is deployed: it should read `err.error?.message ?? err.message`.
- The local backend checkout (`../resume-nodejs-api`) already has phase 5 merged (`6a9e7a2 feat(api)!: unified error envelope + list meta (#278)`). I didn't check whether it is deployed to Render. The code here works with both shapes either way.

## Seal gate
None. No commit, push or API write.
