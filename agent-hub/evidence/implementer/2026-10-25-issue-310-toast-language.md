# 2026-10-25 - issue-310-toast-language

- Worker: implementer
- Version: 0.1.0
- Node: `issue-310-toast-language` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, operator): "xong hết thì tiếp tục P3-P4". This pass covers issue #310 "[QC][P3] Toast hiển thị tiếng Việt từ API khi giao diện đang ở EN".

## Hub bytes before: 82257
(Same tree state as the sibling #314–#317 notes: clean `staging` `3c06ad3`.)

## Branch
`fix/issue-310-toast-language`, created from up-to-date `staging` (`3c06ad3`) via `gh issue develop 310 --base staging --name fix/issue-310-toast-language`. It is checked out in the git worktree `../rv-wt310` (`node_modules` symlinked).

## Acceptance criteria (from #310)
1. With the UI in EN, toasts built from API messages (`services/base.ts` success/error, the `services/auth.ts` login toast) are in English. In VI they are in Vietnamese.
2. Switching the language takes effect on the next request (no reload).

## Approach
The issue offered two options: map API codes to i18n keys on the client, or send `Accept-Language` if the API supports it. The API does support it: `resume-nodejs-api` `src/middlewares/language.middleware.ts` resolves `req.lang` from `Accept-Language` (vi default, `en` supported). `req.lang` is used only for messages, never to reshape data: `git grep "req.lang"` lists only message/`t()`/error paths, and the `{ vi, en }` CV fields are untouched. A one-line header is therefore the smallest complete fix. Client-side code mapping would need a key for every API message.

## Diff
| File | Why |
|---|---|
| `src/services/axios.ts` | The request interceptor sets `config.headers['Accept-Language'] = i18n.global.locale.value` (it already imports `t` from `@/i18n`; it now also imports `i18n`). It covers every `_axios` call: `handleBase` → `base.ts` toasts, and `auth.ts` login/forgot/reset. One `//` WHY comment. |
| `src/services/axios.spec.ts` | New test: locale `en` then `vi` → the adapter sees `Accept-Language` `['en', 'vi']`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

## Command
From the worktree root: `npm run test` · `npm run build` · `npm run typecheck`. Also `npx vitest run src/services/axios.spec.ts`, with and without the `axios.ts` change (`git stash push src/services/axios.ts`). Live API check with curl (no auth, a deliberately invalid login).

## Output
With the fix: `Tests  7 passed (7)`.
Without the fix:
```
   × _axios Accept-Language > sends the current UI language so API messages match it 2ms
      Tests  1 failed | 6 passed (7)
```
`npm run test`: `Tests  1 failed | 278 passed (279)`. The single failure is the pre-existing `VeeForm > VI | EN toggle > flags the hidden language…`, which also fails on `staging` (baseline recorded in `2026-10-25-issue-307-modal-save-close.md`).
`npm run build`: `✓ built in 3.68s`
`npm run typecheck`: `grep -c "error TS"` → `90` (= baseline). `grep services/axios` lists 7 errors (`axios.spec.ts(14,…)` ×3, `axios.ts(34|48|66|83,…)`). The same 7 are on clean `staging` (`axios.ts(32|46|64|81,…)`): line numbers +2 from the two added lines, none new.

Live API (`POST /api/v1/auth/login` with an invalid body):
```
en VALIDATION_ERROR | Validation has errors
vi VALIDATION_ERROR | Dữ liệu không hợp lệ
```
CORS preflight from the production origin, requesting `authorization,accept-language` → `HTTP/2 200`, `access-control-allow-headers: authorization,accept-language`.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. API messages follow the UI language | spec: header `en`/`vi` follows `i18n.global.locale`; live API returns English with `en` and Vietnamese with `vi`. The toasts print `res.message`/`error.message` unchanged (`base.ts`), so they follow. |
| 2. Takes effect on the next request | spec flips the locale between two calls and the header follows (read per request, in the interceptor) |
| Cross-site safe | preflight allows `accept-language` from `https://datvt243.github.io` |
| Tests / build / typecheck | 278 passed + 1 pre-existing failure · `✓ built in 3.68s` · 90 = baseline, no new errors |
| Comments per code-comments.md | One `//` WHY comment, no `(#N)` |

**Manual browser check: BLOCKED.** The Playwright Chrome window is `visibilityState: "hidden"` (see the #308/#309 notes). Evidence is the spec plus the live API responses.

## Supersedes: none
## Still open: none

## Noticed, not done
- The plain `axios.post` refresh call (`refreshTokens`) doesn't go through the interceptor, so it has no `Accept-Language`. Its message is never shown, so it doesn't matter.

## Seal gate
None (no commit/push). Live calls were unauthenticated, an invalid login plus an OPTIONS request.
