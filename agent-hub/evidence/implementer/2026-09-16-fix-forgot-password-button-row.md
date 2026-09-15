# 2026-09-16 — fix-forgot-password-button-row

- Worker: implementer
- Version: 0.1.0
- Node: `fix-forgot-password-button-row`
- Task (verbatim, Vietnamese): "page quên mật khẩu, đưa button và quay lai
  đăng nhập lên 1 hàng. text label nhỏ lại" — forgot-password page: put
  the submit button and "back to login" link on the same row; shrink the
  label text.
- Status: sealed_pending_verifier

## Hub bytes before
209190 (root=12569, doctrine=27207, active diagram=143297,
implementer bundle=14963, verifier bundle=11154 — measured before this
node's row was appended, on `origin/staging`'s clean state)

## Branch
`fix/forgot-password-button-row`, checked out from `origin/staging`.
Independent of the still-unshipped `fix/register-login-autofill-autocomplete`
branch — that branch's uncommitted diff was `git stash`ed before creating
this branch so the two unrelated tasks don't mix in one diff (`SmallestDiff`).

## Diff
| File | Change | Why |
|---|---|---|
| `src/pages/auth/PageForgotPassword.vue` | Moved `<RouterLink to="/login">Quay lại đăng nhập</RouterLink>` from its own block below `<VeeForm>` (`class="inline-block mt-[1rem] text-sm"`) into `VeeForm`'s existing `#button` slot, with `class="ms-auto self-center text-xs"` | Puts the link on the same flex row as the submit button (`VeeForm.vue`'s `.footer` is `display:flex`) and shrinks the label from `text-sm` (14px) to `text-xs` (12px) per the operator's request |

Same slot extension point already used by `PageLogin.vue` (node
`tailwindcss-post-ship-review-fixes`, Finding 3) and every CRUD page's
Modal — confirmed pre-existing, not invented for this fix. No changes to
`VeeForm.vue`/`Frm*.vue`.

## Command
```
npm run build
```

## Output
```
> resume-vuejs-website@1.9.0 build
> vite build

vite v5.3.2 building for production...
transforming...
✓ 1304 modules transformed.
rendering chunks...
computing gzip size...
...
✓ built in 3.26s
```
Only the pre-existing "chunks are larger than 500 kB" advisory, no errors.

Also ran (not strictly required by `implement.md`, but this project does
have a real test suite per `doctrine/MEMORY.md`):
```
npm run lint    → exit 0, clean (no output beyond the npm command header)
npm run test    → Test Files  16 passed (16) / Tests  111 passed (111)
```

## Manual UI verification (step 7, UI diff — not an automated test)
Used the already-running `npm run dev` + port-9888 Chrome debug session.
Via CDP, real SPA navigation (not a full `Page.navigate` reload, which
this app's hash-based routing doesn't resolve correctly for a direct deep
link — confirmed: navigating straight to `/forgot-password` lands on the
Login route instead): navigated to `/login`, clicked the real "Quên mật
khẩu?" nav link to reach `/forgot-password` via the SPA router.

```js
document.querySelector(".footer") // computed display: "flex"
button ("Gửi yêu cầu") rect: { y: 492.9375, height: 38 }   // center y = 511.9
link   ("Quay lại đăng nhập") rect: { y: 503.9375, height: 16 } // center y = 511.9
link computed fontSize: "12px"   (was text-sm = 14px before this diff)
link className: "ms-auto self-center text-xs"
```
Button and link are vertically centered on the same row (identical
center-y, 511.9px) and the link is visibly smaller (12px vs the previous
14px) — matches both parts of the operator's request.

## Acceptance
| Criterion | Evidence |
|---|---|
| Button and "Quay lại đăng nhập" on the same row | `.footer` computed `display:flex`; button/link share center-y `511.9` |
| Label text made smaller | `text-sm`→`text-xs`, computed `fontSize` `12px` (was 14px) |
| No unrelated change | `git diff --stat`: `PageForgotPassword.vue \| 7 +++++--`, 5 insertions/2 deletions — only the link's block moved + class changed |
| `npm run build` green | `✓ built in 3.26s` |

## Noticed, not done
None outside scope this pass.

## Seal gate
None — no commit/push/merge in this pass. Merging
`fix/forgot-password-button-row` → `staging` is a separate, later `/ship`
action requiring operator approval.

## Forbidden states check
- `ADHOC_WORK` — node added to `dev-loop.prime-mermaid.md` (`AppendOnly`,
  end of table) before this note. Clear.
- `NO_EVIDENCE` — this note. Clear.
- `EDIT_UNVERIFIED` — build run and read back verbatim; row/link geometry
  and font-size confirmed live via CDP, not inferred. Clear.
- `CODE_IN_HAVEN` — only this note + the diagram row (both `.md`) touched
  under `haven/`/`evidence/`. Clear.
- `DIAGRAM_DRIFT` — diagram row added matching this diff. Clear.
- `MAIN_EDIT` — branch is `fix/forgot-password-button-row`, cut from
  `origin/staging`, not `main`/`staging` directly. Clear.
