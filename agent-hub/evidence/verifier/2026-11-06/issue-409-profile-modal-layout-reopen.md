# 2026-11-06 — issue-409-profile-modal-layout — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-409-profile-modal-layout`
- Evidence reviewed: `evidence/implementer/2026-11-06/issue-409-profile-modal-layout-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with the task "You are a fresh, isolated verifier session for the resume-vuejs-website repo ... You did NOT write this diff — you were spawned as a separate subagent specifically to verify it" and skill args `verifier "agent-hub/evidence/implementer/2026-11-06/issue-409-profile-modal-layout-plan.md"`. This context has no memory of writing the diff and did not open it.

## Verdict: REOPEN

## Reason
1. **DESIGN.md §10 definition of done not met.** §10 line 468: "Ran a final pass against the Vercel Web Interface Guidelines if the `web-design-guidelines` skill is available." The skill IS available in this project's skill list, and the note's own Acceptance row says: "Vercel Web Interface Guidelines pass: **not run** (`web-design-guidelines` skill not invoked)". A self-declared unmet DoD item on a UI change = missing evidence (same precedent as `issue-394-languages-page-nav-group` REOPEN round 1, a §10 gap).
2. **Create/clone screenshots predate the final fix.** The note says `after-light-1440-create.png`, `after-dark-1440-clone.png`, `after-light-375-clone.png` were "Taken before the `py-0.5` fix", and the checkbox-inside-list check was re-measured "in edit mode only". The issue's criterion 5 is "edit, create, clone; light + dark", and these are the screenshots that would go into the PR (criterion 1). Retake them on the final code.

Fix:
- Run the `web-design-guidelines` skill on `src/pages/dashboard/PageProfile.vue` and `src/components/veevalidate/VeeForm.vue` (changed parts); cite each finding and either fix it (in scope) or state why it's out of scope.
- Retake create + clone screenshots (at least 1440 light create, 1440 dark clone, 375 dark or light clone) on the current working tree; cite file names, what each shows, and the `cb.left > box.left` measurement for create and clone.

## Cited (OK)
- Branch `fix/issue-409-profile-modal-layout` off `staging` @ d9f88bf; `git branch --show-current` confirms. No MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`: build `✓ built in 6.26s`, lint exit 0, test `56 passed / 364 passed`, VeeForm spec `21 passed`, typecheck 81 ≤ baseline 90 with 0 hits in PageProfile/VeeForm.vue. Not truncated.
- Criterion 1 (what's hidden): before table at 1366×768 and 390×844 (name top 828 > dialog bottom 740; nested scroll 1 at 390) + `before-desktop.png`/`before-mobile.png` exist.
- Criterion 2 (name at top, Save/Cancel always visible): name top 128/108; bar bottom 855 < 872 and 787 < 804 at scroll top and end, all 12 runs. Sticky bar instead of Modal `#footer` justified (Save state lives in VeeForm). I opened `after2-dark-375-edit.png`: name field first, Hủy/Lưu visible at the bottom, checkboxes inside bordered lists.
- Criterion 3 (no nested scroll): `nested: 0` in all 12 runs; max-height/overflow removed; Chọn tất cả / Bỏ chọn kept.
- Criterion 4 (tokens, no `--bs-*`): token grep on added lines → exit 1; `border-line` + `rounded-md`.
- Criterion 5: 4 theme×width combos × create/edit/clone measured live, read-only on qa.full.
- Keyboard pass, one primary action, empty state: cited.
- Comments row present (1 HTML why-comment in VeeForm, PageProfile comment rewritten, stale text removed).
- Supersedes: none; Still open: none — no other open #409 row on the diagram.
- Seal gate: none (no commit/push/API write). Proportionality: new VeeForm default slot is the minimum needed to place content between fields and the sticky bar; no existing consumer affected; +1 spec test.

## Missing
- Vercel Web Interface Guidelines pass (DESIGN.md §10), skill available but not run.
- Create/clone screenshots + checkbox measurement on the final (`py-0.5`) code.

## Forbidden hit
none (`EDIT_UNVERIFIED` would apply only if sealed as is)

## Re-run
none — audit only; the note's command output matches doctrine and is not truncated.

## PM status
Not changed (REOPEN). Row stays `IN_PROGRESS`; REOPEN pointer added to the row text.

## Hand-off for /ship
Issue criterion 1 wants screenshots in the PR; shots are gitignored, attach by hand.
