# 2026-11-01 — issue-372-skills-page — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-372-skills-page`
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-372-skills-page-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context, not the implementer session), launched with the task "You are a fresh, isolated verifier subagent spawned by the implementer session — you did not write this diff" and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-372-skills-page-plan.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
1. **Typecheck: one changed file not covered.** Criterion 4 and `doctrine/MEMORY.md` (Typecheck row) require no errors in changed files. The note's grep is `Tabs|PageSkills|PageGeneralInformation|LayoutDefault|routers`, which leaves out `src/i18n/index.ts`. That file is in the Diff (new `nav.skills` key in vi + en), and `en` is typed `typeof vi`, so a missing or mismatched key would show up there. The total of `90` does not prove the file is clean, because removing code from `PageGeneralInformation.vue` could cancel out a new error. The issue-370 notes did include `i18n/index` in this grep. → `EDIT_UNVERIFIED` (verify_seal step 4).
2. **The skill-group patch now behaves differently and is not checked.** The note says the group `updatePatchDoc` now takes `_id` from `candidate.getGeneralInformation._id` instead of the form document. That is new logic in `PageSkills.vue`, not a verbatim move. It has no spec and no live check. "Not checked live" is explained as owner-account read-only, but the QA accounts (`qa.full@example.com`) exist for writes. If the id is wrong, skill groups can't be saved on the new page, which breaks the feature criterion 1 moves.

## Cited (OK)
- Branch `feature/issue-372-skills-page`, not main/staging: no MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`: test, build, lint, typecheck.
- Criterion 1: live general-information h2s `["Mong muốn công việc","Ngoại ngữ","Thêm ngoại ngữ"]`, with no skill sections.
- Criterion 2: live s0 shows the professional tab selected by default (25 rows), and the sidebar `["Thông tin chung","Kỹ năng"]`.
- Criterion 3: `Tabs.spec.ts` (+2 tests in `Tests 310 passed (310)`); live click gives `?tab=personal`, ArrowRight wraps to `?tab=professional` and moves focus; screenshot cited.
- Criterion 4, the rest: `Test Files 51 passed (51)` including the i18n key-parity spec; `✓ built in 3.70s`; lint 0 after the `Tabs` ignore, which follows the other single-word globals.
- Comments row present (doc blocks, a 1-line WHY, `shortcut:` on the id counter).
- Supersedes: none, and this is the only row for #372. Seal gate: none (no commit/push). The diff matches the node: the `.eslintrc.cjs` and `.claude/CLAUDE.md` edits are required by the new global component.

## Missing
- Typecheck grep output that includes `src/i18n/index.ts`.
- Evidence that the skill-group tag patch on `/dashboard/skills` sends the right `_id` and saves.

## Forbidden hit
EDIT_UNVERIFIED

## To fix
- Re-run `npm run typecheck` and cite the count plus a grep that includes `i18n/index` (no output expected).
- Prove the group patch one of two ways. (a) In a separate Playwright `browser.newContext()`, so the operator's owner session is untouched, log in as `qa.full@example.com`, add a skill group on `#/dashboard/skills`, then cite the PATCH request body/URL and the reloaded result. (b) Add a `PageSkills` spec that asserts `updatePatchDoc` receives `candidate.getGeneralInformation._id`.
- No code change is needed unless one of these fails. Then re-run the verifier.

## PM status
Not updated (REOPEN). The row stays `sealed_pending_verifier`, per RatchetOnly.

## Re-run
none (audit only: these gaps are missing evidence, and the Re-run scope rules say to REOPEN on those, not to re-run)
