# 2026-11-15 - issue-420-auth-form-fixes

Worker: implementer · Version: 0.1.0 · Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-420-auth-form-fixes` (IN_PROGRESS)
Branch: `fix/issue-420-auth-form-fixes` (off `staging` @ `0e93835`, linked to #420 via `gh issue develop`)

Task (verbatim): Fix auth form issues #420 #422 #425 #429 (one branch fix/issue-420-auth-form-fixes). #420 Register: submit-fn returns undefined so VeeForm never shows submitting → return the handleRegister promise. #422 Register/forgot/reset: error toast reads only err.message; new API envelope { success:false, error:{code,message} } → use the same error-message extraction as login. #425 Register: trim email before POST api/v1/auth/register (passwords untrimmed). #429 /reset-password without ?token=: disable/hide form, show only invalid-link message + Back to login; /forgot-password: show a vi+en note that reset emails are not sent yet (link only in server log).

Bundled because all four touch the same files (#420/#425 → `PageRegister.vue`, #422/#429 → forgot/reset + `services/auth.ts`); separate branches would conflict. `/ship` only appends `Closes #420` from the branch name — the PR body must also close #422 #425 #429.

## Hub bytes before: 99072

## Feature doc: agent-hub/doctrine/features/auth-login.md, agent-hub/doctrine/features/auth-password-reset.md
## Feature doc changed:
- auth-login.md Behavior #8: "not trimmed … Failure: red toast with the rejected body's `message`" → submitting state shown, email trimmed (passwords not), failure uses login's extraction else generic text — operator: open questions 2 (#422 "Bug") and 3 (#425 "Bug: trim"), 2026-11-07.
- auth-password-reset.md Behavior #1/#3/#4/#6: no-email note added; failure toast uses login's extraction; "the form is still shown" → only invalid-link text + Back to login, no form — operator: open questions 1 (#422 "Bug"), 2 (#429 "Bug: disable the form"), 3 (#429 "Change: show a note"), 2026-11-07.
Changelog rows added to both docs.

## Diff
| File | Why |
|---|---|
| `src/services/auth.ts` | Login's inline extraction moved into `apiErrorMessage(err, fallback)` (`error.message` → `message` when `success===false` → fallback; `||` so an empty message falls back); used by login (fallback `error.loginFailed`) and register/forgot/reset (fallback `error.generic`) — #422. Register sends `email.trim()` — #425 |
| `src/pages/auth/PageRegister.vue` | `submit-fn` arrow returns the `handleRegister` promise (was a block body → `undefined`) — #420. Email yup rule gets `.trim()` so a pasted `' a@b.c '` passes validation and reaches the trim — #425 |
| `src/pages/auth/PageResetPassword.vue` | `token` computed (string only — a repeated `?token=` array counts as none); `VeeForm v-if="token"`, else invalid-link text + `RouterLink /login` "Back to login" — #429 |
| `src/pages/auth/PageForgotPassword.vue` | `<p class="mb-4 text-sm text-fg-2">` with `auth.forgotNoEmailNote` under the heading — #429 |
| `src/i18n/index.ts` | New `auth.forgotNoEmailNote` (vi + en). `forgotDescription` "receive" → "request" and `resetInvalidLink` drops "from your email" — both contradicted the new note (review finding). Server-log wording left out of the UI per DESIGN.md "No developer notes in the UI" |
| `src/services/auth.spec.ts` | Register trims email not passwords; register/forgot/reset show `error.message` from the new envelope; generic fallback for non-API error and empty API message |
| `agent-hub/doctrine/features/*.md`, diagram | Behavior/Changelog as above; node row |

## Command
`npm run test` · `npx vitest run src/services/auth.spec.ts` · `npm run build` · `npm run lint` · `npm run typecheck` (all repo root, per `doctrine/MEMORY.md`)

## Output (final run, after review fixes)
```
      Tests  370 passed (370)
      Tests  11 passed (11)            # src/services/auth.spec.ts
✓ built in 3.88s
lint=0
tc errors=78 pages/auth=0 services/auth=14
```
Typecheck baseline (`doctrine/MEMORY.md`): ≤ 90. On `staging` (stash) the same count was `81`, `services/auth.ts` `17`. This diff: `78` / `14` — none added; the 14 left in `services/auth.ts` are pre-existing untyped `values`/`props` params and `unknown` axios results (TS7006/TS18046), not in changed lines. The first draft added one (`err` untyped in the helper) → fixed with `err: unknown`.

## Live check (`npm run dev` on localhost:5173, own headless Chrome on :9888 via Playwright MCP; both stopped afterwards)
```
#/reset-password                    → forms: 0, text "Liên kết … không hợp lệ …" + link "Quay lại đăng nhập→#/login"
#/reset-password?token=a&token=b    → forms: 0, invalid text shown
#/reset-password?token=abc          → forms: 1, invalid text not shown
#/forgot-password                   → "Quên mật khẩu" / "Nhập email đã đăng ký để yêu cầu liên kết đặt lại mật khẩu." / "Lưu ý: hiện hệ thống chưa gửi email đặt lại mật khẩu."
#/register                          → form renders; ' a@b.c ' typed → no emailInvalid message
```
Not live-checked: actually submitting register (would create a real account on the prod API — outward-facing). #420's submitting state rests on `VeeForm.vue` awaiting `submitFn` (covered by `VeeForm.spec.ts`) + the arrow now returning the promise. The register-whitespace check is weak: browsers already strip whitespace from `type=email` input values, so the yup `.trim()` mainly matters for non-browser/pasted paths; its effect was confirmed in node: `yup.string().email().isValidSync(' a@b.c ')` → `false`, with `.trim()` → `true`.

## Acceptance
| Criterion | Evidence |
|---|---|
| #420 register submit-fn returns the promise | Diff `PageRegister.vue`: `:submit-fn="values => handleRegister(...)"` |
| #422 register/forgot/reset toast uses login's extraction | `auth.spec.ts` "%s shows the reason from the new API envelope" ×3 + login tests unchanged, in `Tests 11 passed (11)` |
| #425 register trims email, passwords untrimmed | `auth.spec.ts` "trims the email but not the passwords", in `Tests 11 passed (11)` |
| #429 no token → no form, invalid text + Back to login | Live check rows 1-3 |
| #429 forgot shows vi + en no-email note | Live check row 4 (vi); `en` key at `src/i18n/index.ts` `forgotNoEmailNote: 'Note: password reset emails are not sent yet.'` |
| Matches features/auth-login.md Behavior #8, auth-password-reset.md Behavior #1/#3/#4/#6 (as updated) | Diff + rows above |
| Full suite / build / lint / typecheck | `Tests 370 passed (370)`, `✓ built in 3.88s`, `lint=0`, `tc errors=78` ≤ 90, 0 in `pages/auth` |
| Comments per code-comments.md | 3 one-line `//` WHY comments: helper (moved from login unchanged), `|| not ??` reason, array-token reason. No issue refs, no WHAT comments |

## Supersedes: none
## Still open: none (no other active diagram row cites #420/#422/#425/#429)

## Review
`/code-review medium` on the working-tree diff (7 findings):
1. Login trims passwords, register/reset don't → a password with edge spaces can be set but never logged in with. **Not fixed** — #425 explicitly says passwords stay untrimmed (operator decision); the real mismatch is login's `password.trim()`. → Noticed, not done.
2. `??` lets an empty message win → blank toast. **Fixed** (`||`), test added.
3. Field-level `error.details` dropped (base.ts lists them). **Not fixed** — login already behaved this way; auth error detail listing is out of scope. → Noticed, not done.
4. Duplicates base.ts's envelope parsing. **Not fixed** — base's parsing lives inside the unexported `_helper.error` and also joins details; sharing it would change login's toast. → Noticed, not done.
5. Repeated `?token=` → array posted as token. **Fixed** (string-only computed), live-checked.
6. `forgotDescription` / `resetInvalidLink` contradict the new note. **Fixed** (copy, vi + en).
7. Register trim unreachable: yup `.email()` rejects spaces first. **Fixed** (`.trim()` in the yup rule), confirmed in node (see Live check).
Not labeled `security` → no `/security-review`.

## Noticed, not done
- Login trims the password (`services/auth.ts` `password.trim()`) while register/reset send it raw — mismatch the reviewer flagged; needs an operator call (stop trimming on login, or trim everywhere).
- Auth error toasts don't list `error.details` field errors the way `handleBase` does.
- Login/forgot email yup rules have no `.trim()` either (same pasted-email case as #425).

## Seal gate: none (no commit/push/real API write)
