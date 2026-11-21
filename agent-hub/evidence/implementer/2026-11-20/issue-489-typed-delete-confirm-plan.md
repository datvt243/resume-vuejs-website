# 2026-11-20 - issue-489-typed-delete-confirm
- Worker: implementer · Version: 0.1.0
- Node: `issue-489-typed-delete-confirm` on `haven/diagrams/dev-loop.prime-mermaid.md`
- Task: "#489 Typed `delete` confirmation for account delete, skill-group delete, visits delete-all — umbrella for #431, #439, #456. Each dialog must require typing `delete` before the request is sent, reusing the same shared confirm that single-skill delete already uses."
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/489 (closes #431, #439, #456)

## Branch
`feature/typed-delete-confirm` (cut from synced `staging` via `gh issue develop 489 --base staging`)

## Hub bytes before
100259

## Feature doc
`doctrine/features/account-settings.md` Behavior #4, `doctrine/features/cv-skills.md` Behavior #4 (Delete group), `doctrine/features/cv-visits.md` Behavior #10 — spec from analyst pass 0 (`evidence/analyst/2026-11-20/issue-489-typed-delete-confirm-spec.md`). Open questions: none. Docs not edited by this pass.

## Design choice
The "shared typed confirm" did not exist (single-skill delete inlined its own `Swal.fire`). Added `typedDeleteInput()` in `src/lib/swal.lib.js` (input, empty value, placeholder `confirm.typeDeletePlaceholder`, exact-match validator returning `confirm.typeDelete`) and a `typed` option on `confirmDelete` that spreads it. Single-skill delete now spreads the same helper — one validator for all four dialogs.
`confirm.typeDelete` contains HTML (`<code>`), so the typed dialog uses `html`; the existing warning (`getHtml`, may carry user-entered group names) is escaped via `textContent`→`innerHTML` before joining, keeping the old plain-text guarantee. Untyped callers (`useDocument.deleteDoc`) keep `text` unchanged.

## Diff
| File | Why |
|---|---|
| `src/lib/swal.lib.js` | `typedDeleteInput()` export, `escapeHtml`, `typed` option on `confirmDelete` |
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` | single-skill dialog spreads `typedDeleteInput()` instead of its inline input/validator |
| `src/pages/dashboard/PageAccountSettings.vue` | `typed: true` (#431) |
| `src/pages/dashboard/PageSkills.vue` | `typed: true` on group delete (#439) |
| `src/pages/dashboard/PageVisits.vue` | `typed: true` on delete-all (#456) |
| `src/lib/swal.lib.spec.ts` (new) | validator rejects `''`, `delet`, `Delete`, `delete `, ` delete`; accepts `delete`; warning escaped above prompt; callback only on `isConfirmed`; untyped keeps `text`, no input |
| `src/pages/dashboard/PageAccountSettings.spec.ts` (new) | delete button → `confirmDelete` with `typed: true`, no request before confirm, callback sends exactly one `{ method: 'delete', url: 'candidate' }` |
| `src/pages/dashboard/PageSkills.spec.ts` | group delete → `typed: true`, no PATCH before confirm, callback sends exactly one PATCH with `professionalSkills: []` |
| `src/pages/dashboard/PageVisits.spec.ts` | existing delete-all test also asserts `typed: true` (`vĩnh viễn` check kept) |

## Command
From `doctrine/MEMORY.md`: `npx vitest run <path>`, `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck`.

## Output
Touched specs (`npx vitest run src/lib/swal.lib.spec.ts src/pages/dashboard/PageAccountSettings.spec.ts src/pages/dashboard/PageSkills.spec.ts src/pages/dashboard/PageVisits.spec.ts src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts`):
```
 Test Files  5 passed (5)
      Tests  24 passed (24)
```
(stderr: pre-existing `Failed to resolve component: NoData / FontAwesomeIcon` Vue warnings in PageSkills.spec, also on the old tests)
`npm run test`:
```
 Test Files  60 passed (60)
      Tests  389 passed (389)
```
`npm run build` → `✓ built in 3.77s` (pre-existing chunk-size warning only)
`npm run lint` → `lint exit 0` (re-run after a blank-line tidy in PageSkills.spec: `lint exit 0`, `Tests  6 passed (6)`)
`npm run typecheck 2>&1 | grep -cE "error TS"` → `78` (= baseline); grep for `swal.lib|PageAccountSettings|PageSkills|PageVisits|VeeFormGeneralInformationUpdate` → no output

## Live check (`npm run dev`, qa.full@example.com, Chrome via CDP 9888 + Playwright)
Every dialog was cancelled — no delete request sent.
- `/dashboard/visits` → "Xóa tất cả": title `Xóa tất cả lượt truy cập?`, html `4 lượt truy cập sẽ bị xóa vĩnh viễn và không thể khôi phục.<br>Vui lòng nhập vào <code class="code">"delete"</code> để xác nhận xoá`, input present, placeholder `Nhập "delete"`. Typed `Delete` + clicked Xóa → dialog stayed open with validation message (screenshot viewed), then Hủy.
- `/dashboard/account-settings` → "Xóa tài khoản": title `Xóa tài khoản này?`, warning + `<br>` + typed prompt, input present; Hủy → `closedAfterCancel: true`, still on `#/dashboard/account-settings`.
- `/dashboard/skills?tab=professional` → group delete: title `Xóa nhóm Languages?`, html `Nhóm và 5 kỹ năng trong nhóm sẽ bị xóa. Không thể hoàn tác.<br>Vui lòng nhập vào …`, input present; Hủy.

## Acceptance
| Criterion | Evidence |
|---|---|
| All three keep title + warning, add input with `confirm.typeDelete` prompt + `confirm.typeDeletePlaceholder` | Live check above (all three); swal.lib.spec "keeps the warning, escaped, above the typed prompt" |
| Proceeds only on exact `delete` (case-sensitive, untrimmed); `''`/`delet`/`Delete`/`delete ` rejected, dialog stays | swal.lib.spec validator test; live `Delete` → validation message, dialog open |
| Cancel/×/Esc sends nothing | swal.lib.spec "runs the callback only once confirmed" (`isConfirmed: false` → no callback); live Hủy on all three |
| Account: `delete` → exactly one `DELETE api/v1/candidate` | PageAccountSettings.spec (new) |
| Skill group: exactly one PATCH without group + skills; 0-skill group same path | PageSkills.spec new test; `typed: true` is unconditional in `deleteGroup` (no count branch). `VeeFormGeneralInformationUpdate.spec.ts` still passes (in the 24) |
| Visits: exactly one `DELETE candidate/visits`, reloads list + stats; `vĩnh viễn` check passes | PageVisits.spec existing test + `typed` assertion |
| Shared by all four dialogs, not copied | `typedDeleteInput()` used by `confirmDelete` and VeeFormGeneralInformationUpdate (diff) |
| Build/test/lint green, typecheck ≤ 78 none in touched files | Output above |
| Comments per code-comments.md | One `//` WHY line above `typedDeleteInput`; one JSDoc line for `typed`; one `//` in account spec (why VeeForm is mocked, same wording as existing spec) |
| i18n: no new hardcoded strings | Only existing keys `confirm.typeDelete`/`confirm.typeDeletePlaceholder` used |

## Supersedes
none (`grep -c "issue-489"` on active diagram and archive → 0 / 0; no row for #431/#439/#456)

## Still open
none

## Review
Inline review (diff small; callers of `confirmDelete` grepped: `useDocument.ts:120` untyped → unchanged `text` path; three pages typed). Checks: (1) XSS — typed path now uses `html`; user-entered group names come through `getHtml`, escaped with `textContent`; the prompt is a static i18n string. (2) Single-skill: `html` set after the spread, so its own prompt stays; `value` handling (`_flag: value === 'delete'`) unchanged; its spec still reads `inputValidator` from the call. (3) Swal only resolves `isConfirmed` after `inputValidator` passes, so the callback can't run on a wrong value. No security label on the issue → no `/security-review`.

## Noticed, not done
- Validation message renders `vào"delete"để` with no spaces around the `<code>` in the Swal validation line (same on single-skill delete before this change) — CSS/i18n spacing, not in scope.
- `.playwright-mcp/` (gitignored) was written by the live check; removal was blocked by the permission prompt — left in place.

## Seal gate
none — no outward-facing action (live check only cancelled dialogs on a QA account).
