# Analyst spec — #408 + #452 (Download CV overlay, leave guard, account-menu item)

- Date: 2026-11-23
- Worker: analyst, recipe `spec_feature` (spec mode)
- Branch: feature/issue-408-452-download-overlay-menu (read-only, no code touched)
- Outcome: round 1 **needs_input** (4 open questions) → round 2 **spec_ready** (operator answers 2026-11-23)

## Task (verbatim)
#408 — Download PDF: overlay toàn trang báo trạng thái, chặn đổi trang khi chưa tải xong.
Khi download PDF (CV render từ server), hiển thị popup/overlay toàn trang báo trạng thái download, và chặn đổi trang khi chưa download xong — muốn rời trang thì phải confirm. Context: `useDownloadCv.ts` GET download-pdf → blob → `<a download>`, state `isDownloading` local per caller, error → toast; used in Header.vue:126, PageHome.vue:209, PageAtsCheck.vue:81; Render cold start ~30s. Yêu cầu: overlay with spinner + status text (đang tạo PDF / đang tải / xong / lỗi) and a Hủy button; in-app route change → Swal confirm like `confirmDiscardChanges` (yes → abort + navigate, no → stay); reload/close → `beforeunload`; done → close overlay (có thể toast thành công); error → close overlay + toast as today. AC: one shared state, all 3 callers show overlay; cancel really aborts (AbortController), no file afterwards; router guard only while downloading, `beforeunload` removed on done/cancel/error; a11y role=dialog/aria-modal, aria-live status, focus on Hủy; vitest spec (success/error/cancel); i18n vi+en; DESIGN.md.
#452 — Small screens: add "Download CV" to the account menu. Header Download button hidden below `sm`, account menu has no download entry. Expected: a "Download CV" item in the account menu (same flow as header button). Decided by operator 2026-11-07 (cv-preview-export.md Q6).

## Doc
`agent-hub/doctrine/features/cv-preview-export.md` — updated (existing INDEX row already listed #452), not duplicated. Added Behavior 10–17, edge cases, acceptance criteria, out of scope, open questions 7–10, changelog row. Status split: Behavior 1–9 stay verified; 10–17 draft until node SEAL. INDEX row updated (+#408, status).

## Sources read
- agent-hub/haven/workers/analyst/{manifest.yaml,SOUL.md,recipes/spec_feature.md}
- agent-hub/doctrine/domains/PROJECT.md (Invariants), agent-hub/doctrine/MEMORY.md (commands), agent-hub/doctrine/features/{INDEX.md,cv-preview-export.md}
- src/composables/useDownloadCv.ts, src/composables/useDownloadCv.spec.ts
- src/pages/_layouts/Header.vue (button `hidden sm:inline-flex`, Dropdown user-menu: View API, Logout)
- src/pages/home/PageHome.vue, src/pages/dashboard/PageAtsCheck.vue, src/pages/dashboard/PagePreview.vue (uses only `cvFileName`), src/pages/dashboard/PageApplication.vue (separate `?token=` PDF link)
- src/lib/swal.lib.js (`confirmDiscardChanges`), src/routers/index.ts (single auth `beforeEach`), src/services/axios.ts (90s timeout, 401 refresh+retry, `logOut` on refresh failure), src/composables/useAuthRedirect.ts, src/App.vue + src/components/Spinner.vue (cold-start overlay, only via handleBase), src/components/Modal.vue (Esc handling)
- DESIGN.md lines ~360–365 (no full-page spinner except cold start; Modal: Esc closes, focus trapped, returns to trigger)
- src/i18n/index.ts (`header.downloadCv`, `error.downloadCv` exist in vi+en)

## Findings that shaped the spec
- No existing `beforeunload`/leave guard anywhere in `src/`; `confirmDiscardChanges` is the only confirm pattern to copy.
- Download bypasses `handleBase` → the cold-start overlay never shows for it; no double overlay.
- Status "generating" vs "downloading" is only observable via axios `onDownloadProgress` (first bytes) — written as such.
- A modal overlay blocks header/sidebar clicks, so the route guard mainly matters for Back/Forward and code-driven navigation (incl. forced logout → specified as no confirm).
- DESIGN.md forbids full-page spinners except cold start → conflict raised as Q7.

## Questions (open — need operator)
7. DESIGN.md says "No full-page spinner over content… Spinners only inside buttons", with one exception (cold start). OK to add the download overlay as a second exception in DESIGN.md?
8. On success: close the overlay silently, or also show a green toast ("CV downloaded")?
9. Account-menu "Download CV": every screen size, or only below `sm` (where the header button is hidden)?
10. After Cancel (button, Esc or leave-confirm): no toast, or a neutral toast ("Download cancelled")?

Decided from doctrine, not asked: Esc = Cancel (DESIGN.md Modal rule); header/menu download = Classic template (Q5 2026-11-07); forced logout mid-download → no leave confirm (the request is already dead).

## Isolation proof
Spawned as a separate analyst subagent with only the task text (issues #408/#452 bodies) and paths from the main session; no implementer reasoning, plan or diff was given. All anchors above were grep/read-confirmed in this spawn.

## Round 2 — operator answers (2026-11-23, relayed by coordinator)
7. Yes — add the download overlay to DESIGN.md as a second allowed blocking overlay (next to cold start). → Behavior 11 + new acceptance criterion; the DESIGN.md edit belongs to the implementer's diff (analyst writes only doctrine/features + evidence).
8. Success: close the overlay silently, no toast. → Behavior 15, spec + live criteria.
9. Account-menu "Download CV": below `sm` only. → Behavior 17, live criterion at 375px (present) and >=640px (absent).
10. Cancel (button / Esc / leave-confirm): no toast. → Behavior 12, spec + live criteria.
All questions answered; none left that changes Behavior or Acceptance → spec_ready. Status stays draft for Behavior 10–17 (feat spec — only the node SEAL verifies it).
