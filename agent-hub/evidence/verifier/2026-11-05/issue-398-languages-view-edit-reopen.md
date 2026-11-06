# 2026-11-05 — issue-398-languages-view-edit — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-398-languages-view-edit` (haven/diagrams/dev-loop.prime-mermaid.md)
- Evidence reviewed: `evidence/implementer/2026-11-05/issue-398-languages-view-edit-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context). It was launched with the task "You are a fresh, isolated verifier subagent for the resume-vuejs-website repo ... You did NOT write the diff under review" plus the operator note "the prod API is currently returning HTTP 429 to the dev session ... judge whether the evidence (component spec + gates) is sufficient per the recipe". Skill args: `verifier "agent-hub/evidence/implementer/2026-11-05/issue-398-languages-view-edit-plan.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
1. **DESIGN.md §10 definition of done not met.** This is a UI change: a new read-only list, a header Edit/Close toggle and an empty state. Issue #398 says "theo DESIGN.md", and CLAUDE.md says to follow DESIGN.md. §10 requires screenshots at 1440px light, 1440px dark and 375px dark. The note has none: "Screenshot timed out", and the live check was blocked by HTTP 429. A component spec checks the DOM and the state toggle. It does not check overflow, clipping or the badge layout at 375px. The same gap got REOPEN on `issue-394-languages-page-nav-group`, round 1 and round 2 (`evidence/verifier/2026-11-05/issue-394-languages-page-nav-group-reopen.md`), which was the same page. The 429 explains why the evidence is missing, but it does not replace the evidence.
2. **Other §10 items not reported.** There is no keyboard pass: Tab to Edit, Enter opens the form, Tab to Close, focus stays visible and returns sensibly after the toggle. There is no long-text state (a long language name next to the badge). There is no `web-design-guidelines` pass. §10 says to "check each item and report the result".
3. Minor: the lint line says "no errors printed" but gives no exit code. Cite `exit 0` next time.

Fix (any of these works):
- Once the rate limit clears: log in as qa.full (writes) or qa.empty (empty state) on localhost:5173. Take screenshots of `/dashboard/languages` in view mode, edit mode and empty state at 1440 light, 1440 dark and 375 dark. Cite the file names and say what each one shows.
- Or, if 429 continues: stub `auth/refresh` + `general-information/` with Playwright `page.route`, using fixture data that includes one long language name. The API is then not needed, and the stub must be stated in the note.
- Do the keyboard pass and cite the result. Run the `web-design-guidelines` pass on the changed `.vue` file and cite the findings, or "none".

## Cited (OK)
- Branch `feature/issue-398-languages-view-edit` off `staging` @ a7e5df6: not main/staging, so no MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`: test `56 passed / 355 passed` (+2 vs staging), build `✓ built in 4.81s`, typecheck `90` = baseline 90, `0` in PageLanguages.
- View by default / NoData / Edit → form / Close → view: spec assertions cited (`['EnglishKhá','JapaneseN3']`, `.no-data`, `.edit-form` toggle).
- Save/Cancel interpretation: reasoned and accepted. The form is a table with per-item modals that PATCH immediately. `Modal.vue:91-94` already calls `confirmDiscardChanges`. Close returns to view.
- Data stays in `general-information.foreignLanguages`. Only existing i18n keys are used.
- Token grep on the diff: `exit=1` (no hits). Loading/error state goes through `LoadingGate`.
- The icon regression (`pen` unregistered) was caught by the test suite and fixed (`fa-square-pen`).
- Comments row present: 3 why-comments.
- Supersedes: none. Still open: none. Seal gate: none (no commit/push/API write). The diff (2 files) fits the node.

## Missing
- §10 screenshots: 1440 light, 1440 dark, 375 dark (view, edit, empty).
- Keyboard pass result.
- Long-text state check.
- `web-design-guidelines` pass.

## Forbidden hit
none (`EDIT_UNVERIFIED` would apply only if sealed as is)

## Re-run
none — audit only, the default per "Re-run scope". The note's outputs were enough to judge the gates. The gap is missing UI evidence, not a doubt about the commands.
