# Analyst spec — #400 Experience view modal VI | EN toggle

## Task (verbatim)
Title: "Experience: modal view chỉ xem được 1 ngôn ngữ — bổ sung nút chuyển VI | EN"
Summary: Modal xem chi tiết Experience (nút 👁 trên card) chỉ hiển thị được 1 ngôn ngữ của nội dung — luôn là VI. Bổ sung nút chuyển VI | EN trong modal view.
Context: src/pages/dashboard/PageExperience.vue:154 — viewDescription gọi getLocalizedText(viewDoc.value.description) không truyền lang, nên mặc định 'vi' (src/utilities/index.ts:61). Muốn xem bản EN thì phải mở form edit.
Expected vs actual: Actual: modal view chỉ hiện mô tả tiếng Việt (fallback EN chỉ khi VI trống). Expected: có toggle VI | EN trong modal view, đổi là nội dung đổi theo.
Acceptance criteria:
- Modal view Experience có toggle VI | EN, cùng kiểu với toggle trong VeeForm.
- Các field localized (mô tả, …) hiển thị theo lang đang chọn; lang thiếu nội dung thì fallback như getLocalizedText.
- Dùng chung state lang với #399 (đổi ở form hay view đều áp dụng chung) nếu #399 đã xong.
- Text/aria-label qua i18n (vi + en); theo DESIGN.md.

## Doc
`doctrine/features/cv-timeline-sections.md` (existing feature, updated: Behavior #8 draft, AC, edge cases, out of scope, open question 7, changelog). INDEX row: #400 added.

## Sources read
- agent-hub/doctrine/features/INDEX.md, cv-timeline-sections.md, doctrine/MEMORY.md, doctrine/domains/PROJECT.md (Invariants)
- src/pages/dashboard/PageExperience.vue (view modal lines 146-163, 252-272)
- src/utilities/index.ts (getLocalizedText)
- src/components/veevalidate/VeeForm.vue (toggle lines 119-196)
- src/composables/useFormLang.ts — #399 shipped in commit 1335c10 (module-scope `formLang`), though GitHub issue #399 is still OPEN
- src/components/global/SegmentedControl.vue, src/models/experience.model.ts, src/i18n/index.ts (`form.contentLang` exists vi+en), src/pages/dashboard/PageExperience.spec.ts

## Findings
- Only localized Experience field is `description` (`withEnglish`); position/company are plain strings.
- Career-break type label and modal title use the UI locale today.

## Questions + answers
7. Should the career-break type label and modal title follow the content VI | EN toggle, or stay in UI language? → **Answer (operator 2026-11-19, via coordinator):** "Stay UI language" — break type label and modal title keep following the UI language; only the description follows the modal toggle. Recorded in Behavior #8 + Q7. Outcome: spec_ready.

Note: Behavior #8 marked "spec complete, not yet implemented/sealed" rather than plain — analyst invariant 7 forbids presenting a feat behavior as verified before its node is SEALED.

## Isolation proof
Spawned as a blank-context analyst subagent; got only the issue text and repo. No implementer reasoning or diff seen; branch feature/experience-modal-view was clean.
