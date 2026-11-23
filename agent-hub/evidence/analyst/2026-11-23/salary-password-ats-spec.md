# Analyst spec — #461, #460, #404 (one pass)

## Task (verbatim, from the spawning session)
(1) #461 ATS check: show 'not applicable' checks (classic template) — shape follows backend datvt243/resume-nodejs-api#406.
(2) #460 Account settings: enable Change password / Change email — POST auth/change-password, change-email per backend #412.
(3) #404 Tools: Gross <-> Net salary calculator page in nav.tools; SegmentedControl; default from salaryDesired; client-only; BHXH/BHYT/BHTN, family deductions, PIT; round-trip within 1đ; VN law constants in one place; pure fn + vitest spec; i18n; DESIGN.md. Open: salaryDesired gross or net; current VN law values.

Branch at spec time: feature/issue-404-460-461-salary-password-ats (not changed). No code edited.

## Docs
- doctrine/features/ats-check.md — Behavior 6 (draft), criteria, edge cases, changelog
- doctrine/features/account-settings.md — Behavior 8–11 (draft), criteria, edge cases, Open questions 4–6, changelog
- doctrine/features/salary-calculator.md — new, draft
- doctrine/features/INDEX.md — issue columns + new row

## Sources read
- Frontend: src/types/ats.type.ts, src/pages/dashboard/PageAtsCheck.vue, PageAtsCheck.spec.ts, PageAccountSettings.vue, PageAccountSettings.spec.ts, src/pages/auth/{PageRegister,PageResetPassword}.vue, src/services/auth.ts, src/stores/auth.ts, src/routers/index.ts, src/App.vue:38-39, src/models/generalInformation.model.ts, src/pages/_layouts/LayoutDefault.vue:60-97, src/components/veevalidate/part/FrmCurrency.vue, DESIGN.md (§4.3, §5.6), doctrine/features/{general-information,auth-password-reset}.md
- Backend (local checkout ../resume-nodejs-api on staging @ 28e61e5, v2.11.0): src/services/atsChecks.ts (`applicable?: false`, `notApplicable()`, `scoreChecks` skip), src/candidate_me/ats-check.ts, src/auth/auth.service.ts (handlerChangePassword returns `data: {token, tokenRefresh}`; 400 for wrong current password; handlerChangeEmail; handlerConfirmEmailChange), src/routers/api/v1/auth.route.ts (routes), src/services/mail.ts (`<APP_URL><path>`), src/locales/en.ts, agent-hub/doctrine/features/account-settings.md (rules 1–11), .claude/rules/api.md
- gh: issues #404/#460/#461 (frontend), #406/#412 (backend, CLOSED), PR #440 and #497 (MERGED)
- Web (2026-11-23): Nghị định 161/2026 (lương cơ sở 2,530,000 from 01/07/2026); Nghị định 293/2025 (regional min wage 2026); Nghị định 399/2026 (regional min wage from 01/01/2027); Nghị quyết 110/2025 (15.5M / 6.2M); EY summary of Luật 109/2025/QH15 (5 brackets 5/10/20/30/35, salary from tax period 2026). Primary law texts not fetched (thuvienphapluat 403) — values cross-checked across ≥2 secondary sources only.
- Worked examples computed with a throwaway python one-liner (scratch, not in repo).

## Questions (open)
- salary Q1: desired salary gross or net + which end of range → rec. gross, Gross→Net, salaryDesiredFrom
- salary Q2: law-value set (2026 vs 2027 regional wages) → rec. 2026 values, follow-up on 01/01/2027
- salary Q3: region for BHTN cap → rec. select I–IV default I
- account Q4: inline form vs modal → rec. inline collapsed
- account Q5: session after email confirm (stale stored email breaks reload fetch) → rec. sign out + login toast if signed in
- account Q6: redirect signed-in users from confirm page → rec. no
- #461: none

## Isolation proof
Spawned as a separate analyst subagent; got only the task text above. Read the backend contract directly from the backend checkout/PRs, not from the main session; found two facts not in the task: (a) change-password returns a new token pair that must be stored or the tab gets logged out, (b) after email confirm, App.vue reload fetch `candidate/<old email>` breaks.

## Round 2 — operator answers (2026-11-23, relayed by coordinator)
1. Gross; Gross → Net; amount from salaryDesiredFrom.
2. 2026 regional wages + base salary 2,530,000 (from 01/07/2026); follow-up issue for 01/01/2027 (Nghị định 399/2026), noted in doc.
3. Region I–IV select, default I.
4. Inline forms, hidden until the button is pressed.
5. Confirm success: signed in → logOut + /login with "sign in with your new email"; signed out → success + "Go to login".
6. /confirm-email-change: no redirect, works signed in or out.
Folded into salary-calculator.md and account-settings.md (Behavior, criteria, Open questions → answered, changelog). No question left open. Status stays draft (feat spec — only the SEAL verifies it). Outcome: spec_ready.
