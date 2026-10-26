# 2026-10-26 — issue-335-register-names

- Worker: implementer · Version: 0.1.0
- Node: `issue-335-register-names` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row)
- Task (verbatim, issue title): "#335 [BUG] Trang đăng ký luôn lỗi: API từ chối firstName/lastName" — body: `handleRegister` always sends `firstName/lastName`, backend schema rejects them → register always 400; fix options: frontend sends only `email/password/repassword`, or backend accepts names.

## Hub bytes before: 84908

## Branch
`fix/issue-335-register-names` (off `staging` @ `d08aa39`, via `gh issue develop 335`).

## Finding: the reported bug does not reproduce
- Backend (`../resume-nodejs-api`, `origin/main` @ `83430f0`): `schemaAuthRegister` = `email`, `password`, `repassword` only — unchanged since the first commit (`git log -S firstName -- src/auth` → `3a714d8 first commit`).
- Frontend: the name fields are already commented out in `PageRegister.vue`, so `values.firstName/lastName` are `undefined` and `JSON.stringify` drops them. Live test on the dev server (prod API, isolated context, throwaway `qa.register.335@example.com`) before any change: payload `{"email":…,"password":"***","repassword":"***"}` → **201** `{"success":true,"message":"Đăng ký thành công"}`. The issue was filed from reading `handleRegister` alone (direct curl with names → 400), not from the UI path.
- The same test showed a real defect: after the 201 the page stayed on `#/register` — `handleRegister` calls `router?.push('/login')` but `PageRegister` never passed `router`.

Operator decision (asked via AskUserQuestion): "Bỏ ô Họ/Tên" (remove the name fields) — frontend-only.

## Diff
| file | why |
|---|---|
| `src/pages/auth/PageRegister.vue` | delete the commented-out `firstName/lastName` field configs (one-line why-comment instead); pass `router` to `handleRegister` so success redirects to `/login` |
| `src/services/auth.ts` | `handleRegister` no longer destructures/sends `firstName/lastName` |
| `src/services/auth.spec.ts` | new test: payload is exactly `{email,password,repassword}` even if `firstName` is in `values`, and `router.push('/login')` is called |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row appended |

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npx vitest run src/services/auth.spec.ts`: `Tests  4 passed (4)`
- `npm run test`: `Test Files  1 failed | 48 passed (49)` / `Tests  1 failed | 296 passed (297)` — only the known-flaky `VeeForm.spec.ts > VI | EN toggle > flags the hidden language that has a validation error` (failed 3×, passed 1× earlier today on unrelated branches; file untouched).
- `npm run build`: `✓ built in 3.63s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS` = baseline. `src/services/auth.ts` has 17 errors both on clean `staging` (stash) and with the diff — all pre-existing implicit-any/unknown (baseline row names `src/services/{base,auth}.ts`); none introduced.

## Manual observation (real app, not an automated test)
After the diff, isolated context, throwaway `qa.register2.335@example.com`: form inputs `["email:email","password:password","password:repassword"]`; payload `{"email":"qa.register2.335@example.com","password":"***","repassword":"***"}` → 201; URL after → `#/login`.
Both throwaway accounts are recorded in the local `account-test.json`.

## Acceptance
| Criterion | Evidence |
|---|---|
| Register succeeds | 201 in both live runs |
| Payload has only accepted fields | live payload + `auth.spec.ts` test |
| Name fields removed (operator choice) | form inputs list above; dead config deleted |
| Success redirects to login | `urlAfter: #/login` + spec `router.push('/login')` |
| Build/lint/typecheck vs baseline | `✓ built in 3.63s`, lint 0, typecheck 90 (auth.ts 17 = 17) |
| Comments per code-comments.md | one 1-line why-comment above `formFields` |

## Supersedes: none

## Noticed, not done
- #335's title/premise is wrong (register already worked); the issue should be closed with that explanation once this ships.
- `VeeForm.spec.ts` VI|EN toggle test is flaky.

## Seal gate
none for code (no commit/push). Live action: 2 throwaway accounts created on the prod API via the register form (needed to test the flow); no other data written.
