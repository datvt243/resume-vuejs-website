# 2026-10-26 — issue-336-social-media-update

- Worker: implementer · Version: 0.1.0
- Node: `issue-336-social-media-update` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row)
- Task (verbatim): "#336 [BUG] Không edit/update được thông tin mạng xã hội — Người dùng báo: tôi không edit/update được thông tin mạng xã hội, hãy kiểm tra. Trang: Thông tin cá nhân (#/dashboard/information), các field socialMedia.github/linkedin/website. Lưu ý: KHÔNG ghi dữ liệu vào tài khoản votan.it@gmail.com (chỉ xem); dùng QA account trong account-test.json (vd. qa.minimal@example.com). Gợi ý đã biết: backend PUT candidate/update bắt buộc socialMedia.linkedin/website không rỗng."

## Hub bytes before: 85721

## Branch
`fix/issue-336-social-media-update` (off `staging` @ `08b60ae`, created via `gh issue develop 336`).

## Root cause
The social `VeeForm` in `PageInformation.vue` has no `document` prop — stored links are only shown through the `field.value` DOM trick (already called out in the file's own comment above `slugDocument`), so vee-validate holds `undefined` for every link the user didn't touch. `JSON.stringify` drops those, and the backend's `PATCH candidate/update` **replaces** the whole `socialMedia` object. Reproduced live on `qa.minimal@example.com` (dev server → prod API, isolated browser context):
- edit only GitHub → request `{"socialMedia":{"github":"https://github.com/qa-edited"}}` → 200, server now holds only `github`; LinkedIn/Website silently deleted, UI still shows them until reload.
- direct API probe: `socialMedia.linkedin: ""` → 400 `socialMedia.linkedin không được để trống`.

## Diff
| file | why |
|---|---|
| `src/models/information.model.ts` | new pure `socialMediaPayload(stored, edited)`: overlay touched (non-`undefined`) edits on stored links, drop empty ones (omitting = removing, since PATCH replaces the object) |
| `src/pages/dashboard/PageInformation.vue` | `handleUpdateSocialNetwork` sends `socialMediaPayload(candidate.getCandidate?.socialMedia, values.socialMedia)` instead of raw `values.socialMedia` |
| `src/models/information.model.spec.ts` | new — 3 tests (keep untouched incl. the `undefined` shape vee-validate really produces, drop cleared, no stored links) |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row appended (`AppendOnly`) |

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npm run test`: `Test Files  1 failed | 48 passed (49)` / `Tests  1 failed | 295 passed (296)` — the 1 failure is `VeeForm.spec.ts > VI | EN toggle > flags the hidden language that has a validation error` (`AssertionError: expected 'VI' to contain '!'`). **Pre-existing**: same failure with my changes stashed (`npx vitest run src/components/veevalidate/VeeForm.spec.ts` on clean `staging` → `Tests  1 failed | 18 passed (19)`); file not touched by this diff.
- `npx vitest run src/models/information.model.spec.ts`: `Tests  3 passed (3)`
- `npm run build`: `✓ built in 4.11s` (only the pre-existing chunk-size warning)
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS` = baseline; none in changed files (a first version added 1 — TS2322 at `information.model.ts(100,5)` — fixed with a type-guard filter, recount 90).

## Manual observation (real app, not an automated test)
Dev server `localhost:5173` (prod API), separate Playwright browser context logged in as `qa.minimal@example.com` (operator's own localhost/github.io sessions untouched). QA links reset to 3 values first:
1. Edit GitHub only → payload `{"github":"https://github.com/qa-edited","linkedin":"https://www.linkedin.com/in/example","website":"https://example.com"}` → 200; after full reload + menu navigation all 3 shown.
2. Clear LinkedIn → payload `{"github":"https://github.com/qa-edited","website":"https://example.com"}` → 200; after reload `["https://github.com/qa-edited","","https://example.com"]`; server `GET candidate/qa.minimal@example.com` → `{"github":"https://github.com/qa-edited","website":"https://example.com"}`.
QA links restored to 3 values afterwards (PATCH 200), test context closed. The first live run (before the `undefined` handling) still sent only `github` — that's what exposed the `undefined` shape now covered by the spec.

## Acceptance
| Criterion | Evidence |
|---|---|
| Editing one link no longer wipes the others | Manual step 1 payload + post-reload values above |
| A link can be cleared without a 400 | Manual step 2: status 200, server object without `linkedin` |
| Logic tested | `Tests  3 passed (3)` |
| Build/lint/typecheck green vs baseline | `✓ built in 4.11s`, lint exit 0, typecheck 90 = baseline |
| Owner account untouched | All writes on `qa.minimal@example.com` only |
| Comments per code-comments.md | One 2-line why-comment on `socialMediaPayload`, no other comments added |

## Supersedes: none

## Noticed, not done
- Hard reload directly on `#/dashboard/information` shows every field empty (store not hydrated at `onMounted`) — pre-existing, already documented in `issue-117-public-slug` (archive); not fixed.
- `VeeForm.spec.ts` VI|EN toggle test fails on clean `staging` (see Output).
- `.env` has `ACCOUNT_TEST_EMAIL=votan.it@gmail.com` + its password — conflicts with the operator's rule that the owner account is read-only for agents; operator to decide (gitignored, not edited).
- Register page sends `firstName/lastName` the API rejects — already filed as #335.

## Seal gate
none (no commit/push; live writes only on the QA test account)
