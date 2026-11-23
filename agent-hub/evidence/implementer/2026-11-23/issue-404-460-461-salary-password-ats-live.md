# 2026-11-23 - issue-404-460-461-salary-password-ats — #460 live checks (post-SEAL)

- Worker: implementer · Node: `issue-404-460-461-salary-password-ats` (SEALED, `evidence/verifier/2026-11-23/issue-404-460-461-salary-password-ats-seal.md`)
- Branch: `feature/issue-404-460-461-salary-password-ats` (no code change in this note)
- Why: the SEAL waived the #460 live criteria (backend not on prod). Operator redeployed the API after a failed Render deploy; this runs the waived checks.

## Prod endpoints (curl, after redeploy)
```
POST auth/change-password (no auth) → {"success":false,"error":{"code":"NO_TOKEN",...}}
POST auth/change-email    (no auth) → {"success":false,"error":{"code":"NO_TOKEN",...}}
GET  auth/confirm-email-change?token=x → {"success":false,"error":{"code":"BAD_REQUEST","message":"Token đổi email không hợp lệ hoặc đã hết hạn"}}
```
Before the redeploy all three were `ROUTE_NOT_FOUND`.

## Live results (qa.full, local Vite on :5173 → prod API)
| Waived criterion | Result |
|---|---|
| Change password in tab A; tab A keeps working after reloading a dashboard page | `POST auth/change-password 200`, toast "Đổi mật khẩu thành công. Các thiết bị khác đã bị đăng xuất", form closed; after reload on `#/dashboard/information`: `POST auth/refresh 200`, stayed on the page, `#firstName` = "Nguyễn" |
| A session signed in before the change is logged out on its next request | session B (curl login before the change): old access token → `TOKEN_REVOKED "Token đã bị thu hồi."`; refresh → `TOKEN_REVOKED "Refresh token đã bị thu hồi"` |
| Login with the old password fails | `INVALID_CREDENTIALS "Email hoặc mật khẩu không chính xác"` |
| Wrong current password → red toast, stays signed in and on the page, typed values stay | `POST auth/change-password 400`, toast "Mật khẩu hiện tại không đúng", URL still `#/dashboard/account-settings`, form open, new password still filled |
| Change email with wrong password → toast, nothing else changes | `POST auth/change-email 400`, toast "Mật khẩu hiện tại không đúng", form open, shown email `qa.full@example.com` |
| `#/confirm-email-change` with a used/invalid token shows the API's 400 message | `GET auth/confirm-email-change 400`, `[role="alert"]` = "Token đổi email không hợp lệ hoặc đã hết hạn" |

Cleanup: password changed back to `QaTester@2026` through the UI (`POST auth/change-password 200`); curl login with it → `"success":true`. Vite started for this check was stopped (port 5173 free); the test window was closed.

## Not checked
- A real email-change confirmation (the link is mailed to the new address; `@example.com` has no inbox), so the `APP_URL` ending in `/#` is still unverified.
