# 2026-11-22 - issue-424-login-register-links

- Worker: implementer · Version: 0.1.0
- Node: `issue-424-login-register-links` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS)
- Branch: `feature/issue-424-login-register-links` (off `staging` @ 9382306, via `gh issue develop 424`)
- Task: #424 "Login/Register: replace the unused "Remember me" with an info note, link the two pages" — remove the checkbox, show a vi+en note that the session is tab-only; `/login` "No account? Register" → `/register`, `/register` "Already have an account? Log in" → `/login`.

## Hub bytes before: 100323

## Feature doc: doctrine/features/auth-login.md
Analyst pass 0: `evidence/analyst/2026-11-22/auth-login-424-spec.md` (spec_ready; Behavior #2 updated, #14 added, open questions 1 and 5 answered). Node criteria = the doc's #424 criteria below.

## Diff
| File | Why |
|---|---|
| `src/pages/auth/PageLogin.vue` | drop the `rememberMe` checkbox field; add the `auth.sessionTabNote` note + `auth.noAccount` + RouterLink `/register` (text reuses `auth.registerTitle`) under the form |
| `src/pages/auth/PageRegister.vue` | add `auth.haveAccount` + RouterLink `/login` (text reuses `auth.loginTitle`) under the form |
| `src/i18n/index.ts` | `auth.rememberMe` removed (vi+en); `auth.sessionTabNote`, `auth.noAccount`, `auth.haveAccount` added to both vi and en |

Note style copies `PageForgotPassword.vue:38` (`text-sm text-fg-2`). No comments added.

## Command
- `npx vitest run src/stores/auth.spec.ts src/services/auth.spec.ts src/services/axios.spec.ts`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `grep -rn rememberMe src`
- live check: `npm run dev` (started by this session) + Playwright on `http://localhost:5173/resume-vuejs-website/#/login`

## Output
```
 Test Files  3 passed (3)
      Tests  33 passed (33)
```
```
✓ built in 4.46s
```
```
> resume-vuejs-website@1.43.0 lint
> eslint src --ext .js,.ts,.vue
lint exit 0
```
typecheck: `exit 2`, `grep -c "error TS"` → `78` (baseline 78 per doctrine/MEMORY.md); `grep -cE "PageLogin|PageRegister|src/i18n/index"` → `0`.
`grep -rn rememberMe src` → no output, `grep exit 1`.

Live check (signed out: this tab's `sessionStorage.refreshToken` removed first; before that, a signed-in `#/login` redirected to `#/dashboard/information` — Behavior #6 intact):
```
{ "hash": "#/login", "checkbox": false,
  "text": "Phiên đăng nhập chỉ giữ trong tab này — đóng tab hoặc mở tab mới sẽ cần đăng nhập lại. |  | Chưa có tài khoản? Đăng ký",
  "afterClick": "#/register", "registerText": "Đã có tài khoản? Đăng nhập", "back": "#/login" }
```
EN (`localStorage.uiLang='en'` + reload, restored to `vi` after):
```
{ "login": "Your session is kept only in this tab — closing it or opening a new tab requires signing in again. |  | No account? Sign up",
  "register": "Already have an account? Log in" }
```

## Acceptance
| Criterion | Evidence |
|---|---|
| auth/axios specs pass | `Tests  33 passed (33)` |
| `#/login`: no checkbox, tab-only note visible | live `"checkbox": false`, `text` shows the note |
| `/login` link → `#/register`; `/register` link → `#/login` | live `"afterClick": "#/register"`, `"back": "#/login"` |
| EN switch changes both texts | EN live output above |
| `grep -rn rememberMe src` returns nothing | `grep exit 1`, no output |
| `npm run build` and `npm run lint` pass | `✓ built in 4.46s`; `lint exit 0` |
| typecheck ≤ baseline, none in changed files | 78 / 0 |
| vi + en keys both present | diff of `src/i18n/index.ts` (3 keys added in each of `vi.auth` and `en.auth`) |
| comments per code-comments.md | no comments added or changed |
| Other doc criteria (guard, register min-length, sessionStorage) | untouched code paths (`routers/index.ts`, register field config, `services/auth.ts` not changed) |

## Supersedes: none
`grep -n "issue-424\|#424"` on the active diagram and the archive → no other row.

## Review
`/code-review medium` done inline (diff is 3 files, read in full with callers): `rememberMe` was never read anywhere (`grep -rn rememberMe src` empty after removal; `handleLogin` only sends email/password). No correctness/security findings. i18n: no `@ $ | { }` in the new messages.

## Noticed, not done
- none

## Seal gate: none (no commit/push; `/ship` is separate)
