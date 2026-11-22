# Analyst spec — issue #436 Share "Copy link" button

- Date: 2026-11-22
- Node: `issue-434-436-social-links-copy` (shared with #434, per coordinator/operator), branch `feature/issue-434-436-social-links-copy`
- Status returned: spec_ready
- Doc: `agent-hub/doctrine/features/personal-information.md` (UPDATED — Behavior 7a/7b, 3 acceptance criteria, 2 edge cases, 1 out-of-scope line, changelog row; #434 changelog row node renamed to `issue-434-436-social-links-copy`). INDEX row already lists #436, unchanged.

## Task (verbatim)
Issue #436 "Share: add a 'Copy link' button for the public link"
## Problem
The Share block in /dashboard/information shows the public link as plain text only.
## Expected
A "Copy" button next to it (Clipboard API) with a success toast (vi + en).
Decided by the operator while confirming personal-information.md (2026-11-07).
Coordinator addendum: cover the error path too — clipboard unavailable or rejected (non-secure context, permission denied). Pick the obvious behavior if the doc/DESIGN.md already settles it; ask only if it doesn't.

## Decisions taken from existing doctrine (not invented)
- Failure → danger toast that says what happened + what to do: DESIGN.md §7 "Errors say what happened and what to do next. They don't apologize." Toast `bg: 'danger'` / `'success'` are the existing variants (21 / 8 uses in src).
- Label "Copy link" / "Sao chép link": DESIGN.md §5.3 "Labels are specific verbs"; issue title says "Copy link". Success toast "Link copied" mirrors §7 "same action keeps the same name" ("Lưu" → "Đã lưu").
- Secondary, no `action` color: §5.3 action table has add/update/delete/clone/view only; copying isn't duplicating (`clone`), so no color picked.
- Toast placement/a11y already handled globally by `App.vue` `showToast` (DESIGN.md §5.9: `aria-live="polite"`, 4s) — injected via `useHelper().toast`, already used in `PageInformation.vue:34`.
- No execCommand fallback: issue specifies Clipboard API; listed Out of scope. Exact VI/EN wording is a proposal the implementer may polish within §7.

## Sources read
- DESIGN.md §5.3 (lines 302-322), §5.9 (355-370), §7 (409-421)
- src/pages/dashboard/PageInformation.vue:34 (`toast`), 143 (`publicLink` computed), 184 (toast call shape `{ message, bg }`), 289-304 (Share block, link `<p>` at 302, `v-if="publicLink"` at 300)
- src/App.vue:58-70 (`provide('toast', showToast)`)
- src/components/global/Button.vue (`action` prop), ItemActions.vue (`fa-copy` already used for duplicate), src/plugins/initFontAwesomeIcon.js:41 (`faCopy` registered)
- src/i18n/index.ts — no existing copy/clipboard key (grep "copy" only hits copyright/extractedText) → new keys needed in vi + en
- grep `clipboard` across src: no existing usage

## Questions + answers
- Q5 (2026-11-07): "no copy button. Intended?" → operator: "Change: add 'Copy' — #436".
- Error path: settled by DESIGN.md §7 + existing danger toast; no question needed.

## Isolation proof
Same analyst subagent spawn as #434 (coordinator follow-up message); only task text + paths received, no implementer reasoning or diff seen. All anchors grep-confirmed in this spawn.
